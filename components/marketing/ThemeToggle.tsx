"use client";

import { useEffect } from "react";
import styles from "./theme-toggle.module.css";

// Must match the inline script in app/layout.tsx.
const STORAGE_KEY = "rivo-theme";
type Theme = "light" | "dark";

function readStored(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null; // private mode or blocked storage: just follow the system
  }
}

function apply(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  useEffect(() => {
    // Until the visitor picks a theme themselves, keep following the system
    // setting live (for example when the OS switches to dark at sunset).
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = (e: MediaQueryListEvent) => {
      if (!readStored()) apply(e.matches ? "dark" : "light");
    };
    // Keep other open tabs in step when the choice is changed in one of them.
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) apply(e.newValue);
    };
    mq.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorage);
    return () => {
      mq.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  function toggle() {
    const next: Theme = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* the theme still changes for this visit, it just will not be remembered */
    }
  }

  // Both icons are always rendered and CSS shows the right one from the
  // data-theme attribute, so the server HTML and the first client render match.
  return (
    <button type="button" className={styles.btn} onClick={toggle} aria-label="Switch between light and dark mode" title="Switch theme">
      <svg className={styles.sun} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
      </svg>
      <svg className={styles.moon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
      </svg>
    </button>
  );
}
