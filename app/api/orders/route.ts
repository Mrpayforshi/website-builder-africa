import { NextResponse } from "next/server";
import { createOrder, saveOrderPollUrl } from "@/lib/commerce/orders";
import { buildLaybySchedule } from "@/lib/commerce/layby";
import { initiateEcocashPayment } from "@/lib/commerce/paynow";
import type { LaybyCadence } from "@/lib/commerce/types";

/**
 * Public checkout endpoint — no auth required, the customer is not a
 * business_users member. Stock validation and atomicity happen inside the
 * create_order RPC (SECURITY DEFINER), called via the admin client. See
 * lib/commerce/orders.ts.
 */
export async function POST(req: Request) {
  const body = await req.json();

  const {
    businessId,
    customerName,
    customerPhone,
    items,
    fulfillmentType,
    orderType,
    paymentMethod,
    depositPct,
    cadence,
    installmentCount,
    ecocashPhone,
    authEmail,
  }: {
    businessId: string;
    customerName?: string;
    customerPhone?: string;
    items: Array<{ inventoryItemId: string; quantity: number; unitPrice: number; name: string }>;
    fulfillmentType: "pickup" | "delivery";
    orderType: "direct" | "layby";
    paymentMethod: "ecocash_paynow" | "cash";
    depositPct?: number;
    cadence?: LaybyCadence;
    installmentCount?: number;
    ecocashPhone?: string;
    authEmail?: string;
  } = body;

  if (!businessId || !items?.length || !fulfillmentType || !orderType || !paymentMethod) {
    return NextResponse.json({ error: "missing_required_fields" }, { status: 400 });
  }

  let schedule;
  if (orderType === "layby") {
    if (depositPct == null || !cadence || !installmentCount) {
      return NextResponse.json({ error: "layby_requires_depositPct_cadence_installmentCount" }, { status: 400 });
    }
    const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const balanceAfterDeposit = Math.round((total - total * (depositPct / 100)) * 100) / 100;
    schedule = buildLaybySchedule(balanceAfterDeposit, cadence, installmentCount);
  }

  let orderResult;
  try {
    orderResult = await createOrder({
      businessId,
      customerName,
      customerPhone,
      items,
      fulfillmentType,
      orderType,
      depositPct,
      schedule,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "order_creation_failed";
    const status = message.includes("insufficient_stock") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }

  if (paymentMethod === "ecocash_paynow") {
    if (!ecocashPhone || !authEmail) {
      return NextResponse.json({ error: "ecocash_paynow_requires_ecocashPhone_and_authEmail" }, { status: 400 });
    }

    const origin = new URL(req.url).origin;
    // reference = order_id for the first payment (deposit, for layby; full amount, for direct).
    const amountDue = orderType === "layby"
      ? Math.round(orderResult.total * ((depositPct ?? 0) / 100) * 100) / 100
      : orderResult.total;

    const paynowResult = await initiateEcocashPayment({
      reference: orderResult.orderId,
      amount: amountDue,
      additionalInfo: `Order ${orderResult.orderId.slice(0, 8)}`,
      authEmail,
      phone: ecocashPhone,
      method: "ecocash",
      resultUrl: `${origin}/api/orders/paynow-callback`,
    });

    if (!paynowResult.success) {
      return NextResponse.json(
        { orderId: orderResult.orderId, laybyPlanId: orderResult.laybyPlanId, paynowError: paynowResult.error },
        { status: 502 }
      );
    }

    if (paynowResult.pollUrl) {
      await saveOrderPollUrl(orderResult.orderId, paynowResult.pollUrl);
    }

    return NextResponse.json({
      orderId: orderResult.orderId,
      laybyPlanId: orderResult.laybyPlanId,
      total: orderResult.total,
      amountDue,
      paynowInstructions: paynowResult.instructions,
      pollUrl: paynowResult.pollUrl,
    });
  }

  // Cash orders: nothing further to do here — staff confirm payment/status from the dashboard.
  return NextResponse.json({
    orderId: orderResult.orderId,
    laybyPlanId: orderResult.laybyPlanId,
    total: orderResult.total,
  });
}
