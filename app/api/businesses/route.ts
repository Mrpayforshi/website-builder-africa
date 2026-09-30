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
 * Creates a business + owner membership + site config + default feature
 * toggles.
 *
 * Two modes:
 *  - Body `{ galleryTemplateId }` where that gallery template has a live
 *    `templates` row (templates.gallery_template_id = galleryTemplateId):
 *    the business is created WITH that template assigned and its gallery
 *    demo content copied into site_configs.content_blocks, so the user can
 *    go straight to the dashboard editor. Business name/category are seeded
 *    from the template and are expected to be edited by the user.
 *  - No body, or a gallery template with no live row yet: blank business,
 *    as before — the AI intake chat fills it in and assigns a template
 *    (see lib/ai/tool-executor.ts handleSetBusinessInfo).
 *
 * Uses the admin client for the writes deliberately: `businesses` has no
 * owner-level SELECT policy (only `is_business_member`, which reads
 * `business_users` — a row that doesn't exist yet at the moment this
 * business is inserted). An RLS-scoped insert().select() would fail the
 * RETURNING read. Identity is still verified via the cookie-scoped RLS
 * client before any privileged write happens.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    galleryTemplateId?: unknown;
  } | null;
  const galleryTemplateId =
    typeof body?.galleryTemplateId === "string" ? body.galleryTemplateId : null;

  const admin = createAdminClient();

  // Resolve the live template (if this gallery template has one) and its demo
  // content before creating anything, so a lookup failure can't leave a
  // half-created business behind.
  let liveTemplate: { id: string; name: string; category: string } | null = null;
  let seedContentBlocks: Record<string, unknown> = {};

  if (galleryTemplateId) {
    const { data: tpl } = await admin
      .from("templates")
      .select("id, name, category")
      .eq("gallery_template_id", galleryTemplateId)
      .maybeSingle();

    if (tpl) {
      liveTemplate = tpl;
      const { data: blocks, error: blocksError } = await admin
        .from("gallery_content_blocks")
        .select("section_id, content")
        .eq("template_id", galleryTemplateId);

      if (blocksError) {
        return NextResponse.json({ error: blocksError.message }, { status: 500 });
      }
      for (const block of blocks ?? []) {
        seedContentBlocks[block.section_id] = block.content;
      }
    }
  }

  let slug = `project-${randomSuffix()}`;
  let business: { id: string; slug: string } | null = null;
  let lastError: { message: string; code?: string } | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await admin
      .from("businesses")
      .insert({
        owner_user_id: user.id,
        name: liveTemplate?.name ?? "Untitled project",
        slug,
        status: "draft",
        ...(liveTemplate ? { category: liveTemplate.category } : {}),
      })
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

  const { error: configError } = await admin.from("site_configs").insert({
    business_id: business.id,
    template_id: liveTemplate?.id ?? null,
    content_blocks: seedContentBlocks,
    color_scheme: {},
    status: "draft",
    source: "system",
  });

  if (configError) {
    return NextResponse.json({ error: configError.message }, { status: 500 });
  }

  await admin.from("feature_toggles").insert(
    FEATURE_KEYS.map((feature_key) => ({
      business_id: business!.id,
      feature_key,
      enabled: false,
    }))
  );

  return NextResponse.json({
    businessId: business.id,
    slug: business.slug,
    templateApplied: Boolean(liveTemplate),
  });
}
