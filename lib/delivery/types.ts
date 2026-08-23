// Mirrors Workstream E schema (riders, deliveries, delivery_status_events).
// Keep in sync with migrations workstream_e_delivery_schema / workstream_e_delivery_rpcs.

export type RiderStatus = "available" | "on_delivery" | "offline";
export type DeliveryStatus = "broadcast" | "claimed" | "picked_up" | "delivered" | "cancelled";

export interface Rider {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  status: RiderStatus;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  business_id: string;
  status: DeliveryStatus;
  claimed_by: string | null;
  broadcast_at: string;
  claimed_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  escalated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryStatusEvent {
  id: string;
  delivery_id: string;
  status: string;
  rider_id: string | null;
  raw_message: string | null;
  created_at: string;
}

/** Short code used in rider-facing WhatsApp messages, e.g. "CLAIM 3F9A21C4". */
export function deliveryShortCode(deliveryId: string): string {
  return deliveryId.replace(/-/g, "").slice(0, 8).toUpperCase();
}
