import { NextResponse } from "next/server";
import {
  parseInboundMessage,
  normalizeIncomingPhone,
  verifyWebhookSubscription,
  sendTextMessage,
} from "@/lib/delivery/whatsapp";
import { findRiderByPhone } from "@/lib/delivery/riders";
import {
  claimDeliveryByPhone,
  updateDeliveryStatusByPhone,
  findActiveClaimedDelivery,
  findBroadcastDeliveryByShortCode,
} from "@/lib/delivery/dispatch";

/** Meta's subscription verification handshake. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const challenge = verifyWebhookSubscription(searchParams);
  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "verification_failed" }, { status: 403 });
}

/**
 * Rider-facing WhatsApp bot flow — simple keyword matching per the v1 spec
 * (no live GPS, status-based tracking only). One shared platform WhatsApp
 * number handles every tenant's riders, so a rider is resolved by phone
 * number alone (see findRiderByPhone's one-rider-one-business assumption,
 * a known open item, not addressed here).
 */
export async function POST(req: Request) {
  const body = await req.json();
  const message = parseInboundMessage(body);

  // Delivery receipts, media messages, etc. — nothing to act on.
  if (!message) {
    return NextResponse.json({ ok: true });
  }

  const riderPhone = normalizeIncomingPhone(message.from);
  const rider = await findRiderByPhone(riderPhone);

  if (!rider) {
    await sendTextMessage(
      riderPhone,
      "This number isn't registered as a rider for any business on this platform."
    );
    return NextResponse.json({ ok: true });
  }

  const text = message.text.trim();
  const claimMatch = text.match(/^claim\s+([a-z0-9]+)/i);

  if (claimMatch) {
    const shortCode = claimMatch[1];
    const delivery = await findBroadcastDeliveryByShortCode(rider.businessId, shortCode);

    if (!delivery) {
      await sendTextMessage(
        riderPhone,
        `Couldn't find an open delivery matching "${shortCode}" — it may already be claimed.`
      );
      return NextResponse.json({ ok: true });
    }

    const result = await claimDeliveryByPhone(delivery.id, riderPhone);
    const reply = result.claimed
      ? `You're on it! Delivery ${shortCode} is yours.`
      : result.reason === "already_claimed"
      ? `Sorry, delivery ${shortCode} was just claimed by another rider.`
      : `Couldn't claim delivery ${shortCode} (${result.reason ?? "unknown error"}).`;
    await sendTextMessage(riderPhone, reply);
    return NextResponse.json({ ok: true });
  }

  if (/picked\s*up|delivered|cancel/i.test(text)) {
    const active = await findActiveClaimedDelivery(riderPhone);
    if (!active) {
      await sendTextMessage(riderPhone, "You don't have an active delivery to update.");
      return NextResponse.json({ ok: true });
    }

    const newStatus = /picked/i.test(text) ? "picked_up" : /deliv/i.test(text) ? "delivered" : "cancelled";
    const result = await updateDeliveryStatusByPhone(active.id, riderPhone, newStatus, text);
    const reply = result.ok
      ? `Got it — marked as ${newStatus.replace("_", " ")}.`
      : `Couldn't update status (${result.reason ?? "unknown error"}).`;
    await sendTextMessage(riderPhone, reply);
    return NextResponse.json({ ok: true });
  }

  await sendTextMessage(
    riderPhone,
    'Reply "CLAIM <code>" to accept a delivery, or "PICKED UP" / "DELIVERED" to update your active delivery.'
  );
  return NextResponse.json({ ok: true });
}
