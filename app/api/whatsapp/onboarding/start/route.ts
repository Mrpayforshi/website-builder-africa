import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertPendingChannel } from "@/lib/whatsapp/channel-store";

/**
 * Called by components/dashboard/WhatsAppOrderingConnect.tsx once
 * 360dialog's Connect Button callback fires. Only records that
 * onboarding started — the channel isn't usable until
 * app/api/whatsapp/dialog360-webhook/route.ts confirms it's live.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { businessId, dialog360ClientId, channelId } = (await req.json()) as {
    businessId?: string;
    dialog360ClientId?: string;
    channelId?: string;
  };

  if (!businessId || !dialog360ClientId || !channelId) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  // Membership check via RLS, same pattern as the load-shedding toggle
  // route: a plain select against business_users scoped to this user
  // fails closed if they aren't actually a member of businessId.
  const { data: membership, error: membershipError } = await supabase
    .from("business_users")
    .select("id")
    .eq("business_id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (membershipError || !membership) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    await upsertPendingChannel({ businessId, dialog360ClientId, channelId });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "onboarding_start_failed" },
      { status: 500 }
    );
  }
}
