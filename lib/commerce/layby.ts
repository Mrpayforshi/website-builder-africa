import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { LaybyCadence, LaybyPlan, LaybyScheduleEntry } from "@/lib/commerce/types";

/**
 * Builds a due-date schedule for a layby plan. Cadence determines spacing;
 * the deposit itself is NOT part of this schedule — schedule covers the
 * balance_remaining only, split evenly across installmentCount.
 */
export function buildLaybySchedule(
  balanceAfterDeposit: number,
  cadence: LaybyCadence,
  installmentCount: number,
  startDate: Date = new Date()
): LaybyScheduleEntry[] {
  if (installmentCount < 1) throw new Error("installmentCount must be >= 1");

  const stepDays = cadence === "weekly" ? 7 : cadence === "biweekly" ? 14 : 30;
  const perInstallment = Math.round((balanceAfterDeposit / installmentCount) * 100) / 100;

  const schedule: LaybyScheduleEntry[] = [];
  let runningTotal = 0;
  for (let i = 1; i <= installmentCount; i++) {
    const due = new Date(startDate);
    due.setDate(due.getDate() + stepDays * i);
    // Last installment absorbs any rounding remainder.
    const amount = i === installmentCount ? Math.round((balanceAfterDeposit - runningTotal) * 100) / 100 : perInstallment;
    runningTotal += amount;
    schedule.push({ due_date: due.toISOString().slice(0, 10), amount });
  }
  return schedule;
}

/**
 * Records a layby payment via the record_layby_payment RPC. For cash
 * payments this is called directly after a staff-membership check in the
 * API route. For Paynow payments, call this only from the verified webhook
 * — never synchronously after initiateEcocashPayment, since that call only
 * confirms the USSD push was sent, not that the customer paid.
 */
export async function recordLaybyPayment(
  planId: string,
  amount: number,
  method: "cash" | "ecocash_paynow" | "other",
  paynowReference?: string
): Promise<{ balanceRemaining: number; status: "active" | "completed" }> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("record_layby_payment", {
    p_plan_id: planId,
    p_amount: amount,
    p_method: method,
    p_paynow_reference: paynowReference ?? null,
  });
  if (error) throw new Error(error.message);
  return { balanceRemaining: Number(data.balance_remaining), status: data.status };
}

export async function getLaybyPlanForStaff(planId: string): Promise<LaybyPlan | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("layby_plans").select("*").eq("id", planId).maybeSingle();
  if (error) throw new Error(error.message);
  return data as LaybyPlan | null;
}

export async function getLaybyPlanByIdAdmin(planId: string): Promise<LaybyPlan | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("layby_plans").select("*").eq("id", planId).maybeSingle();
  if (error) throw new Error(error.message);
  return data as LaybyPlan | null;
}

/**
 * Sweeps overdue plans via forfeit_overdue_laybys — call this from a
 * scheduled route (e.g. Vercel Cron hitting /api/cron/forfeit-laybys daily).
 * Not wired to a schedule here; that's an infra/deploy step.
 */
export async function forfeitOverdueLaybys(): Promise<{ forfeitedCount: number }> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("forfeit_overdue_laybys");
  if (error) throw new Error(error.message);
  return { forfeitedCount: data.forfeited_count };
}
