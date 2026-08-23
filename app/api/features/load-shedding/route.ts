import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { setLoadSheddingStatus, type LoadSheddingStatus } from "@/lib/market-fit/load-shedding";

/** Owner-facing manual toggle. Authorization is RLS itself — "members can manage feature toggles" on the update. */
export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { businessId, status, message } = (await req.json()) as {
    businessId: string;
    status: LoadSheddingStatus;
    message?: string;
  };

  if (!businessId || !["normal", "limited", "closed"].includes(status)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    await setLoadSheddingStatus(businessId, status, message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    // RLS will reject this as a plain error if the user isn't a member of businessId.
    return NextResponse.json({ error: err instanceof Error ? err.message : "update_failed" }, { status: 403 });
  }
}
