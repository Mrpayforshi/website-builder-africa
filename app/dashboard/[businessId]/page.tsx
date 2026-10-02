import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkBusinessMembership, getSiteConfig } from "@/lib/ai/config-store";
import { getTemplateById, getGalleryTemplateWithContent } from "@/lib/templates/template-store";
import { DashboardEditor } from "@/components/dashboard/DashboardEditor";
import type { FeatureToggleState } from "@/components/dashboard/FeatureTogglesPanel";

export default async function DashboardPage(props: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ welcome?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
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
  if (!config) {
    notFound();
  }
  if (!config.template_id) {
    redirect(`/dashboard/${params.businessId}/intake`);
  }

  const template = await getTemplateById(config.template_id);
  if (!template) {
    notFound();
  }

  const [{ data: business }, { data: tplLink }, { data: featureRows }] = await Promise.all([
    supabase.from("businesses").select("name, slug").eq("id", params.businessId).maybeSingle(),
    supabase.from("templates").select("gallery_template_id").eq("id", config.template_id).maybeSingle(),
    supabase.from("feature_toggles").select("feature_key, enabled, config").eq("business_id", params.businessId),
  ]);

  // Gallery-linked templates render through their bespoke component, so the
  // live preview needs the gallery id + structure.
  const galleryTemplate = tplLink?.gallery_template_id
    ? await getGalleryTemplateWithContent(tplLink.gallery_template_id)
    : null;

  const initialFeatureToggles: FeatureToggleState[] = (featureRows ?? []).map((row) => ({
    feature_key: row.feature_key,
    enabled: row.enabled,
    config: row.config ?? {},
  }));

  return (
    <DashboardEditor
      businessId={params.businessId}
      businessName={business?.name ?? template.name}
      slug={business?.slug ?? ""}
      initialConfig={config}
      template={template}
      galleryTemplate={galleryTemplate}
      initialFeatureToggles={initialFeatureToggles}
      welcome={searchParams.welcome === "1"}
    />
  );
}
