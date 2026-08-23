import { createClient } from "@/lib/supabase/server";

/**
 * Manual owner toggle only — this is the whole feature per the locked
 * decision (no ZESA schedule API/scrape). No time-based evaluation, no
 * schedule storage: the owner directly sets what the banner currently
 * says, and it stays that way until they change it again.
 */
export type LoadSheddingStatus = "normal" | "limited" | "closed";

export interface LoadSheddingConfig {
  status: LoadSheddingStatus;
  message?: string;
  updated_at?: string;
}

const DEFAULT_MESSAGES: Record<LoadSheddingStatus, string> = {
  normal: "We're open as usual.",
  limited: "Limited hours today due to load-shedding.",
  closed: "Currently closed due to load-shedding — back soon.",
};

export async function getLoadSheddingConfig(
  businessId: string
): Promise<{ enabled: boolean; config: LoadSheddingConfig } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feature_toggles")
    .select("enabled, config")
    .eq("business_id", businessId)
    .eq("feature_key", "load_shedding_banner")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return { enabled: data.enabled, config: data.config as LoadSheddingConfig };
}

/** Owner action — RLS ("members can manage feature toggles") is the only authorization check needed here. */
export async function setLoadSheddingStatus(
  businessId: string,
  status: LoadSheddingStatus,
  message?: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("feature_toggles").upsert(
    {
      business_id: businessId,
      feature_key: "load_shedding_banner",
      enabled: true,
      config: {
        status,
        message: message ?? DEFAULT_MESSAGES[status],
        updated_at: new Date().toISOString(),
      },
    },
    { onConflict: "business_id,feature_key" }
  );
  if (error) throw new Error(error.message);
}

export function resolveDisplayMessage(config: LoadSheddingConfig): string {
  return config.message ?? DEFAULT_MESSAGES[config.status];
}
