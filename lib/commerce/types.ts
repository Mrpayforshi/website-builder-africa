// Mirrors Workstream D schema (orders, layby_plans, layby_payments, inventory_items).
// Keep in sync with migrations workstream_d_commerce_schema / workstream_d_commerce_rpcs.

export type FulfillmentType = "pickup" | "delivery";
export type OrderType = "direct" | "layby";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "ecocash_paynow" | "cash" | "other";
export type OrderStatus = "pending" | "processing" | "ready" | "completed" | "cancelled";
export type LaybyStatus = "active" | "completed" | "forfeited" | "cancelled";
export type LaybyCadence = "weekly" | "biweekly" | "monthly";

export interface OrderLineItem {
  inventory_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  business_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: OrderLineItem[];
  total: number;
  currency: string;
  fulfillment_type: FulfillmentType;
  order_type: OrderType;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  paynow_reference: string | null;
  paynow_poll_url: string | null;
  status: OrderStatus;
  assigned_staff_id: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LaybyScheduleEntry {
  due_date: string; // ISO date, e.g. "2026-09-15"
  amount: number;
}

export interface LaybyPlan {
  id: string;
  business_id: string;
  order_id: string;
  deposit_pct: number;
  total: number;
  deposit_amount: number;
  balance_remaining: number;
  schedule: LaybyScheduleEntry[];
  status: LaybyStatus;
  grace_period_days: number;
  next_due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LaybyPayment {
  id: string;
  plan_id: string;
  amount: number;
  method: PaymentMethod;
  paynow_reference: string | null;
  paid_at: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  business_id: string;
  name: string;
  sku: string | null;
  price: number;
  quantity: number;
  reserved_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderInput {
  businessId: string;
  customerName?: string;
  customerPhone?: string;
  items: Array<{ inventoryItemId: string; quantity: number; unitPrice: number; name: string }>;
  fulfillmentType: FulfillmentType;
  orderType: OrderType;
  // layby-only:
  depositPct?: number;
  schedule?: LaybyScheduleEntry[];
  gracePeriodDays?: number;
}

export interface CreateOrderResult {
  orderId: string;
  laybyPlanId: string | null;
  total: number;
}
