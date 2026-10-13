"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RESOURCES } from "./resources";
import { SOLUTIONS_USE, SOLUTIONS_WHO } from "./solutions";
import styles from "./home-mobile-nav.module.css";

// Phone/tablet navigation for the home page. The desktop links in app/page.tsx
// are hidden at 900px and below; this hamburger takes over from there. It is
// hidden by CSS above 900px, so desktop never sees it.
export function HomeMobileNav() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // Rotating a tablet or resizing a window past the breakpoint closes the menu.
    const mq = window.matchMedia("(min-width: 901px)");
    const onWide = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <div ref={ref} className={styles.root}>
      <button
        type="button"
        className={styles.burger}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="home-mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <div id="home-mobile-menu" className={styles.panel}>
          <a href="#product" className={styles.link} onClick={close}>
            Product
          </a>

          <details className={styles.group}>
            <summary className={styles.summary}>
              Solutions
              <svg className={styles.chev} width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <div className={styles.sub}>
              <div className={styles.head}>Who is it for?</div>
              {SOLUTIONS_WHO.map((i) => (
                <Link key={i.title} href={i.href} className={styles.subLink} onClick={close}>
                  {i.title}
                </Link>
              ))}
              <div className={styles.head}>Industries &amp; use cases</div>
              {SOLUTIONS_USE.map((i) => (
                <Link key={i.title} href={i.href} className={styles.subLink} onClick={close}>
                  {i.title}
                </Link>
              ))}
            </div>
          </details>

          <Link href="/templates" className={styles.link} onClick={close}>
            Templates
          </Link>
          <a href="#pricing" className={styles.link} onClick={close}>
            Pricing
          </a>

          <details className={styles.group}>
            <summary className={styles.summary}>
              Resources
              <svg className={styles.chev} width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <div className={styles.sub}>
              {RESOURCES.map((item) =>
                item.href ? (
                  <Link key={item.title} href={item.href} className={styles.subLink} onClick={close}>
                    {item.title}
                  </Link>
                ) : (
                  <span key={item.title} className={`${styles.subLink} ${styles.subOff}`} aria-disabled="true">
                    {item.title} <em>Soon</em>
                  </span>
                ),
              )}
            </div>
          </details>

          <a href="#payments" className={styles.link} onClick={close}>
            WhatsApp &amp; EcoCash
          </a>

          <div className={styles.actions}>
            <a href="/login" className={styles.login}>
              Log in
            </a>
            <a href="/signup" className={styles.signup}>
              Get started
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
