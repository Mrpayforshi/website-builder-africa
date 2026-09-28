"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useId, useState } from "react";
import { LITE_MODE_GALLERY_IMAGE_LIMIT } from "@/lib/market-fit/bandwidth";
import styles from "./MvuraPlumbingTemplate.module.css";

interface HeroContent {
  headline?: string;
  subheadline?: string;
  image?: string;
}

interface ServiceItem {
  name: string;
  price?: string;
  description?: string;
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

interface ProofContent {
  label?: string;
  value?: string;
  rating?: string;
  rating_label?: string;
}

interface StatItem {
  value: string | number;
  label: string;
}

interface TestimonialItem {
  name: string;
  role?: string;
  quote: string;
  image?: string;
}

interface CtaContent {
  headline?: string;
  body?: string;
  button_label?: string;
}

interface ContactContent {
  address?: string;
  phone?: string;
  email?: string;
}

interface MvuraPlumbingTemplateProps {
  contentBlocks: Record<string, unknown>;
  businessName: string;
  liteMode?: boolean;
}

// Service card icons cycle by position — static chrome, not content fields.
const ICON_PATHS = [
  "M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  "M4 12h16M4 12c0 4.4 3.6 8 8 8s8-3.6 8-8M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8M12 4v16",
  "M8 3h8v4H8zM6 7h12v11a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V7ZM12 12v3",
  "M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2ZM12 12V6m0 0c0-1.7 1.3-3 3-3",
  "M12 3C12 3 6 10 6 14a6 6 0 0 0 12 0c0-4-6-11-6-11ZM9.5 14.5a2.5 2.5 0 0 0 2.5 2.5",
  "M3 8h8a4 4 0 0 1 4 4v8M3 8V5m0 3h18M15 20h3m-3 0v-3",
];

const BLOB_CLASSES = ["b1", "b2", "b3", "b4", "b5", "b6"] as const;

function shortCount(value: string | undefined): string {
  const n = parseInt((value ?? "").replace(/[^\d]/g, ""), 10);
  if (!n) return "★";
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export default function MvuraPlumbingTemplate({
  contentBlocks,
  businessName,
  liteMode = false,
}: MvuraPlumbingTemplateProps) {
  const hero = (contentBlocks.hero ?? {}) as HeroContent;
  const services = (contentBlocks.services ?? {}) as { items?: ServiceItem[] };
  const about = (contentBlocks.about ?? {}) as AboutContent;
  const gallery = (contentBlocks.gallery ?? {}) as { images?: GalleryImage[] };
  const proof = (contentBlocks.proof ?? {}) as ProofContent;
  const marquee = (contentBlocks.marquee ?? {}) as { items?: string[] };
  const stats = (contentBlocks.stats ?? {}) as { items?: StatItem[] };
  const testimonials = (contentBlocks.testimonials ?? {}) as { items?: TestimonialItem[] };
  const cta = (contentBlocks.cta ?? {}) as CtaContent;
  const contact = (contentBlocks.contact ?? {}) as ContactContent;

  // Scope anchor ids per instance: the gallery renders this component once per
  // card thumbnail, so bare ids like "services" would collide on the page.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `${uid}-${name}`;

  const serviceItems = services.items ?? [];
  const statItems = stats.items ?? [];
  const quoteItems = testimonials.items ?? [];
  const marqueeItems = marquee.items ?? [];
  const credentials = about.credentials ?? [];

  let collage = gallery.images ?? [];
  if (collage.length === 0 && hero.image) collage = [{ url: hero.image, caption: businessName }];
  collage = collage.slice(0, liteMode ? LITE_MODE_GALLERY_IMAGE_LIMIT : BLOB_CLASSES.length);

  // Last two words of the headline get the lime highlight.
  const headWords = (hero.headline ?? businessName).split(/\s+/).filter(Boolean);
  const splitAt = Math.max(headWords.length - 2, 0);
  const headPlain = headWords.slice(0, splitAt).join(" ");
  const headLime = headWords.slice(splitAt).join(" ");

  const phone = contact.phone;
  const callHref = phone ? telHref(phone) : `#${id("contact")}`;
  const brandFirst = businessName.split(/\s+/)[0] ?? businessName;

  const [navOpen, setNavOpen] = useState(false);
  const closeNav = () => setNavOpen(false);

  const [active, setActive] = useState(0);
  useEffect(() => {
    if (liteMode || quoteItems.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % quoteItems.length), 5000);
    return () => clearInterval(t);
  }, [liteMode, quoteItems.length]);
  const quote = quoteItems[active % Math.max(quoteItems.length, 1)];

  const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

  return (
    <div className={cx(styles.wrapper, liteMode && styles.lite)}>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className={cx(styles.container, styles.navInner)}>
          <a href={`#${id("top")}`} className={styles.brand}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0C19 10 12 2 12 2Z" fill="#c4f238" />
              <path d="M9 15a3 3 0 0 0 3 3" stroke="#1b4fd8" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {businessName}
          </a>
          <div className={cx(styles.navLinks, navOpen && styles.navLinksOpen)}>
            <a href={`#${id("top")}`} onClick={closeNav}>Home</a>
            {serviceItems.length > 0 && (
              <a href={`#${id("services")}`} onClick={closeNav}>Services</a>
            )}
            {(about.headline || about.body) && (
              <a href={`#${id("why")}`} onClick={closeNav}>About</a>
            )}
            {quoteItems.length > 0 && (
              <a href={`#${id("reviews")}`} onClick={closeNav}>Reviews</a>
            )}
            <a href={`#${id("contact")}`} onClick={closeNav}>Contact</a>
          </div>
          <div className={styles.navActions}>
            {phone && (
              <a className={styles.pillCall} href={callHref}>
                ✆ Call {phone}
              </a>
            )}
            <a className={styles.btnLime} href={`#${id("contact")}`}>
              Get a Quote
            </a>
            <button
              type="button"
              className={styles.menuToggle}
              aria-label={navOpen ? "Close menu" : "Open menu"}
              aria-expanded={navOpen}
              onClick={() => setNavOpen((o) => !o)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {navOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className={styles.hero} id={id("top")}>
        <div className={cx(styles.container, styles.heroGrid)}>
          <div>
            <h1>
              {headPlain}
              {headPlain && " "}
              <span className={styles.lime}>{headLime}</span>
            </h1>
            {hero.subheadline && <p className={styles.heroSub}>{hero.subheadline}</p>}
            <div className={styles.heroCtas}>
              <a className={cx(styles.btnLime, styles.btnHero)} href={`#${id("contact")}`}>
                Get a Quote
              </a>
              {serviceItems.length > 0 && (
                <a className={cx(styles.btnGhost, styles.btnHero)} href={`#${id("services")}`}>
                  See All Services
                </a>
              )}
            </div>
            {proof.value && (
              <div className={styles.heroProof}>
                <div className={styles.avatars}>
                  {quoteItems.slice(0, 3).map((q) =>
                    q.image && !liteMode ? (
                      <img key={q.name} src={q.image} alt="" loading="lazy" />
                    ) : (
                      <span key={q.name} className={styles.avatarInitials}>
                        {initials(q.name)}
                      </span>
                    ),
                  )}
                  <span className={styles.more}>{shortCount(proof.value)}</span>
                </div>
                <div className={styles.proofText}>
                  <b>{proof.value}</b>
                  <span>{proof.label ?? "Happy Clients"}</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.collage} aria-hidden="true">
            {proof.rating && (
              <div className={styles.badgeRating}>
                <div className={styles.stars}>★★★★★</div>
                <b>{proof.rating}</b>
                <span>{proof.rating_label ?? "Average Rating"}</span>
              </div>
            )}
            {collage.map((img, i) => (
              <div key={`${img.url}-${i}`} className={cx(styles.blob, styles[BLOB_CLASSES[i]])}>
                <img src={img.url} alt={img.caption ?? ""} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* MARQUEE */}
      {marqueeItems.length > 0 && (
        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {[...marqueeItems, ...marqueeItems].map((text, i) => (
              <span key={`${text}-${i}`}>{text}</span>
            ))}
          </div>
        </div>
      )}

      {/* SERVICES */}
      {serviceItems.length > 0 && (
        <section className={styles.services} id={id("services")}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>What We Do</span>
                <h2>
                  Services built around
                  <br />
                  your home.
                </h2>
              </div>
              <p>One call handles it all — done right the first time, with the price agreed upfront.</p>
            </div>
            <div className={styles.svcGrid}>
              {serviceItems.map((s, i) => (
                <div key={`${s.name}-${i}`} className={styles.svc}>
                  <div className={styles.svcIcon}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d={ICON_PATHS[i % ICON_PATHS.length]} />
                    </svg>
                  </div>
                  <h3>{s.name}</h3>
                  {s.description && <p>{s.description}</p>}
                  <div className={styles.svcFoot}>
                    <a href={`#${id("contact")}`}>Book Now →</a>
                    {s.price && <span className={styles.svcPrice}>{s.price}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHY US */}
      {(about.headline || about.body) && (
        <section className={styles.why} id={id("why")}>
          <div className={cx(styles.container, styles.whyGrid)}>
            {about.image && (
              <div className={styles.whyImg}>
                <img src={about.image} alt={about.headline ?? businessName} loading="lazy" />
              </div>
            )}
            <div>
              <span className={styles.eyebrow}>Why {brandFirst}</span>
              {about.headline && <h2>{about.headline}</h2>}
              {about.body && <p>{about.body}</p>}
              {credentials.length > 0 && (
                <ul className={styles.creds}>
                  {credentials.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              )}
              {statItems.length > 0 && (
                <div className={styles.stats}>
                  {statItems.map((s) => (
                    <div key={s.label} className={styles.stat}>
                      <b>{String(s.value)}</b>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {quote && (
        <section className={styles.testi} id={id("reviews")}>
          <div className={styles.container}>
            <div className={cx(styles.sectionHead, styles.center)}>
              <div>
                <span className={styles.eyebrow}>Reviews</span>
                <h2>
                  Trusted on every street
                  <br />
                  in town.
                </h2>
              </div>
            </div>
            <div className={styles.testiCard}>
              <div key={active} className={styles.testiInner}>
                <div className={cx(styles.stars, styles.starsLg)}>★★★★★</div>
                <blockquote>“{quote.quote}”</blockquote>
                <div className={styles.testiWho}>
                  {quote.image && !liteMode ? (
                    <img src={quote.image} alt="" loading="lazy" />
                  ) : (
                    <span className={styles.whoInitials}>{initials(quote.name)}</span>
                  )}
                  <div className={styles.whoText}>
                    <b>{quote.name}</b>
                    {quote.role && <span>{quote.role}</span>}
                  </div>
                </div>
              </div>
              {quoteItems.length > 1 && (
                <div className={styles.dots}>
                  {quoteItems.map((q, i) => (
                    <button
                      key={q.name}
                      type="button"
                      aria-label={`Show review from ${q.name}`}
                      className={cx(styles.dot, i === active && styles.dotActive)}
                      onClick={() => setActive(i)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className={styles.cta} id={id("contact")}>
        <div className={styles.container}>
          <div className={styles.ctaBox}>
            <div className={styles.ctaRing} style={{ width: 340, height: 340, top: -140, left: -100 }} />
            <div className={styles.ctaRing} style={{ width: 260, height: 260, bottom: -120, right: -60 }} />
            <h2>{cta.headline ?? "Need a plumber today?"}</h2>
            {cta.body && <p>{cta.body}</p>}
            <a className={styles.btnInk} href={callHref}>
              {cta.button_label ?? "Call now"}
              {phone ? ` · ${phone}` : ""}
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footGrid}>
            <div>
              <a href={`#${id("top")}`} className={styles.brand}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0C19 10 12 2 12 2Z" fill="#c4f238" />
                  <path d="M9 15a3 3 0 0 0 3 3" stroke="#12338a" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {businessName}
              </a>
              <p className={styles.footDesc}>Quality work, honest prices. Built with Rivo.</p>
            </div>
            {serviceItems.length > 0 && (
              <div>
                <h4>Services</h4>
                <ul>
                  {serviceItems.slice(0, 4).map((s) => (
                    <li key={s.name}>
                      <a href={`#${id("services")}`}>{s.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h4>Company</h4>
              <ul>
                {(about.headline || about.body) && (
                  <li>
                    <a href={`#${id("why")}`}>About Us</a>
                  </li>
                )}
                {quoteItems.length > 0 && (
                  <li>
                    <a href={`#${id("reviews")}`}>Reviews</a>
                  </li>
                )}
                <li>
                  <a href={`#${id("contact")}`}>Contact</a>
                </li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                {phone && (
                  <li>
                    <a href={callHref}>{phone}</a>
                  </li>
                )}
                {contact.email && (
                  <li>
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </li>
                )}
                {contact.address && (
                  <li>
                    <span className={styles.footText}>{contact.address}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className={styles.footBottom}>
            <div>
              © {new Date().getFullYear()} {businessName}
            </div>
            <div>Made with Rivo</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
