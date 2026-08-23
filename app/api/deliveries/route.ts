import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAndBroadcastDelivery } from "@/lib/delivery/dispatch";

/**
 * Staff-triggered: mark an order ready for delivery and broadcast it to
 * riders. Authorization: the caller must be a member of the order's
 * business — checked via RLS on the orders SELECT before we touch the
 * admin-client RPC path inside createAndBroadcastDelivery. Same
 * load-bearing pattern as Workstream B/D: verify membership before any
 * SECURITY DEFINER call.
 */
export async function POST(req: Request) {
  const { orderId } = await req.json();
  if (!orderId) {
    return NextResponse.json({ error: "orderId_required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // RLS-scoped read — returns null if this user isn't a member of the order's business.
  const { data: order } = await supabase.from("orders").select("id").eq("id", orderId).maybeSingle();
  if (!order) {
    return NextResponse.json({ error: "order_not_found_or_not_authorized" }, { status: 404 });
  }

  try {
    const delivery = await createAndBroadcastDelivery(orderId);
    return NextResponse.json({ deliveryId: delivery.id, status: delivery.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "delivery_creation_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
