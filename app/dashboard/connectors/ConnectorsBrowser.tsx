"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import styles from "./connectors.module.css";

export interface ConnectorProject {
  id: string;
  name: string;
  version: number;
}

export type ConnectorToggleMap = Record<string, Record<string, { enabled: boolean; config: Record<string, unknown> }>>;

interface ConnectorDef {
  key: string;
  name: string;
  description: string;
  category: "payments" | "ordering" | "operations" | "experience";
  comingSoon?: boolean;
  icon: JSX.Element;
}

function Icon(path: JSX.Element) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {path}
    </svg>
  );
}

const CONNECTORS: ConnectorDef[] = [
  {
    key: "whatsapp",
    name: "WhatsApp ordering (deep link)",
    description: "Free — a wa.me button that opens WhatsApp with a pre-filled order message.",
    category: "ordering",
    icon: Icon(
      <>
        <path d="M12 3a8 8 0 0 0-6.9 12l-1 4 4.1-1.1A8 8 0 1 0 12 3Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 10c.3 2.2 2 3.9 4.2 4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: "whatsapp_flow_ordering",
    name: "WhatsApp Flow ordering",
    description: "Paid add-on — customers browse your live catalog and check out inside WhatsApp, no website visit needed.",
    category: "ordering",
    icon: Icon(
      <>
        <path d="M12 3a8 8 0 0 0-6.9 12l-1 4 4.1-1.1A8 8 0 1 0 12 3Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 13.5h6M9 10h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: "ecocash",
    name: "EcoCash checkout",
    description: "Accept EcoCash mobile money payments at checkout.",
    category: "payments",
    icon: Icon(
      <>
        <rect x="3.5" y="6" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.6" />
      </>
    ),
  },
  {
    key: "layby",
    name: "Layby plans",
    description: "Let customers pay in installments with a deposit and schedule.",
    category: "payments",
    icon: Icon(
      <>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7v5l3.2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: "delivery",
    name: "Rider delivery",
    description: "Turn on delivery zones and rider handoff for orders.",
    category: "ordering",
    icon: Icon(
      <>
        <path d="M3 7h11v8H3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14 10h4l3 3v2h-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="7" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="17.5" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      </>
    ),
  },
  {
    key: "inventory_sync",
    name: "Inventory sync",
    description: "Keep stock counts in sync automatically as orders come in.",
    category: "operations",
    icon: Icon(
      <>
        <path d="M4 8 12 4l8 4-8 4-8-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 8v8l8 4 8-4V8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 12v8" stroke="currentColor" strokeWidth="1.6" />
      </>
    ),
  },
  {
    key: "invoicing",
    name: "Receipts & invoicing",
    description: "Auto-generate receipts and invoices for every order.",
    category: "operations",
    icon: Icon(
      <>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: "maps_sync",
    name: "Google Maps sync",
    description: "Show your location and directions with live map data.",
    category: "operations",
    icon: Icon(
      <>
        <path
          d="M12 21s7-6.1 7-11.4A7 7 0 0 0 5 9.6C5 14.9 12 21 12 21Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
      </>
    ),
  },
  {
    key: "load_shedding_banner",
    name: "Load-shedding banner",
    description: "Show customers a banner during scheduled power cuts.",
    category: "experience",
    icon: Icon(
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    ),
  },
  {
    key: "low_bandwidth_mode",
    name: "Low-bandwidth mode",
    description: "Serve a lighter version of the site on slow connections.",
    category: "experience",
    icon: Icon(
      <>
        <path d="M4 19c3-1 3-11 8-11s5 10 8 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="19" r="1.4" fill="currentColor" />
      </>
    ),
  },
];

const COMING_SOON: ConnectorDef[] = [
  {
    key: "onemoney",
    name: "OneMoney checkout",
    description: "Accept OneMoney mobile money payments.",
    category: "payments",
    comingSoon: true,
    icon: Icon(
      <>
        <path d="M12 3a8 8 0 0 0-6.9 12l-1 4 4.1-1.1A8 8 0 1 0 12 3Z" stroke="currentColor" strokeWidth="1.6" />
      </>
    ),
  },
  {
    key: "paynow",
    name: "Paynow checkout",
    description: "Card and bank payments via Paynow.",
    category: "payments",
    comingSoon: true,
    icon: Icon(<rect x="3.5" y="6" width="17" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.6" />),
  },
  {
    key: "card_payments",
    name: "Visa & Mastercard",
    description: "Accept card payments in USD or ZWG.",
    category: "payments",
    comingSoon: true,
    icon: Icon(
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
      </>
    ),
  },
  {
    key: "booking_calendar",
    name: "Booking calendar",
    description: "Let customers book appointments and sync to Google Calendar.",
    category: "operations",
    comingSoon: true,
    icon: Icon(
      <>
        <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 10h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
];

const ALL_CONNECTORS = [...CONNECTORS, ...COMING_SOON];

const CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "payments", label: "Payments" },
  { id: "ordering", label: "Ordering & Delivery" },
  { id: "operations", label: "Operations" },
  { id: "experience", label: "Site experience" },
  { id: "soon", label: "Coming soon" },
];

interface ConnectorsBrowserProps {
  projects: ConnectorProject[];
  toggleMap: ConnectorToggleMap;
  displayName: string;
}

export function ConnectorsBrowser({ projects: initialProjects, toggleMap: initialToggleMap, displayName }: ConnectorsBrowserProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [toggleMap, setToggleMap] = useState(initialToggleMap);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const enabledCount = (key: string) => projects.filter((p) => toggleMap[p.id]?.[key]?.enabled).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_CONNECTORS.filter((c) => {
      const matchesCategory =
        category === "all"
          ? true
          : category === "soon"
          ? Boolean(c.comingSoon)
          : c.category === category && !c.comingSoon;
      const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const categoryCount = (id: string) =>
    id === "all"
      ? CONNECTORS.length
      : id === "soon"
      ? COMING_SOON.length
      : CONNECTORS.filter((c) => c.category === id).length;

  async function handleToggle(connectorKey: string, businessId: string, nextEnabled: boolean) {
    const pendingKey = `${connectorKey}:${businessId}`;
    setPending(pendingKey);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[pendingKey];
      return next;
    });

    const existingConfig = toggleMap[businessId]?.[connectorKey]?.config ?? {};

    // Optimistic update.
    setToggleMap((prev) => ({
      ...prev,
      [businessId]: {
        ...prev[businessId],
        [connectorKey]: { enabled: nextEnabled, config: existingConfig },
      },
    }));

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("feature_toggles")
        .upsert(
          { business_id: businessId, feature_key: connectorKey, enabled: nextEnabled, config: existingConfig },
          { onConflict: "business_id,feature_key" }
        );

      if (error) throw error;
    } catch (err) {
      // Roll back the optimistic update and surface the error on this row.
      setToggleMap((prev) => ({
        ...prev,
        [businessId]: {
          ...prev[businessId],
          [connectorKey]: { enabled: !nextEnabled, config: existingConfig },
        },
      }));
      setErrors((prev) => ({
        ...prev,
        [pendingKey]: err instanceof Error ? err.message : "Failed to update — try again.",
      }));
    } finally {
      setPending((current) => (current === pendingKey ? null : current));
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div>
          <h1>Connectors</h1>
          <p>Hi {displayName} — turn features on or off per business.</p>
        </div>
        <input
          className={styles.search}
          type="text"
          placeholder="Search connectors…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.layout}>
        <nav className={styles.categories}>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`${styles.categoryItem} ${category === c.id ? styles.categoryItemActive : ""}`}
              onClick={() => setCategory(c.id)}
            >
              <span>{c.label}</span>
              <span className={styles.categoryCount}>{categoryCount(c.id)}</span>
            </button>
          ))}
        </nav>

        <div className={styles.grid}>
          {filtered.length === 0 && <p className={styles.empty}>No connectors match your search.</p>}

          {filtered.map((connector) => {
            const isExpanded = expanded === connector.key;
            const count = enabledCount(connector.key);

            return (
              <React.Fragment key={connector.key}>
                <button
                  type="button"
                  className={`${styles.card} ${connector.comingSoon ? styles.cardSoon : ""} ${
                    isExpanded ? styles.cardExpanded : ""
                  }`}
                  onClick={() => {
                    if (connector.comingSoon) return;
                    setExpanded((current) => (current === connector.key ? null : connector.key));
                  }}
                  disabled={connector.comingSoon}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardIcon}>{connector.icon}</div>
                    {connector.comingSoon ? (
                      <span className={`${styles.cardBadge} ${styles.cardBadgeSoon}`}>Coming soon</span>
                    ) : count > 0 ? (
                      <span className={styles.cardBadge}>
                        {count} of {projects.length}
                      </span>
                    ) : null}
                  </div>
                  <h3>{connector.name}</h3>
                  <p>{connector.description}</p>
                </button>

                {isExpanded && !connector.comingSoon && (
                  <div className={styles.panel}>
                    {projects.length === 0 ? (
                      <p className={styles.panelEmpty}>
                        You don&apos;t have any businesses yet — <Link href="/dashboard">create one</Link> to enable
                        connectors.
                      </p>
                    ) : (
                      projects.map((project) => {
                        const enabled = Boolean(toggleMap[project.id]?.[connector.key]?.enabled);
                        const pendingKey = `${connector.key}:${project.id}`;
                        const isPending = pending === pendingKey;
                        const rowError = errors[pendingKey];

                        return (
                          <div key={project.id} className={styles.projectRow}>
                            <div>
                              <div className={styles.projectName}>{project.name}</div>
                              {rowError && <div className={styles.projectError}>{rowError}</div>}
                              {connector.key === "whatsapp_flow_ordering" && enabled && !rowError && (
                                <div className={styles.projectError} style={{ color: "inherit", opacity: 0.7 }}>
                                  Requires connecting a WhatsApp Business Account — see the setup prompt on this
                                  business&apos;s dashboard.
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              className={`${styles.switch} ${enabled ? styles.switchOn : ""}`}
                              onClick={() => handleToggle(connector.key, project.id, !enabled)}
                              disabled={isPending}
                              aria-pressed={enabled}
                              aria-label={`Toggle ${connector.name} for ${project.name}`}
                            >
                              <span className={styles.switchKnob} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </main>
  );
}
