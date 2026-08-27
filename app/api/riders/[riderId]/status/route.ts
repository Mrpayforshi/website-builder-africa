import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkBusinessMembership } from "@/lib/ai/config-store";
import { setRiderStatus } from "@/lib/delivery/riders";
import type { RiderStatus } from "@/lib/delivery/types";

/**
 * businessId in the body is used only to return a clean 403 with a useful
 * message — the real enforcement is RLS's "members can manage riders"
 * policy, which checks the rider row's actual business_id against the
 * caller's session regardless of what's claimed here.
 */
export async function PATCH(req: Request, { params }: { params: { riderId: string } }) {
  const { businessId, status } = (await req.json()) as { businessId: string; status: RiderStatus };
  if (!businessId || !status) {
    return NextResponse.json({ error: "businessId_and_status_required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const membership = await checkBusinessMembership(user.id, businessId);
  if (!membership) return NextResponse.json({ error: "not_authorized_for_business" }, { status: 403 });

  try {
    await setRiderStatus(params.riderId, status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "update_failed" }, { status: 400 });
  }
}
