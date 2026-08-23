import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { claimDeliveryByPhone, updateDeliveryStatusByPhone } from "@/lib/delivery/dispatch-actions";
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
 * Looks up which business a phone number belongs to as a rider, across all
 * tenants — needed because the webhook receives one shared WhatsApp number
 * for the whole platform, not one per business. Runs on the admin client:
 * there's no rider session to scope RLS to.
 */
export async function findRiderByPhone(phone: string): Promise<{ businessId: string; riderId: string } | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("riders")
    .select("id, business_id")
    .eq("phone", phone)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? { businessId: data.business_id, riderId: data.id } : null;
}

export { claimDeliveryByPhone, updateDeliveryStatusByPhone };
