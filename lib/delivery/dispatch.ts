import { createAdminClient } from "@/lib/supabase/admin";
import { sendTemplateMessage } from "@/lib/delivery/whatsapp";
import { deliveryShortCode } from "@/lib/delivery/types";
import type { Delivery } from "@/lib/delivery/types";

/**
 * Creates a delivery row (status='broadcast') for an order and sends the
 * WhatsApp broadcast to every available rider for that business. Runs on
 * the admin client — this is triggered by a staff action (order marked
 * ready) or automatically by the order-status flow, not a rider session.
 */
export async function createAndBroadcastDelivery(orderId: string): Promise<Delivery> {
  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, business_id, customer_name, fulfillment_type")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    throw new Error("order_not_found");
  }
  if (order.fulfillment_type !== "delivery") {
    throw new Error("order_not_marked_for_delivery");
  }

  const { data: toggle } = await admin
    .from("feature_toggles")
    .select("enabled")
    .eq("business_id", order.business_id)
    .eq("feature_key", "delivery")
    .maybeSingle();
  if (!toggle?.enabled) {
    throw new Error("delivery_not_enabled_for_business");
  }

  const { data: existing } = await admin
    .from("deliveries")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();
  if (existing) {
    throw new Error("delivery_already_exists_for_order");
  }

  const { data: business } = await admin
    .from("businesses")
    .select("name")
    .eq("id", order.business_id)
    .single();

  const { data: delivery, error: deliveryError } = await admin
    .from("deliveries")
    .insert({ order_id: orderId, business_id: order.business_id, status: "broadcast" })
    .select()
    .single();

  if (deliveryError || !delivery) {
    throw new Error(deliveryError?.message ?? "delivery_create_failed");
  }

  await broadcastToAvailableRiders(delivery as Delivery, business?.name ?? "your order");

  return delivery as Delivery;
}

/** Sends (or re-sends, for escalation) the broadcast message to every currently-available rider. */
export async function broadcastToAvailableRiders(delivery: Delivery, businessName: string): Promise<number> {
  const admin = createAdminClient();

  const { data: riders, error } = await admin
    .from("riders")
    .select("id, phone")
    .eq("business_id", delivery.business_id)
    .eq("status", "available");

  if (error) throw new Error(error.message);
  if (!riders?.length) return 0;

  const shortCode = deliveryShortCode(delivery.id);
  const messageBody = `New delivery available for ${businessName}. Reply "CLAIM ${shortCode}" to accept.`;

  await Promise.allSettled(
    riders.map((rider) => sendTemplateMessage(rider.phone, "delivery_broadcast", [messageBody]))
  );

  return riders.length;
}

/**
 * Sweeps deliveries stuck in 'broadcast' past the timeout (via the
 * escalate_stale_broadcasts RPC), then re-broadcasts each one so waiting
 * riders get a second nudge. The escalated_at flag itself is what a
 * staff dashboard (Workstream F) would surface as "needs attention".
 */
export async function escalateAndRebroadcastStale(timeoutMinutes = 15): Promise<{ escalatedCount: number }> {
  const admin = createAdminClient();

  const { data: rpcResult, error: rpcError } = await admin.rpc("escalate_stale_broadcasts", {
    p_timeout_minutes: timeoutMinutes,
  });
  if (rpcError) throw new Error(rpcError.message);

  const { data: escalated } = await admin
    .from("deliveries")
    .select("*, businesses(name)")
    .not("escalated_at", "is", null)
    .eq("status", "broadcast");

  for (const row of escalated ?? []) {
    const { businesses, ...delivery } = row as any;
    await broadcastToAvailableRiders(delivery as Delivery, businesses?.name ?? "your order");
  }

  return { escalatedCount: rpcResult.escalated_count };
}
