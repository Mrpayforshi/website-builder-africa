import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TemplateRenderer } from "@/components/TemplateRenderer";
import { PLACEHOLDER_TEMPLATES, PREVIEWABLE } from "../data";
import styles from "./detail.module.css";
import "@/styles/site.css";

interface DetailPageProps {
  params: { id: string };
}

export function generateMetadata({ params }: DetailPageProps): Metadata {
  const template = PLACEHOLDER_TEMPLATES.find((t) => t.id === params.id);
  return { title: template ? `${template.name} — Rivo templates` : "Template not found" };
}

export default function TemplateDetailPage({ params }: DetailPageProps) {
  const template = PLACEHOLDER_TEMPLATES.find((t) => t.id === params.id);
  if (!template) notFound();

  const preview = PREVIEWABLE[template.id];

  return (
    <div className={styles.scene}>
      <div className={styles.wrap}>
        <Link href="/templates" className={styles.back}>
          ← All templates
        </Link>

        <header className={styles.head}>
          <div>
            <span className={styles.badge}>{template.categoryLabel}</span>
            <h1>{template.name}</h1>
            <p>{template.description}</p>
            {template.features.length > 0 && (
              <div className={styles.feats}>
                {template.features.map((f) => (
                  <span key={f} className={styles.featDot}>{f}</span>
                ))}
              </div>
            )}
          </div>
          <Link href={`/signup?template=${template.id}`} className={styles.cta}>
            Use this template
          </Link>
        </header>

        {preview ? (
          <div className={styles.phoneFrame}>
            <div className={styles.urlBar}>{template.id}.rivo.app</div>
            <div
              className="site"
              data-category={template.category}
              style={
                {
                  "--color-primary": "#1c1c22",
                  "--color-secondary": "#6b6b74",
                  "--color-accent": "#e2652b",
                } as React.CSSProperties
              }
            >
              <TemplateRenderer structure={preview.structure} contentBlocks={preview.contentBlocks} />
            </div>
          </div>
        ) : (
          <div className={styles.comingSoon}>
            <p>Full preview coming soon — this template doesn&apos;t have seeded content yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
