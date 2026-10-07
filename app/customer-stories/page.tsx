import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Cta, PageTop } from "@/components/marketing/ResourceBits";
import m from "@/components/marketing/marketing.module.css";
import r from "@/components/marketing/resources.module.css";

export const metadata: Metadata = {
  title: "Customer stories — Rivo",
  description: "See what businesses have built with Rivo.",
};

export default function CustomerStoriesPage() {
  return (
    <MarketingShell>
      <PageTop
        eyebrow="Customer stories"
        title="See what businesses have built"
        sub="Real businesses, real sites, in their own words."
      />

      <section className={r.empty}>
        <h2>The first stories are on their way</h2>
        <p>
          Rivo is new, so there are no customer stories to show yet, and we will not make any up. As businesses go
          live, their stories will appear here.
        </p>
        <div className={r.actions}>
          <a className={`${m.btnDark} ${m.btnLg}`} href="/signup">
            Build yours
          </a>
          <Link className={`${m.btnLight} ${m.btnLg}`} href="/templates">
            Browse sample sites
          </Link>
        </div>
      </section>

      <section className={r.group}>
        <h2 className={r.groupHead}>While you wait</h2>
        <div className={`${r.grid} ${r.grid2}`}>
          <Link href="/templates" className={r.card}>
            <div className={r.cardTag}>Sample sites</div>
            <h3 className={r.cardTitle}>Start from a ready-made template</h3>
            <p className={r.cardText}>
              Our templates are built around made-up sample businesses, not real customers. Open one to see how a
              finished site looks and feels.
            </p>
          </Link>
          <Link href="/guides/launch-your-site" className={r.card}>
            <div className={r.cardTag}>Guide</div>
            <h3 className={r.cardTitle}>Launch your first site</h3>
            <p className={r.cardText}>Go from a one-line description to a live site on your own Rivo address.</p>
          </Link>
        </div>
      </section>

      <Cta title="Be one of the first stories" label="Start building" href="/signup" />
    </MarketingShell>
  );
}
