import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkBusinessMembership } from "@/lib/ai/config-store";
import { listRidersForBusiness, addRider } from "@/lib/delivery/riders";

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

  const riders = await listRidersForBusiness(businessId);
  return NextResponse.json({ riders });
}

export async function POST(req: Request) {
  const { businessId, name, phone } = (await req.json()) as {
    businessId: string;
    name: string;
    phone: string;
  };
  if (!businessId || !name || !phone) {
    return NextResponse.json({ error: "businessId_name_phone_required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const membership = await checkBusinessMembership(user.id, businessId);
  if (!membership) return NextResponse.json({ error: "not_authorized_for_business" }, { status: 403 });

  try {
    const rider = await addRider(businessId, { name, phone });
    return NextResponse.json({ rider });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "add_rider_failed" }, { status: 400 });
  }
}
