import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PageTop } from "@/components/marketing/ResourceBits";
import { DOC_SECTIONS, getDoc } from "@/lib/resources/content";
import r from "@/components/marketing/resources.module.css";

export const metadata: Metadata = {
  title: "Docs — Rivo",
  description: "Everything under the hood: how Rivo sites, the chat, features and payments work.",
};

export default function DocsPage() {
  return (
    <MarketingShell>
      <PageTop
        eyebrow="Docs"
        title="Everything under the hood"
        sub="How Rivo stores your site, what the chat can change, and how orders, payments and delivery fit together."
      />

      {DOC_SECTIONS.map((section) => (
        <section key={section.title} className={r.group}>
          <h2 className={r.groupHead}>{section.title}</h2>
          <div className={`${r.grid} ${r.grid2}`}>
            {section.slugs.map((slug) => {
              const doc = getDoc(slug);
              if (!doc) return null;
              return (
                <Link key={slug} href={`/docs/${slug}`} className={r.card}>
                  <h3 className={r.cardTitle}>{doc.title}</h3>
                  <p className={r.cardText}>{doc.summary}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </MarketingShell>
  );
}
