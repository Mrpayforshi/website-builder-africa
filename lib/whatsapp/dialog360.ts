/**
 * 360dialog Partner API + Messaging API client.
 *
 * Two distinct base URLs/auth schemes, per 360dialog's docs:
 *  - Partner API (hub.360dialog.io) — authenticated with OUR partner API
 *    key (DIALOG360_PARTNER_API_KEY), used for account/channel/Flow
 *    management across ALL tenants.
 *  - Messaging API (waba-v2.360dialog.io) — authenticated per-request
 *    with a specific TENANT'S channel API key (D360-API-KEY header),
 *    used to actually send messages on that tenant's number.
 *
 * NOTE ON UNVERIFIED SHAPES: the Partner webhook event names
 * (`channel_created` / `channel_running` / `channel_live`) and the
 * exact response shape of the "create channel API key" endpoint are
 * inconsistent across 360dialog's own docs pages at the time this was
 * written. Both are marked below — confirm against real payloads from
 * the 360dialog Partner Sandbox before this goes live, per the repo's
 * "verify against live state before trusting it" rule.
 */

const PARTNER_BASE_URL = "https://hub.360dialog.io/api/v2";
const MESSAGING_BASE_URL = "https://waba-v2.360dialog.io";

function getPartnerConfig() {
  const partnerId = process.env.DIALOG360_PARTNER_ID;
  const apiKey = process.env.DIALOG360_PARTNER_API_KEY;
  if (!partnerId || !apiKey) {
    throw new Error("DIALOG360_PARTNER_ID / DIALOG360_PARTNER_API_KEY are not set.");
  }
  return { partnerId, apiKey };
}

async function partnerRequest<T>(
  path: string,
  init: { method?: string; body?: unknown; formData?: FormData } = {}
): Promise<T> {
  const { apiKey } = getPartnerConfig();
  const headers: Record<string, string> = { "X-API-Key": apiKey };
  let body: BodyInit | undefined;

  if (init.formData) {
    body = init.formData; // fetch sets multipart boundary automatically
  } else if (init.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.body);
  }

  const res = await fetch(`${PARTNER_BASE_URL}${path}`, {
    method: init.method ?? "GET",
    headers,
    body,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      `360dialog Partner API error ${res.status} on ${path}: ${data?.meta?.developer_message ?? JSON.stringify(data)}`
    );
  }
  return data as T;
}

async function messagingRequest<T>(
  channelApiKey: string,
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(`${MESSAGING_BASE_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "D360-API-KEY": channelApiKey,
      "Content-Type": "application/json",
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`360dialog Messaging API error ${res.status} on ${path}: ${JSON.stringify(data)}`);
  }
  return data as T;
}

// ---------------------------------------------------------------------------
// Channel API key generation
// ---------------------------------------------------------------------------

/**
 * Generates (or rotates) a Messaging API key for a channel we have Partner
 * permission over. Response shape unverified against a real sandbox call —
 * adjust the `.api_key` access below once confirmed; some 360dialog docs
 * examples show `api_key`, others just the raw key string.
 */
export async function generateChannelApiKey(channelId: string): Promise<string> {
  const { partnerId } = getPartnerConfig();
  const result = await partnerRequest<{ api_key: string }>(
    `/partners/${partnerId}/channels/${channelId}/api_keys`,
    { method: "POST" }
  );
  return result.api_key;
}

// ---------------------------------------------------------------------------
// Flow encryption key registration (per-WABA, Messaging API scoped)
// ---------------------------------------------------------------------------

/** Registers this tenant's RSA public key with Meta for Flow data-exchange encryption. */
export async function registerFlowPublicKey(channelApiKey: string, publicKeyPem: string): Promise<void> {
  const res = await fetch(`${MESSAGING_BASE_URL}/whatsapp_business_encryption`, {
    method: "POST",
    headers: {
      "D360-API-KEY": channelApiKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ business_public_key: publicKeyPem }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to register Flow public key (${res.status}): ${text}`);
  }
}

// ---------------------------------------------------------------------------
// Flow lifecycle — clone the template flow into a tenant's WABA, publish it
// ---------------------------------------------------------------------------

export interface CreateFlowInput {
  wabaId: string;
  name: string;
  category:
    | "SIGN_UP"
    | "SIGN_IN"
    | "APPOINTMENT_BOOKING"
    | "LEAD_GENERATION"
    | "CONTACT_US"
    | "CUSTOMER_SUPPORT"
    | "SURVEY"
    | "OTHER";
  /** Set when cloning our reusable order-flow template into a new tenant's WABA. */
  cloneFlowId?: string;
  endpointUri: string;
}

export async function createFlow(input: CreateFlowInput): Promise<{ id: string }> {
  const { partnerId } = getPartnerConfig();
  return partnerRequest<{ id: string }>(`/partners/${partnerId}/waba_accounts/${input.wabaId}/flows`, {
    method: "POST",
    body: {
      name: input.name,
      categories: [input.category],
      clone_flow_id: input.cloneFlowId,
      endpoint_uri: input.endpointUri,
    },
  });
}

export async function uploadFlowJson(wabaId: string, flowId: string, flowJson: object): Promise<void> {
  const { partnerId } = getPartnerConfig();
  const formData = new FormData();
  formData.append(
    "file",
    new Blob([JSON.stringify(flowJson)], { type: "application/json" }),
    "flow.json"
  );
  formData.append("name", "flow.json");
  formData.append("asset_type", "FLOW_JSON");

  await partnerRequest(`/partners/${partnerId}/waba_accounts/${wabaId}/flows/${flowId}/assets`, {
    method: "POST",
    formData,
  });
}

export async function publishFlow(wabaId: string, flowId: string): Promise<void> {
  const { partnerId } = getPartnerConfig();
  await partnerRequest(`/partners/${partnerId}/waba_accounts/${wabaId}/flows/${flowId}/publish`, {
    method: "POST",
  });
}

/**
 * Deploys the reusable order-flow template into a newly-onboarded
 * tenant's WABA: create (cloning the master template flow), upload the
 * JSON, publish. Returns the new tenant-scoped flow id.
 *
 * masterFlowId comes from WHATSAPP_ORDER_FLOW_TEMPLATE_ID (the one Flow
 * we author and publish once, in our own reference WABA — see the Flow
 * JSON design, next file batch).
 */
export async function deployOrderFlowToTenant(input: {
  wabaId: string;
  businessName: string;
  endpointUri: string;
}): Promise<string> {
  const masterFlowId = process.env.WHATSAPP_ORDER_FLOW_TEMPLATE_ID;
  if (!masterFlowId) {
    throw new Error("WHATSAPP_ORDER_FLOW_TEMPLATE_ID is not set — author and publish the template flow first.");
  }

  const flow = await createFlow({
    wabaId: input.wabaId,
    name: `${input.businessName} — Order Flow`,
    category: "OTHER",
    cloneFlowId: masterFlowId,
    endpointUri: input.endpointUri,
  });
  await publishFlow(input.wabaId, flow.id);
  return flow.id;
}

// ---------------------------------------------------------------------------
// Messaging — List Message menu + Flow-trigger CTA
// ---------------------------------------------------------------------------

/** Sends the top-level "Select Option" style List Message (see Mobis screenshots). */
export async function sendListMessage(
  channelApiKey: string,
  to: string,
  input: {
    bodyText: string;
    buttonText: string;
    sections: { title: string; rows: { id: string; title: string; description?: string }[] }[];
  }
): Promise<void> {
  await messagingRequest(channelApiKey, "/messages", {
    method: "POST",
    body: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: input.bodyText },
        action: { button: input.buttonText, sections: input.sections },
      },
    },
  });
}

/** Sends the CTA that launches the tenant's order-taking WhatsApp Flow. */
export async function sendFlowTrigger(
  channelApiKey: string,
  to: string,
  input: { flowId: string; flowToken: string; ctaText: string; bodyText: string; screen: string }
): Promise<void> {
  await messagingRequest(channelApiKey, "/messages", {
    method: "POST",
    body: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "interactive",
      interactive: {
        type: "flow",
        body: { text: input.bodyText },
        action: {
          name: "flow",
          parameters: {
            flow_message_version: "3",
            flow_token: input.flowToken,
            flow_id: input.flowId,
            flow_cta: input.ctaText,
            flow_action: "navigate",
            flow_action_payload: { screen: input.screen },
          },
        },
      },
    },
  });
}
