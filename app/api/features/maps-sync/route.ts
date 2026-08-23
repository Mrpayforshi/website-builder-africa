import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncGoogleBusinessProfile } from "@/lib/market-fit/google-places";

/**
 * Staff-triggered sync. Authorization check mirrors the load-bearing
 * pattern used everywhere else: verify membership via an RLS-scoped read
 * before calling into the admin-client sync function.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { businessId, placeId } = (await req.json()) as { businessId: string; placeId: string };
  if (!businessId || !placeId) {
    return NextResponse.json({ error: "businessId_and_placeId_required" }, { status: 400 });
  }

  const { data: membership } = await supabase
    .from("business_users")
    .select("id")
    .eq("business_id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "not_authorized_for_business" }, { status: 403 });
  }

  try {
    const data = await syncGoogleBusinessProfile(businessId, placeId);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "sync_failed" }, { status: 502 });
  }
}
