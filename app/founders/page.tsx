import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import styles from "@/components/marketing/marketing.module.css";

export const metadata: Metadata = {
  title: "Rivo for founders — build your business online",
  description:
    "Describe your business in a chat and get a live site with WhatsApp ordering and EcoCash checkout built in.",
};

const USE_CASES = [
  { icon: "🛍", title: "Shops & retail", body: "Storefronts with products, orders and EcoCash checkout from day one." },
  { icon: "🍽", title: "Restaurants & cafés", body: "Menus customers can order from on WhatsApp, with delivery options." },
  { icon: "🛠", title: "Services & trades", body: "Show what you do, list your services and get enquiries directly." },
  { icon: "⚖", title: "Professional firms", body: "A credible site for lawyers, accountants and consultants." },
  { icon: "🤝", title: "NGOs & communities", body: "Share your programmes, gallery and ways to get involved." },
  { icon: "📸", title: "Events & portfolios", body: "Weddings, photographers and creatives — show the work, take bookings." },
];

export default function FoundersPage() {
  return (
    <MarketingShell>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Tools for founders</p>
        <h1 className={styles.h1}>
          Build your
          <br />
          <span className={styles.blob}>business</span>
        </h1>
        <p className={styles.lede}>
          Rivo is your AI web team. Describe your business in a chat and ship a site with WhatsApp ordering and
          EcoCash checkout built in — in days, not months.
        </p>
        <div className={styles.heroCtas}>
          <a className={`${styles.btnDark} ${styles.btnLg}`} href="/signup">Start building</a>
          <Link className={`${styles.btnLight} ${styles.btnLg}`} href="/templates">Browse templates</Link>
        </div>
      </section>

      <div className={styles.sectionHead}>
        <h2 className={styles.h2}>Your AI web team</h2>
        <p className={styles.sectionLede}>
          You don&apos;t need a developer to get started. Rivo builds, iterates and publishes with you — then
          keeps running your orders.
        </p>
      </div>

      <section className={styles.feature}>
        <div className={styles.featureText}>
          <h3>Build by describing what you want</h3>
          <p>
            Chatting with Rivo is like briefing a developer. Tell it about your business and it picks the right
            template and builds your site from it.
          </p>
        </div>
        <div className={`${styles.visual} ${styles.vBlue}`}>
          <div className={styles.mock}>
            <div className={styles.mockPrompt}>I run a bakery in Avondale. I want customers to order on WhatsApp…</div>
            <div className={styles.mockRow}>
              <span className={styles.pill}>+ Attach</span>
              <span className={styles.pill}>Build with AI</span>
            </div>
          </div>
        </div>
      </section>

      <section id="payments" className={`${styles.feature} ${styles.featureFlip}`}>
        <div className={`${styles.visual} ${styles.vPink}`}>
          <div className={styles.mock}>
            <div className={styles.mockTitle}>Connected</div>
            <div className={styles.mockRow}>
              <span className={`${styles.pill} ${styles.pillOn}`}>WhatsApp ordering</span>
              <span className={`${styles.pill} ${styles.pillOn}`}>EcoCash</span>
              <span className={styles.pill}>Layby</span>
              <span className={styles.pill}>Rider delivery</span>
            </div>
          </div>
        </div>
        <div className={styles.featureText}>
          <h3>Orders and payments included</h3>
          <p>
            WhatsApp ordering, EcoCash checkout, layby and rider delivery are switches, not integration projects.
            Turn on what your business needs.
          </p>
        </div>
      </section>

      <section className={styles.feature}>
        <div className={styles.featureText}>
          <h3>Hosting and data, handled</h3>
          <p>
            Hosting, SSL and your database are set up automatically. Your customers and orders are stored in a
            real database, and the data stays yours.
          </p>
        </div>
        <div className={`${styles.visual} ${styles.vOrange}`}>
          <div className={styles.mock}>
            <div className={styles.mockTitle}>Orders</div>
            <div className={styles.mockLine} />
            <div className={styles.mockLine} />
            <div className={styles.mockLine} style={{ width: "70%" }} />
          </div>
        </div>
      </section>

      <section className={`${styles.feature} ${styles.featureFlip}`}>
        <div className={`${styles.visual} ${styles.vViolet}`}>
          <div className={styles.mock}>
            <div className={styles.mockTitle}>Typography</div>
            <div className={styles.mockRow}>
              <span className={styles.pill}>Heading</span>
              <span className={styles.pill}>Serif</span>
              <span className={styles.pill}>Bold</span>
            </div>
            <div className={styles.mockTitle}>Color</div>
            <div className={styles.mockRow}>
              <span className={styles.pill}>● #111111</span>
              <span className={styles.pill}>● #e2652b</span>
            </div>
          </div>
        </div>
        <div className={styles.featureText}>
          <h3>Polish it to perfection</h3>
          <p>
            Click any text on your page to rewrite it, then adjust spacing, typography and colour with direct
            visual controls. See changes instantly.
          </p>
        </div>
      </section>

      <section className={styles.feature}>
        <div className={styles.featureText}>
          <h3>One-click publish</h3>
          <p>
            Your site goes live on your own Rivo address the moment you publish — and you can pull it back to draft
            whenever you like.
          </p>
        </div>
        <div className={`${styles.visual} ${styles.vSunset}`}>
          <div className={styles.mock}>
            <div className={styles.publish}>
              <span>Draft</span>
              <b>Publish</b>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.sectionHead} style={{ paddingTop: 48 }}>
        <h2 className={styles.h2}>Dream it. Build it. Ship it.</h2>
        <p className={styles.sectionLede}>Start from a template made for your kind of business.</p>
      </div>
      <div className={styles.useGrid}>
        {USE_CASES.map((u) => (
          <Link key={u.title} href="/templates" className={styles.useCard}>
            <div className={styles.useIcon} aria-hidden>{u.icon}</div>
            <h3>{u.title}</h3>
            <p>{u.body}</p>
          </Link>
        ))}
      </div>

      <section className={styles.cta}>
        <h2>Build the business you&apos;ve been dreaming about</h2>
        <a className={`${styles.btnLight} ${styles.btnLg}`} href="/signup">Start building</a>
      </section>
    </MarketingShell>
  );
}
