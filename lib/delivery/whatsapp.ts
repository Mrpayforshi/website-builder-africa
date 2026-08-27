const WHATSAPP_API_VERSION = "v20.0";

function getConfig() {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    throw new Error("WHATSAPP_CLOUD_API_TOKEN / WHATSAPP_PHONE_NUMBER_ID are not set.");
  }
  return { token, phoneNumberId };
}

/** Riders' phone numbers are stored +263-normalized elsewhere in the app; the Cloud API wants digits only. */
function toWhatsAppNumber(phone: string): string {
  return phone.replace(/^\+/, "");
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

async function callWhatsAppApi(body: Record<string, unknown>): Promise<WhatsAppSendResult> {
  const { token, phoneNumberId } = getConfig();

  const res = await fetch(`https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, error: data?.error?.message ?? `whatsapp_api_error_${res.status}` };
  }
  return { success: true, messageId: data?.messages?.[0]?.id };
}

/**
 * Sends an approved WhatsApp message template. `delivery_broadcast` must be
 * created and approved in Meta Business Manager before this will send (see
 * project notes — this is the documented deployment blocker, not a bug).
 * `params` fill the template's numbered body variables in order.
 */
export async function sendTemplateMessage(
  phone: string,
  templateName: string,
  params: string[],
  languageCode = "en_US"
): Promise<WhatsAppSendResult> {
  return callWhatsAppApi({
    messaging_product: "whatsapp",
    to: toWhatsAppNumber(phone),
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components: params.length
        ? [{ type: "body", parameters: params.map((text) => ({ type: "text", text })) }]
        : undefined,
    },
  });
}

/**
 * Free-form text reply. Only deliverable within Meta's 24-hour
 * customer-service window (the rider messaged us first) — use
 * sendTemplateMessage to initiate contact outside that window.
 */
export async function sendTextMessage(phone: string, body: string): Promise<WhatsAppSendResult> {
  return callWhatsAppApi({
    messaging_product: "whatsapp",
    to: toWhatsAppNumber(phone),
    type: "text",
    text: { body },
  });
}

export interface InboundWhatsAppMessage {
  from: string; // digits only, no leading +
  text: string;
  messageId: string;
}

/**
 * Parses Meta's webhook "messages" change notification. Returns null for
 * anything that isn't an inbound text message (status callbacks, media,
 * etc.) — the webhook route should just 200 and ignore those.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseInboundMessage(body: any): InboundWhatsAppMessage | null {
  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message || message.type !== "text") return null;

  return {
    from: message.from,
    text: message.text?.body ?? "",
    messageId: message.id,
  };
}

/** Meta gives inbound numbers as digits-only; riders.phone is stored +263-normalized. */
export function normalizeIncomingPhone(rawFrom: string): string {
  return `+${rawFrom.replace(/\D/g, "")}`;
}

/** Meta's webhook verification handshake (GET with hub.challenge). Returns the challenge to echo back, or null. */
export function verifyWebhookSubscription(searchParams: URLSearchParams): string | null {
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && challenge && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return challenge;
  }
  return null;
}
