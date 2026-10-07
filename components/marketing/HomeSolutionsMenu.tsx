"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SOLUTIONS_WHO, SOLUTIONS_USE, type SolutionItem } from "./solutions";
import styles from "./home-resources-menu.module.css";

function Entry({ item, onNavigate }: { item: SolutionItem; onNavigate: () => void }) {
  return (
    <Link href={item.href} className={styles.item} onClick={onNavigate}>
      <span className={styles.title}>{item.title}</span>
      <span className={styles.desc}>{item.desc}</span>
    </Link>
  );
}

export function HomeSolutionsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pointerType = useRef<string>("mouse");

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const close = () => setOpen(false);

  return (
    <div
      ref={ref}
      className={styles.group}
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="home-solutions-menu"
        onPointerDown={(e) => {
          pointerType.current = e.pointerType;
        }}
        onClick={(e) => {
          if (e.detail > 0 && pointerType.current === "mouse") setOpen(true);
          else setOpen((v) => !v);
        }}
      >
        Solutions
        <svg
          className={`${styles.chev} ${open ? styles.chevOpen : ""}`}
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
        >
          <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className={styles.panelWrap} id="home-solutions-menu">
          <div className={styles.panel}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
              <div>
                <div className={styles.head}>Who is it for?</div>
                <div className={styles.grid} style={{ gridTemplateColumns: "1fr" }}>
                  {SOLUTIONS_WHO.map((i) => <Entry key={i.title} item={i} onNavigate={close} />)}
                </div>
              </div>
              <div>
                <div className={styles.head}>Industries &amp; use cases</div>
                <div className={styles.grid} style={{ gridTemplateColumns: "1fr" }}>
                  {SOLUTIONS_USE.map((i) => <Entry key={i.title} item={i} onNavigate={close} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
