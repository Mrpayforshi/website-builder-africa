"use client";

import { useMemo, useState } from "react";
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
        category === "all" ? true : category === "soon" ? Boolean(c.comingSoon) : c.category === category &&
