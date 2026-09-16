"use client";

import { useState } from "react";
import { buildWhatsappEnquiryLink } from "@/lib/commerce/whatsapp-links";
import styles from "./NyoniAccountingTemplate.module.css";

interface HeroContent {
  headline?: string;
  subheadline?: string;
  image?: string;
}

interface ServiceItem {
  name: string;
  description?: string;
  price?: string | number;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface NyoniAccountingTemplateProps {
  contentBlocks: Record<string, unknown>;
  businessName: string;
  whatsappNumber?: string | null;
  liteMode?: boolean;
}

// Cycled by index — same 4 generic icon glyphs as the reference file, applied
// regardless of how many service items a business actually has.
const ICON_PATHS = [
  "M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2 M10 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  "M3 12h4l2.5-6 4 12 2.5-6h5",
  "M3 3v18h18 M7 14l4-4 3 3 5-6",
  "M12 2l8 3v6c0 5-3.5 9.4-8 11-4.5-1.6-8-6-8-11V5l8-3z M9 12l2 2 4-4",
];

export default function NyoniAccountingTemplate({
  contentBlocks,
  businessName,
  whatsappNumber = null,
  liteMode = false,
}: NyoniAccountingTemplateProps) {
  const hero = (contentBlocks.hero ?? {}) as HeroContent;
  const services = (contentBlocks.services ?? {}) as { items?: ServiceItem[] };
  const faq = (contentBlocks.faq ?? {}) as { items?: FaqItem[] };

  const serviceItems = services.items ?? [];
  const faqItems = faq.items ?? [];

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const heroBgImage = !liteMode && hero.image ? `url("${hero.image}")` : "none";

  return (
    <div className={styles.wrapper}>
      {/* HERO */}
      <header className={styles.hero} style={{ ["--hero-bg-image" as string]: heroBgImage }}>
        <nav className={styles.nav}>
          <div className={styles.brand}>
            <span className={styles.dot}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                <path d="M3 12h4l2.5-6 4 12 2.5-6h5" />
              </svg>
            </span>
            {businessName}
          </div>
          <div className={styles.navLinks}>
            <a href="#services">Services</a>
            <a href="#faq">FAQ</a>
            <button className={styles.btnSignin} type="button">Client Portal</button>
          </div>
        </nav>

        <div className={styles.heroInner}>
          {hero.headline && <h1 className={styles.heroTitle}>{hero.headline}</h1>}
          {hero.subheadline && <p className={styles.heroSubtitle}>{hero.subheadline}</p>}
          <div className={styles.heroCta}>
            <button className={styles.btnPrimary} type="button">Book a consultation</button>
            <a className={styles.btnGhost} href="#services">See our services</a>
          </div>
        </div>
      </header>

      {/* SERVICES / "HOW IT WORKS" GRID */}
      {serviceItems.length > 0 && (
        <section id="services" className={styles.section}>
          <div className={styles.wrap}>
            <h2 className={styles.sectionTitle}>WHAT WE HANDLE</h2>
            <div className={styles.grid4}>
              {serviceItems.map((item, i) => (
                <div className={styles.card} key={item.name}>
                  <div className={styles.icon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={ICON_PATHS[i % ICON_PATHS.length]} />
                    </svg>
                  </div>
                  <h3>{item.name}</h3>
                  {item.description && <p>{item.description}</p>}
                  {item.price && <span className={styles.cardPrice}>{item.price}</span>}
                  {whatsappNumber && (
                    <div>
                      <a
                        className={styles.cardPrice}
                        href={buildWhatsappEnquiryLink(whatsappNumber, item.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Enquire via WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqItems.length > 0 && (
        <section id="faq" className={styles.sectionTight}>
          <div className={styles.wrap}>
            <h2 className={styles.sectionTitle}>FREQUENTLY ASKED</h2>
            <div className={styles.faqList}>
              {faqItems.map((item, i) => {
                const isOpen = openFaqIndex === i;
                return (
                  <div className={`${styles.faq} ${isOpen ? styles.faqOpen : ""}`} key={item.question}>
                    <button
                      type="button"
                      className={styles.faqButton}
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    >
                      {item.question}
                      <span className={styles.toggle}>+</span>
                    </button>
                    <div className={styles.answer}>{item.answer}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className={styles.footer}>
        <b>{businessName}</b> · built with <b>Rivo</b>
      </footer>
    </div>
  );
}
