// Mirrors the Workstream A schema (Stage 1). Keep in sync with migrations.

export type BusinessStatus = "draft" | "published" | "suspended";
export type SiteConfigStatus = "draft" | "published";
export type ConfigSource = "ai_chat" | "dashboard" | "system";

export type FeatureKey =
  | "whatsapp"
  | "delivery"
  | "ecocash"
  | "layby"
  | "load_shedding_banner"
  | "low_bandwidth_mode"
  | "maps_sync"
  | "inventory_sync"
  | "invoicing";

export interface Business {
  id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  status: BusinessStatus;
  created_at: string;
}

export interface SiteConfig {
  id: string;
  business_id: string;
  template_id: string | null;
  content_blocks: Record<string, unknown>;
  color_scheme: Record<string, unknown>;
  status: SiteConfigStatus;
  version: number;
  source: ConfigSource | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeatureToggle {
  id: string;
  business_id: string;
  feature_key: FeatureKey;
  enabled: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Domain {
  id: string;
  business_id: string;
  domain: string;
  is_primary: boolean;
  verified_at: string | null;
  created_at: string;
}
