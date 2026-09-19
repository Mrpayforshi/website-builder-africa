import NyoniAccountingTemplate from "@/components/templates/nyoni-accounting";
import { TemplateRenderer } from "@/components/TemplateRenderer";
import { isNyoniAccountingGalleryTemplate } from "@/lib/templates/bespoke-templates";
import type { LoadedTemplate } from "./load-template";
import styles from "./detail.module.css";
import "@/styles/site.css";

// Shared by the full-page /templates/[id] route and the intercepted
// @modal route — this is the actual rendered site preview, independent
// of whichever chrome (full page vs dialog) wraps it.
export function TemplateBody({ meta, dbTemplate }: LoadedTemplate) {
  if (!dbTemplate) {
    return (
      <div className={styles.comingSoon}>
        <p>Full preview coming soon — this template doesn&apos;t have seeded content yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.browserFrame}>
      <div className={styles.urlBar}>
        <span className={styles.urlDots}>
          <span /><span /><span />
        </span>
        {meta.id}.rivo.app
      </div>
      {isNyoniAccountingGalleryTemplate(dbTemplate.id) ? (
        <NyoniAccountingTemplate
          contentBlocks={dbTemplate.contentBlocks}
          businessName={dbTemplate.name}
        />
      ) : (
        <div
          className="site"
          data-category={dbTemplate.category}
          data-template={dbTemplate.id}
          style={
            {
              "--color-primary": "#1c1c22",
              "--color-secondary": "#6b6b74",
              "--color-accent": "#e2652b",
            } as React.CSSProperties
          }
        >
          <TemplateRenderer
            structure={dbTemplate.structure}
            contentBlocks={dbTemplate.contentBlocks}
          />
        </div>
      )}
    </div>
  );
}
