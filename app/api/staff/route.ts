import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkBusinessMembership } from "@/lib/ai/config-store";
import { listStaffForBusiness } from "@/lib/staff/roster";

/**
 * Lists the staff roster for a business (any member can view — used to
 * populate the order-assignment dropdown). Adding/inviting staff isn't
 * built here; this is read-only for now.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId_required" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const membership = await checkBusinessMembership(user.id, businessId);
  if (!membership) return NextResponse.json({ error: "not_authorized_for_business" }, { status: 403 });

  try {
    const staff = await listStaffForBusiness(businessId);
    return NextResponse.json({ staff });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "list_staff_failed" },
      { status: 500 }
    );
  }
}
