import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { InventoryItem } from "@/lib/commerce/types";

/** Staff-side inventory management — RLS-scoped, "members can manage inventory" covers all of this. */
export async function listInventoryForBusiness(businessId: string): Promise<InventoryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("business_id", businessId)
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as InventoryItem[];
}

export async function upsertInventoryItem(
  businessId: string,
  item: { id?: string; name: string; sku?: string | null; price: number; quantity: number }
): Promise<InventoryItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_items")
    .upsert(
      {
        id: item.id,
        business_id: businessId,
        name: item.name,
        sku: item.sku ?? null,
        price: item.price,
        quantity: item.quantity,
      },
      { onConflict: "id" }
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as InventoryItem;
}

/**
 * Public read for the storefront product grid — shows availability
 * (quantity - reserved_quantity), not raw quantity, so holds from active
 * laybys are reflected without exposing internal reservation counts.
 */
export async function listAvailableInventoryForStorefront(
  businessId: string
): Promise<Array<{ id: string; name: string; price: number; available: number }>> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("inventory_items")
    .select("id, name, price, quantity, reserved_quantity")
    .eq("business_id", businessId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    price: Number(row.price),
    available: row.quantity - row.reserved_quantity,
  }));
}
