import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import styles from "@/components/marketing/marketing.module.css";

export const metadata: Metadata = {
  title: "Rivo for work — the site that runs your business",
  description:
    "Orders, payments, inventory and delivery in one place, behind a login and connected to the tools you already use.",
};

const TOOLS = [
  { icon: "📦", title: "Orders", body: "See every order in one place and assign it to a team member." },
  { icon: "💬", title: "WhatsApp ordering", body: "Customers order inside WhatsApp; orders land in your dashboard." },
  { icon: "💳", title: "Payments", body: "EcoCash checkout and layby, with payments tied to each order." },
  { icon: "🛵", title: "Delivery", body: "Offer rider delivery or collection per order." },
  { icon: "🗂", title: "Inventory", body: "Keep what you sell in sync with what you actually have." },
  { icon: "🧾", title: "Invoicing", body: "Turn orders into invoices without retyping anything." },
  { icon: "🔌", title: "Local-ready", body: "Load-shedding banner and a low-bandwidth mode for patchy connections." },
  { icon: "🗺", title: "Maps sync", body: "Keep your location and hours consistent wherever customers find you." },
];

export default function ForWorkPage() {
  return (
    <MarketingShell>
      <section className={styles.hero}>
        <h1 className={styles.h1} style={{ fontSize: "clamp(2.8rem, 7.5vw, 5.6rem)" }}>
          Build the site that
          <br />
          runs your business
        </h1>
        <p className={styles.lede}>
          Describe what your team needs and build it with Rivo: orders, payments and delivery on your own data,
          behind a login, connected to the tools you already run.
        </p>
        <div className={styles.heroCtas}>
          <a className={`${styles.btnDark} ${styles.btnLg}`} href="/signup">Get started</a>
          <Link className={`${styles.btnLight} ${styles.btnLg}`} href="/templates">See templates</Link>
        </div>
      </section>

      <div className={styles.sectionHead}>
        <h2 className={styles.h2}>Building is just the beginning</h2>
        <p className={styles.sectionLede}>
          Most website builders stop at a pretty page. Rivo carries on into the daily running of the business.
        </p>
      </div>
      <div className={styles.trio}>
        <div>
          <h3>Build</h3>
          <p>Describe your business in a chat. Rivo builds the site, and you refine it by clicking straight on the page.</p>
        </div>
        <div>
          <h3>Run</h3>
          <p>Take orders on your site and on WhatsApp, collect EcoCash payments and work the orders from one dashboard.</p>
        </div>
        <div>
          <h3>Govern</h3>
          <p>
            Nothing goes live until you publish it, and edits from the chat and the dashboard can never silently
            overwrite each other.
          </p>
        </div>
      </div>

      <div id="connectors" className={styles.sectionHead}>
        <h2 className={styles.h2}>Tools tailored to your business</h2>
        <p className={styles.sectionLede}>Every business has a few jobs that eat the week. Switch on the connectors that take them off you.</p>
      </div>
      <div className={`${styles.useGrid} ${styles.toolGrid}`}>
        {TOOLS.map((t) => (
          <div key={t.title} className={styles.useCard} style={{ minHeight: 170 }}>
            <div className={styles.useIcon} aria-hidden style={{ marginBottom: 18 }}>{t.icon}</div>
            <h3 style={{ fontSize: 18 }}>{t.title}</h3>
            <p style={{ fontSize: 13.5 }}>{t.body}</p>
          </div>
        ))}
      </div>

      <section className={styles.cta}>
        <h2>Put your business on one dashboard</h2>
        <a className={`${styles.btnLight} ${styles.btnLg}`} href="/signup">Get started</a>
      </section>
    </MarketingShell>
  );
}
