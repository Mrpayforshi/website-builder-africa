import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import styles from "@/components/marketing/marketing.module.css";
import { SOLUTION_PAGES } from "@/components/marketing/solutions";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SOLUTION_PAGES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = SOLUTION_PAGES.find((s) => s.slug === slug);
  if (!page) return {};
  return { title: `${page.eyebrow} | Rivo`, description: page.lede };
}

export default async function SolutionPage({ params }: Props) {
  const { slug } = await params;
  const page = SOLUTION_PAGES.find((s) => s.slug === slug);
  if (!page) notFound();

  return (
    <MarketingShell>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>{page.eyebrow}</p>
        <h1 className={styles.h1}>
          {page.headA}
          <br />
          <span className={styles.blob}>{page.headB}</span>
        </h1>
        <p className={styles.lede}>{page.lede}</p>
        <div className={styles.heroCtas}>
          <a className={`${styles.btnDark} ${styles.btnLg}`} href="/signup">Start building</a>
          <Link className={`${styles.btnLight} ${styles.btnLg}`} href="/templates">Browse templates</Link>
        </div>
      </section>

      {page.features.map((f, i) => (
        <section key={f.title} className={`${styles.feature} ${i % 2 ? styles.featureFlip : ""}`}>
          {i % 2 === 0 && (
            <div className={styles.featureText}>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          )}
          <div className={`${styles.visual} ${styles[f.tone]}`}>
            <div className={styles.mock}>
              <div className={styles.mockTitle}>{f.title}</div>
              <div className={styles.mockRow}>
                {f.chips.map((c, j) => (
                  <span key={c} className={`${styles.pill} ${j === 0 ? styles.pillOn : ""}`}>{c}</span>
                ))}
              </div>
            </div>
          </div>
          {i % 2 === 1 && (
            <div className={styles.featureText}>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          )}
        </section>
      ))}

      <section className={styles.cta}>
        <h2>{page.ctaTitle}</h2>
        <a className={`${styles.btnLight} ${styles.btnLg}`} href="/signup">Start building</a>
      </section>
    </MarketingShell>
  );
}
