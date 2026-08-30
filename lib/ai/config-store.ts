import { createClient } from "@/lib/supabase/server";
import type { SiteConfig, SiteConfigStatus, ConfigSource, FeatureKey } from "@/types/database";

export interface BusinessMembership {
  id: string;
  business_id: string;
  user_id: string;
  role: string;
}

/**
 * Load-bearing authorization check. `apply_site_config_patch` is SECURITY
 * DEFINER and bypasses RLS — this must run before any call that reaches it.
 * Never skip this.
 *
 * `id` (the business_users row id) is included because several FKs —
 * orders.assigned_staff_id, orders.updated_by, order_status_events.changed_by —
 * reference business_users(id), not auth.users(id). Callers that need to
 * attribute a write to "this staff member" must use membership.id, not
 * userId.
 */
export async function checkBusinessMembership(
  userId: string,
  businessId: string
): Promise<BusinessMembership | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_users")
    .select("id, business_id, user_id, role")
    .eq("business_id", businessId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as BusinessMembership;
}

export async function getSiteConfig(businessId: string): Promise<SiteConfig | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_configs")
    .select("*")
    .eq("business_id", businessId)
    .single();

  if (error || !data) return null;
  return data as SiteConfig;
}

export interface FeatureTogglePatch {
  feature_key: FeatureKey;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface SiteConfigPatchInput {
  businessId: string;
  expectedVersion: number;
  /** Partial patch — merged onto the CURRENT content_blocks before the RPC call, since the RPC itself does a full replace, not a merge. */
  contentBlocksPatch?: Record<string, unknown>;
  colorSchemePatch?: Record<string, unknown>;
  configStatus?: SiteConfigStatus;
  featureTogglesPatch?: FeatureTogglePatch[];
  source: ConfigSource;
  businessName?: string;
  businessCategory?: string;
  businessStatus?: string;
}

export interface PatchResult {
  conflict: boolean;
  currentVersion?: number;
  newVersion?: number;
}

/**
 * Wraps `apply_site_config_patch`. IMPORTANT: the RPC replaces
 * content_blocks/color_scheme wholesale — it does not merge jsonb. This
 * function fetches the current row, merges the patch client-side (shallow,
 * top-level keys), and sends the full merged object.
 */
export async function applySiteConfigPatch(input: SiteConfigPatchInput): Promise<PatchResult> {
  const supabase = await createClient();

  const current = await getSiteConfig(input.businessId);
  if (!current) throw new Error("Site config not found");

  const mergedContentBlocks = {
    ...(current.content_blocks ?? {}),
    ...(input.contentBlocksPatch ?? {}),
  };
  const mergedColorScheme = {
    ...(current.color_scheme ?? {}),
    ...(input.colorSchemePatch ?? {}),
  };

  const { data, error } = await supabase.rpc("apply_site_config_patch", {
    p_business_id: input.businessId,
    p_expected_version: input.expectedVersion,
    p_content_blocks: mergedContentBlocks,
    p_color_scheme: mergedColorScheme,
    p_config_status: input.configStatus ?? current.status,
    p_source: input.source,
    p_business_name: input.businessName ?? null,
    p_business_category: input.businessCategory ?? null,
    p_business_status: input.businessStatus ?? null,
    p_feature_toggles: input.featureTogglesPatch ?? null,
  });

  if (error) {
    throw new Error(`apply_site_config_patch failed: ${error.message}`);
  }

  return {
    conflict: Boolean(data?.conflict),
    currentVersion: data?.current_version,
    newVersion: data?.new_version,
  };
}

/**
 * Retry-on-conflict wrapper. Refetches the current version and lets the
 * caller rebuild the patch against it, then retries once before giving up.
 */
export async function applyPatchWithRetry(
  input: SiteConfigPatchInput,
  rebuildPatch: (latest: SiteConfig) => SiteConfigPatchInput
): Promise<PatchResult> {
  const first = await applySiteConfigPatch(input);
  if (!first.conflict) return first;

  const latest = await getSiteConfig(input.businessId);
  if (!latest) throw new Error("Site config not found during conflict retry");

  return applySiteConfigPatch(rebuildPatch(latest));
}
