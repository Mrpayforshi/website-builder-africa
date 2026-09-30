   "use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import styles from "./LexfordTemplate.module.css";

// Self-hosted at build time by next/font; applied on the wrapper div and
// consumed in the CSS module as --font-display / --font-body.
const displayFont = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--lx-display",
  display: "swap",
});
const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--lx-body",
  display: "swap",
});

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
interface ServiceItem {
  name: string;
  description?: string;
  price?: string;
}
interface ServicesContent {
  items?: ServiceItem[];
}
interface ContactContent {
  address?: string;
  phone?: string;
  email?: string;
}
// Gallery/bespoke-only block: headings, labels and small chrome copy that the
// shared section schemas don't cover.
interface FirmContent {
  monogram?: string;
  tagline?: string;
  hero_eyebrow?: string;
  headline_em?: string;
  hero_cta?: string;
  hero_cta_secondary?: string;
  nav_cta?: string;
  caption_name?: string;
  caption_role?: string;
  areas_eyebrow?: string;
  areas_title?: string;
  areas_title_em?: string;
  areas_lead?: string;
  about_eyebrow?: string;
  about_em?: string;
  team_eyebrow?: string;
  team_title?: string;
  team_title_em?: string;
  contact_eyebrow?: string;
  contact_title?: string;
  contact_title_em?: string;
  contact_lead?: string;
  form_button?: string;
  success_text?: string;
  footer_note?: string;
  disclaimer?: string;
}
interface MarqueeContent {
  items?: string[];
}
interface StatItem {
  value: number | string;
  prefix?: string;
  suffix?: string;
  label: string;
}
interface StatsContent {
  items?: StatItem[];
}
interface TeamMember {
  name: string;
  role?: string;
  image?: string;
}
interface TeamContent {
  items?: TeamMember[];
}
interface TestimonialContent {
  quote?: string;
  quote_em?: string;
  cite?: string;
}

interface LexfordTemplateProps {
  contentBlocks: Record<string, unknown>;
  businessName: string;
  liteMode?: boolean;
}

// Wraps the first occurrence of `em` inside `text` in <em>. Falls back to
// plain text if the emphasised phrase was edited out of the headline.
function Emph({ text, em }: { text?: string; em?: string }) {
  if (!text) return null;
  const i = em ? text.indexOf(em) : -1;
  if (!em || i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <em>{em}</em>
      {text.slice(i + em.length)}
    </>
  );
}

// "Chirara & Partners" -> ampersand picks up the accent colour.
function BrandName({ name }: { name: string }) {
  const parts = name.split(/\s*&\s*/);
  if (parts.length !== 2) return <>{name}</>;
  return (
    <>
      {parts[0]} <span>&amp;</span> {parts[1]}
    </>
  );
}

function Brand({
  monogram,
  name,
  tagline,
  onClick,
}: {
  monogram: string;
  name: string;
  tagline: string;
  onClick: (e: MouseEvent) => void;
}) {
  return (
    <a className={styles.brand} href="#home" onClick={onClick}>
      <span className={styles.brandMark}>{monogram}</span>
      <span>
        <span className={styles.brandName}>
          <BrandName name={name} />
        </span>
        <span className={styles.brandSub}>{tagline}</span>
      </span>
    </a>
  );
}

function Arrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// Count-up when scrolled into view. IntersectionObserver works inside any
// scroll container (gallery modal, phone frame, full page).
function Counter({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number | string;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const target = typeof value === "number" ? value : Number(value);
  const numeric = Number.isFinite(target);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || !numeric) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setN(target);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (t: number) => {
          const p = Math.min((t - t0) / 1400, 1);
          setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, numeric]);

  if (!numeric) return <b ref={ref}>{String(value)}</b>;
  return (
    <b ref={ref}>
      {prefix}
      {n.toLocaleString("en-US")}
      {suffix}
    </b>
  );
}

export default function LexfordTemplate({
  contentBlocks,
  businessName,
  liteMode = false,
}: LexfordTemplateProps) {
  const hero = (contentBlocks.hero ?? {}) as HeroContent;
  const about = (contentBlocks.about ?? {}) as AboutContent;
  const services = (contentBlocks.services ?? {}) as ServicesContent;
  const contact = (contentBlocks.contact ?? {}) as ContactContent;
  const firm = (contentBlocks.firm ?? {}) as FirmContent;
  const marquee = ((contentBlocks.marquee ?? {}) as MarqueeContent).items ?? [];
  const stats = ((contentBlocks.stats ?? {}) as StatsContent).items ?? [];
  const team = ((contentBlocks.team ?? {}) as TeamContent).items ?? [];
  const testimonial = (contentBlocks.testimonial ?? {}) as TestimonialContent;

  const areas = services.items ?? [];
  const monogram = firm.monogram ?? businessName.charAt(0);
  const tagline = firm.tagline ?? "Legal Practitioners";
  const hasAbout = !!(about.headline || about.body);
  const showHeroImage = !!hero.image && !liteMode;
  const showAboutImage = !!about.image && !liteMode;

  const rootRef = useRef<HTMLDivElement>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [openArea, setOpenArea] = useState(0);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const uid = useId();

  const scrollTo = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    setNavOpen(false);
    rootRef.current
      ?.querySelector<HTMLElement>(`[data-sec="${id}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleArea = (i: number) => setOpenArea((cur) => (cur === i ? -1 : i));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const d = new FormData(form);
    const note = String(d.get("msg") ?? "").trim();
    setSubmitted(
      `Consultation request for ${businessName}: ${d.get("fname")} ${d.get("lname")} (${d.get(
        "email",
      )}) — ${d.get("matter")}.${note ? ` ${note}` : ""}`,
    );
  };

  const waDigits = contact.phone?.replace(/\D/g, "");
  const telHref = contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : undefined;
  const addressLines = contact.address
    ? contact.address.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const matterOptions = [...areas.map((a) => a.name), "Other"];

  const navLinks: { id: string; label: string }[] = [
    ...(areas.length > 0 ? [{ id: "areas", label: "Practice Areas" }] : []),
    ...(hasAbout ? [{ id: "firm", label: "The Firm" }] : []),
    ...(team.length > 0 ? [{ id: "team", label: "Attorneys" }] : []),
    { id: "contact", label: "Contact" },
  ];

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${displayFont.variable} ${bodyFont.variable}`}
    >
      {/* HEADER */}
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Brand
            monogram={monogram}
            name={businessName}
            tagline={tagline}
            onClick={scrollTo("home")}
          />

          <nav className={styles.nav}>
            {navLinks.map((l) => (
              <a
                key={l.id}
                className={styles.navLink}
                href={`#${l.id}`}
                onClick={scrollTo(l.id)}
              >
                {l.label}
              </a>
            ))}
            <a
              className={`${styles.btn} ${styles.btnSolid} ${styles.navCta}`}
              href="#contact"
              onClick={scrollTo("contact")}
            >
              {firm.nav_cta ?? "Consultation"}
            </a>
          </nav>

          <button
            className={styles.navToggle}
            type="button"
            aria-label="Menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>

        <nav className={`${styles.headerMenu} ${navOpen ? styles.open : ""}`}>
          {navLinks.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={scrollTo(l.id)}>
              {l.label}
            </a>
          ))}
        </nav>
      </header>

      {/* HERO */}
      <section className={styles.hero} data-sec="home">
        <div
          className={`${styles.container} ${styles.heroGrid} ${
            showHeroImage ? "" : styles.heroGridSolo
          }`}
        >
          <div>
            {firm.hero_eyebrow && <p className={styles.eyebrow}>{firm.hero_eyebrow}</p>}
            <h1 className={`${styles.hDisplay} ${styles.heroTitle} ${styles.breakEm}`}>
              <Emph text={hero.headline ?? businessName} em={firm.headline_em} />
            </h1>
            {hero.subheadline && (
              <p className={`${styles.lead} ${styles.heroLead}`}>{hero.subheadline}</p>
            )}
            <div className={styles.heroCtas}>
              <a
                className={`${styles.btn} ${styles.btnSolid}`}
                href="#contact"
                onClick={scrollTo("contact")}
              >
                {firm.hero_cta ?? "Request a consultation"} <Arrow />
              </a>
              {areas.length > 0 && (
                <a className={styles.btn} href="#areas" onClick={scrollTo("areas")}>
                  {firm.hero_cta_secondary ?? "Our practice"}
                </a>
              )}
            </div>
          </div>

          {showHeroImage && (
            <figure className={styles.heroFigure}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.heroImg} src={hero.image} alt={firm.caption_name ?? businessName} />
              {(firm.caption_name || firm.caption_role) && (
                <figcaption className={styles.heroCaption}>
                  {firm.caption_name && <b>{firm.caption_name}</b>}
                  {firm.caption_role && <span>{firm.caption_role}</span>}
                </figcaption>
              )}
            </figure>
          )}
        </div>
      </section>

      {/* MARQUEE STRIP */}
      {marquee.length > 0 && (
        <div className={styles.strip} aria-hidden="true">
          <div className={`${styles.stripTrack} ${liteMode ? styles.still : ""}`}>
            {[0, 1].map((k) => (
              <div className={styles.stripGroup} key={k}>
                {marquee.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRACTICE AREAS */}
      {areas.length > 0 && (
        <section className={styles.section} data-sec="areas">
          <div className={styles.container}>
            <p className={styles.eyebrow}>{firm.areas_eyebrow ?? "What we do"}</p>
            <h2 className={styles.hSection}>
              <Emph text={firm.areas_title ?? "Practice areas"} em={firm.areas_title_em} />
            </h2>
            {firm.areas_lead && (
              <p className={`${styles.lead} ${styles.leadTight}`}>{firm.areas_lead}</p>
            )}

            <div className={styles.areasList}>
              {areas.map((a, i) => {
                const open = openArea === i;
                return (
                  <div
                    key={a.name}
                    className={`${styles.area} ${open ? styles.areaOpen : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-expanded={open}
                    onClick={() => toggleArea(i)}
                    onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleArea(i);
                      }
                    }}
                  >
                    <span className={styles.areaNum}>{String(i + 1).padStart(2, "0")}</span>
                    <h3 className={styles.areaName}>{a.name}</h3>
                    {a.description && <p className={styles.areaDesc}>{a.description}</p>}
                    <span className={styles.areaArrow} aria-hidden="true">
                      →
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT / FIRM */}
      {hasAbout && (
        <section className={`${styles.section} ${styles.about}`} data-sec="firm">
          <div
            className={`${styles.container} ${styles.aboutGrid} ${
              showAboutImage ? "" : styles.aboutGridSolo
            }`}
          >
            {showAboutImage && (
              <div className={styles.aboutImgWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.aboutImg}
                  src={about.image}
                  alt={`${businessName} office`}
                  loading="lazy"
                />
              </div>
            )}
            <div>
              <p className={styles.eyebrow}>{firm.about_eyebrow ?? "The firm"}</p>
              <h2 className={`${styles.hSection} ${styles.breakEm}`}>
                <Emph text={about.headline} em={firm.about_em} />
              </h2>
              {about.body && (
                <p className={`${styles.lead} ${styles.aboutLead}`}>{about.body}</p>
              )}
              {(about.credentials?.length ?? 0) > 0 && (
                <ul className={styles.credits}>
                  {about.credentials!.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              )}
              {stats.length > 0 && (
                <div className={styles.numbers}>
                  {stats.map((s) => (
                    <div key={s.label}>
                      <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* TEAM */}
      {team.length > 0 && (
        <section className={styles.section} data-sec="team">
          <div className={styles.container}>
            <p className={styles.eyebrow}>{firm.team_eyebrow ?? "Our people"}</p>
            <h2 className={styles.hSection}>
              <Emph text={firm.team_title ?? "The attorneys"} em={firm.team_title_em} />
            </h2>
            <div className={styles.teamGrid}>
              {team.map((m) => (
                <div className={styles.member} key={m.name}>
                  {m.image && !liteMode && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.image} alt={m.name} loading="lazy" />
                  )}
                  <div className={styles.memberInfo}>
                    <b>{m.name}</b>
                    {m.role && <span>{m.role}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIAL */}
      {testimonial.quote && (
        <section className={`${styles.section} ${styles.quote}`}>
          <div className={styles.container}>
            <blockquote>
              <Emph text={testimonial.quote} em={testimonial.quote_em} />
            </blockquote>
            {testimonial.cite && {testimonial.cite}}
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section className={`${styles.section} ${styles.contact}`} data-sec="contact">
        <div className={`${styles.container} ${styles.contactGrid}`}>
          <div>
            <p className={styles.eyebrow}>{firm.contact_eyebrow ?? "Contact"}</p>
            <h2 className={styles.hSection}>
              <Emph
                text={firm.contact_title ?? "Request a consultation"}
                em={firm.contact_title_em}
              />
            </h2>
            {firm.contact_lead && (
              <p className={`${styles.lead} ${styles.contactLead}`}>{firm.contact_lead}</p>
            )}
            <p className={styles.contactInfo}>
              {addressLines.map((line, i) => (
                <span key={line}>
                  {line}
                  {i < addressLines.length - 1 && <br />}
                </span>
              ))}
              {addressLines.length > 0 && (contact.phone || contact.email) && (
                <>
                  <br />
                  <br />
                </>
              )}
              {contact.phone && (
                <>
                  <a href={telHref}>{contact.phone}</a>
                  <br />
                </>
              )}
              {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
            </p>
          </div>

          <div>
            {submitted === null ? (
              <form className={styles.form} onSubmit={onSubmit} noValidate>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label htmlFor={`${uid}-fname`}>First name</label>
                    <input id={`${uid}-fname`} name="fname" type="text" required placeholder="Jane" />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor={`${uid}-lname`}>Last name</label>
                    <input id={`${uid}-lname`} name="lname" type="text" required placeholder="Doe" />
                  </div>
                </div>
                <div className={styles.field}>
                  <label htmlFor={`${uid}-email`}>Email</label>
                  <input
                    id={`${uid}-email`}
                    name="email"
                    type="email"
                    required
                    placeholder="jane@company.com"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor={`${uid}-matter`}>Type of matter</label>
                  <select id={`${uid}-matter`} name="matter" required defaultValue="">
                    <option value="">Please select…</option>
                    {matterOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor={`${uid}-msg`}>Brief description</label>
                  <textarea
                    id={`${uid}-msg`}
                    name="msg"
                    placeholder="A few sentences about your situation…"
                  />
                </div>
                <button className={`${styles.btn} ${styles.btnSolid} ${styles.formBtn}`} type="submit">
                  {firm.form_button ?? "Send inquiry"} <Arrow />
                </button>
              </form>
            ) : (
              <div className={styles.success}>
                <p className={styles.successText}>
                  {firm.success_text ??
                    "Thank you. Your inquiry has been received — we'll be in touch within one business day."}
                </p>
                {waDigits && (
                  <a
                    className={styles.btn}
                    href={`https://wa.me/${waDigits}?text=${encodeURIComponent(submitted)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Also send on WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <Brand
            monogram={monogram}
            name={businessName}
            tagline={tagline}
            onClick={scrollTo("home")}
          />
          <div className={styles.footerLinks}>
            {navLinks.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={scrollTo(l.id)}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <div className={`${styles.container} ${styles.footerNoteWrap}`}>
          <p className={styles.footerNote}>
            {firm.footer_note ?? `© ${businessName}.`} · Made with Rivo
          </p>
        </div>
      </footer>

      {firm.disclaimer && <div className={styles.disclaimer}>{firm.disclaimer}</div>}
    </div>
  );
}
