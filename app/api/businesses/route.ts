import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const CATEGORIES = [
  "retail",
  "services",
  "food",
  "professional",
  "ngo_community",
  "events_portfolio",
];

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

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  return base || "business";
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

/**
 * Creates a business + owner membership + empty site config + default
 * feature toggles as one logical unit.
 *
 * Uses the admin client for the writes deliberately: `businesses` has no
 * owner-level SELECT policy (only `is_business_member`, which reads
 * `business_users` — a row that doesn't exist yet at the moment this
 * business is inserted). An RLS-scoped insert().select() would fail the
 * RETURNING read. Identity is still verified via the cookie-scoped RLS
 * client before any privileged write happens.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const category = typeof body?.category === "string" ? body.category : "";

  if (!name) {
    return NextResponse.json({ error: "Business name is required" }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: templates } = await admin
    .from("templates")
    .select("id")
    .eq("category", category)
    .limit(1);
  const templateId = templates?.[0]?.id ?? null;

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let business: { id: string; slug: string } | null = null;
  let lastError: { message: string; code?: string } | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await admin
      .from("businesses")
      .insert({ owner_user_id: user.id, name, category, slug, status: "draft" })
      .select("id, slug")
      .single();

    if (!error) {
      business = data;
      break;
    }
    lastError = error;
    if (error.code !== "23505") break; // not a unique-slug violation, don't retry
    slug = `${baseSlug}-${randomSuffix()}`;
  }

  if (!business) {
    return NextResponse.json(
      { error: lastError?.message ?? "Could not create business" },
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
    template_id: templateId,
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
