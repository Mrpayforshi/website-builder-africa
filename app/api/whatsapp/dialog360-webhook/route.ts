import { NextResponse } from "next/server";
import { generateFlowKeyPair } from "@/lib/whatsapp/crypto";
import { activateChannel, getChannelByChannelId, setFlowDeployment } from "@/lib/whatsapp/channel-store";
import { deployOrderFlowToTenant, generateChannelApiKey, registerFlowPublicKey } from "@/lib/whatsapp/dialog360";

/**
 * 360dialog Partner API webhook (configured once via POST
 * /partners/{partner_id}/webhook_url) — distinct from
 * app/api/whatsapp/webhook, which is the platform's own Meta Cloud API
 * webhook for the rider dispatch bot. This one carries account/channel
 * lifecycle events across every tenant's onboarding.
 *
 * The exact "channel is ready" event name is inconsistent across
 * 360dialog's docs at time of writing (channel_running,
 * channel_status_running, and channel_live all appear on different
 * pages). Treated as equivalent here — narrow this once a real sandbox
 * payload confirms which one actually fires.
 */
const CHANNEL_READY_EVENTS = new Set(["channel_running", "channel_status_running", "channel_live"]);

interface Dialog360WebhookEvent {
  event?: string;
  type?: string;
  client_id?: string;
  channel?: string; // channel_id, per docs' "identify which client created this channel in the client_id and client fields"
  waba_account_id?: string;
  phone_number?: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as Dialog360WebhookEvent;
  const eventName = body.event ?? body.type ?? "";

  if (!CHANNEL_READY_EVENTS.has(eventName)) {
    // client_created, channel_created, phone_number_quality_changed, etc. — nothing to act on yet.
    return NextResponse.json({ ok: true });
  }

  const channelId = body.channel;
  const wabaId = body.waba_account_id;
  const phoneNumber = body.phone_number;
  if (!channelId || !wabaId || !phoneNumber) {
    console.error("dialog360-webhook: channel-ready event missing required fields", body);
    return NextResponse.json({ ok: true }); // ack anyway — 360dialog retries on non-200
  }

  const channel = await getChannelByChannelId(channelId);
  if (!channel) {
    console.error(`dialog360-webhook: no whatsapp_channels row for channel_id ${channelId}`);
    return NextResponse.json({ ok: true });
  }

  // Idempotency: retried webhooks shouldn't regenerate keys / redeploy the Flow.
  if (channel.status === "live") {
    return NextResponse.json({ ok: true });
  }

  const apiKey = await generateChannelApiKey(channelId);
  const { publicKeyPem, privateKeyPem } = generateFlowKeyPair();
  await registerFlowPublicKey(apiKey, publicKeyPem);

  await activateChannel({
    channelId,
    wabaId,
    phoneNumber,
    publicKeyPem,
    privateKeyPem,
    apiKey,
  });

  // Tenant-scoped by channelId in the path — see
  // app/api/whatsapp/flows/[channelId]/route.ts for why the data-exchange
  // endpoint can't be a single shared URL. NEXT_PUBLIC_ROOT_DOMAIN is the
  // same var flagged unverified in project notes (Vercel env state
  // unverifiable until the MCP connector is back) — confirm it resolves
  // correctly before this deploy step is trusted.
  const flowEndpointUri = `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/api/whatsapp/flows/${channelId}`;
  const flowId = await deployOrderFlowToTenant({
    wabaId,
    businessName: channel.businessId, // TODO: swap for the actual business name once passed through — see next batch
    endpointUri: flowEndpointUri,
  });
  await setFlowDeployment({ businessId: channel.businessId, flowId, flowStatus: "published" });

  return NextResponse.json({ ok: true });
}
