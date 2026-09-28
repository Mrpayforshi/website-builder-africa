import NyoniAccountingTemplate from "@/components/templates/nyoni-accounting";
import TerracottaTableTemplate from "@/components/templates/terracotta-table";
import GreenHarareTemplate from "@/components/templates/green-harare";
import RufaroStudioTemplate from "@/components/templates/rufaro-studio";
import MwenjeTrustTemplate from "@/components/templates/mwenje-trust";
import MvuraPlumbingTemplate from "@/components/templates/mvura-plumbing";
import EverAfterTemplate from "@/components/templates/ever-after";
import { TemplateRenderer } from "@/components/TemplateRenderer";
import {
  isNyoniAccountingGalleryTemplate,
  isTerracottaTableGalleryTemplate,
  isGreenHarareGalleryTemplate,
  isRufaroStudioGalleryTemplate,
  isMwenjeTrustGalleryTemplate,
  isMvuraPlumbingGalleryTemplate,
  isEverAfterGalleryTemplate,
} from "@/lib/templates/bespoke-templates";
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

  if (isTerracottaTableGalleryTemplate(template.id)) {
    return (
      <TerracottaTableTemplate
        contentBlocks={template.contentBlocks}
        businessName={template.name}
      />
    );
  }

  if (isGreenHarareGalleryTemplate(template.id)) {
    return (
      <GreenHarareTemplate
        contentBlocks={template.contentBlocks}
        businessName={template.name}
      />
    );
  }

  if (isRufaroStudioGalleryTemplate(template.id)) {
    return (
      <RufaroStudioTemplate
        contentBlocks={template.contentBlocks}
        businessName={template.name}
      />
    );
  }

  if (isMwenjeTrustGalleryTemplate(template.id)) {
    return (
      <MwenjeTrustTemplate
        contentBlocks={template.contentBlocks}
        businessName={template.name}
      />
    );
  }

  if (isMvuraPlumbingGalleryTemplate(template.id)) {
    return (
      <MvuraPlumbingTemplate
        contentBlocks={template.contentBlocks}
        businessName={template.name}
      />
    );
  }

  if (isEverAfterGalleryTemplate(template.id)) {
    return (
      <EverAfterTemplate
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
