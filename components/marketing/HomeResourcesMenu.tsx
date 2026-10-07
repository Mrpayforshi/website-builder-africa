"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RESOURCES, type ResourceItem } from "./resources";
import styles from "./home-resources-menu.module.css";

function Entry({ item, onNavigate }: { item: ResourceItem; onNavigate: () => void }) {
  const body = (
    <>
      <span className={styles.title}>
        {item.title}
        {!item.href && <em className={styles.soon}>Soon</em>}
      </span>
      <span className={styles.desc}>{item.desc}</span>
    </>
  );

  return item.href ? (
    <Link href={item.href} className={styles.item} onClick={onNavigate}>
      {body}
    </Link>
  ) : (
    <span className={`${styles.item} ${styles.itemOff}`} aria-disabled="true">
      {body}
    </span>
  );
}

export function HomeResourcesMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={ref}
      className={styles.group}
      // Hover-open for mouse only, so a tap on touch screens toggles via click
      // instead of opening on hover and immediately closing on click.
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="home-resources-menu"
        onClick={() => setOpen((v) => !v)}
      >
        Resources
        <svg
          className={`${styles.chev} ${open ? styles.chevOpen : ""}`}
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 3.5 5 6.5 8 3.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className={styles.panelWrap} id="home-resources-menu">
          <div className={styles.panel}>
            <div className={styles.head}>Resources</div>
            <div className={styles.grid}>
              {RESOURCES.map((item) => (
                <Entry key={item.title} item={item} onNavigate={() => setOpen(false)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
