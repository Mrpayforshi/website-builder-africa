"use client";

import { useEffect, useState } from "react";
import styles from "./PlatformSection.module.css";

const PROMPTS = [
  "Create an online store for my boutique…",
  "Build a menu with WhatsApp ordering…",
  "Make a booking site for my salon…",
  "Set up a shop that takes EcoCash…",
];

const FEATURES = [
  { key: "orders", label: "Orders", icon: "M4 6h16M4 12h16M4 18h10" },
  { key: "whatsapp", label: "WhatsApp ordering", icon: "M21 12a8 8 0 0 1-11.9 7L4 20l1.1-4.9A8 8 0 1 1 21 12z" },
  { key: "ecocash", label: "EcoCash checkout", icon: "M3 7h18v10H3zM3 11h18" },
  { key: "layby", label: "Layby payments", icon: "M12 3v18M5 10l7-7 7 7" },
  { key: "connectors", label: "Connectors", icon: "M6 3v12M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9c0 6-12 3-12 6" },
  { key: "delivery", label: "Rider delivery", icon: "M3 7h11v8H3zM14 10h4l3 3v2h-7M7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" },
  { key: "inventory", label: "Inventory", icon: "M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7" },
  { key: "analytics", label: "Analytics", icon: "M4 20V10M10 20V4M16 20v-8M22 20H2" },
];

function useTypewriter(lines: string[]) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(lines[0]);
      return;
    }
    let line = 0;
    let char = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = lines[line];
      if (!deleting) {
        char += 1;
        setText(current.slice(0, char));
        if (char === current.length) {
          deleting = true;
          timer = setTimeout(tick, 1800);
          return;
        }
        timer = setTimeout(tick, 55);
      } else {
        char -= 1;
        setText(current.slice(0, char));
        if (char === 0) {
          deleting = false;
          line = (line + 1) % lines.length;
          timer = setTimeout(tick, 350);
          return;
        }
        timer = setTimeout(tick, 22);
      }
    };

    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [lines]);

  return text;
}

export default function PlatformSection() {
  const typed = useTypewriter(PROMPTS);

  return (
    <section className={styles.section} aria-labelledby="platform-heading">
      <div className={styles.inner}>
        <h2 id="platform-heading" className={styles.heading}>
          One platform. Endless possibilities.
        </h2>
        <p className={styles.sub}>
          If you can describe it, you can sell it. Create, run, and manage your
          whole business online from scratch.
        </p>

        <div className={styles.grid}>
          {/* Card 1: describe it */}
          <article className={styles.card}>
            <div className={`${styles.visual} ${styles.visualPrompt}`}>
              <div className={styles.promptBox} aria-hidden="true">
                <span className={styles.promptText}>
                  {typed}
                  <span className={styles.caret} />
                </span>
              </div>
            </div>
            <div className={styles.copy}>
              <h3>Now in the chat, describe it, it&apos;s live</h3>
              <p>
                Tell Rivo about your business in plain words. It picks the right
                template and builds your site in seconds.
              </p>
            </div>
          </article>

          {/* Card 2: refine it */}
          <article className={styles.card}>
            <div className={`${styles.visual} ${styles.visualPreview}`}>
              <div className={styles.previewFrame} aria-hidden="true">
                <div className={styles.previewBar}>
                  <span className={styles.previewTab}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                    </svg>
                    Preview
                  </span>
                  <span className={styles.previewIcon}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 3h7l5 5v13H7zM14 3v5h5" /></svg>
                  </span>
                  <span className={styles.previewIcon}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5" /></svg>
                  </span>
                </div>
                <div className={styles.previewPage}>
                  <div className={styles.selected}>
                    Fresh groceries, delivered across Harare
                    <span className={styles.badge}>h1</span>
                  </div>
                  <p className={styles.previewSub}>
                    Order in minutes on WhatsApp. Pay with EcoCash or layby.
                  </p>
                  <span className={styles.previewCta}>Order on WhatsApp</span>
                </div>
              </div>
            </div>
            <div className={styles.copy}>
              <h3>Refine any detail, visually</h3>
              <p>
                Click any heading, photo, or button on your site and change it
                right there. No forms, no code.
              </p>
            </div>
          </article>

          {/* Card 3: everything built in */}
          <article className={styles.card}>
            <div className={`${styles.visual} ${styles.visualFeatures}`}>
              <ul className={styles.featureList} aria-hidden="true">
                {FEATURES.map((f) => (
                  <li
                    key={f.key}
                    className={`${styles.feature} ${f.key === "connectors" ? styles.featureActive : ""}`}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d={f.icon} />
                    </svg>
                    {f.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.copy}>
              <h3>Run the business, not just the site</h3>
              <p>
                Orders, payments, delivery, and inventory are built in. Switch
                each one on when you need it.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
