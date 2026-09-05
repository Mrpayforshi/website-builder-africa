import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const FEATURE_KEYS = [
  "whatsapp",
  "delivery",
  "ecocash",
  "layby",
  "load_shedding_banner",
  "low_bandwidth_mode",
  "maps_sync",
  "inventory_sync",
  "invoicing",
];

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

/**
 * Creates a blank business + owner membership + empty site config + default
 * feature toggles. No name/category collected here — that's entirely the AI
 * intake chat's job now (see lib/ai/tool-executor.ts handleSetBusinessInfo,
 * which is also what assigns a template once a category is known). This
 * route just stakes out a row for the chat to fill in.
 *
 * Uses the admin client for the writes deliberately: `businesses` has no
 * owner-level SELECT policy (only `is_business_member`, which reads
 * `business_users` — a row that doesn't exist yet at the moment this
 * business is inserted). An RLS-scoped insert().select() would fail the
 * RETURNING read. Identity is still verified via the cookie-scoped RLS
 * client before any privileged write happens.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createAdminClient();

  let slug = `project-${randomSuffix()}`;
  let business: { id: string; slug: string } | null = null;
  let lastError: { message: string; code?: string } | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await admin
      .from("businesses")
      .insert({ owner_user_id: user.id, name: "Untitled project", slug, status: "draft" })
      .select("id, slug")
      .single();

    if (!error) {
      business = data;
      break;
    }
    lastError = error;
    if (error.code !== "23505") break; // not a unique-slug violation, don't retry
    slug = `project-${randomSuffix()}`;
  }

  if (!business) {
    return NextResponse.json(
      { error: lastError?.message ?? "Could not create project" },
      { status: 500 }
    );
  }

  const { error: memberError } = await admin
    .from("business_users")
    .insert({ business_id: business.id, user_id: user.id, role: "owner" });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  await admin.from("site_configs").insert({
    business_id: business.id,
    template_id: null,
    content_blocks: {},
    color_scheme: {},
    status: "draft",
    source: "system",
  });

  await admin.from("feature_toggles").insert(
    FEATURE_KEYS.map((feature_key) => ({
      business_id: business!.id,
      feature_key,
      enabled: false,
    }))
  );

  return NextResponse.json({ businessId: business.id, slug: business.slug });
}
