import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Cta, PageTop } from "@/components/marketing/ResourceBits";
import { getGuide } from "@/lib/resources/content";
import r from "@/components/marketing/resources.module.css";

export const metadata: Metadata = {
  title: "Academy — Rivo",
  description: "Learn to build and run a business site with Rivo, one step at a time.",
};

const PATHS = [
  {
    title: "Launch your site",
    text: "From a sentence about your business to a live site you can share.",
    guides: ["launch-your-site", "edit-your-site"],
  },
  {
    title: "Take orders and get paid",
    text: "Let customers order on WhatsApp, pay with EcoCash and reserve with layby.",
    guides: ["whatsapp-ordering", "get-paid-ecocash", "layby-plans"],
  },
  {
    title: "Deliver and stay open",
    text: "Get orders to customers, and keep your site useful when the power or the data is poor.",
    guides: ["deliver-with-riders", "load-shedding-and-slow-connections"],
  },
];

export default function AcademyPage() {
  return (
    <MarketingShell>
      <PageTop
        eyebrow="Academy"
        title="Learn to build with Rivo"
        sub="Three short learning paths. Work through them in order, or jump to the one you need."
      />

      {PATHS.map((path, pi) => (
        <section key={path.title} className={r.path}>
          <div className={r.pathHead}>
            <span className={r.pathNum}>Path {pi + 1}</span>
            <h2 className={r.pathTitle}>{path.title}</h2>
          </div>
          <p className={r.pathText}>{path.text}</p>
          <div className={r.steps}>
            {path.guides.map((slug, si) => {
              const g = getGuide(slug);
              if (!g) return null;
              return (
                <Link key={slug} href={`/guides/${slug}`} className={r.step}>
                  <span className={r.stepNum}>{si + 1}</span>
                  <span className={r.stepBody}>
                    <span className={r.stepTitle}>{g.title}</span>
                    <span className={r.stepSub}>
                      {g.summary} &middot; {g.minutes} min
                    </span>
                  </span>
                  <span className={r.stepArrow} aria-hidden>
                    &rarr;
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <section className={r.group} style={{ marginTop: 36 }}>
        <h2 className={r.groupHead}>Then go deeper</h2>
        <div className={`${r.grid} ${r.grid2}`}>
          <Link href="/docs" className={r.card}>
            <h3 className={r.cardTitle}>Docs</h3>
            <p className={r.cardText}>How Rivo stores your site, what the chat can change, and how payments work.</p>
          </Link>
          <Link href="/guides" className={r.card}>
            <h3 className={r.cardTitle}>All guides</h3>
            <p className={r.cardText}>Every step-by-step guide in one place.</p>
          </Link>
        </div>
      </section>

      <Cta title="Learn by building" label="Start building" href="/signup" />
    </MarketingShell>
  );
}
