import crypto from "crypto";
import { ProxyAgent, type Dispatcher } from "undici";

/**
 * Paynow integration — this is the ONLY payment path per the locked
 * architectural decision (EcoCash via Paynow as aggregator, not direct
 * EcoCash API). Do not add a direct EcoCash integration here.
 *
 * OPERATIONAL NOTE (deployment, not a design decision): Paynow IP-whitelists
 * callers of these interface endpoints. Vercel's own Static IP add-on is
 * Pro/Enterprise-only and doesn't exist on Hobby, so this needs a
 * third-party fixed-IP HTTP proxy in front of the two outbound calls below
 * (QuotaGuard Static, Fixie, OutboundGateway, or a self-hosted relay with a
 * static IP all work — set PAYNOW_PROXY_URL to whichever one you pick).
 * Without that env var set, these calls go out on Vercel's normal rotating
 * IPs and Paynow will reject them in production.
 */

const PAYNOW_MOBILE_URL = "https://www.paynow.co.zw/interface/remotetransaction";

export type PaynowMobileMethod = "ecocash" | "onemoney";

export interface InitiateMobilePaymentInput {
  reference: string; // order_id for a deposit/direct sale, layby_plan_id for a later installment
  amount: number;
  additionalInfo: string;
  authEmail: string;
  phone: string; // customer's mobile money number, e.g. 0771234567
  method: PaynowMobileMethod;
  resultUrl: string;
  returnUrl?: string;
}

export interface PaynowInitiateResult {
  success: boolean;
  status?: string;
  pollUrl?: string;
  instructions?: string;
  error?: string;
}

export interface PaynowStatusUpdate {
  reference: string;
  paynowReference: string;
  amount: string;
  status: string;
  pollUrl: string;
}

function getCredentials() {
  const id = process.env.PAYNOW_INTEGRATION_ID;
  const key = process.env.PAYNOW_INTEGRATION_KEY;
  if (!id || !key) {
    throw new Error("PAYNOW_INTEGRATION_ID / PAYNOW_INTEGRATION_KEY are not set.");
  }
  return { id, key };
}

/**
 * Lazily builds (and caches) a ProxyAgent from PAYNOW_PROXY_URL. Returns
 * undefined when the env var isn't set, in which case fetchViaProxy falls
 * back to normal direct egress — i.e. today's behavior, unchanged.
 */
let cachedDispatcher: Dispatcher | undefined;
function getProxyDispatcher(): Dispatcher | undefined {
  const proxyUrl = process.env.PAYNOW_PROXY_URL;
  if (!proxyUrl) return undefined;
  if (!cachedDispatcher) {
    cachedDispatcher = new ProxyAgent(proxyUrl);
  }
  return cachedDispatcher;
}

/**
 * Wraps fetch() to route through the fixed-IP proxy when configured. The
 * `dispatcher` option is a Node/undici extension to fetch's RequestInit,
 * not part of the DOM lib's fetch types — cast through an intersection type
 * rather than `any` so this stays type-checked everywhere except the one
 * property TypeScript's bundled DOM types don't know about.
 */
async function fetchViaProxy(url: string, init: RequestInit): Promise<Response> {
  const dispatcher = getProxyDispatcher();
  if (!dispatcher) return fetch(url, init);
  const initWithDispatcher: RequestInit & { dispatcher: Dispatcher } = { ...init, dispatcher };
  return fetch(url, initWithDispatcher as RequestInit);
}

/**
 * Paynow's hash rule (https://developers.paynow.co.zw/docs/paynow/generating_hash/):
 * concatenate every field VALUE in message order (never the "hash" field
 * itself), append the integration key, SHA512, uppercase hex.
 */
function computeHash(fields: Record<string, string>, integrationKey: string): string {
  const concatenated = Object.entries(fields)
    .filter(([key]) => key.toLowerCase() !== "hash")
    .map(([, value]) => value ?? "")
    .join("");
  return crypto
    .createHash("sha512")
    .update(concatenated + integrationKey, "utf8")
    .digest("hex")
    .toUpperCase();
}

function verifyHash(fields: Record<string, string>, integrationKey: string): boolean {
  const provided = (fields.hash ?? "").toUpperCase();
  if (!provided) return false;
  return computeHash(fields, integrationKey) === provided;
}

function parsePaynowResponse(body: string): Record<string, string> {
  const params = new URLSearchParams(body);
  const result: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    result[key.toLowerCase()] = value;
  }
  return result;
}

/**
 * Initiates an EcoCash/OneMoney express-checkout USSD push via Paynow.
 * `reference` must be something the webhook can look up an order or layby
 * plan by (see app/api/orders/paynow-callback/route.ts).
 */
export async function initiateEcocashPayment(
  input: InitiateMobilePaymentInput
): Promise<PaynowInitiateResult> {
  const { id, key } = getCredentials();

  const fields: Record<string, string> = {
    id,
    reference: input.reference,
    amount: input.amount.toFixed(2),
    additionalinfo: input.additionalInfo,
    returnurl: input.returnUrl ?? input.resultUrl,
    resulturl: input.resultUrl,
    authemail: input.authEmail,
    phone: input.phone,
    method: input.method,
    status: "Message",
  };
  fields.hash = computeHash(fields, key);

  const res = await fetchViaProxy(PAYNOW_MOBILE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields).toString(),
  });

  const parsed = parsePaynowResponse(await res.text());

  if (parsed.status?.toLowerCase() !== "ok") {
    return { success: false, error: parsed.error ?? "Paynow rejected the transaction" };
  }

  return {
    success: true,
    status: parsed.status,
    pollUrl: parsed.pollurl,
    instructions: parsed.instructions,
  };
}

/** Polls a saved pollUrl for current status — fallback if the webhook is delayed/missed. */
export async function pollTransactionStatus(
  pollUrl: string
): Promise<{ status: string; amount?: string; paynowReference?: string }> {
  const res = await fetchViaProxy(pollUrl, { method: "POST" });
  const parsed = parsePaynowResponse(await res.text());
  return {
    status: parsed.status ?? "unknown",
    amount: parsed.amount,
    paynowReference: parsed.paynowreference,
  };
}

/**
 * Verifies + parses an inbound status-update POST from Paynow's resulturl
 * webhook. Returns null if the hash doesn't check out — treat that as an
 * untrusted/forged request and reject it (don't touch the DB).
 *
 * No proxy involved here — this is Paynow calling US, not us calling them,
 * so outbound IP whitelisting is irrelevant to this function.
 */
export function parseStatusUpdate(rawBody: string): PaynowStatusUpdate | null {
  const { key } = getCredentials();
  const parsed = parsePaynowResponse(rawBody);

  if (!verifyHash(parsed, key)) {
    return null;
  }

  return {
    reference: parsed.reference,
    paynowReference: parsed.paynowreference,
    amount: parsed.amount,
    status: parsed.status,
    pollUrl: parsed.pollurl,
  };
}

export function isPaidStatus(status: string): boolean {
  return status.toLowerCase() === "paid";
}

export function isFailedStatus(status: string): boolean {
  return ["cancelled", "failed", "disputed"].includes(status.toLowerCase());
}
