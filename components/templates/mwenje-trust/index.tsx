"use client";

import { useState } from "react";
import { LITE_MODE_GALLERY_IMAGE_LIMIT } from "@/lib/market-fit/bandwidth";
import styles from "./MwenjeTrustTemplate.module.css";

interface HeroContent {
  headline?: string;
  subheadline?: string;
  image?: string;
}

interface AboutContent {
  headline?: string;
  body?: string;
  image?: string;
  credentials?: string[];
}

interface GalleryImage {
  url: string;
  caption?: string;
}

interface StatItem {
  value: number;
  suffix?: string;
  label: string;
}

interface StatsContent {
  items?: StatItem[];
}

interface CtaContent {
  eyebrow?: string;
  headline?: string;
  body?: string;
  button_label?: string;
}

interface ContactContent {
  address?: string;
  phone?: string;
  email?: string;
}

interface MwenjeTrustTemplateProps {
  contentBlocks: Record<string, unknown>;
  businessName: string;
  liteMode?: boolean;
}

function bgStyle(name: string, url: string | undefined, liteMode: boolean) {
  if (!url || liteMode) return undefined;
  return { [name]: `url("${url}")` } as React.CSSProperties;
}

export default function MwenjeTrustTemplate({
  contentBlocks,
  businessName,
  liteMode = false,
}: MwenjeTrustTemplateProps) {
  const hero = (contentBlocks.hero ?? {}) as HeroContent;
  const about = (contentBlocks.about ?? {}) as AboutContent;
  const gallery = (contentBlocks.gallery ?? {}) as { images?: GalleryImage[] };
  const stats = (contentBlocks.stats ?? {}) as StatsContent;
  const cta = (contentBlocks.cta ?? {}) as CtaContent;
  const contact = (contentBlocks.contact ?? {}) as ContactContent;

  const statItems = stats.items ?? [];
  const galleryImages = gallery.images ?? [];
  const visibleGallery = liteMode
    ? galleryImages.slice(0, LITE_MODE_GALLERY_IMAGE_LIMIT)
    : galleryImages;
  // The donate banner reuses the first gallery photo as its backdrop, since
  // the design has no gallery section of its own.
  const ctaImage = visibleGallery[0]?.url;

  const heroWords = (hero.headline ?? "").split(/\s+/).filter(Boolean);
  const ctaLines = (cta.headline ?? "").split("\n");
  const ctaHref = contact.email ? `mailto:${contact.email}` : "#donate";

  const [navOpen, setNavOpen] = useState(false);
  const closeNav = () => setNavOpen(false);

  return (
    <div className={styles.wrapper}>
      <div className={styles.page}>
        {/* HEADER */}
        <header className={styles.header}>
          <a className={styles.brand} href="#top">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2c.6 3.2-.9 5-2.5 6.8C7.9 10.6 6 12.6 6 15.4A6 6 0 0 0 12 21a6 6 0 0 0 6-5.6c0-1.7-.6-3-1.5-4.2-.4 1-1.1 1.8-2 2.3.3-3.2-.8-7.6-2.5-9.5z" />
            </svg>
            {businessName}
          </a>
          <button
            className={styles.menuToggle}
            type="button"
            aria-label="Open menu"
            onClick={() => setNavOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <nav className={`${styles.nav} ${navOpen ? styles.navOpen : ""}`}>
            <button
              className={styles.menuClose}
              type="button"
              aria-label="Close menu"
              onClick={closeNav}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {statItems.length > 0 && (
              <a className={styles.navLink} href="#impact" onClick={closeNav}>
                Our Impact
              </a>
            )}
            {(about.headline || about.body) && (
              <a className={styles.navLink} href="#story" onClick={closeNav}>
                Our Story
              </a>
            )}
            <a className={styles.navLink} href="#donate" onClick={closeNav}>
              Give Hope
            </a>
          </nav>
        </header>

        {/* HERO */}
        <section className={styles.hero} id="top">
          <div
            className={styles.heroBg}
            style={bgStyle("--hero-bg", hero.image, liteMode)}
            role="img"
            aria-label={hero.headline ?? businessName}
          />
          <div className={styles.heroHeadline}>
            {heroWords.map((word, i) => (
              <span key={`${word}-${i}`} className={styles.word}>
                {word}
              </span>
            ))}
          </div>
          <div className={styles.heroFoot}>
            {hero.subheadline && <p className={styles.heroTag}>{hero.subheadline}</p>}
            <a href="#donate" className={`${styles.btn} ${styles.btnOutline}`}>
              Donate
            </a>
          </div>
        </section>

        {/* OUR STORY */}
        {(about.headline || about.body) && (
          <section className={`${styles.story} ${styles.block}`} id="story">
            <div
              className={styles.storyBg}
              style={bgStyle("--story-bg", about.image, liteMode)}
              role="img"
              aria-label={about.headline ?? businessName}
            />
            <div className={styles.storyBody}>
              <span className={styles.eyebrow}>Who we are</span>
              {about.headline && <h2 className={styles.storyTitle}>{about.headline}</h2>}
              {about.body && <p className={styles.storyText}>{about.body}</p>}
            </div>
          </section>
        )}

        {/* IMPACT STATS */}
        {statItems.length > 0 && (
          <section className={`${styles.stats} ${styles.block}`} id="impact">
            {statItems.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <div className={styles.num}>
                  {stat.value}
                  {stat.suffix ?? ""}
                </div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </section>
        )}

        {/* DONATE CTA */}
        <section className={`${styles.cta} ${styles.block}`} id="donate">
          <div
            className={styles.ctaBg}
            style={bgStyle("--cta-bg", ctaImage, liteMode)}
            aria-hidden="true"
          />
          <span className={styles.eyebrow}>{cta.eyebrow ?? "Give Hope"}</span>
          {cta.headline && (
            <h2 className={styles.ctaTitle}>
              {ctaLines.map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </h2>
          )}
          {cta.body && <p className={styles.ctaText}>{cta.body}</p>}
          <a href={ctaHref} className={`${styles.btn} ${styles.btnSolid}`}>
            {cta.button_label ?? "Donate Now"}
          </a>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <span>
            © {new Date().getFullYear()} {businessName} · Built with Rivo
          </span>
          <span>
            {contact.email && <a href={`mailto:${contact.email}`}>Contact</a>}
            {contact.phone && (
              <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a>
            )}
          </span>
        </footer>
      </div>
    </div>
  );
}
