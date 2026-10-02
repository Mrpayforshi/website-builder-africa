"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import styles from "./use-template-dialog.module.css";

interface Props {
  templateName: string;
  categoryLabel: string;
  galleryTemplateId?: string;
  onClose: () => void;
}

const STEPS = [
  { label: "Creating your site", detail: "Copying the template's content" },
  { label: "Setting up features", detail: "WhatsApp, EcoCash, layby and delivery switches" },
  { label: "Finalizing", detail: "Opening your editor" },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function UseTemplateDialog({ templateName, categoryLabel, galleryTemplateId, onClose }: Props) {
  const router = useRouter();
  const [stage, setStage] = useState<"confirm" | "working">("confirm");
  const [name, setName] = useState(templateName);
  const [agreed, setAgreed] = useState(false);
  const [progress, setProgress] = useState(0); // index of the active step; 3 = all done
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = name.trim();
  const canCreate = trimmed.length >= 2 && trimmed.length <= 80 && agreed;

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && stage === "confirm") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function create() {
    if (!canCreate) return;
    setError(null);
    setStage("working");
    setProgress(0);

    let data: { businessId: string; templateApplied: boolean } | null = null;
    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ galleryTemplateId, siteName: trimmed }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json) throw new Error(json?.error ?? "Couldn't create your site — try again.");
      data = json;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't create your site — try again.");
      setStage("confirm");
      return;
    }

    // The server does all three steps in one transaction; this just paces the
    // checklist so each step is visible.
    setProgress(1);
    await sleep(450);
    setProgress(2);
    await sleep(450);
    setProgress(3);
    await sleep(300);

    if (data!.templateApplied) {
      router.push(`/dashboard/${data!.businessId}?welcome=1`);
    } else {
      const first = `I want to start from the "${templateName}" template (${categoryLabel}).`;
      router.push(`/dashboard/${data!.businessId}/intake?first=${encodeURIComponent(first)}`);
    }
  }

  const dialog = (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && stage === "confirm") onClose();
      }}
    >
      <div className={styles.card} role="dialog" aria-modal="true" aria-labelledby="utd-title">
        <div className={styles.mark} aria-hidden="true" />

        {stage === "confirm" ? (
          <>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
              ×
            </button>
            <h2 id="utd-title" className={styles.title}>
              Use this template
            </h2>
            <p className={styles.lead}>This creates a copy of the site that you own and can change freely.</p>

            <label className={styles.label} htmlFor="utd-name">
              Site name
            </label>
            <input
              id="utd-name"
              ref={inputRef}
              className={styles.input}
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") create();
              }}
            />

            <label className={styles.ack}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>
                I understand the sample text, photos and prices are placeholders, and I&apos;ll replace them with
                my own business details before publishing.
              </span>
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <button type="button" className={styles.btn} onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={create}
                disabled={!canCreate}
              >
                Create my site
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="utd-title" className={styles.title}>
              Setting up your site
            </h2>
            <p className={styles.lead}>This may take a few moments.</p>
            <ul className={styles.steps}>
              {STEPS.map((s, i) => {
                const state = i < progress ? "done" : i === progress ? "active" : "pending";
                return (
                  <li key={s.label} className={`${styles.step} ${state === "pending" ? styles.stepPending : ""}`}>
                    {state === "done" && <span className={`${styles.icon} ${styles.tick}`}>✓</span>}
                    {state === "active" && <span className={`${styles.icon} ${styles.spinner}`} />}
                    {state === "pending" && <span className={styles.dot} />}
                    <span className={styles.stepText}>
                      <strong>{s.label}</strong>
                      {state === "active" && <span>{s.detail}</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
