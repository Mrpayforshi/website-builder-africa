import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ArticleBody } from "@/components/marketing/ResourceBits";
import { DOCS, DOC_SECTIONS, getDoc } from "@/lib/resources/content";
import r from "@/components/marketing/resources.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return {};
  return { title: `${doc.title} — Rivo docs`, description: doc.summary };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  return (
    <MarketingShell>
      <div className={r.docsLayout}>
        <aside className={r.sidebar} aria-label="Docs navigation">
          <div className={r.sideGroup}>
            <Link href="/docs" className={r.sideLink}>
              All docs
            </Link>
          </div>
          {DOC_SECTIONS.map((section) => (
            <div key={section.title} className={r.sideGroup}>
              <p className={r.sideHead}>{section.title}</p>
              {section.slugs.map((s) => {
                const d = getDoc(s);
                if (!d) return null;
                return (
                  <Link
                    key={s}
                    href={`/docs/${s}`}
                    className={`${r.sideLink} ${s === slug ? r.sideLinkOn : ""}`}
                    aria-current={s === slug ? "page" : undefined}
                  >
                    {d.title}
                  </Link>
                );
              })}
            </div>
          ))}
        </aside>

        <div className={r.docsMain}>
          <article className={r.article}>
            <p className={r.crumbs}>
              <Link href="/docs">Docs</Link> / {doc.category}
            </p>
            <h1 className={r.articleTitle}>{doc.title}</h1>
            <p className={r.articleLede}>{doc.summary}</p>
            <p className={r.articleMeta}>{doc.minutes} min read</p>
            <ArticleBody blocks={doc.body} />
          </article>
        </div>
      </div>
    </MarketingShell>
  );
}
