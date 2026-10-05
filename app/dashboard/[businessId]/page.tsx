import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkBusinessMembership, getSiteConfig } from "@/lib/ai/config-store";
import { getTemplateById, getGalleryTemplateWithContent } from "@/lib/templates/template-store";
import { DashboardEditor } from "@/components/dashboard/DashboardEditor";
import type { FeatureToggleState } from "@/components/dashboard/FeatureTogglesPanel";
import type { ProjectLink } from "@/components/dashboard/BuilderMenu";

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

  const [{ data: business }, { data: tplLink }, { data: featureRows }, { data: memberships }] = await Promise.all([
    supabase.from("businesses").select("name, slug").eq("id", params.businessId).maybeSingle(),
    supabase.from("templates").select("gallery_template_id").eq("id", config.template_id).maybeSingle(),
    supabase.from("feature_toggles").select("feature_key, enabled, config").eq("business_id", params.businessId),
    supabase.from("business_users").select("business:businesses(id, name, created_at)").eq("user_id", user.id),
  ]);

  // Gallery-linked templates render through their bespoke component, so the
  // live preview needs the gallery id + structure.
  const galleryTemplate = tplLink?.gallery_template_id
    ? await getGalleryTemplateWithContent(tplLink.gallery_template_id)
    : null;

  // The user's projects, newest first, for the builder's slide-out menu.
  const projects: ProjectLink[] = (memberships ?? [])
    .map((m) => m.business as unknown as { id: string; name: string; created_at: string } | null)
    .filter((b): b is { id: string; name: string; created_at: string } => Boolean(b))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 50)
    .map((b) => ({ id: b.id, name: b.name }));

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
      projects={projects}
      userEmail={user.email ?? ""}
    />
  );
}
