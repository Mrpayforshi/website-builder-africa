import { createAdminClient } from "@/lib/supabase/admin";

export interface WhatsappCtaConfig {
  enabled: boolean;
  number: string | null;
}

/**
 * Reads the per-tenant WhatsApp order number for rendering "Order via
 * WhatsApp" / "Enquire via WhatsApp" CTAs on the public site (Workstream D's
 * WhatsApp module — outbound wa.me deep-link only, no inbound handling).
 *
 * The number is written by the AI tool layer via `set_business_info`'s
 * `contact.whatsapp` field — see lib/ai/tool-executor.ts, which stores it in
 * feature_toggles.config.number under feature_key = 'whatsapp' rather than
 * on the contact section itself (whatsapp isn't a valid `contact` field per
 * SECTION_FIELD_SCHEMAS).
 *
 * Uses the ADMIN client deliberately: feature_toggles only has "members can
 * view feature toggles" (is_business_member) RLS policies — there's no
 * public/published-business read policy on this table, unlike `businesses`
 * and `site_configs`. This page renders for anonymous visitors, so an
 * RLS-scoped client would silently return no rows here. Same class of
 * gotcha as order_status_events needing the admin client for writes.
 * Flagging in case a public policy gets added to this table later — this
 * admin read would become redundant (harmless, but worth revisiting then).
 */
export async function getWhatsappCtaConfig(businessId: string): Promise<WhatsappCtaConfig> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("feature_toggles")
    .select("enabled, config")
    .eq("business_id", businessId)
    .eq("feature_key", "whatsapp")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return { enabled: false, number: null };

  const config = (data.config ?? {}) as { number?: string };
  return {
    enabled: Boolean(data.enabled && config.number),
    number: config.number ?? null,
  };
}

/** Strips everything but digits — wa.me requires a bare international number, no "+", spaces, or dashes. */
function toWhatsappDigits(number: string): string {
  return number.replace(/[^\d]/g, "");
}

/** Builds a wa.me deep link pre-filled with an order message for a product/menu item. */
export function buildWhatsappOrderLink(number: string, itemName: string): string {
  const message = `Hi, I'd like to order ${itemName}`;
  return `https://wa.me/${toWhatsappDigits(number)}?text=${encodeURIComponent(message)}`;
}

/** Builds a wa.me deep link pre-filled with an enquiry message for a service. */
export function buildWhatsappEnquiryLink(number: string, serviceName: string): string {
  const message = `Hi, I'd like to enquire about ${serviceName}`;
  return `https://wa.me/${toWhatsappDigits(number)}?text=${encodeURIComponent(message)}`;
}
