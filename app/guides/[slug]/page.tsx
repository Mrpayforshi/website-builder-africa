import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ArticleBody, Cta } from "@/components/marketing/ResourceBits";
import { GUIDES, getGuide } from "@/lib/resources/content";
import r from "@/components/marketing/resources.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return { title: `${guide.title} — Rivo guides`, description: guide.summary };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const index = GUIDES.findIndex((g) => g.slug === slug);
  const prev = index > 0 ? GUIDES[index - 1] : null;
  const next = index < GUIDES.length - 1 ? GUIDES[index + 1] : null;

  return (
    <MarketingShell>
      <article className={r.article}>
        <p className={r.crumbs}>
          <Link href="/guides">Guides</Link> / {guide.category}
        </p>
        <h1 className={r.articleTitle}>{guide.title}</h1>
        <p className={r.articleLede}>{guide.summary}</p>
        <p className={r.articleMeta}>{guide.minutes} min read</p>

        <ArticleBody blocks={guide.body} />

        <nav className={r.next} aria-label="More guides">
          {prev ? <Link href={`/guides/${prev.slug}`}>&larr; {prev.title}</Link> : <span />}
          {next ? <Link href={`/guides/${next.slug}`}>{next.title} &rarr;</Link> : <span />}
        </nav>
      </article>

      <Cta title="Put it into practice" label="Start building" href="/signup" />
    </MarketingShell>
  );
}
