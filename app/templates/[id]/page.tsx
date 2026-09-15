import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TemplateRenderer } from "@/components/TemplateRenderer";
import { FALLBACK_TEMPLATES } from "../data";
import { getGalleryTemplateWithContent } from "@/lib/templates/template-store";
import { RetailTwoTemplate } from "./RetailTwoTemplate";
import styles from "./detail.module.css";
import "@/styles/site.css";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: DetailPageProps): Promise<Metadata> {
  const params = await props.params;
  const dbTemplate = await getGalleryTemplateWithContent(params.id);
  const name = dbTemplate?.name ?? FALLBACK_TEMPLATES.find((t) => t.id === params.id)?.name;
  return { title: name ? `${name} — Rivo templates` : "Template not found" };
}

export default async function TemplateDetailPage(props: DetailPageProps) {
  const params = await props.params;
  const dbTemplate = await getGalleryTemplateWithContent(params.id);

  const meta = dbTemplate ?? FALLBACK_TEMPLATES.find((t) => t.id === params.id);

  if (!meta) notFound();

  return (
    <div className={styles.scene}>
      <div className={dbTemplate?.id === "retail-2" ? `${styles.wrap} ${styles.wrapWide}` : styles.wrap}>
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
          <div className={dbTemplate.id === "retail-2" ? styles.desktopFrame : styles.phoneFrame}>
            <div className={styles.urlBar}>{meta.id}.rivo.app</div>
            {dbTemplate.id === "retail-2" ? (
              // Bespoke, content-driven renderer matching the uploaded
              // design exactly — see RetailTwoTemplate.tsx. Still reads
              // the same hero/products/about/contact content blocks as
              // every other template, so it stays editable through the
              // normal content pipeline.
              <RetailTwoTemplate
                brandName={dbTemplate.name}
                hero={dbTemplate.contentBlocks.hero as never}
                products={dbTemplate.contentBlocks.products as never}
                about={dbTemplate.contentBlocks.about as never}
                contact={dbTemplate.contentBlocks.contact as never}
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
        ) : (
          <div className={styles.comingSoon}>
            <p>Full preview coming soon — this template doesn&apos;t have seeded content yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
