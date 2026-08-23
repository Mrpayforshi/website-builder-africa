import crypto from "crypto";

/**
 * Paynow integration — this is the ONLY payment path per the locked
 * architectural decision (EcoCash via Paynow as aggregator, not direct
 * EcoCash API). Do not add a direct EcoCash integration here.
 *
 * OPERATIONAL NOTE (deployment, not a design decision): Paynow IP-whitelists
 * callers of these interface endpoints. On Vercel (no static outbound IP)
 * these fetch() calls will need to go through a fixed-IP relay — a small
 * VPS, or a static-IP egress add-on — sitting between this code and Paynow.
 * Flagging this now so it isn't discovered at go-live.
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

  const res = await fetch(PAYNOW_MOBILE_URL, {
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
  const res = await fetch(pollUrl, { method: "POST" });
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
