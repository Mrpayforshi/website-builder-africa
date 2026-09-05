import { createClient } from "@/lib/supabase/server";
import {
  getSiteConfig,
  applyPatchWithRetry,
  type SiteConfigPatchInput,
} from "@/lib/ai/config-store";
import { getTemplateById, listTemplatesByCategory } from "@/lib/templates/template-store";
import { validateAgainstStructure, SECTION_FIELD_SCHEMAS } from "@/lib/templates/section-schemas";
import type { AiToolName } from "@/lib/ai/tools";
import type { SiteConfig, FeatureKey } from "@/types/database";

export interface ToolExecutionContext {
  businessId: string;
  userId: string;
}

export interface ToolExecutionResult {
  ok: boolean;
  error?: string;
  [key: string]: unknown;
}

type PatchBuilder = (
  latest: SiteConfig
) => Omit<SiteConfigPatchInput, "businessId" | "expectedVersion" | "source">;

/**
 * Fetches the current config, builds a patch against it, and writes via
 * applyPatchWithRetry — so every tool call gets the same one-retry
 * version-conflict handling B's spec calls for, without each handler
 * reimplementing it.
 */
async function patchWithMerge(businessId: string, buildPatch: PatchBuilder) {
  const initial = await getSiteConfig(businessId);
  if (!initial) throw new Error("Site config not found");

  const firstInput: SiteConfigPatchInput = {
    businessId,
    expectedVersion: initial.version,
    source: "ai_chat",
    ...buildPatch(initial),
  };

  return applyPatchWithRetry(firstInput, (latest) => ({
    businessId,
    expectedVersion: latest.version,
    source: "ai_chat",
    ...buildPatch(latest),
  }));
}

async function upsertFeatureToggleConfig(
  businessId: string,
  featureKey: FeatureKey,
  configPatch: Record<string, unknown>
) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("feature_toggles")
    .select("enabled, config")
    .eq("business_id", businessId)
    .eq("feature_key", featureKey)
    .maybeSingle();

  const mergedConfig = { ...(existing?.config ?? {}), ...configPatch };

  await patchWithMerge(businessId, () => ({
    featureTogglesPatch: [{ feature_key: featureKey, enabled: existing?.enabled ?? false, config: mergedConfig }],
  }));
}

const CONFLICT_ERROR = "Config changed elsewhere and the retry also conflicted — please try again.";

// --- set_business_info ------------------------------------------------

async function handleSetBusinessInfo(
  input: Record<string, unknown>,
  ctx: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { name, category, contact } = input as {
    name: string;
    category: string;
    contact?: { phone?: string; email?: string; whatsapp?: string };
  };

  try {
    // Resolved once up front rather than inside the patch closure — it's a
    // read against `templates`, not `latest` (the site config), and only
    // matters the first time (the RPC coalesces template_id, so passing it
    // on every call is harmless once one is already assigned). v1 has
    // exactly one template per category, so this is the whole of
    // "AI-powered" template selection for now: the AI's job is choosing
    // the right category from the conversation, and that choice is what
    // picks the template. If templates.ts ever grows multiple templates
    // per category, this is the place to add a real choice — e.g. an
    // explicit choose_template tool, or picking among candidates here
    // based on the conversation so far.
    const candidateTemplates = await listTemplatesByCategory(category);
    const candidateTemplateId = candidateTemplates[0]?.id;

    const result = await patchWithMerge(ctx.businessId, (latest) => {
      const currentContact = (latest.content_blocks?.contact as Record<string, unknown>) ?? {};
      return {
        businessName: name,
        businessCategory: category,
        templateId: latest.template_id ? undefined : candidateTemplateId,
        contentBlocksPatch: {
          contact: {
            ...currentContact,
            ...(contact?.phone !== undefined ? { phone: contact.phone } : {}),
            ...(contact?.email !== undefined ? { email: contact.email } : {}),
          },
        },
      };
    });

    if (result.conflict) return { ok: false, error: CONFLICT_ERROR };

    // WhatsApp isn't a valid `contact` section field (see
    // SECTION_FIELD_SCHEMAS.contact) — it's the number D's WhatsApp module
    // uses for wa.me deep links, so it lives on the whatsapp feature
    // toggle's config instead. Assumption, not verified against D's code —
    // flag if D expects it somewhere else.
    if (contact?.whatsapp) {
      await upsertFeatureToggleConfig(ctx.businessId, "whatsapp", { number: contact.whatsapp });
    }

    return { ok: true, newVersion: result.newVersion };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// --- set_color_scheme ---------------------------------------------------

async function handleSetColorScheme(
  input: Record<string, unknown>,
  ctx: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { primary, secondary, accent } = input as { primary: string; secondary?: string; accent?: string };

  try {
    const result = await patchWithMerge(ctx.businessId, () => ({
      colorSchemePatch: {
        primary,
        ...(secondary !== undefined ? { secondary } : {}),
        ...(accent !== undefined ? { accent } : {}),
      },
    }));

    if (result.conflict) return { ok: false, error: CONFLICT_ERROR };
    return { ok: true, newVersion: result.newVersion };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// --- set_section_content -------------------------------------------------

async function handleSetSectionContent(
  input: Record<string, unknown>,
  ctx: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { section_id, content } = input as { section_id: string; content: Record<string, unknown> };

  const config = await getSiteConfig(ctx.businessId);
  if (!config || !config.template_id) return { ok: false, error: "Site config or template not found" };

  const template = await getTemplateById(config.template_id);
  if (!template) return { ok: false, error: "Template not found" };

  const validation = validateAgainstStructure(template.structure, section_id, content);
  if (!validation.valid) {
    return { ok: false, error: validation.errors.join("; ") };
  }

  try {
    // Merge onto the existing section content rather than replacing it
    // wholesale, so a partial edit like "change my price to $15" doesn't
    // wipe the rest of the section (per B's spec's edge case).
    const result = await patchWithMerge(ctx.businessId, (latest) => {
      const currentSection = (latest.content_blocks?.[section_id] as Record<string, unknown>) ?? {};
      return { contentBlocksPatch: { [section_id]: { ...currentSection, ...content } } };
    });

    if (result.conflict) return { ok: false, error: CONFLICT_ERROR };
    return { ok: true, newVersion: result.newVersion };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// --- toggle_feature -------------------------------------------------------

async function handleToggleFeature(
  input: Record<string, unknown>,
  ctx: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { feature, enabled } = input as { feature: FeatureKey; enabled: boolean };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("feature_toggles")
    .select("config")
    .eq("business_id", ctx.businessId)
    .eq("feature_key", feature)
    .maybeSingle();

  try {
    const result = await patchWithMerge(ctx.businessId, () => ({
      featureTogglesPatch: [{ feature_key: feature, enabled, config: existing?.config ?? {} }],
    }));

    if (result.conflict) return { ok: false, error: CONFLICT_ERROR };
    return { ok: true, newVersion: result.newVersion };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// --- set_layby_config -------------------------------------------------------

async function handleSetLaybyConfig(
  input: Record<string, unknown>,
  ctx: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { deposit_pct, schedule, forfeiture_policy } = input as {
    deposit_pct: number;
    schedule: string;
    forfeiture_policy: string;
  };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("feature_toggles")
    .select("enabled")
    .eq("business_id", ctx.businessId)
    .eq("feature_key", "layby")
    .maybeSingle();

  // Explicit gate called out in tools.ts's tool description.
  if (!existing?.enabled) {
    return { ok: false, error: "The layby feature must be enabled before configuring layby terms." };
  }

  try {
    const result = await patchWithMerge(ctx.businessId, () => ({
      featureTogglesPatch: [
        { feature_key: "layby", enabled: true, config: { deposit_pct, schedule, forfeiture_policy } },
      ],
    }));

    if (result.conflict) return { ok: false, error: CONFLICT_ERROR };
    return { ok: true, newVersion: result.newVersion };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// --- set_hours -------------------------------------------------------

async function handleSetHours(
  input: Record<string, unknown>,
  ctx: ToolExecutionContext
): Promise<ToolExecutionResult> {
  const { day, open, close } = input as { day: string; open: string; close: string };

  try {
    const result = await patchWithMerge(ctx.businessId, (latest) => {
      const contact = (latest.content_blocks?.contact as Record<string, unknown>) ?? {};
      const hours = (contact.hours as Record<string, { open: string; close: string }>) ?? {};
      return {
        contentBlocksPatch: {
          contact: { ...contact, hours: { ...hours, [day]: { open, close } } },
        },
      };
    });

    if (result.conflict) return { ok: false, error: CONFLICT_ERROR };
    return { ok: true, newVersion: result.newVersion };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// --- publish_site -------------------------------------------------------

async function handlePublishSite(ctx: ToolExecutionContext): Promise<ToolExecutionResult> {
  const config = await getSiteConfig(ctx.businessId);
  if (!config || !config.template_id) return { ok: false, error: "Site config or template not found" };

  const template = await getTemplateById(config.template_id);
  if (!template) return { ok: false, error: "Template not found" };

  const missing: string[] = [];
  for (const section of template.structure.sections) {
    if (!section.required) continue;

    const content = (config.content_blocks?.[section.id] as Record<string, unknown>) ?? {};
    const allowedFields = SECTION_FIELD_SCHEMAS[section.type] ?? [];
    const hasContent = allowedFields.some((field) => {
      const value = content[field];
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    });

    if (!hasContent) missing.push(section.id);
  }

  if (missing.length > 0) {
    return { ok: false, error: `Missing required content for: ${missing.join(", ")}` };
  }

  try {
    const result = await patchWithMerge(ctx.businessId, () => ({
      configStatus: "published",
      businessStatus: "published",
    }));

    if (result.conflict) return { ok: false, error: CONFLICT_ERROR };
    return { ok: true, newVersion: result.newVersion };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// --- dispatch -------------------------------------------------------

export async function executeTool(
  name: AiToolName,
  input: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  switch (name) {
    case "set_business_info":
      return handleSetBusinessInfo(input, context);
    case "set_color_scheme":
      return handleSetColorScheme(input, context);
    case "set_section_content":
      return handleSetSectionContent(input, context);
    case "toggle_feature":
      return handleToggleFeature(input, context);
    case "set_layby_config":
      return handleSetLaybyConfig(input, context);
    case "set_hours":
      return handleSetHours(input, context);
    case "publish_site":
      return handlePublishSite(context);
    default:
      return { ok: false, error: `Unknown tool: ${name satisfies never}` };
  }
}
