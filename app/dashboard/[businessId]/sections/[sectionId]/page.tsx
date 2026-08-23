import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkBusinessMembership, getSiteConfig } from "@/lib/ai/config-store";
import { SectionForm } from "@/components/dashboard/SectionForm";
import type { TemplateStructure } from "@/lib/templates/section-schemas";

export default async function SectionEditPage({
  params,
}: {
  params: { businessId: string; sectionId: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const membership = await checkBusinessMembership(user.id, params.businessId);
  if (!membership) redirect("/dashboard");

  const config = await getSiteConfig(params.businessId);
  if (!config) notFound();

  const { data: template } = await supabase
    .from("templates")
    .select("structure")
    .eq("id", config.template_id)
    .single();

  const structure = template?.structure as TemplateStructure | undefined;
  const sectionDef = structure?.sections.find((s) => s.id === params.sectionId);
  if (!sectionDef) notFound();

  const initialContent =
    (config.content_blocks?.[params.sectionId] as Record<string, unknown>) ?? {};

  return (
    <div className="dashboard">
      <h1>Edit: {sectionDef.id}</h1>
      <SectionForm
        businessId={params.businessId}
        sectionId={sectionDef.id}
        sectionType={sectionDef.type}
        allowedFields={sectionDef.fields}
        initialContent={initialContent}
        expectedVersion={config.version}
      />
    </div>
  );
}
