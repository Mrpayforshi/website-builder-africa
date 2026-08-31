import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkBusinessMembership } from "@/lib/ai/config-store";
import { assignOrderStaff } from "@/lib/commerce/orders";

/**
 * Assigns or unassigns an order to a staff member.
 *
 * Role rules (enforced here, not in RLS — "members can update orders" is
 * member-level, not role-scoped, per the orders RLS policy):
 * - owner/manager: can assign any order to any business_users.id on the
 *   business, or unassign (staffId: null).
 * - staff: can only self-claim (staffId === their own business_users.id)
 *   or self-release (unassigning an order currently assigned to them).
 *
 * Body: { staffId: string | null }
 */
export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;
  if (!orderId) return NextResponse.json({ error: "orderId_required" }, { status: 400 });

  const { staffId }: { staffId: string | null } = await req.json();
  if (staffId === undefined) {
    return NextResponse.json({ error: "staffId_required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, business_id, assigned_staff_id")
    .eq("id", orderId)
    .maybeSingle();
  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });
  if (!order) return NextResponse.json({ error: "order_not_found" }, { status: 404 });

  const membership = await checkBusinessMembership(user.id, order.business_id);
  if (!membership) return NextResponse.json({ error: "not_authorized_for_business" }, { status: 403 });

  const isOwnerOrManager = membership.role === "owner" || membership.role === "manager";

  if (!isOwnerOrManager) {
    const isSelfClaim = staffId === membership.id;
    const isSelfRelease = staffId === null && order.assigned_staff_id === membership.id;
    if (!isSelfClaim && !isSelfRelease) {
      return NextResponse.json(
        { error: "staff_can_only_self_claim_or_release" },
        { status: 403 }
      );
    }
  }

  try {
    const updated = await assignOrderStaff({
      orderId,
      businessId: order.business_id,
      staffId,
      actorBusinessUserId: membership.id,
    });
    return NextResponse.json({ order: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "assign_order_staff_failed";
    const status = message === "staff_not_member_of_business" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
