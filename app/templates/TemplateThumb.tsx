import type { GalleryTemplateDetail } from "@/lib/templates/template-store";
import { TemplateSite } from "./[id]/TemplateSite";
import { ThumbFrame } from "./ThumbFrame";

// Only the top of the page is ever visible in a card, so don't render
// the whole site 12 times.
const THUMB_SECTION_LIMIT = 2;

export function TemplateThumb({ template }: { template: GalleryTemplateDetail }) {
  const trimmed: GalleryTemplateDetail = {
    ...template,
    structure: {
      ...template.structure,
      sections: template.structure.sections.slice(0, THUMB_SECTION_LIMIT),
    },
  };

  return (
    <ThumbFrame>
      <TemplateSite template={trimmed} />
    </ThumbFrame>
  );
}
