import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkBusinessMembership, getSiteConfig } from "@/lib/ai/config-store";
import { getTemplateById } from "@/lib/templates/template-store";
import { DashboardEditor } from "@/components/dashboard/DashboardEditor";
import type { FeatureToggleState } from "@/components/dashboard/FeatureTogglesPanel";

export default async function DashboardPage({ params }: { params: { businessId: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const membership = await checkBusinessMembership(user.id, params.businessId);
  if (!membership) {
    notFound();
  }

  const config = await getSiteConfig(params.businessId);
  if (!config || !config.template_id) {
    notFound();
  }

  const template = await getTemplateById(config.template_id);
  if (!template) {
    notFound();
  }

  const { data: featureRows } = await supabase
    .from("feature_toggles")
    .select("feature_key, enabled, config")
    .eq("business_id", params.businessId);

  const initialFeatureToggles: FeatureToggleState[] = (featureRows ?? []).map((row) => ({
    feature_key: row.feature_key,
    enabled: row.enabled,
    config: row.config ?? {},
  }));

  return (
    <DashboardEditor
      businessId={params.businessId}
      initialConfig={config}
      template={template}
      initialFeatureToggles={initialFeatureToggles}
    />
  );
}
