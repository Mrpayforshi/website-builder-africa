"use client";

import { useEffect, useRef, useState } from "react";
import { LITE_MODE_GALLERY_IMAGE_LIMIT } from "@/lib/market-fit/bandwidth";
import styles from "./GreenHarareTemplate.module.css";

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

interface ProgramItem {
  name: string;
  description?: string;
  image?: string;
}

interface GalleryImage {
  url: string;
  caption?: string;
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

interface GreenHarareTemplateProps {
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

const SLIDE_DURATION_MS = 6000;

export default function GreenHarareTemplate({
  contentBlocks,
  businessName,
  liteMode = false,
}: GreenHarareTemplateProps) {
  const hero = (contentBlocks.hero ?? {}) as HeroContent;
  const about = (contentBlocks.about ?? {}) as AboutContent;
  const programs = (contentBlocks.programs ?? {}) as { items?: ProgramItem[] };
  const gallery = (contentBlocks.gallery ?? {}) as { images?: GalleryImage[] };
  const contact = (contentBlocks.contact ?? {}) as ContactContent;

  const programItems = programs.items ?? [];
  const galleryImages = gallery.images ?? [];
  const visibleGalleryImages = liteMode ? galleryImages.slice(0, LITE_MODE_GALLERY_IMAGE_LIMIT) : galleryImages;
  const credentials = about.credentials ?? [];

  // The sourced design cycles through several hero photos; this content
  // model only has one hero.image plus a separate gallery. Reuse the first
  // few gallery photos as slides when available, falling back to the single
  // hero image, and to no slideshow at all in lite mode (matches Hero.tsx,
  // which omits the hero image entirely in lite mode).
  const slideImages = liteMode
    ? []
    : galleryImages.length > 0
      ? galleryImages.slice(0, 4).map((img) => img.url)
      : hero.image
        ? [hero.image]
        : [];

  const [slideIndex, setSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (slideImages.length <= 1) return;

    function tick(now: number) {
      if (startRef.current === null) startRef.current = now;
      const p = Math.min((now - startRef.current) / SLIDE_DURATION_MS, 1);
      setProgress(p * 100);
      if (p >= 1) {
        startRef.current = null;
        setSlideIndex((i) => (i + 1) % slideImages.length);
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideImages.length]);

  const [navOpen, setNavOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [modalOpen]);

  function openModal() {
    setNavOpen(false);
    setSubmitted(false);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setModalOpen(false);
      setSubmitted(false);
    }, 2600);
  }

  return (
    <div className={styles.wrapper}>
      {/* HEADER */}
      <header className={styles.siteHeader}>
        <a className={styles.brand} href="#top">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
            <path d="M12 3 4 19h5l3-6 3 6h5L12 3z" />
          </svg>
          {businessName}
        </a>

        <button
          className={styles.menuToggle}
          aria-label="Open menu"
          onClick={() => setNavOpen(true)}
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <nav className={`${styles.mainNav} ${navOpen ? styles.mainNavOpen : ""}`}>
          <button
            className={styles.menuClose}
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
            type="button"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          {programItems.length > 0 && (
            <a className={styles.navLink} href="#programs" onClick={() => setNavOpen(false)}>
              PROGRAMS
            </a>
          )}
          <a className={styles.navLink} href="#about" onClick={() => setNavOpen(false)}>
            ABOUT
          </a>
          <a className={styles.navLink} href="#contact" onClick={() => setNavOpen(false)}>
            CONTACT
          </a>
          <button className={`${styles.btn} ${styles.btnDark}`} type="button" onClick={openModal}>
            Get Involved
          </button>
        </nav>
      </header>

      {/* HERO */}
      <section className={styles.hero} id="top">
        {slideImages.map((src, i) => (
          <div
            key={src + i}
            className={`${styles.slide} ${i === slideIndex ? styles.slideActive : ""}`}
            style={{ backgroundImage: `url("${src}")` }}
          />
        ))}
        <div className={styles.heroInner}>
          {hero.headline && <h1 className={styles.heroTitle}>{hero.headline}</h1>}
          {hero.subheadline && <p className={styles.heroSubtitle}>{hero.subheadline}</p>}
          <button className={`${styles.btn} ${styles.btnLight}`} type="button" onClick={openModal}>
            Get Involved
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          {slideImages.length > 1 && (
            <div className={styles.heroProgress}>
              <div className={styles.track}>
                <div className={styles.fill} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.count}>
                {String(slideIndex + 1).padStart(2, "0")} / {String(slideImages.length).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* PROGRAMS */}
      {programItems.length > 0 && (
        <section className={styles.block} id="programs">
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.eyebrow}>get involved</span>
              <h2 className={styles.sectionTitle}>Our Programs</h2>
            </div>
            <p className={styles.sectionSub}>
              Community-led environmental work across Harare — every program open to volunteers.
            </p>
          </div>
          <div className={styles.programsGrid}>
            {programItems.map((program, i) => (
              <article className={styles.programCard} key={program.name} data-index={i % 3}>
                {program.image && !liteMode && (
                  <div className={styles.programMedia}>
                    <img src={program.image} alt={program.name} loading="lazy" decoding="async" />
                  </div>
                )}
                <div className={styles.programBody}>
                  <h3 className={styles.programName}>{program.name}</h3>
                  {program.description && <p className={styles.programDesc}>{program.description}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* GALLERY */}
      {visibleGalleryImages.length > 0 && (
        <section className={styles.block}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.eyebrow}>on the ground</span>
              <h2 className={styles.sectionTitle}>Recent Activity</h2>
            </div>
          </div>
          <div className={styles.galleryGrid}>
            {visibleGalleryImages.map((image) => (
              <figure className={styles.galleryItem} key={image.url}>
                <img src={image.url} alt={image.caption ?? ""} loading="lazy" decoding="async" />
                {image.caption && <figcaption>{image.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ABOUT */}
      {(about.headline || about.body) && (
        <section className={styles.about} id="about">
          {about.image && !liteMode && (
            <div className={styles.aboutMedia}>
              <img src={about.image} alt={about.headline ?? businessName} loading="lazy" decoding="async" />
            </div>
          )}
          <div className={styles.aboutCopy}>
            <span className={styles.eyebrow}>why it matters</span>
            {about.headline && <h2 className={styles.sectionTitle}>{about.headline}</h2>}
            {about.body && <p>{about.body}</p>}
            {credentials.length > 0 && (
              <ul className={styles.aboutList}>
                {credentials.map((c) => (
                  <li key={c}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {c}
                  </li>
                ))}
              </ul>
            )}
            <button className={`${styles.btn} ${styles.btnDark}`} type="button" onClick={openModal}>
              Get Involved
            </button>
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      <section
        className={styles.cta}
        style={!liteMode && hero.image ? { ["--cta-bg" as string]: `url("${hero.image}")` } : undefined}
      >
        <span className={styles.eyebrow} style={{ color: "#fff" }}>
          ready when you are
        </span>
        <h2>The work isn&apos;t done.</h2>
        <p>Join the next planting day, clean-up, or school program — no experience needed, just show up.</p>
        <button className={`${styles.btn} ${styles.btnLight}`} type="button" onClick={openModal}>
          Get Involved
        </button>
      </section>

      {/* CONTACT / FOOTER */}
      <footer className={styles.siteFooter} id="contact">
        <div className={styles.footerContact}>
          {contact.address && <span>{contact.address}</span>}
          {contact.phone && <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a>}
          {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
        </div>
        {contact.hours && (
          <ul className={styles.footerHours}>
            {Object.entries(contact.hours).map(([day, times]) => (
              <li key={day}>
                {DAY_LABELS[day] ?? day} {times.open}–{times.close}
              </li>
            ))}
          </ul>
        )}
        <span className={styles.footerCopy}>© {new Date().getFullYear()} {businessName}. All rights reserved.</span>
      </footer>

      {/* GET INVOLVED MODAL */}
      {modalOpen && (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label="Get involved"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className={styles.modalWrap}>
            <div className={styles.modal}>
              <button className={styles.modalClose} aria-label="Close" type="button" onClick={closeModal}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>

              {!submitted ? (
                <form onSubmit={handleSubmit}>
                  <h3>Get involved</h3>
                  <p className={styles.modalSub}>Pick a program and leave your details — we&apos;ll be in touch.</p>
                  <div className={styles.field}>
                    <label htmlFor="ghProgram">Program</label>
                    <select id="ghProgram" required defaultValue="">
                      <option value="" disabled>
                        Choose a program
                      </option>
                      {(programItems.length > 0
                        ? programItems.map((p) => p.name)
                        : ["General volunteering"]
                      ).map((name) => (
                        <option key={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="ghName">Name</label>
                    <input id="ghName" type="text" required />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="ghPhone">Phone or email</label>
                    <input id="ghPhone" type="text" required />
                  </div>
                  <button type="submit" className={`${styles.btn} ${styles.btnDark} ${styles.modalSubmit}`}>
                    Request to Join
                  </button>
                </form>
              ) : (
                <div className={styles.modalSuccess}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12.5l2.5 2.5L16 9.5" />
                  </svg>
                  <h4>Request received!</h4>
                  <p>We&apos;ll follow up by email within a few days. Thanks for stepping up.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
