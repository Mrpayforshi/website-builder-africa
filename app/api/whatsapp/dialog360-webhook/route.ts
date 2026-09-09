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
 * CONFIRMED against 360dialog's docs (docs.360dialog.com/partner/onboarding/
 * webhook-events-and-setup/webhook-events-partner-and-messaging-api, and
 * .../waba-creation/webhooks): the lifecycle is a sequence of DISTINCT
 * events — client_created -> channel_created -> channel_ready ->
 * channel_running -> channel_live — not interchangeable names for the
 * same event (this file previously treated channel_running and
 * channel_live as equivalent, which was wrong). Their own docs state
 * plainly: "When the number is fully live, you will receive the Channel
 * Live Webhook Event. You should be able to generate an API Key..." —
 * channel_live is the only event this handler should act on.
 *
 * Payload shape is also confirmed nested under `data`, not flat:
 *   { id, event, data: { id, client_id, account_mode, status,
 *     setup_info: { phone_number, phone_name }, waba_account: { id } } }
 * (previous version read flat body.channel / body.waba_account_id /
 * body.phone_number, none of which exist in the real payload).
 *
 * STILL UNVERIFIED: the exact response shape of generateChannelApiKey's
 * underlying endpoint (see dialog360.ts) — that one genuinely differs
 * across 360dialog's own doc examples and hasn't been confirmed against
 * a live sandbox call.
 */
interface Dialog360WebhookEvent {
  id?: string;
  event?: string;
  data?: {
    id?: string; // channel_id
    client_id?: string;
    account_mode?: string;
    status?: string;
    setup_info?: { phone_number?: string; phone_name?: string };
    waba_account?: { id?: string };
  };
}

export async function POST(req: Request) {
  const body = (await req.json()) as Dialog360WebhookEvent;

  if (body.event !== "channel_live") {
    // client_created, channel_created, channel_ready, channel_running,
    // phone_number_quality_changed, etc. — nothing to act on yet.
    return NextResponse.json({ ok: true });
  }

  const channelId = body.data?.id;
  const wabaId = body.data?.waba_account?.id;
  const phoneNumber = body.data?.setup_info?.phone_number;
  if (!channelId || !wabaId || !phoneNumber) {
    console.error("dialog360-webhook: channel_live event missing required fields", body);
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
  // endpoint can't be a single shared URL.
  const flowEndpointUri = `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/api/whatsapp/flows/${channelId}`;
  const flowId = await deployOrderFlowToTenant({
    wabaId,
    businessName: channel.businessId, // TODO: swap for the actual business name once passed through
    endpointUri: flowEndpointUri,
  });
  await setFlowDeployment({ businessId: channel.businessId, flowId, flowStatus: "published" });

  return NextResponse.json({ ok: true });
}
