import { createAdminClient } from "@/lib/supabase/admin";
import { sendTemplateMessage } from "@/lib/delivery/whatsapp";
import { deliveryShortCode, type Delivery } from "@/lib/delivery/types";

/**
 * Thin wrappers around claim_delivery / update_delivery_status — split out
 * from riders.ts to avoid a circular import with dispatch.ts (which also
 * needs rider lookups). Both RPCs identify the rider by phone number, since
 * riders authenticate only via WhatsApp, not a Supabase session.
 */

export async function claimDeliveryByPhone(
  deliveryId: string,
  riderPhone: string
): Promise<{ claimed: boolean; reason?: string; orderId?: string; riderName?: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("claim_delivery", {
    p_delivery_id: deliveryId,
    p_rider_phone: riderPhone,
  });
  if (error) throw new Error(error.message);
  return {
    claimed: data.claimed,
    reason: data.reason,
    orderId: data.order_id,
    riderName: data.rider_name,
  };
}

export async function updateDeliveryStatusByPhone(
  deliveryId: string,
  riderPhone: string,
  newStatus: "picked_up" | "delivered" | "cancelled",
  rawMessage?: string
): Promise<{ ok: boolean; reason?: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("update_delivery_status", {
    p_delivery_id: deliveryId,
    p_rider_phone: riderPhone,
    p_new_status: newStatus,
    p_raw_message: rawMessage ?? null,
  });
  if (error) throw new Error(error.message);
  return { ok: data.ok, reason: data.reason };
}

/**
 * Finds every currently-claimed (not yet delivered) delivery across all of
 * a phone number's rider identities. A phone can be a rider at more than
 * one business (riders_business_phone_unique is per-business, not global),
 * so this can legitimately return more than one delivery — the caller
 * (webhook route) disambiguates by short code when that happens.
 */
export async function findActiveClaimedDeliveries(
  riderPhone: string
): Promise<Array<{ id: string; businessId: string }>> {
  const admin = createAdminClient();
  const { data: riders } = await admin.from("riders").select("id, business_id").eq("phone", riderPhone);
  if (!riders?.length) return [];

  const { data: deliveries } = await admin
    .from("deliveries")
    .select("id, business_id")
    .in("claimed_by", riders.map((r) => r.id))
    .in("status", ["claimed", "picked_up"]);

  return (deliveries ?? []).map((d) => ({ id: d.id, businessId: d.business_id }));
}

/**
 * Finds a broadcast delivery by its short code, scoped to the rider's own
 * business. FIX: this previously took a `businessPhoneScope` param but
 * never applied it as a filter — a short-code prefix collision across two
 * different businesses' deliveries could have let a rider claim someone
 * else's delivery. Now actually filters by business_id.
 */
export async function findBroadcastDeliveryByShortCode(
  businessId: string,
  shortCode: string
): Promise<{ id: string } | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("deliveries")
    .select("id")
    .eq("status", "broadcast")
    .eq("business_id", businessId)
    .ilike("id", `${shortCode.slice(0, 8)}%`.toLowerCase())
    .maybeSingle();
  return data ?? null;
}

/** Sends (or re-sends) the delivery_broadcast template to every available rider for a business. */
async function notifyAvailableRiders(businessId: string, delivery: Delivery, orderTotal: string) {
  const admin = createAdminClient();
  const { data: riders } = await admin
    .from("riders")
    .select("id, phone")
    .eq("business_id", businessId)
    .eq("status", "available");

  const shortCode = deliveryShortCode(delivery.id);
  await Promise.all(
    (riders ?? []).map((r) =>
      sendTemplateMessage(r.phone, "delivery_broadcast", [shortCode, orderTotal])
    )
  );
}

/**
 * Creates a delivery for an order and broadcasts it to available riders.
 * Caller (route handler) is responsible for verifying the requesting user
 * is a member of the order's business before calling this — this function
 * itself runs on the admin client and does not re-check membership.
 */
export async function createAndBroadcastDelivery(orderId: string): Promise<Delivery> {
  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, business_id, fulfillment_type, total, currency")
    .eq("id", orderId)
    .maybeSingle();
  if (orderError) throw new Error(orderError.message);
  if (!order) throw new Error("order_not_found");
  if (order.fulfillment_type !== "delivery") throw new Error("order_not_marked_for_delivery");

  const { data: toggle } = await admin
    .from("feature_toggles")
    .select("enabled")
    .eq("business_id", order.business_id)
    .eq("feature_key", "delivery")
    .maybeSingle();
  if (!toggle?.enabled) throw new Error("delivery_not_enabled_for_business");

  const { data: existing } = await admin
    .from("deliveries")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();
  if (existing) throw new Error("delivery_already_exists_for_order");

  const { data: delivery, error: insertError } = await admin
    .from("deliveries")
    .insert({ order_id: orderId, business_id: order.business_id })
    .select()
    .single();
  if (insertError) throw new Error(insertError.message);

  await admin
    .from("delivery_status_events")
    .insert({ delivery_id: delivery.id, status: "broadcast" });

  await notifyAvailableRiders(
    order.business_id,
    delivery as Delivery,
    `${order.currency} ${order.total}`
  );

  return delivery as Delivery;
}

/**
 * Scheduled sweep (see vercel.json's escalate-broadcasts cron). Marks any
 * broadcast delivery older than the timeout as escalated via the
 * escalate_stale_broadcasts RPC, then re-notifies available riders for
 * each newly-escalated delivery so it gets claimed on a second pass.
 */
export async function escalateAndRebroadcastStale(
  timeoutMinutes = 15
): Promise<{ escalatedCount: number; rebroadcastDeliveryIds: string[] }> {
  const admin = createAdminClient();
  const sweepStartedAt = new Date().toISOString();

  const { data, error } = await admin.rpc("escalate_stale_broadcasts", {
    p_timeout_minutes: timeoutMinutes,
  });
  if (error) throw new Error(error.message);

  const escalatedCount: number = data?.escalated_count ?? 0;
  if (escalatedCount === 0) {
    return { escalatedCount: 0, rebroadcastDeliveryIds: [] };
  }

  const { data: escalated } = await admin
    .from("deliveries")
    .select("id, business_id, order_id")
    .eq("status", "broadcast")
    .gte("escalated_at", sweepStartedAt);

  const rebroadcastDeliveryIds: string[] = [];
  for (const delivery of escalated ?? []) {
    const { data: order } = await admin
      .from("orders")
      .select("total, currency")
      .eq("id", delivery.order_id)
      .maybeSingle();
    await notifyAvailableRiders(
      delivery.business_id,
      delivery as Delivery,
      order ? `${order.currency} ${order.total}` : ""
    );
    rebroadcastDeliveryIds.push(delivery.id);
  }

  return { escalatedCount, rebroadcastDeliveryIds };
}
