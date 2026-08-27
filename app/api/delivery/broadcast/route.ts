import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkBusinessMembership } from "@/lib/ai/config-store";
import { createAndBroadcastDelivery } from "@/lib/delivery/dispatch";

/**
 * Staff-triggered: marks an order 'ready' and broadcasts it to available
 * riders in one step. Membership is verified via the RLS-scoped client;
 * the status flip + event log run on the admin client since
 * order_status_events has no member INSERT policy (SECURITY DEFINER RPCs
 * are the only normal writers there).
 */
export async function POST(req: Request) {
  const { orderId } = (await req.json()) as { orderId: string };
  if (!orderId) return NextResponse.json({ error: "orderId_required" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: order } = await supabase
    .from("orders")
    .select("id, business_id, status, fulfillment_type")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "order_not_found" }, { status: 404 });

  const membership = await checkBusinessMembership(user.id, order.business_id);
  if (!membership) return NextResponse.json({ error: "not_authorized_for_business" }, { status: 403 });

  if (order.fulfillment_type !== "delivery") {
    return NextResponse.json({ error: "order_not_marked_for_delivery" }, { status: 400 });
  }
  if (["ready", "completed", "cancelled"].includes(order.status)) {
    return NextResponse.json({ error: `order_already_${order.status}` }, { status: 409 });
  }

  const admin = createAdminClient();
  const { error: statusError } = await admin
    .from("orders")
    .update({ status: "ready", updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (statusError) return NextResponse.json({ error: statusError.message }, { status: 500 });

  await admin
    .from("order_status_events")
    .insert({ order_id: orderId, status: "ready", note: "marked ready for delivery" });

  try {
    const delivery = await createAndBroadcastDelivery(orderId);
    return NextResponse.json({ delivery });
  } catch (err) {
    const message = err instanceof Error ? err.message : "broadcast_failed";
    const knownValidation = [
      "delivery_not_enabled_for_business",
      "order_not_marked_for_delivery",
      "delivery_already_exists_for_order",
      "order_not_found",
    ];
    return NextResponse.json({ error: message }, { status: knownValidation.includes(message) ? 400 : 502 });
  }
}
