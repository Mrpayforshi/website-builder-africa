import { createAdminClient } from "@/lib/supabase/admin";

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

/** Finds a rider's single currently-claimed (not yet delivered) delivery — used when a reply has no short code. */
export async function findActiveClaimedDelivery(riderPhone: string): Promise<{ id: string } | null> {
  const admin = createAdminClient();
  const { data: rider } = await admin.from("riders").select("id").eq("phone", riderPhone).maybeSingle();
  if (!rider) return null;

  const { data: delivery } = await admin
    .from("deliveries")
    .select("id")
    .eq("claimed_by", rider.id)
    .in("status", ["claimed", "picked_up"])
    .maybeSingle();

  return delivery ?? null;
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
