import { createClient } from "@/lib/supabase/server";

export interface StaffRosterEntry {
  id: string; // business_users.id — the FK target for orders.assigned_staff_id etc.
  user_id: string;
  role: string;
  phone: string | null;
  created_at: string;
}

/**
 * Read-only staff roster for a business, used to populate an
 * order-assignment dropdown. Adding/inviting staff isn't built here.
 *
 * RLS-scoped — relies on business_users' existing "members can view
 * business_users for their business" policy. No admin client needed since
 * this never writes.
 */
export async function listStaffForBusiness(businessId: string): Promise<StaffRosterEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_users")
    .select("id, user_id, role, phone, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as StaffRosterEntry[];
}
