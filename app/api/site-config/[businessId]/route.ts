import { NextRequest, NextResponse } from "next/server";
import { applySiteConfigPatch, checkBusinessMembership, getSiteConfig } from "@/lib/ai/config-store";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest, { params }: { params: { businessId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const membership = await checkBusinessMembership(user.id, params.businessId);
  if (!membership) return NextResponse.json({ error: "Not a member of this business" }, { status: 403 });

  const config = await getSiteConfig(params.businessId);
  if (!config) return NextResponse.json({ error: "Site config not found" }, { status: 404 });

  return NextResponse.json(config);
}

/**
 * Dashboard write path (Workstream F) — same endpoint and same version
 * check the AI chat layer uses, so concurrent edits from chat and dashboard
 * both go through apply_site_config_patch and can't silently clobber
 * each other.
 */
export async function PATCH(req: NextRequest, { params }: { params: { businessId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const membership = await checkBusinessMembership(user.id, params.businessId);
  if (!membership) return NextResponse.json({ error: "Not a member of this business" }, { status: 403 });

  const body = await req.json();
  const { expectedVersion, contentBlocksPatch, colorSchemePatch, featureTogglesPatch, configStatus } = body;

  if (typeof expectedVersion !== "number") {
    return NextResponse.json({ error: "expectedVersion is required" }, { status: 400 });
  }

  try {
    const result = await applySiteConfigPatch({
      businessId: params.businessId,
      expectedVersion,
      contentBlocksPatch,
      colorSchemePatch,
      featureTogglesPatch,
      configStatus,
      source: "dashboard",
    });

    if (result.conflict) {
      return NextResponse.json({ conflict: true, currentVersion: result.currentVersion }, { status: 409 });
    }

    return NextResponse.json({ conflict: false, newVersion: result.newVersion });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
