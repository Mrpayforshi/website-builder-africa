import { NextResponse } from "next/server";
import { decryptFlowRequest, encryptFlowResponse, type EncryptedFlowRequestBody } from "@/lib/whatsapp/crypto";
import { getChannelByChannelId } from "@/lib/whatsapp/channel-store";
import { listAvailableInventoryForStorefront } from "@/lib/commerce/inventory";
import { createOrder } from "@/lib/commerce/orders";

/**
 * WhatsApp Flow data-exchange endpoint, tenant-scoped by channelId in the
 * URL. Registered as this tenant's Flow `endpoint_uri` (see
 * lib/whatsapp/dialog360.ts deployOrderFlowToTenant, which sets it to
 * `${ROOT_DOMAIN}/api/whatsapp/flows/${channelId}`) — deliberately NOT a
 * single shared route, because the request body arrives RSA/AES-encrypted
 * and there's nothing to route on until it's decrypted with a specific
 * tenant's private key. The URL segment is what tenant-scopes it; the
 * handler logic itself is still shared code, same as the rest of the
 * platform's toggleable-module pattern.
 *
 * Meta's endpoint contract (see lib/whatsapp/crypto.ts for the encryption
 * mechanics): must return 421 on decryption failure (signals the client
 * to refresh its cached public key, not just retry), must answer
 * {action: "ping"} even on an unpublished Flow, and every other response
 * is the AES-encrypted next-screen payload as a raw text/plain body.
 *
 * SCREEN FLOW (matches lib/whatsapp/flows/order-flow.json):
 *   MENU (item picker, quantity dropdowns) -> CHECKOUT (customer info +
 *   review) -> SUCCESS (terminal, closes the Flow client-side via the
 *   "complete" action — no server round trip on that last tap).
 *
 * DESIGN NOTE — capped menu slots: Flow JSON screens are static and have
 * no repeater/loop construct, so a dynamic-length item list can't become
 * a dynamic number of quantity inputs. order-flow.json pre-declares
 * MAX_MENU_ITEMS (20) Dropdown slots and toggles each one's `visible`
 * flag from here. A tenant with more than 20 active inventory items will
 * only see the first 20 (ordered by name) until the template is
 * regenerated with a higher cap — flagging this now since it's a real
 * ceiling, not a bug.
 *
 * UNVERIFIED: the Flow JSON `version`/`data_api_version` values in
 * order-flow.json (currently "6.3"/"3.0") and the exact `visible`
 * boolean-expression syntax used for delivery_address were written from
 * general Flow JSON knowledge, not confirmed against Meta's live Flow
 * Builder validator or a real 360dialog asset-upload response — validate
 * the JSON in Flow Builder's preview before publishing (see
 * uploadFlowJson/publishFlow in dialog360.ts).
 */

interface FlowDataExchangePayload {
  version?: string;
  action?: "ping" | "INIT" | "data_exchange" | "BACK";
  screen?: string;
  data?: Record<string, unknown>;
  flow_token?: string;
}

const MAX_MENU_ITEMS = 20;
const QTY_OPTIONS = Array.from({ length: 11 }, (_, n) => ({ id: String(n), title: String(n) }));

function currency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/** Builds the MENU screen's per-slot data from a tenant's available inventory, capped at MAX_MENU_ITEMS. */
function buildMenuScreenData(items: Array<{ id: string; name: string; price: number; available: number }>) {
  const inStock = items.filter((item) => item.available > 0).slice(0, MAX_MENU_ITEMS);
  const data: Record<string, unknown> = { qty_options: QTY_OPTIONS };

  for (let i = 0; i < MAX_MENU_ITEMS; i++) {
    const slot = i + 1;
    const item = inStock[i];
    data[`item_${slot}_id`] = item?.id ?? "";
    data[`item_${slot}_label`] = item ? `${item.name} — ${currency(item.price)}` : "";
    data[`item_${slot}_visible`] = Boolean(item);
  }

  return data;
}

interface CartLine {
  inventoryItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

/**
 * Reconstructs the cart from the MENU screen's submitted payload
 * (qty_1..qty_20 form values + item_1_id..item_20_id data values), then
 * looks up current name/price server-side rather than trusting anything
 * echoed back from the client — the payload only carries item ids and
 * quantities, never price, precisely so a tampered client payload can't
 * under-charge an order.
 */
async function reconstructCart(
  businessId: string,
  payload: Record<string, unknown>
): Promise<CartLine[]> {
  const available = await listAvailableInventoryForStorefront(businessId);
  const byId = new Map(available.map((item) => [item.id, item]));
  const cart: CartLine[] = [];

  for (let slot = 1; slot <= MAX_MENU_ITEMS; slot++) {
    const itemId = payload[`item_${slot}_id`];
    const qtyRaw = payload[`qty_${slot}`];
    if (typeof itemId !== "string" || !itemId) continue;
    const quantity = Number(qtyRaw);
    if (!quantity || quantity <= 0) continue;

    const item = byId.get(itemId);
    if (!item) continue; // item vanished/out of stock between MENU render and submit
    cart.push({ inventoryItemId: item.id, name: item.name, unitPrice: item.price, quantity });
  }

  return cart;
}

function formatOrderSummary(cart: CartLine[]): { summaryText: string; totalText: string; total: number } {
  const lines = cart.map((line) => `${line.quantity}x ${line.name} — ${currency(line.unitPrice * line.quantity)}`);
  const total = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  return {
    summaryText: lines.join("\n") || "No items selected.",
    totalText: `Total: ${currency(total)}`,
    total,
  };
}

export async function POST(req: Request, { params }: { params: { channelId: string } }) {
  const body = (await req.json()) as EncryptedFlowRequestBody;

  const channel = await getChannelByChannelId(params.channelId);
  if (!channel?.encryptionPrivateKeyPem) {
    return new NextResponse("channel not found or not activated", { status: 421 });
  }

  let decrypted;
  try {
    decrypted = decryptFlowRequest(body, channel.encryptionPrivateKeyPem);
  } catch {
    return new NextResponse("decryption failed", { status: 421 });
  }

  const { payload, aesKey, iv } = decrypted;
  const flowPayload = payload as FlowDataExchangePayload;
  const respond = (data: { screen: string; data: Record<string, unknown> }) => {
    const response = encryptFlowResponse(data, aesKey, iv);
    return new NextResponse(response, { status: 200, headers: { "Content-Type": "text/plain" } });
  };

  if (flowPayload.action === "ping") {
    // No `screen` key here — Meta's health-check response contract is just {data: {status}}.
    const response = encryptFlowResponse({ data: { status: "active" } }, aesKey, iv);
    return new NextResponse(response, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  if (flowPayload.action === "INIT") {
    const items = await listAvailableInventoryForStorefront(channel.businessId);
    return respond({ screen: "MENU", data: buildMenuScreenData(items) });
  }

  if (flowPayload.action === "data_exchange") {
    const data = flowPayload.data ?? {};

    if (flowPayload.screen === "MENU") {
      const cart = await reconstructCart(channel.businessId, data);
      const { summaryText, totalText } = formatOrderSummary(cart);
      return respond({
        screen: "CHECKOUT",
        data: {
          order_summary_text: summaryText,
          total_text: totalText,
          cart_json: JSON.stringify(cart),
        },
      });
    }

    if (flowPayload.screen === "CHECKOUT") {
      let cart: CartLine[] = [];
      try {
        cart = JSON.parse(String(data.cart_json ?? "[]")) as CartLine[];
      } catch {
        cart = [];
      }
      if (cart.length === 0) {
        // Nothing to order — bounce back to MENU rather than create an empty order.
        const items = await listAvailableInventoryForStorefront(channel.businessId);
        return respond({ screen: "MENU", data: buildMenuScreenData(items) });
      }

      const fulfillmentType = data.fulfillment_type === "delivery" ? "delivery" : "pickup";
      const { orderId, total } = await createOrder({
        businessId: channel.businessId,
        customerName: typeof data.customer_name === "string" ? data.customer_name : undefined,
        customerPhone: typeof data.customer_phone === "string" ? data.customer_phone : undefined,
        items: cart.map((line) => ({
          inventoryItemId: line.inventoryItemId,
          name: line.name,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
        fulfillmentType,
        orderType: "direct",
      });

      return respond({
        screen: "SUCCESS",
        data: {
          confirmation_text: `Order #${orderId.slice(0, 8)} — ${currency(total)}. We'll message you once it's confirmed.`,
        },
      });
    }
  }

  // Unknown action/screen combination — fall back to a safe, non-crashing MENU render.
  const items = await listAvailableInventoryForStorefront(channel.businessId);
  return respond({ screen: "MENU", data: buildMenuScreenData(items) });
}
