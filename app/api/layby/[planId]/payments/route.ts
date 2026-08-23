import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordLaybyPayment, getLaybyPlanForStaff } from "@/lib/commerce/layby";
import { initiateEcocashPayment } from "@/lib/commerce/paynow";

/**
 * Staff-facing endpoint: record a cash layby installment, or initiate a
 * Paynow push for the customer to pay the next installment themselves.
 * Authorization mirrors Workstream B's pattern (load-bearing, must precede
 * any SECURITY DEFINER RPC call): auth.getUser() -> business_users
 * membership check, done here via RLS SELECT on layby_plans (that policy
 * already scopes to is_business_member).
 */
export async function POST(req: Request, { params }: { params: { planId: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // RLS-scoped read: returns null if this user isn't a member of the plan's business.
  const plan = await getLaybyPlanForStaff(params.planId);
  if (!plan) {
    return NextResponse.json({ error: "layby_plan_not_found_or_not_authorized" }, { status: 404 });
  }
  if (plan.status !== "active") {
    return NextResponse.json({ error: "layby_plan_not_active" }, { status: 409 });
  }

  const body = await req.json();
  const { amount, method, ecocashPhone, authEmail } = body as {
    amount: number;
    method: "cash" | "ecocash_paynow";
    ecocashPhone?: string;
    authEmail?: string;
  };

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }

  if (method === "cash") {
    const result = await recordLaybyPayment(plan.id, amount, "cash");
    return NextResponse.json(result);
  }

  if (method === "ecocash_paynow") {
    if (!ecocashPhone || !authEmail) {
      return NextResponse.json({ error: "ecocash_paynow_requires_ecocashPhone_and_authEmail" }, { status: 400 });
    }
    const origin = new URL(req.url).origin;
    const paynowResult = await initiateEcocashPayment({
      reference: plan.id, // distinguishes this as a layby installment, not the initial order payment
      amount,
      additionalInfo: `Layby installment for order ${plan.order_id.slice(0, 8)}`,
      authEmail,
      phone: ecocashPhone,
      method: "ecocash",
      resultUrl: `${origin}/api/orders/paynow-callback`,
    });

    if (!paynowResult.success) {
      return NextResponse.json({ error: paynowResult.error }, { status: 502 });
    }

    // Not recorded yet — the webhook confirms actual payment via record_layby_payment.
    return NextResponse.json({
      pending: true,
      instructions: paynowResult.instructions,
      pollUrl: paynowResult.pollUrl,
    });
  }

  return NextResponse.json({ error: "invalid_method" }, { status: 400 });
}
