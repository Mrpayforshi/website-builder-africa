"use client";

import { useEffect, useState } from "react";
import { LITE_MODE_GALLERY_IMAGE_LIMIT } from "@/lib/market-fit/bandwidth";
import styles from "./RufaroStudioTemplate.module.css";

interface HeroContent {
  headline?: string;
  subheadline?: string;
  image?: string;
}

interface GalleryImage {
  url: string;
  caption?: string;
}

interface AboutContent {
  headline?: string;
  body?: string;
  image?: string;
  credentials?: string[];
}

interface ContactHours {
  [day: string]: { open: string; close: string };
}

interface ContactContent {
  address?: string;
  phone?: string;
  email?: string;
  hours?: ContactHours;
}

interface RufaroStudioTemplateProps {
  contentBlocks: Record<string, unknown>;
  businessName: string;
  liteMode?: boolean;
}

const DAY_LABELS: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

const THEME_STORAGE_KEY = "rivo_studio_template_theme";
const COLLAGE_SLOTS = 8;

export default function RufaroStudioTemplate({
  contentBlocks,
  businessName,
  liteMode = false,
}: RufaroStudioTemplateProps) {
  const hero = (contentBlocks.hero ?? {}) as HeroContent;
  const gallery = (contentBlocks.gallery ?? {}) as { images?: GalleryImage[] };
  const about = (contentBlocks.about ?? {}) as AboutContent;
  const contact = (contentBlocks.contact ?? {}) as ContactContent;

  const images = gallery.images ?? [];
  const visibleImages = liteMode ? images.slice(0, LITE_MODE_GALLERY_IMAGE_LIMIT) : images;
  const services = about.credentials ?? [];

  // The sourced design fills an 8-tile collage; cycle through whatever
  // gallery photos exist (repeating if there are fewer than 8) so the
  // layout holds together regardless of how many photos a business has.
  // Skipped entirely in lite mode, matching Hero.tsx's convention of
  // omitting hero imagery there.
  const collageTiles =
    !liteMode && images.length > 0
      ? Array.from({ length: COLLAGE_SLOTS }, (_, i) => images[i % images.length])
      : [];

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") setTheme(stored);
    } catch {
      // localStorage unavailable (private browsing, etc.) — default stands.
    }
  }, []);
  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // best-effort persistence only
      }
      return next;
    });
  }

  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className={styles.wrapper} data-theme={theme}>
      {/* NAV */}
      <header className={styles.nav}>
        <a className={styles.brand} href="#top">
          {businessName}
        </a>
        <div className={styles.navRight}>
          <button className={styles.themeToggle} type="button" onClick={toggleTheme} aria-label="Toggle theme">
            <span className={styles.themeDot} />
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <button
            className={styles.menuToggle}
            type="button"
            aria-label="Open menu"
            onClick={() => setNavOpen(true)}
          >
            Menu
          </button>
        </div>
        <nav className={`${styles.navOverlay} ${navOpen ? styles.navOverlayOpen : ""}`}>
          <button
            className={styles.navClose}
            type="button"
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          >
            Close
          </button>
          {images.length > 0 && (
            <a href="#work" onClick={() => setNavOpen(false)}>
              Work
            </a>
          )}
          {(about.headline || about.body) && (
            <a href="#about" onClick={() => setNavOpen(false)}>
              About
            </a>
          )}
          <a href="#contact" onClick={() => setNavOpen(false)}>
            Contact
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section className={styles.hero} id="top">
        {collageTiles.length > 0 && (
          <div className={styles.collage} aria-hidden="true">
            {collageTiles.map((image, i) => (
              <div key={i} className={`${styles.tile} ${styles[`tile${i}`]}`}>
                <img src={image.url} alt="" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        )}
        <div className={styles.heroCopy}>
          {hero.headline && <h1 className={styles.heroTitle}>{hero.headline}</h1>}
          {hero.subheadline && <p className={styles.heroSubtitle}>{hero.subheadline}</p>}
        </div>
      </section>

      {/* WORK */}
      {visibleImages.length > 0 && (
        <section className={styles.section} id="work">
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>Selected Work</span>
            <h2 className={styles.sectionTitle}>Recent projects</h2>
          </div>
          <div className={styles.workGrid}>
            {visibleImages.map((image) => (
              <a key={image.url} className={styles.workItem} href="#work" onClick={(e) => e.preventDefault()}>
                <div className={styles.workMedia}>
                  <img src={image.url} alt={image.caption ?? ""} loading="lazy" decoding="async" />
                </div>
                <div className={styles.workMeta}>
                  {image.caption && <span className={styles.workName}>{image.caption}</span>}
                  <span className={styles.workArrow} aria-hidden="true">
                    →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ABOUT */}
      {(about.headline || about.body) && (
        <section className={styles.about} id="about">
          <div className={styles.aboutLede}>
            {about.headline && <h2>{about.headline}</h2>}
          </div>
          <div className={styles.aboutSide}>
            {about.image && !liteMode && (
              <div className={styles.aboutMedia}>
                <img src={about.image} alt={about.headline ?? businessName} loading="lazy" decoding="async" />
              </div>
            )}
            {about.body && <p className={styles.aboutBody}>{about.body}</p>}
            {services.length > 0 && (
              <ul className={styles.services}>
                {services.map((s, i) => (
                  <li key={s}>
                    <span className={styles.serviceIndex}>{String(i + 1).padStart(2, "0")}</span>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section className={styles.contact} id="contact">
        <span className={styles.eyebrow}>Get in touch</span>
        {contact.email ? (
          <a className={styles.bigMail} href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        ) : (
          <h2 className={styles.bigMail}>Let&apos;s work together</h2>
        )}
        <div className={styles.contactDetails}>
          {contact.address && <span>{contact.address}</span>}
          {contact.phone && <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a>}
          {contact.hours && (
            <ul className={styles.contactHours}>
              {Object.entries(contact.hours).map(([day, times]) => (
                <li key={day}>
                  {DAY_LABELS[day] ?? day} {times.open}–{times.close}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <span>{businessName}</span>
        <span>© {new Date().getFullYear()} · Built with Rivo</span>
      </footer>
    </div>
  );
}
