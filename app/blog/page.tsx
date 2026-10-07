import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PageTop } from "@/components/marketing/ResourceBits";
import { POSTS, formatDate } from "@/lib/resources/content";
import r from "@/components/marketing/resources.module.css";

export const metadata: Metadata = {
  title: "Blog — Rivo",
  description: "Ideas, updates and stories from the Rivo team.",
};

export default function BlogPage() {
  const posts = [...POSTS].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  const [latest, ...rest] = posts;

  return (
    <MarketingShell>
      <PageTop eyebrow="Blog" title="Ideas, updates, stories" sub="What we are building at Rivo and why." />

      {latest && (
        <Link href={`/blog/${latest.slug}`} className={r.featured}>
          <div className={r.cardTag}>
            {latest.category} &middot; {latest.date && formatDate(latest.date)}
          </div>
          <h2 className={r.featuredTitle}>{latest.title}</h2>
          <p className={r.cardText}>{latest.summary}</p>
          <div className={r.cardMeta}>{latest.minutes} min read</div>
        </Link>
      )}

      {rest.length > 0 && (
        <div className={`${r.grid} ${r.grid2}`} style={{ marginBottom: 56 }}>
          {rest.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className={r.card}>
              <div className={r.cardTag}>
                {p.category} &middot; {p.date && formatDate(p.date)}
              </div>
              <h3 className={r.cardTitle}>{p.title}</h3>
              <p className={r.cardText}>{p.summary}</p>
              <div className={r.cardMeta}>{p.minutes} min read</div>
            </Link>
          ))}
        </div>
      )}
    </MarketingShell>
  );
}
