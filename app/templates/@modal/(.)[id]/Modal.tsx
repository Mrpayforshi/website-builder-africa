"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { TemplateCard } from "@/lib/templates/template-store";
import styles from "./modal.module.css";

export function TemplatePreviewModal({
  meta,
  children,
}: {
  meta: TemplateCard;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") router.back();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [router]);

  function onOverlayClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === overlayRef.current) router.back();
  }

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={onOverlayClick}
      role="presentation"
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={`${meta.name} preview`}
      >
        <header className={styles.dialogHead}>
          <div className={styles.dialogHeadLeft}>
            <span className={styles.badge}>{meta.categoryLabel}</span>
            <h2>{meta.name}</h2>
            <span className={styles.byline}>by Rivo</span>
          </div>
          <div className={styles.dialogHeadRight}>
            <Link href={`/signup?template=${meta.id}`} className={styles.cta}>
              Use template
            </Link>
            <button
              type="button"
              className={styles.close}
              onClick={() => router.back()}
              aria-label="Close preview"
            >
              ×
            </button>
          </div>
        </header>

        <div className={styles.scrollArea}>{children}</div>
      </div>
    </div>
  );
}
