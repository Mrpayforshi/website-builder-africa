import { NextResponse } from "next/server";
import { parseStatusUpdate, isPaidStatus, isFailedStatus } from "@/lib/commerce/paynow";
import { confirmOrderPayment, getOrderByIdAdmin } from "@/lib/commerce/orders";
import { recordLaybyPayment, getLaybyPlanByIdAdmin } from "@/lib/commerce/layby";

/**
 * Paynow's resulturl webhook target. `reference` disambiguates what's being
 * confirmed:
 *  - matches an orders.id  -> first payment (direct sale in full, or a
 *    layby deposit) -> confirm_order_payment
 *  - matches a layby_plans.id -> a later installment -> record_layby_payment
 *
 * Hash verification happens inside parseStatusUpdate — an unverifiable
 * request is rejected outright, nothing is written.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const update = parseStatusUpdate(rawBody);

  if (!update) {
    return NextResponse.json({ error: "invalid_hash" }, { status: 400 });
  }

  const order = await getOrderByIdAdmin(update.reference);
  if (order) {
    if (isPaidStatus(update.status)) {
      await confirmOrderPayment(order.id, "paid", update.paynowReference);
    } else if (isFailedStatus(update.status)) {
      await confirmOrderPayment(order.id, "failed", update.paynowReference);
    }
    return NextResponse.json({ ok: true });
  }

  const plan = await getLaybyPlanByIdAdmin(update.reference);
  if (plan) {
    if (isPaidStatus(update.status)) {
      await recordLaybyPayment(plan.id, Number(update.amount), "ecocash_paynow", update.paynowReference);
    }
    // Failed installment payments need no DB change — the customer simply
    // didn't pay this cycle; forfeit_overdue_laybys handles the grace-period
    // consequence, not this webhook.
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "reference_not_found" }, { status: 404 });
}
