import { loadTemplate } from "@/app/templates/[id]/load-template";
import { TemplateBody } from "@/app/templates/[id]/TemplateBody";
import { TemplatePreviewModal } from "./Modal";

interface InterceptedModalProps {
  params: Promise<{ id: string }>;
}

// Intercepts client-side navigation from /templates -> /templates/[id]
// (the "(.)" convention matches one segment up, i.e. from within
// /templates itself) and renders it as a modal over the gallery instead
// of a full page nav. Direct links / refreshes still hit the real
// app/templates/[id]/page.tsx, untouched.
export default async function InterceptedTemplateModal(props: InterceptedModalProps) {
  const params = await props.params;
  const loaded = await loadTemplate(params.id);

  // Quietly render nothing rather than notFound() here — notFound() inside
  // a parallel-route slot can bubble up and replace the whole page instead
  // of just this slot. A missing id should never happen from a real card
  // click anyway.
  if (!loaded) return null;

  return (
    <TemplatePreviewModal meta={loaded.meta}>
      <TemplateBody {...loaded} />
    </TemplatePreviewModal>
  );
}
