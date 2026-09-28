"use client";

import { Fragment, useEffect, useRef, useState, type RefObject } from "react";
import { buildWhatsappOrderLink } from "@/lib/commerce/whatsapp-links";
import styles from "./MazoeCafeTemplate.module.css";

interface HeroContent {
  headline?: string;
  subheadline?: string;
  image?: string;
  // Optional design extras (not in SECTION_FIELD_SCHEMAS). Absent = not rendered.
  eyebrow?: string;
  marquee?: string[];
}

interface AboutContent {
  headline?: string;
  body?: string;
  image?: string;
  credentials?: string[];
}

interface MenuItem {
  name: string;
  price?: string | number;
  description?: string;
  // Optional design extra (not in SECTION_FIELD_SCHEMAS). Absent = tinted placeholder.
  image?: string;
}

interface MenuCategory {
  name: string;
  items?: MenuItem[];
}

interface MenuContent {
  categories?: MenuCategory[];
  // Optional design extras.
  eyebrow?: string;
  headline?: string;
  intro?: string;
}

interface ContactContent {
  address?: string;
  phone?: string;
  email?: string;
  hours?: Record<string, { open: string; close: string }>;
  map_embed?: string;
  // Optional design extra.
  headline?: string;
}

interface MazoeCafeTemplateProps {
  contentBlocks: Record<string, unknown>;
  businessName: string;
  whatsappNumber?: string | null;
  liteMode?: boolean;
}

// jsonb returns object keys in its own order (alphabetical for same-length
// keys), so hours are always rendered in this explicit Mon-first order.
const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_NAMES: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function formatTime(t: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return t;
  const h = Number(m[1]) % 24;
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${m[2] === "00" ? "" : `:${m[2]}`}${suffix}`;
}

function parsePrice(p: string | number | undefined): number {
  if (typeof p === "number") return p;
  return parseFloat(String(p ?? "").replace(/[^\d.]/g, "")) || 0;
}

function currencyOf(items: MenuItem[]): string {
  for (const item of items) {
    if (typeof item.price !== "string") continue;
    const m = /^\s*([^\d\s.,-]+)/.exec(item.price);
    if (m) return m[1];
  }
  return "$";
}

function splitStat(s: string): { value: string; label: string } {
  const m = /^(\S+)\s+(.+)$/.exec(s.trim());
  return m ? { value: m[1], label: m[2] } : { value: s, label: "" };
}

// map_embed is stored as an iframe HTML string. Rather than injecting that
// HTML, pull out the src and only accept Google Maps embeds.
function safeMapSrc(embed?: string): string | null {
  if (!embed) return null;
  const m = /src\s*=\s*["']([^"']+)["']/i.exec(embed);
  if (!m) return null;
  try {
    const u = new URL(m[1].replace(/&amp;/g, "&"));
    const okHost = ["maps.google.com", "www.google.com", "google.com"].includes(u.hostname);
    if (u.protocol !== "https:" || !okHost || !u.pathname.startsWith("/maps")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

export default function MazoeCafeTemplate({
  contentBlocks,
  businessName,
  whatsappNumber = null,
  liteMode = false,
}: MazoeCafeTemplateProps) {
  const hero = (contentBlocks.hero ?? {}) as HeroContent;
  const about = (contentBlocks.about ?? null) as AboutContent | null;
  const menu = (contentBlocks.menu ?? {}) as MenuContent;
  const contact = (contentBlocks.contact ?? null) as ContactContent | null;

  const categories = (menu.categories ?? []).filter((c) => (c.items ?? []).length > 0);
  const allItems = categories.flatMap((c) => c.items ?? []);
  const marquee = (hero.marquee ?? []).filter(Boolean);
  const mapSrc = liteMode ? null : safeMapSrc(contact?.map_embed);
  const mapsLink = contact?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`
    : null;
  const currency = currencyOf(allItems);
  const paragraphs = (about?.body ?? "").split(/\n{2,}/).filter(Boolean);
  const stats = (about?.credentials ?? []).map(splitStat);

  // ---- section scrolling (refs, not #hash links: hash links would clash with
  // other mounted copies of this template, e.g. gallery thumbnails behind the
  // preview modal, and would change the URL inside the intercepted modal route).
  const topRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const visitRef = useRef<HTMLElement>(null);
  const go = (ref: RefObject<HTMLElement | null>) => () =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // ---- nav turns solid after the first ~40px of scroll. IntersectionObserver
  // on a sentinel works for any scroll container (window, modal, browser frame).
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ---- "today" highlight, client-only to avoid a server/client mismatch
  const [todayIdx, setTodayIdx] = useState<number | null>(null);
  useEffect(() => {
    setTodayIdx((new Date().getDay() + 6) % 7);
  }, []);

  // ---- demo cart (only when no WhatsApp number is configured)
  const [cart, setCart] = useState<{ name: string; price: number }[]>([]);
  const [toast, setToast] = useState({ text: "", show: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = (text: string, ms = 2200) => {
    setToast({ text, show: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), ms);
  };
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );
  const addToCart = (item: MenuItem) => {
    setCart((c) => [...c, { name: item.name, price: parsePrice(item.price) }]);
    flash(`${item.name} added to cart ✓`);
  };
  const showCart = () => {
    if (cart.length === 0) return flash("Your cart is empty", 2600);
    const total = cart.reduce((sum, line) => sum + line.price, 0);
    flash(`${cart.length} item${cart.length === 1 ? "" : "s"} · ${currency}${total.toFixed(2)}`, 2600);
  };

  const hours = contact?.hours ?? {};
  const hourRows = DAY_ORDER.filter((d) => hours[d]);

  return (
    <div className={`${styles.root} ${liteMode ? styles.lite : ""}`}>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />

      {/* NAV */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
        <div className={`${styles.navLinks} ${styles.navLinksLeft}`}>
          {categories.length > 0 && (
            <button type="button" onClick={go(menuRef)}>
              Menu
            </button>
          )}
          {contact && (
            <button type="button" onClick={go(visitRef)}>
              Location
            </button>
          )}
          {about && (
            <button type="button" onClick={go(storyRef)}>
              About
            </button>
          )}
        </div>
        <button type="button" className={styles.logo} onClick={go(topRef)}>
          {businessName}
        </button>
        <div className={`${styles.navLinks} ${styles.navRight}`}>
          {!whatsappNumber && (
            <button type="button" className={styles.cartBtn} onClick={showCart}>
              Cart · <span>{cart.length}</span>
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <header ref={topRef} className={styles.hero}>
        {hero.image && !liteMode && (
          <img className={styles.heroBg} src={hero.image} alt="" decoding="async" />
        )}
        <div className={styles.heroInner}>
          {hero.eyebrow && <div className={styles.heroEyebrow}>{hero.eyebrow}</div>}
          {hero.headline && (
            <h1>
              <Lines text={hero.headline} />
            </h1>
          )}
          {hero.subheadline && <p>{hero.subheadline}</p>}
          <div className={styles.heroCta}>
            {categories.length > 0 && (
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={go(menuRef)}>
                View Menu
              </button>
            )}
            {contact && (
              <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={go(visitRef)}>
                Visit Us
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MARQUEE */}
      {marquee.length > 0 && (
        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {[...marquee, ...marquee].map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        </div>
      )}

      {/* STORY */}
      {about && (
        <section ref={storyRef} className={`${styles.section} ${styles.story}`}>
          <div className={`${styles.split} ${about.image && !liteMode ? "" : styles.splitSingle}`}>
            {about.image && !liteMode && (
              <div className={styles.storyImg}>
                <img src={about.image} alt={about.headline ?? ""} loading="lazy" decoding="async" />
              </div>
            )}
            <div>
              <h2>{about.headline ?? "Our Story"}</h2>
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {stats.length > 0 && (
                <div className={styles.statRow}>
                  {stats.map((s, i) => (
                    <div key={i} className={styles.stat}>
                      <b>{s.value}</b>
                      {s.label && <span>{s.label}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* MENU */}
      {categories.length > 0 && (
        <section ref={menuRef} className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.eyebrow}>{menu.eyebrow ?? "The Menu"}</span>
            <h2>{menu.headline ?? "Poured daily, priced honestly."}</h2>
            {menu.intro && <p>{menu.intro}</p>}
          </div>
          {categories.map((category) => (
            <div key={category.name}>
              {categories.length > 1 && <h3 className={styles.categoryLabel}>{category.name}</h3>}
              <div className={styles.menuGrid}>
                {(category.items ?? []).map((item, i) => (
                  <article key={`${item.name}-${i}`} className={styles.card}>
                    <div className={styles.cardImg}>
                      {item.image && !liteMode ? (
                        <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
                      ) : (
                        <div className={styles.imgFallback} />
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardTop}>
                        <h3>{item.name}</h3>
                        {item.price !== undefined && item.price !== "" && (
                          <span className={styles.price}>{item.price}</span>
                        )}
                      </div>
                      {item.description && <p>{item.description}</p>}
                      {whatsappNumber ? (
                        <a
                          className={styles.addBtn}
                          href={buildWhatsappOrderLink(whatsappNumber, item.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Order on WhatsApp
                        </a>
                      ) : (
                        <button type="button" className={styles.addBtn} onClick={() => addToCart(item)}>
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* VISIT */}
      {contact && (
        <section ref={visitRef} className={`${styles.section} ${styles.visit}`}>
          <div className={`${styles.split} ${styles.visitSplit} ${mapSrc ? "" : styles.splitSingle}`}>
            {mapSrc && (
              <div className={styles.mapWrap}>
                <iframe
                  title={`Map to ${businessName}`}
                  src={mapSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
            <div className={styles.visitInfo}>
              <span className={styles.eyebrow}>Visit Us</span>
              <h2>{contact.headline ?? "Stop by anytime — we'd love to make you a cup."}</h2>
              <address>
                <b>{businessName}</b>
                {contact.address && (
                  <>
                    <br />
                    {contact.address}
                  </>
                )}
                {contact.phone && (
                  <>
                    <br />
                    <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a>
                  </>
                )}
                {contact.email && (
                  <>
                    <br />
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </>
                )}
              </address>
              {!mapSrc && mapsLink && (
                <a className={styles.mapLink} href={mapsLink} target="_blank" rel="noopener noreferrer">
                  View on Google Maps
                </a>
              )}
              {hourRows.length > 0 && (
                <div className={styles.hours}>
                  {hourRows.map((day) => {
                    const isToday = DAY_ORDER.indexOf(day) === todayIdx;
                    return (
                      <div key={day} className={`${styles.hoursRow} ${isToday ? styles.today : ""}`}>
                        <span>
                          {DAY_NAMES[day]}
                          {isToday ? " · Today" : ""}
                        </span>
                        <span>
                          {formatTime(hours[day].open)} – {formatTime(hours[day].close)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>{businessName}</div>
        <div>
          © {new Date().getFullYear()} {businessName} · Made with Rivo
        </div>
      </footer>

      {/* TOAST — sticky dock so it stays inside the visible scroll area of the
          preview frame instead of pinning to the bottom of the full page */}
      <div className={styles.toastDock} aria-live="polite">
        <div className={`${styles.toast} ${toast.show ? styles.toastShow : ""}`}>{toast.text}</div>
      </div>
    </div>
  );
}
