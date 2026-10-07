import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Cta, PageTop } from "@/components/marketing/ResourceBits";
import { GUIDES } from "@/lib/resources/content";
import r from "@/components/marketing/resources.module.css";

export const metadata: Metadata = {
  title: "Guides — Rivo",
  description: "Step-by-step guides for building and running your business site on Rivo.",
};

export default function GuidesPage() {
  const categories = Array.from(new Set(GUIDES.map((g) => g.category)));

  return (
    <MarketingShell>
      <PageTop
        eyebrow="Guides"
        title="Learn as you build"
        sub="Short, practical guides for getting your site live and running orders, payments and delivery."
      />

      {categories.map((category) => (
        <section key={category} className={r.group}>
          <h2 className={r.groupHead}>{category}</h2>
          <div className={r.grid}>
            {GUIDES.filter((g) => g.category === category).map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} className={r.card}>
                <div className={r.cardTag}>{g.category}</div>
                <h3 className={r.cardTitle}>{g.title}</h3>
                <p className={r.cardText}>{g.summary}</p>
                <div className={r.cardMeta}>{g.minutes} min read</div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <Cta title="Ready to build?" label="Start building" href="/signup" />
    </MarketingShell>
  );
}
