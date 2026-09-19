import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadTemplate } from "./load-template";
import { TemplateBody } from "./TemplateBody";
import styles from "./detail.module.css";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: DetailPageProps): Promise<Metadata> {
  const params = await props.params;
  const loaded = await loadTemplate(params.id);
  return { title: loaded ? `${loaded.meta.name} — Rivo templates` : "Template not found" };
}

export default async function TemplateDetailPage(props: DetailPageProps) {
  const params = await props.params;
  const loaded = await loadTemplate(params.id);

  if (!loaded) notFound();
  const { meta } = loaded;

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
        <TemplateBody {...loaded} />
      </div>
    </div>
  );
}
