import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { claimDeliveryByPhone, updateDeliveryStatusByPhone } from "@/lib/delivery/dispatch";
import type { Rider } from "@/lib/delivery/types";

/** Staff-side rider roster management — RLS-scoped, "members can manage riders" covers all of this. */
export async function listRidersForBusiness(businessId: string): Promise<Rider[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("riders")
    .select("*")
    .eq("business_id", businessId)
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as Rider[];
}

export async function addRider(
  businessId: string,
  input: { name: string; phone: string }
): Promise<Rider> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("riders")
    .insert({ business_id: businessId, name: input.name, phone: input.phone, status: "offline" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Rider;
}

export async function setRiderStatus(
  riderId: string,
  status: Rider["status"]
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("riders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", riderId);
  if (error) throw new Error(error.message);
}

/**
 * Looks up every business a phone number is registered as a rider for.
 * riders_business_phone_unique is scoped to (business_id, phone), not phone
 * alone — the same person can legitimately ride for more than one business,
 * so this can return more than one row. (Previously this used .maybeSingle()
 * assuming exactly one match, which throws once a phone rides for a second
 * business — see the webhook route for how callers now handle multiple.)
 * Runs on the admin client: there's no rider session to scope RLS to, and
 * this needs to see across every tenant regardless.
 */
export async function findRidersByPhone(
  phone: string
): Promise<Array<{ businessId: string; riderId: string }>> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("riders")
    .select("id, business_id")
    .eq("phone", phone);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({ businessId: r.business_id, riderId: r.id }));
}

export { claimDeliveryByPhone, updateDeliveryStatusByPhone };
