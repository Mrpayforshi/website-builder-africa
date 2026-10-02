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
 *  - Body `{ galleryTemplateId, siteName }`: atomic path via the
 *    create_site_from_template RPC (runs as the signed-in user; the function
 *    is SECURITY DEFINER and uses auth.uid(), so no admin client is needed).
 *  - Legacy path (no siteName, or a template with no live row): unchanged
 *    behaviour — blank business for the AI intake chat, or seeded from the
 *    live template with a default name.
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
    siteName?: unknown;
  } | null;
  const galleryTemplateId =
    typeof body?.galleryTemplateId === "string" ? body.galleryTemplateId : null;
  const siteName = typeof body?.siteName === "string" ? body.siteName.trim() : "";

  // --- Atomic path -------------------------------------------------------
  if (galleryTemplateId && siteName) {
    const { data, error } = await supabase.rpc("create_site_from_template", {
      p_gallery_template_id: galleryTemplateId,
      p_site_name: siteName,
    });

    if (!error && data) {
      const result = data as { business_id: string; slug: string };
      return NextResponse.json({
        businessId: result.business_id,
        slug: result.slug,
        templateApplied: true,
      });
    }

    if (error?.message.includes("invalid_site_name")) {
      return NextResponse.json(
        { error: "Site name must be between 2 and 80 characters." },
        { status: 400 }
      );
    }
    // Template has no live row: fall through to the legacy path below.
    if (!error?.message.includes("template_not_available")) {
      return NextResponse.json(
        { error: error?.message ?? "Could not create your site" },
        { status: 500 }
      );
    }
  }

  // --- Legacy path (unchanged) --------------------------------------------
  const admin = createAdminClient();

  let liveTemplate: { id: string; name: string; category: string } | null = null;
  const seedContentBlocks: Record<string, unknown> = {};

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
        name: siteName || liveTemplate?.name || "Untitled project",
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
    if (error.code !== "23505") break;
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
