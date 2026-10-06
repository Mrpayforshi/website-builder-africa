"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./marketing.module.css";

type Item = { title: string; desc: string; href?: string };

const SOLUTIONS_WHO: Item[] = [
  { title: "For work", desc: "Run on what you build.", href: "/for-work" },
  { title: "Founders", desc: "Ship before you pitch.", href: "/founders" },
  { title: "Shops & retail", desc: "Sell online in a day.", href: "/templates" },
  { title: "Restaurants & cafés", desc: "Menus that take orders.", href: "/templates" },
];

const SOLUTIONS_USE: Item[] = [
  { title: "Websites", desc: "From idea to live site.", href: "/templates" },
  { title: "WhatsApp ordering", desc: "Orders where customers already are.", href: "/for-work#connectors" },
  { title: "EcoCash checkout", desc: "Get paid the local way.", href: "/founders#payments" },
];

const RESOURCES: Item[] = [
  { title: "Templates", desc: "Begin with a template.", href: "/templates" },
  { title: "Connectors", desc: "Build from what you already use.", href: "/for-work#connectors" },
  { title: "Guides", desc: "Learn as you build." },
  { title: "Docs", desc: "Everything under the hood." },
  { title: "Blog", desc: "Ideas, updates, stories." },
  { title: "Customer stories", desc: "See what businesses have built." },
];

function Entry({ item, onNavigate }: { item: Item; onNavigate: () => void }) {
  const body = (
    <>
      <span className={styles.menuTitle}>
        {item.title}
        {!item.href && <em className={styles.soon}>Soon</em>}
      </span>
      <span className={styles.menuDesc}>{item.desc}</span>
    </>
  );
  return item.href ? (
    <Link href={item.href} className={styles.menuItem} onClick={onNavigate}>
      {body}
    </Link>
  ) : (
    <span className={`${styles.menuItem} ${styles.menuItemOff}`} aria-disabled="true">
      {body}
    </span>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState<"solutions" | "resources" | null>(null);
  const [mobile, setMobile] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const close = () => {
    setOpen(null);
    setMobile(false);
  };

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const trigger = (key: "solutions" | "resources", label: string) => (
    <div className={styles.navGroup} onMouseEnter={() => setOpen(key)} onMouseLeave={() => setOpen(null)}>
      <button
        type="button"
        className={styles.navLink}
        aria-expanded={open === key}
        aria-haspopup="true"
        onClick={() => setOpen(open === key ? null : key)}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open === key && (
        <div className={styles.menu} role="menu">
          {key === "solutions" ? (
            <>
              <div className={styles.menuCol}>
                <div className={styles.menuHead}>Who is it for?</div>
                {SOLUTIONS_WHO.map((i) => <Entry key={i.title} item={i} onNavigate={close} />)}
              </div>
              <div className={`${styles.menuCol} ${styles.menuColAlt}`}>
                <div className={styles.menuHead}>Use cases</div>
                {SOLUTIONS_USE.map((i) => <Entry key={i.title} item={i} onNavigate={close} />)}
              </div>
            </>
          ) : (
            <div className={styles.menuCol}>
              <div className={styles.menuHead}>Resources</div>
              <div className={styles.menuGrid}>
                {RESOURCES.map((i) => <Entry key={i.title} item={i} onNavigate={close} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className={styles.nav} ref={ref}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.logo} onClick={close}>
          <span className={styles.logoMark}>R</span>
          Rivo
        </Link>

        <nav className={`${styles.navLinks} ${mobile ? styles.navLinksOpen : ""}`} aria-label="Main">
          {trigger("solutions", "Solutions")}
          {trigger("resources", "Resources")}
          <Link className={styles.navLink} href="/templates" onClick={close}>Community</Link>
          <Link className={styles.navLink} href="/for-work" onClick={close}>Enterprise</Link>
          <a className={styles.navLink} href="/#pricing" onClick={close}>Pricing</a>
          <a className={styles.navLink} href="/#payments" onClick={close}>Security</a>
        </nav>

        <div className={styles.navRight}>
          <a className={styles.btnGhost} href="/login">Log in</a>
          <a className={styles.btnDark} href="/signup">Get started</a>
          <button
            type="button"
            className={styles.burger}
            aria-label="Menu"
            aria-expanded={mobile}
            onClick={() => setMobile((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
