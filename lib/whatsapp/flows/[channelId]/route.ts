import { NextResponse } from "next/server";
import { decryptFlowRequest, encryptFlowResponse, type EncryptedFlowRequestBody } from "@/lib/whatsapp/crypto";
import { getChannelByChannelId } from "@/lib/whatsapp/channel-store";

/**
 * WhatsApp Flow data-exchange endpoint, tenant-scoped by channelId in the
 * URL. Registered as this tenant's Flow `endpoint_uri` (see
 * lib/whatsapp/dialog360.ts deployOrderFlowToTenant, which sets it to
 * `${ROOT_DOMAIN}/api/whatsapp/flows/${channelId}`) — deliberately NOT a
 * single shared route, because the request body arrives RSA/AES-encrypted
 * and there's nothing to route on until it's decrypted with a specific
 * tenant's private key. The URL segment is what tenant-scopes it; the
 * handler logic itself is still shared code, same as the rest of the
 * platform's toggleable-module pattern.
 *
 * Meta's endpoint contract (see lib/whatsapp/crypto.ts for the encryption
 * mechanics): must return 421 on decryption failure (signals the client
 * to refresh its cached public key, not just retry), must answer
 * {action: "ping"} even on an unpublished Flow, and every other response
 * is the AES-encrypted next-screen payload as a raw text/plain body.
 *
 * PLACEHOLDER: only the protocol-level responses (ping, INIT) are real
 * below. The data_exchange branch — item selection, quantities, final
 * submit → createOrder — depends on the Flow JSON's actual screen names
 * and field ids, which haven't been authored yet. That's the next file
 * batch, alongside wiring channel.businessId's content_blocks/
 * inventory_items into the MENU screen's data.
 */

interface FlowDataExchangePayload {
  version?: string;
  action?: "ping" | "INIT" | "data_exchange" | "BACK";
  screen?: string;
  data?: Record<string, unknown>;
  flow_token?: string;
}

export async function POST(req: Request, { params }: { params: { channelId: string } }) {
  const body = (await req.json()) as EncryptedFlowRequestBody;

  const channel = await getChannelByChannelId(params.channelId);
  if (!channel?.encryptionPrivateKeyPem) {
    return new NextResponse("channel not found or not activated", { status: 421 });
  }

  let decrypted;
  try {
    decrypted = decryptFlowRequest(body, channel.encryptionPrivateKeyPem);
  } catch {
    return new NextResponse("decryption failed", { status: 421 });
  }

  const { payload, aesKey, iv } = decrypted;
  const flowPayload = payload as FlowDataExchangePayload;

  if (flowPayload.action === "ping") {
    const response = encryptFlowResponse({ data: { status: "active" } }, aesKey, iv);
    return new NextResponse(response, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  if (flowPayload.action === "INIT") {
    // TODO: read channel.businessId's site_configs.content_blocks /
    // inventory_items and populate the real first screen's data here.
    const response = encryptFlowResponse({ screen: "MENU", data: {} }, aesKey, iv);
    return new NextResponse(response, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  // TODO: data_exchange per-screen routing (item selection, quantities,
  // final submit → lib/commerce/orders.ts createOrder) lands once the
  // Flow JSON's screen names/fields exist.
  const response = encryptFlowResponse({ screen: flowPayload.screen ?? "MENU", data: {} }, aesKey, iv);
  return new NextResponse(response, { status: 200, headers: { "Content-Type": "text/plain" } });
}
