import { NextResponse } from "next/server";
import {
  parseInboundMessage,
  normalizeIncomingPhone,
  verifyWebhookSubscription,
  sendTextMessage,
} from "@/lib/delivery/whatsapp";
import { findRidersByPhone } from "@/lib/delivery/riders";
import {
  claimDeliveryByPhone,
  updateDeliveryStatusByPhone,
  findActiveClaimedDeliveries,
  findBroadcastDeliveryByShortCode,
} from "@/lib/delivery/dispatch";
import { deliveryShortCode } from "@/lib/delivery/types";

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
 * number handles every tenant's riders. A phone can ride for more than one
 * business (riders_business_phone_unique is scoped per business, not
 * globally), so every lookup here considers ALL of a phone's rider
 * identities rather than assuming one, and falls back to asking for the
 * delivery's short code only in the rare case that's actually ambiguous
 * (e.g. two active deliveries across two businesses at once).
 */
export async function POST(req: Request) {
  const body = await req.json();
  const message = parseInboundMessage(body);

  // Delivery receipts, media messages, etc. — nothing to act on.
  if (!message) {
    return NextResponse.json({ ok: true });
  }

  const riderPhone = normalizeIncomingPhone(message.from);
  const riders = await findRidersByPhone(riderPhone);

  if (!riders.length) {
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

    // Short codes are per-business (see findBroadcastDeliveryByShortCode),
    // so check each business this phone rides for until one matches —
    // a cross-business code collision is astronomically unlikely, and even
    // if it happened claim_delivery still re-validates against a specific
    // delivery id, not the code.
    let delivery: { id: string } | null = null;
    for (const r of riders) {
      delivery = await findBroadcastDeliveryByShortCode(r.businessId, shortCode);
      if (delivery) break;
    }

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

  const verbMatch = text.match(/picked\s*up|delivered|cancel/i);
  if (verbMatch) {
    const active = await findActiveClaimedDeliveries(riderPhone);

    if (!active.length) {
      await sendTextMessage(riderPhone, "You don't have an active delivery to update.");
      return NextResponse.json({ ok: true });
    }

    let target = active[0];
    if (active.length > 1) {
      // Ambiguous only when the same phone has more than one delivery in
      // flight at once (almost always across two different businesses).
      // Look for any of the candidate short codes literally in the message.
      const matched = active.find((d) => text.toUpperCase().includes(deliveryShortCode(d.id)));
      if (!matched) {
        const codes = active.map((d) => deliveryShortCode(d.id)).join(", ");
        await sendTextMessage(
          riderPhone,
          `You have more than one active delivery. Reply with the code too, e.g. "DELIVERED ${deliveryShortCode(
            active[0].id
          )}". Your active codes: ${codes}.`
        );
        return NextResponse.json({ ok: true });
      }
      target = matched;
    }

    const matchedVerb = verbMatch[0];
    const newStatus = /picked/i.test(matchedVerb)
      ? "picked_up"
      : /deliv/i.test(matchedVerb)
      ? "delivered"
      : "cancelled";
    const result = await updateDeliveryStatusByPhone(target.id, riderPhone, newStatus, text);
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
