import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkBusinessMembership } from "@/lib/ai/config-store";
import { listOrdersForBusiness } from "@/lib/commerce/orders";
import { listStaffForBusiness } from "@/lib/staff/roster";
import { OrdersAssignmentPanel } from "@/components/dashboard/OrdersAssignmentPanel";

export default async function DashboardOrdersPage({
  params,
}: {
  params: { businessId: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const membership = await checkBusinessMembership(user.id, params.businessId);
  if (!membership) {
    notFound();
  }

  const [orders, staff] = await Promise.all([
    listOrdersForBusiness(params.businessId),
    listStaffForBusiness(params.businessId),
  ]);

  const isOwnerOrManager = membership.role === "owner" || membership.role === "manager";

  return (
    <OrdersAssignmentPanel
      businessId={params.businessId}
      initialOrders={orders}
      staff={staff}
      currentMembershipId={membership.id}
      isOwnerOrManager={isOwnerOrManager}
    />
  );
}
