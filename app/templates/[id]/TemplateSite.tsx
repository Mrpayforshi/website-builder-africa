import NyoniAccountingTemplate from "@/components/templates/nyoni-accounting";
import { TemplateRenderer } from "@/components/TemplateRenderer";
import { isNyoniAccountingGalleryTemplate } from "@/lib/templates/bespoke-templates";
import type { GalleryTemplateDetail } from "@/lib/templates/template-store";
import "@/styles/site.css";

// The rendered site itself (no browser chrome). Used by both the modal/full-page
// preview (TemplateBody) and the gallery card thumbnails (TemplateThumb).
export function TemplateSite({ template }: { template: GalleryTemplateDetail }) {
  if (isNyoniAccountingGalleryTemplate(template.id)) {
    return (
      <NyoniAccountingTemplate
        contentBlocks={template.contentBlocks}
        businessName={template.name}
      />
    );
  }

  return (
    <div
      className="site"
      data-category={template.category}
      data-template={template.id}
      style={
        {
          "--color-primary": "#1c1c22",
          "--color-secondary": "#6b6b74",
          "--color-accent": "#e2652b",
        } as React.CSSProperties
      }
    >
      <TemplateRenderer
        structure={template.structure}
        contentBlocks={template.contentBlocks}
      />
    </div>
  );
}
