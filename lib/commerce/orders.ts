import { createAdminClient } from "@/lib/supabase/admin";
import type { CreateOrderInput, CreateOrderResult, Order, PaymentStatus } from "@/lib/commerce/types";

/**
 * Creates an order (and, for layby orders, its layby_plan) via the
 * create_order RPC (SECURITY DEFINER, row-locks each inventory_items row
 * before holding stock — see workstream_d_commerce_rpcs migration).
 *
 * Called from the public checkout route with no authenticated user, so this
 * always goes through the admin client — RLS on `orders`/`inventory_items`
 * would otherwise block an anonymous customer entirely.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const admin = createAdminClient();

  const items = input.items.map((item) => ({
    inventory_item_id: item.inventoryItemId,
    name: item.name,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }));

  const { data, error } = await admin.rpc("create_order", {
    p_business_id: input.businessId,
    p_customer_name: input.customerName ?? null,
    p_customer_phone: input.customerPhone ?? null,
    p_items: items,
    p_fulfillment_type: input.fulfillmentType,
    p_order_type: input.orderType,
    p_deposit_pct: input.depositPct ?? null,
    p_schedule: input.schedule ?? null,
    p_grace_period_days: input.gracePeriodDays ?? 0,
  });

  if (error) throw new Error(error.message);

  return {
    orderId: data.order_id,
    laybyPlanId: data.layby_plan_id ?? null,
    total: Number(data.total),
  };
}

/**
 * Records the Paynow poll URL returned by initiateEcocashPayment, so a
 * delayed/missed webhook can be recovered from later via pollTransactionStatus.
 */
export async function saveOrderPollUrl(orderId: string, pollUrl: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ paynow_poll_url: pollUrl })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
}

/**
 * Confirms (or fails) an order's payment via confirm_order_payment.
 * Only called from the verified Paynow webhook, per the same rule as
 * recordLaybyPayment — never call this synchronously after
 * initiateEcocashPayment, since that only confirms the USSD push was sent.
 */
export async function confirmOrderPayment(
  orderId: string,
  status: Extract<PaymentStatus, "paid" | "failed">,
  paynowReference?: string
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("confirm_order_payment", {
    p_order_id: orderId,
    p_payment_status: status,
    p_paynow_reference: paynowReference ?? null,
  });
  if (error) throw new Error(error.message);
}

/** Admin-side lookup used by the unauthenticated Paynow webhook to disambiguate a reference. */
export async function getOrderByIdAdmin(orderId: string): Promise<Order | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Order | null;
}
