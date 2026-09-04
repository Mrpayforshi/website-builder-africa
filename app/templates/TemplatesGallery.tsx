"use client";

import { useMemo, useState } from "react";
import styles from "./templates.module.css";

export interface TemplateCard {
  id: string;
  category: string;
  categoryLabel: string;
  name: string;
  description: string;
  features: string[];
}

interface CategoryOption {
  value: string;
  label: string;
}

const FEATURE_OPTIONS: { key: string; label: string }[] = [
  { key: "whatsapp", label: "WhatsApp ordering" },
  { key: "ecocash", label: "EcoCash checkout" },
  { key: "layby", label: "Layby payments" },
  { key: "delivery", label: "Delivery tracking" },
];

// Category → thumbnail treatment. Matches the section personality already
// defined in styles/site.css, just used decoratively here.
const THUMB_CLASS: Record<string, string> = {
  food: "thumbFood",
  retail: "thumbRetail",
  services: "thumbServices",
  professional: "thumbProfessional",
  ngo_community: "thumbNgo",
  events_portfolio: "thumbEvents",
};

export function TemplatesGallery({
  templates,
  categories,
}: {
  templates: TemplateCard[];
  categories: CategoryOption[];
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: templates.length };
    for (const t of templates) {
      map[t.category] = (map[t.category] ?? 0) + 1;
    }
    return map;
  }, [templates]);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const categoryMatch = activeCategory === "all" || t.category === activeCategory;
      const featureMatch = activeFeatures.every((f) => t.features.includes(f));
      return categoryMatch && featureMatch;
    });
  }, [templates, activeCategory, activeFeatures]);

  function toggleFeature(key: string) {
    setActiveFeatures((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  }

  const activeLabel = categories.find((c) => c.value === activeCategory)?.label ?? "All templates";

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <h4>Category</h4>
        <ul className={styles.catList}>
          {categories.map((cat) => (
            <li key={cat.value}>
              <button
                type="button"
                className={cat.value === activeCategory ? styles.active : undefined}
                onClick={() => setActiveCategory(cat.value)}
              >
                {cat.label} <span className={styles.count}>{counts[cat.value] ?? 0}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.divider} />

        <h4>Built-in features</h4>
        <ul className={styles.featList}>
          {FEATURE_OPTIONS.map((feat) => (
            <li key={feat.key} className={styles.featItem}>
              <label>
                <input
                  type="checkbox"
                  checked={activeFeatures.includes(feat.key)}
                  onChange={() => toggleFeature(feat.key)}
                />
                {feat.label}
              </label>
            </li>
          ))}
        </ul>
      </aside>

      <main>
        <div className={styles.resultsBar}>
          <h2>{activeCategory === "all" ? "All templates" : activeLabel}</h2>
          <span>{filtered.length} {filtered.length === 1 ? "result" : "results"}</span>
        </div>

        {filtered.length === 0 ? (
          <p className={styles.empty}>No templates match those filters yet — try clearing a feature filter.</p>
        ) : (
          <div className={styles.grid}>
            {filtered.map((tpl) => (
              <a key={tpl.id} className={styles.card} href={`/templates/${tpl.id}`}>
                <div className={`${styles.thumb} ${styles[THUMB_CLASS[tpl.category]]}`} />
                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <h3>{tpl.name}</h3>
                    <span className={styles.badge}>{tpl.categoryLabel}</span>
                  </div>
                  <p>{tpl.description}</p>
                  {tpl.features.length > 0 && (
                    <div className={styles.cardFeats}>
                      {tpl.features.map((f) => (
                        <span key={f} className={styles.featDot}>{f}</span>
                      ))}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
