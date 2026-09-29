"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import styles from "./FreshDropTemplate.module.css";

interface HeroContent {
  headline?: string;
  subheadline?: string;
  image?: string;
}

interface HighlightsContent {
  tag?: string;
  stats?: { value: string; label: string }[];
  badges?: { icon?: string; title: string; subtitle?: string }[];
}

interface CategoryItem {
  name: string;
  emoji?: string;
}

interface ProductItem {
  name: string;
  price?: string;
  image?: string;
  description?: string;
  sku?: string;
  // Extra optional fields used by this design (gallery/bespoke only).
  category?: string;
  unit?: string;
  tag?: string;
  old_price?: string;
}

interface PromoContent {
  headline?: string;
  body?: string;
  code?: string;
  button_label?: string;
  image?: string;
}

interface StepsContent {
  headline?: string;
  items?: { title: string; body?: string }[];
}

interface AboutContent {
  headline?: string;
  body?: string;
}

type DayHours = { open: string; close: string };

interface ContactContent {
  address?: string;
  phone?: string;
  email?: string;
  hours?: Record<string, DayHours | undefined>;
}

interface FreshDropTemplateProps {
  contentBlocks: Record<string, unknown>;
  businessName: string;
  liteMode?: boolean;
}

const DEFAULT_BADGES = [
  { icon: "🚚", title: "Fast delivery", subtitle: "Right to your door" },
  { icon: "🌿", title: "Farm fresh", subtitle: "Picked this morning" },
  { icon: "⭐", title: "4.9 rating", subtitle: "Loved by customers" },
];

const DEFAULT_STEPS = [
  { title: "Pick your favourites", body: "Browse fresh produce and everyday essentials from local farms." },
  { title: "Order in seconds", body: "Order on WhatsApp and pay with EcoCash, cash, or layby." },
  { title: "We deliver fast", body: "A rider brings it to your door, often within the hour." },
];

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function waHref(phone: string | undefined): string | undefined {
  const digits = (phone ?? "").replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : undefined;
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

// Compact one-line hours summary: "Mon–Fri 08:00–18:00 · Sat 08:00–16:00".
function summariseHours(hours: ContactContent["hours"]): string[] {
  if (!hours) return [];
  const lines: string[] = [];
  const weekdays = DAY_ORDER.slice(0, 5).map((d) => hours[d]);
  const first = weekdays[0];
  const uniform =
    first && weekdays.every((h) => h && h.open === first.open && h.close === first.close);
  if (uniform && first) {
    lines.push(`Mon–Fri ${first.open}–${first.close}`);
  } else {
    DAY_ORDER.slice(0, 5).forEach((d) => {
      const h = hours[d];
      if (h) lines.push(`${d[0].toUpperCase()}${d.slice(1)} ${h.open}–${h.close}`);
    });
  }
  const sat = hours.sat;
  if (sat) lines.push(`Sat ${sat.open}–${sat.close}`);
  const sun = hours.sun;
  if (sun) lines.push(`Sun ${sun.open}–${sun.close}`);
  return lines;
}

function splitHeadline(text: string): { plain: string; hl: string } {
  const comma = text.indexOf(",");
  if (comma > 0 && comma < text.length - 1) {
    return { plain: text.slice(0, comma + 1), hl: text.slice(comma + 1).trim() };
  }
  const words = text.split(/\s+/).filter(Boolean);
  const at = Math.max(words.length - 2, 0);
  return { plain: words.slice(0, at).join(" "), hl: words.slice(at).join(" ") };
}

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

// Hides an <img> that fails to load so the tinted placeholder behind it shows
// instead of a broken-image icon.
function hideOnError(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.visibility = "hidden";
}

export default function FreshDropTemplate({
  contentBlocks,
  businessName,
  liteMode = false,
}: FreshDropTemplateProps) {
  const hero = (contentBlocks.hero ?? {}) as HeroContent;
  const highlights = (contentBlocks.highlights ?? {}) as HighlightsContent;
  const categories = (contentBlocks.categories ?? {}) as { items?: CategoryItem[] };
  const products = (contentBlocks.products ?? {}) as { items?: ProductItem[] };
  const promo = (contentBlocks.promo ?? {}) as PromoContent;
  const steps = (contentBlocks.steps ?? {}) as StepsContent;
  const about = (contentBlocks.about ?? {}) as AboutContent;
  const contact = (contentBlocks.contact ?? {}) as ContactContent;

  // Scope anchor ids per instance: the gallery renders this component once per
  // card thumbnail, so bare ids like "products" would collide on the page.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `${uid}-${name}`;

  const allProducts = products.items ?? [];
  const categoryItems = categories.items ?? [];
  const stats = highlights.stats ?? [];
  const badges = (highlights.badges?.length ? highlights.badges : DEFAULT_BADGES).slice(0, 3);
  const stepItems = steps.items?.length ? steps.items : DEFAULT_STEPS;

  const [navOpen, setNavOpen] = useState(false);
  const closeNav = () => setNavOpen(false);

  const [activeCat, setActiveCat] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState(0);
  const [flash, setFlash] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  const showNotice = (msg: string) => {
    setNotice(msg);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3200);
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allProducts.filter((p) => {
      if (activeCat !== "All" && p.category !== activeCat) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allProducts, activeCat, query]);

  const addToCart = (index: number) => {
    setCart((n) => n + 1);
    setFlash(index);
    setTimeout(() => setFlash((f) => (f === index ? null : f)), 400);
  };

  const wa = waHref(contact.phone);
  const orderHref = wa ?? `#${id("contact")}`;
  const headline = splitHeadline(hero.headline ?? businessName);
  const hoursLines = summariseHours(contact.hours);

  return (
    <div className={cx(styles.wrapper, liteMode && styles.lite)}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={cx(styles.container, styles.headerInner)}>
          <a className={styles.logo} href={`#${id("top")}`}>
            <span className={styles.logoMark}>🥬</span> {businessName}
          </a>

          <label className={styles.search}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              placeholder="Search fresh fruits, vegetables…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
          </label>

          <div className={styles.headerActions}>
            <nav className={styles.headerLinks}>
              {allProducts.length > 0 && <a href={`#${id("categories")}`}>Shop</a>}
              <a href={`#${id("how")}`}>How it works</a>
            </nav>
            <button
              type="button"
              className={styles.cart}
              aria-label={`Cart, ${cart} items`}
              onClick={() =>
                showNotice(
                  cart === 0
                    ? "Your cart is empty — add some fresh picks!"
                    : `${cart} item${cart === 1 ? "" : "s"} in your cart. Checkout goes through WhatsApp.`,
                )
              }
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M6 6h15l-1.5 9h-12z" />
                <path d="M6 6 5 3H2" />
                <circle cx="9" cy="20" r="1.6" />
                <circle cx="18" cy="20" r="1.6" />
              </svg>
              <span className={styles.cartCount}>{cart}</span>
            </button>
            <a
              className={cx(styles.btn, styles.btnAccent, styles.btnSm, styles.headerCta)}
              href={orderHref}
              target={wa ? "_blank" : undefined}
              rel={wa ? "noopener noreferrer" : undefined}
            >
              Order on WhatsApp
            </a>
            <button
              type="button"
              className={styles.navToggle}
              aria-label={navOpen ? "Close menu" : "Open menu"}
              aria-expanded={navOpen}
              onClick={() => setNavOpen((o) => !o)}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                {navOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
              </svg>
            </button>
          </div>
        </div>

        <nav className={cx(styles.headerMenu, navOpen && styles.headerMenuOpen)}>
          {allProducts.length > 0 && (
            <a href={`#${id("categories")}`} onClick={closeNav}>Shop</a>
          )}
          <a href={`#${id("how")}`} onClick={closeNav}>How it works</a>
          <a
            className={cx(styles.btn, styles.btnAccent, styles.btnSm)}
            style={{ alignSelf: "flex-start" }}
            href={orderHref}
            target={wa ? "_blank" : undefined}
            rel={wa ? "noopener noreferrer" : undefined}
            onClick={closeNav}
          >
            Order on WhatsApp
          </a>
        </nav>
      </header>

      {notice && (
        <div className={styles.notice} role="status" aria-live="polite">
          {notice}
        </div>
      )}

      {/* HERO */}
      <section className={styles.hero} id={id("top")}>
        <div className={cx(styles.container, styles.heroGrid)}>
          <div>
            {highlights.tag && (
              <span className={styles.heroTag}>
                <span className={styles.dot} /> {highlights.tag}
              </span>
            )}
            <h1 className={styles.heroTitle}>
              {headline.plain}
              {headline.plain && <br />}
              <span className={styles.hl}>{headline.hl}</span>
            </h1>
            {hero.subheadline && <p className={styles.heroSub}>{hero.subheadline}</p>}
            <div className={styles.heroCtas}>
              {allProducts.length > 0 && (
                <a className={cx(styles.btn, styles.btnAccent)} href={`#${id("products")}`}>
                  Shop now →
                </a>
              )}
              <a className={cx(styles.btn, styles.btnGhost)} href={`#${id("how")}`}>
                How it works
              </a>
            </div>
            {stats.length > 0 && (
              <div className={styles.heroStats}>
                {stats.slice(0, 3).map((s) => (
                  <div key={s.label} className={styles.heroStat}>
                    <b>{s.value}</b>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.heroVisual}>
            {hero.image && (
              <img
                className={styles.heroImg}
                src={hero.image}
                alt={businessName}
                loading="eager"
                onError={hideOnError}
              />
            )}
            {badges.map((b, i) => (
              <div key={b.title} className={cx(styles.floatBadge, styles[`fb${i + 1}` as "fb1"])}>
                <span className={styles.badgeIcon}>{b.icon ?? "✓"}</span>
                <div>
                  {b.title}
                  {b.subtitle && <small>{b.subtitle}</small>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {categoryItems.length > 0 && (
        <section className={styles.categories} id={id("categories")}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <h2>Shop by category</h2>
              <a href={`#${id("products")}`}>View all →</a>
            </div>
            <div className={styles.catRow}>
              {[{ name: "All", emoji: "🛒" }, ...categoryItems].map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className={cx(styles.catPill, activeCat === c.name && styles.catPillActive)}
                  aria-pressed={activeCat === c.name}
                  onClick={() => setActiveCat(c.name)}
                >
                  <span className={styles.emoji}>{c.emoji ?? "🛍️"}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRODUCTS */}
      {allProducts.length > 0 && (
        <section className={styles.products} id={id("products")}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <h2>This week&apos;s fresh picks</h2>
              <a href={orderHref} target={wa ? "_blank" : undefined} rel={wa ? "noopener noreferrer" : undefined}>
                Order everything →
              </a>
            </div>
            {visible.length === 0 ? (
              <p className={styles.empty}>Nothing matches that search — try another word or category.</p>
            ) : (
              <div className={styles.productGrid}>
                {visible.map((p, i) => (
                  <article key={`${p.sku ?? p.name}-${i}`} className={styles.product}>
                    <div className={styles.productImgWrap}>
                      {p.image && (
                        <img
                          className={styles.productImg}
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          onError={hideOnError}
                        />
                      )}
                      {p.tag && <span className={styles.productTag}>{p.tag}</span>}
                    </div>
                    <div className={styles.productBody}>
                      <p className={styles.productName}>{p.name}</p>
                      {(p.unit || p.description) && (
                        <p className={styles.productUnit}>{p.unit ?? p.description}</p>
                      )}
                      <div className={styles.productRow}>
                        <span className={styles.productPrice}>
                          {p.price}
                          {p.old_price && <s>{p.old_price}</s>}
                        </span>
                        <button
                          type="button"
                          className={cx(styles.addBtn, flash === i && styles.addBtnFlash)}
                          aria-label={`Add ${p.name} to cart`}
                          onClick={() => addToCart(i)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* PROMO */}
      {promo.headline && (
        <section className={styles.container}>
          <div className={styles.promo}>
            <div>
              <h2>{promo.headline}</h2>
              {(promo.body || promo.code) && (
                <p>
                  {promo.code && (
                    <>
                      Use code <b>{promo.code}</b> at checkout.{" "}
                    </>
                  )}
                  {promo.body}
                </p>
              )}
              <a
                className={cx(styles.btn, styles.btnAccent)}
                href={orderHref}
                target={wa ? "_blank" : undefined}
                rel={wa ? "noopener noreferrer" : undefined}
              >
                {promo.button_label ?? "Claim offer"} →
              </a>
            </div>
            {promo.image && (
              <img
                className={styles.promoImg}
                src={promo.image}
                alt=""
                loading="lazy"
                onError={hideOnError}
              />
            )}
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className={styles.steps} id={id("how")}>
        <div className={cx(styles.container, styles.stepsInner)}>
          <h2>{steps.headline ?? "Groceries in 3 easy steps"}</h2>
          <div className={styles.stepsGrid}>
            {stepItems.map((s, i) => (
              <div key={s.title} className={styles.step}>
                <div className={styles.stepNum}>{i + 1}</div>
                <h3>{s.title}</h3>
                {s.body && <p>{s.body}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer} id={id("contact")}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div>
              <a className={cx(styles.logo, styles.footLogo)} href={`#${id("top")}`}>
                <span className={styles.logoMark}>🥬</span> {businessName}
              </a>
              <p className={styles.footDesc}>
                {about.body ?? "Fresh groceries from local farms, delivered to your door."}
              </p>
            </div>
            {categoryItems.length > 0 && (
              <div>
                <h4>Shop</h4>
                <ul>
                  {categoryItems.slice(0, 4).map((c) => (
                    <li key={c.name}>
                      <a
                        href={`#${id("products")}`}
                        onClick={() => setActiveCat(c.name)}
                      >
                        {c.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h4>Company</h4>
              <ul>
                <li><a href={`#${id("how")}`}>How it works</a></li>
                {promo.headline && <li><a href={orderHref}>Offers</a></li>}
                <li><a href={`#${id("contact")}`}>Contact</a></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                {contact.phone && (
                  <li><a href={telHref(contact.phone)}>{contact.phone}</a></li>
                )}
                {contact.email && (
                  <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
                )}
                {contact.address && <li><span className={styles.footText}>{contact.address}</span></li>}
                {hoursLines.map((l) => (
                  <li key={l}><span className={styles.footText}>{l}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>
              © {new Date().getFullYear()} {businessName}. All rights reserved.
            </span>
            <span>Made with Rivo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
