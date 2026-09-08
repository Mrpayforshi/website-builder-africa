import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TemplateRenderer } from "@/components/TemplateRenderer";
import { FALLBACK_TEMPLATES } from "../data";
import { getGalleryTemplateWithContent } from "@/lib/templates/template-store";
import styles from "./detail.module.css";
import "@/styles/site.css";

interface DetailPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const dbTemplate = await getGalleryTemplateWithContent(params.id);
  const name = dbTemplate?.name ?? FALLBACK_TEMPLATES.find((t) => t.id === params.id)?.name;
  return { title: name ? `${name} — Rivo templates` : "Template not found" };
}

export default async function TemplateDetailPage({ params }: DetailPageProps) {
  const dbTemplate = await getGalleryTemplateWithContent(params.id);

  const meta = dbTemplate ?? FALLBACK_TEMPLATES.find((t) => t.id === params.id);

  if (!meta) notFound();

  return (
    <div className={styles.scene}>
      <div className={styles.wrap}>
        <Link href="/templates" className={styles.back}>
          ← All templates
        </Link>
        <header className={styles.head}>
          <div>
            <span className={styles.badge}>{meta.categoryLabel}</span>
            <h1>{meta.name}</h1>
            <p>{meta.description}</p>
            {meta.features.length > 0 && (
              <div className={styles.feats}>
                {meta.features.map((f) => (
                  <span key={f} className={styles.featDot}>{f}</span>
                ))}
              </div>
            )}
          </div>
          <Link href={`/signup?template=${meta.id}`} className={styles.cta}>
            Use this template
          </Link>
        </header>
        {dbTemplate ? (
          <div className={styles.phoneFrame}>
            <div className={styles.urlBar}>{meta.id}.rivo.app</div>
            <div
              className="site"
              data-category={dbTemplate.category}
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
