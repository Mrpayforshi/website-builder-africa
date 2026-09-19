import type { LoadedTemplate } from "./load-template";
import { TemplateSite } from "./TemplateSite";
import styles from "./detail.module.css";

// Shared by the full-page /templates/[id] route and the intercepted
// @modal route — the browser chrome around the actual rendered site.
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
      <TemplateSite template={dbTemplate} />
    </div>
  );
}
