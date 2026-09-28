"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { Great_Vibes, Cormorant_Garamond, Montserrat } from "next/font/google";
import styles from "./EverAfterTemplate.module.css";

// Self-hosted at build time by next/font. The variables are applied to the
// wrapper div below and consumed in the CSS module as --font-script/serif/sans.
const script = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--ea-script",
  display: "swap",
});
const serif = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--ea-serif",
  display: "swap",
});
const sans = Montserrat({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--ea-sans",
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
}
interface ContactContent {
  address?: string;
  phone?: string;
  email?: string;
}
interface EventContent {
  monogram?: string;
  date_iso?: string;
  date_label?: string;
  date_short?: string;
  location?: string;
  story_eyebrow?: string;
  story_em?: string;
  hero_cta?: string;
}
interface CardItem {
  title: string;
  text?: string;
  image?: string;
  link_label?: string;
  link_url?: string;
}
interface CardSection {
  eyebrow?: string;
  title?: string;
  title_em?: string;
  lead?: string;
  items?: CardItem[];
}
interface RegistryItem {
  label: string;
  url?: string;
}
interface RegistryContent {
  eyebrow?: string;
  title?: string;
  title_em?: string;
  lead?: string;
  items?: RegistryItem[];
}
interface RsvpContent {
  eyebrow?: string;
  title?: string;
  title_em?: string;
  lead?: string;
  button_label?: string;
  success_title?: string;
  success_text?: string;
}

interface EverAfterTemplateProps {
  contentBlocks: Record<string, unknown>;
  businessName: string;
  liteMode?: boolean;
}

function useCountdown(iso?: string) {
  const [t, setT] = useState<{ d: string; h: string; m: string; s: string } | null>(null);
  useEffect(() => {
    if (!iso) return;
    const target = new Date(iso).getTime();
    if (Number.isNaN(target)) return;
    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setT({
        d: String(Math.floor(diff / 864e5)),
        h: pad(Math.floor(diff / 36e5) % 24),
        m: pad(Math.floor(diff / 6e4) % 60),
        s: pad(Math.floor(diff / 1e3) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [iso]);
  return t;
}

function isRealUrl(url?: string) {
  return !!url && url !== "#";
}

function Heading({
  eyebrow,
  title,
  em,
  lead,
}: {
  eyebrow?: string;
  title?: string;
  em?: string;
  lead?: string;
}) {
  return (
    <>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      {title && (
        <h2 className={styles.title}>
          {title}
          {em && (
            <>
              {" "}
              <em>{em}</em>
            </>
          )}
        </h2>
      )}
      {lead && <p className={styles.lead}>{lead}</p>}
    </>
  );
}

export default function EverAfterTemplate({
  contentBlocks,
  businessName,
  liteMode = false,
}: EverAfterTemplateProps) {
  const hero = (contentBlocks.hero ?? {}) as HeroContent;
  const about = (contentBlocks.about ?? {}) as AboutContent;
  const contact = (contentBlocks.contact ?? {}) as ContactContent;
  const event = (contentBlocks.event ?? {}) as EventContent;
  const travel = (contentBlocks.travel ?? {}) as CardSection;
  const things = (contentBlocks.things ?? {}) as CardSection;
  const registry = (contentBlocks.registry ?? {}) as RegistryContent;
  const rsvp = (contentBlocks.rsvp ?? {}) as RsvpContent;

  const names = hero.headline ?? businessName;
  const monogram =
    event.monogram ??
    names
      .split(/\s*[&+]\s*/)
      .map((n) => n.trim().charAt(0))
      .filter(Boolean)
      .join("&");

  const rootRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const uid = useId();
  const countdown = useCountdown(event.date_iso);

  // Works inside any scroll container (modal, phone frame, full page) —
  // a window scroll listener would not fire in the gallery preview modal.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    setNavOpen(false);
    rootRef.current
      ?.querySelector<HTMLElement>(`[data-sec="${id}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const linkProps = (url?: string) =>
    isRealUrl(url)
      ? { href: url, target: "_blank", rel: "noopener noreferrer" }
      : { href: "#", onClick: (e: MouseEvent) => e.preventDefault() };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const d = new FormData(form);
    const attending = d.get("attending") === "yes" ? "joyfully accepts" : "regretfully declines";
    const note = String(d.get("message") ?? "").trim();
    setSubmitted(
      `RSVP for ${names}: ${d.get("name")} ${attending} (${d.get("guests")} guest${
        d.get("guests") === "1" ? "" : "s"
      }).${note ? ` Note: ${note}` : ""}`,
    );
  };

  const waDigits = contact.phone?.replace(/\D/g, "");
  const heroStyle =
    hero.image && !liteMode
      ? ({ "--hero-bg": `url("${hero.image}")` } as React.CSSProperties)
      : undefined;

  const renderCards = (section: CardSection, id: string, alt: boolean) =>
    (section.items?.length ?? 0) > 0 && (
      <section
        className={`${styles.section} ${alt ? styles.sectionAlt : ""}`}
        data-sec={id}
      >
        <div className={styles.inner}>
          <Heading
            eyebrow={section.eyebrow}
            title={section.title}
            em={section.title_em}
            lead={section.lead}
          />
          <div className={styles.cards}>
            {section.items!.map((it) => (
              <article className={styles.card} key={it.title}>
                {it.image && !liteMode && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={styles.cardImg} src={it.image} alt={it.title} loading="lazy" />
                )}
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{it.title}</h3>
                  {it.text && <p className={styles.cardText}>{it.text}</p>}
                  {it.link_label && (
                    <a className={styles.cardLink} {...linkProps(it.link_url)}>
                      {it.link_label}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${script.variable} ${serif.variable} ${sans.variable}`}
    >
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />

      {/* NAV */}
      <header className={`${styles.nav} ${scrolled || navOpen ? styles.scrolled : ""}`}>
        <a className={styles.navLogo} href="#home" onClick={go("home")}>
          {monogram}
        </a>
        <button
          className={styles.navToggle}
          type="button"
          aria-label="Menu"
          aria-expanded={navOpen}
          onClick={() => setNavOpen((o) => !o)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <nav>
          <ul className={`${styles.navLinks} ${navOpen ? styles.open : ""}`}>
            <li>
              <a className={styles.navLink} href="#home" onClick={go("home")}>
                Home
              </a>
            </li>
            {(about.headline || about.body) && (
              <li>
                <a className={styles.navLink} href="#story" onClick={go("story")}>
                  Our Story
                </a>
              </li>
            )}
            {(travel.items?.length ?? 0) > 0 && (
              <li>
                <a className={styles.navLink} href="#travel" onClick={go("travel")}>
                  {travel.eyebrow ?? "Travel & Stay"}
                </a>
              </li>
            )}
            {(things.items?.length ?? 0) > 0 && (
              <li>
                <a className={styles.navLink} href="#things" onClick={go("things")}>
                  {things.eyebrow ?? "Things to Do"}
                </a>
              </li>
            )}
            {(registry.items?.length ?? 0) > 0 && (
              <li>
                <a className={styles.navLink} href="#registry" onClick={go("registry")}>
                  {registry.eyebrow ?? "Registry"}
                </a>
              </li>
            )}
            <li>
              <a className={`${styles.btn} ${styles.btnLight} ${styles.navCta}`} href="#rsvp" onClick={go("rsvp")}>
                RSVP
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* HERO */}
      <section className={styles.hero} style={heroStyle} data-sec="home">
        {hero.subheadline && <p className={styles.heroEyebrow}>{hero.subheadline}</p>}
        <h1 className={styles.heroNames}>{names}</h1>
        {(event.date_label || event.location) && (
          <p className={styles.heroDetails}>
            {event.date_label}
            {event.date_label && event.location && <span className={styles.sep}>|</span>}
            {event.location}
          </p>
        )}
        <div className={styles.heroActions}>
          <a className={`${styles.btn} ${styles.btnLight}`} href="#rsvp" onClick={go("rsvp")}>
            {event.hero_cta ?? "RSVP Now"}
          </a>
        </div>
        <a className={styles.heroScroll} href="#story" onClick={go("story")} aria-label="Scroll down">
          ⌄
        </a>
      </section>

      {/* STORY + COUNTDOWN */}
      {(about.headline || about.body) && (
        <section className={styles.section} data-sec="story">
          <div className={styles.inner}>
            <Heading
              eyebrow={event.story_eyebrow ?? "Our Story"}
              title={about.headline}
              em={event.story_em}
              lead={about.body}
            />
            {countdown && (
              <div className={styles.countdown}>
                {(
                  [
                    [countdown.d, "Days"],
                    [countdown.h, "Hours"],
                    [countdown.m, "Minutes"],
                    [countdown.s, "Seconds"],
                  ] as const
                ).map(([n, label]) => (
                  <div className={styles.countdownUnit} key={label}>
                    <div className={styles.countdownNum}>{n}</div>
                    <div className={styles.countdownLabel}>{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {renderCards(travel, "travel", true)}
      {renderCards(things, "things", false)}

      {/* REGISTRY */}
      {(registry.items?.length ?? 0) > 0 && (
        <section className={`${styles.section} ${styles.sectionAlt}`} data-sec="registry">
          <div className={styles.inner}>
            <Heading
              eyebrow={registry.eyebrow}
              title={registry.title}
              em={registry.title_em}
              lead={registry.lead}
            />
            <div className={styles.registryBtns}>
              {registry.items!.map((it, i) => (
                <a
                  key={it.label}
                  className={`${styles.btn} ${i === 0 ? styles.btnSolid : ""}`}
                  {...linkProps(it.url)}
                >
                  {it.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RSVP */}
      <section className={styles.section} data-sec="rsvp">
        <div className={styles.inner}>
          <Heading
            eyebrow={rsvp.eyebrow ?? "RSVP"}
            title={rsvp.title}
            em={rsvp.title_em}
            lead={rsvp.lead}
          />
          {submitted === null ? (
            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <div className={styles.field}>
                <label htmlFor={`${uid}-name`}>Full name</label>
                <input id={`${uid}-name`} name="name" type="text" placeholder="Your name" required />
              </div>
              <div className={styles.field}>
                <label htmlFor={`${uid}-email`}>Email</label>
                <input id={`${uid}-email`} name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div className={styles.field}>
                <label htmlFor={`${uid}-attending`}>Attendance</label>
                <select id={`${uid}-attending`} name="attending" required defaultValue="">
                  <option value="">Please choose…</option>
                  <option value="yes">Joyfully accepts</option>
                  <option value="no">Regretfully declines</option>
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor={`${uid}-guests`}>Number of guests</label>
                <select id={`${uid}-guests`} name="guests" defaultValue="1">
                  <option value="1">Just me</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor={`${uid}-message`}>Song request / dietary notes (optional)</label>
                <textarea
                  id={`${uid}-message`}
                  name="message"
                  rows={3}
                  placeholder="Tell us anything we should know"
                />
              </div>
              <button className={`${styles.btn} ${styles.btnSolid}`} type="submit">
                {rsvp.button_label ?? "Send RSVP"}
              </button>
            </form>
          ) : (
            <div className={styles.success}>
              <p className={styles.successBig}>{rsvp.success_title ?? "Thank you!"}</p>
              <p>{rsvp.success_text ?? "We've received your RSVP."}</p>
              {waDigits && (
                <a
                  className={`${styles.btn} ${styles.successWa}`}
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
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <p className={styles.footerNames}>{names}</p>
        {(event.date_short || event.location) && (
          <p className={styles.footerDate}>
            {event.date_short}
            {event.date_short && event.location && " — "}
            {event.location}
          </p>
        )}
        <p className={styles.footerCredit}>Made with Rivo</p>
      </footer>
    </div>
  );
}
