import { loadTemplate } from "@/app/templates/[id]/load-template";
import { TemplateBody } from "@/app/templates/[id]/TemplateBody";
import { TemplatePreviewModal } from "@/app/templates/@modal/(.)[id]/Modal";

interface InterceptedModalProps {
  params: Promise<{ id: string }>;
}

// Intercepts client-side navigation from /dashboard/templates ->
// /dashboard/templates/[id] and shows it as a modal over the gallery,
// so the builder shell never goes away.
export default async function InterceptedDashboardTemplateModal(props: InterceptedModalProps) {
  const params = await props.params;
  const loaded = await loadTemplate(params.id);

  if (!loaded) return null;

  return (
    <TemplatePreviewModal meta={loaded.meta} ctaMode="builder">
      <TemplateBody {...loaded} />
    </TemplatePreviewModal>
  );
}
