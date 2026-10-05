"use client";

import { useState } from "react";
import Link from "next/link";
import type { FeatureToggleState } from "@/components/dashboard/FeatureTogglesPanel";
import styles from "./editor-workspace.module.css";

type MoreSection = "analytics" | "domain" | "connectors" | "settings";

const SECTIONS: { key: MoreSection; label: string }[] = [
  { key: "analytics", label: "Analytics" },
  { key: "domain", label: "Domain" },
  { key: "connectors", label: "Connectors" },
  { key: "settings", label: "Settings" },
];

interface MorePanelProps {
  businessId: string;
  businessName: string;
  slug: string;
  isLive: boolean;
  version: number;
  siteHost: string | null;
  siteUrl: string | null;
  featureToggles: FeatureToggleState[];
  busy: boolean;
  onTogglePublish: () => void;
}

function prettyKey(key: string) {
  const text = key.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function MorePanel({
  businessId,
  businessName,
  slug,
  isLive,
  version,
  siteHost,
  siteUrl,
  featureToggles,
  busy,
  onTogglePublish,
}: MorePanelProps) {
  const [section, setSection] = useState<MoreSection>("analytics");
  const [copied, setCopied] = useState(false);
  const enabled = featureToggles.filter((f) => f.enabled);

  async function copyUrl() {
    if (!siteUrl) return;
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked — ignore.
    }
  }

  return (
    <div className={styles.moreRoot}>
      <nav className={styles.moreNav} aria-label="More">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`${styles.moreNavItem} ${section === s.key ? styles.moreNavActive : ""}`}
            onClick={() => setSection(s.key)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className={styles.moreBody}>
        {section === "analytics" && (
          <>
            <h2 className={styles.moreTitle}>Analytics</h2>
            <div className={styles.moreCard}>
              <div className={styles.moreEmpty}>
                {isLive ? (
                  <>
                    <strong>Visitor analytics aren&apos;t available yet</strong>
                    <p>Your site is live. Visit counts will appear here once analytics are added to Rivo.</p>
                  </>
                ) : (
                  <>
                    <strong>Publish your site to start tracking visits</strong>
                    <p>Share your site with a live address to see its traffic here.</p>
                    <button type="button" className={styles.moreBtnPrimary} onClick={onTogglePublish} disabled={busy}>
                      Publish
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {section === "domain" && (
          <>
            <h2 className={styles.moreTitle}>Domain</h2>
            <div className={styles.moreCard}>
              <div className={styles.moreRow}>
                <span className={styles.moreLabel}>Site address</span>
                <span className={styles.moreValue}>{siteHost ?? "Not set"}</span>
              </div>
              <div className={styles.moreRow}>
                <span className={styles.moreLabel}>Status</span>
                <span className={styles.moreValue}>
                  {isLive ? "Live: visitors can open it" : "Draft: only you can see it, publish to go live"}
                </span>
              </div>
              {siteUrl && (
                <div className={styles.moreActions}>
                  <button type="button" className={styles.moreBtn} onClick={copyUrl}>
                    {copied ? "Copied" : "Copy link"}
                  </button>
                  {isLive && (
                    <a className={styles.moreBtn} href={siteUrl} target="_blank" rel="noreferrer">
                      Open site ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {section === "connectors" && (
          <>
            <h2 className={styles.moreTitle}>Connectors</h2>
            <div className={styles.moreCard}>
              {enabled.length === 0 ? (
                <p className={styles.moreNote}>No features are switched on for this site yet.</p>
              ) : (
                <ul className={styles.moreList}>
                  {enabled.map((f) => (
                    <li key={f.feature_key}>{prettyKey(f.feature_key)}</li>
                  ))}
                </ul>
              )}
              <div className={styles.moreActions}>
                <Link className={styles.moreBtn} href="/dashboard/connectors">
                  Manage connectors
                </Link>
              </div>
            </div>
          </>
        )}

        {section === "settings" && (
          <>
            <h2 className={styles.moreTitle}>Settings</h2>
            <div className={styles.moreCard}>
              <div className={styles.moreRow}>
                <span className={styles.moreLabel}>Project name</span>
                <span className={styles.moreValue}>{businessName}</span>
              </div>
              <div className={styles.moreRow}>
                <span className={styles.moreLabel}>Slug</span>
                <span className={styles.moreValue}>{slug || "Not set"}</span>
              </div>
              <div className={styles.moreRow}>
                <span className={styles.moreLabel}>Site version</span>
                <span className={styles.moreValue}>{version}</span>
              </div>
              <div className={styles.moreActions}>
                <Link className={styles.moreBtn} href={`/dashboard/${businessId}/orders`}>
                  Orders
                </Link>
                <Link className={styles.moreBtn} href="/dashboard">
                  All projects
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
