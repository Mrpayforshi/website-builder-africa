import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Cta, PageTop } from "@/components/marketing/ResourceBits";
import r from "@/components/marketing/resources.module.css";

export const metadata: Metadata = {
  title: "Connectors — Rivo",
  description: "Switch on payments, ordering, delivery and local-ready features for your Rivo site.",
};

type Status = "available" | "paid" | "soon";

interface Connector {
  name: string;
  description: string;
  status: Status;
}

// Mirrors the catalogue in app/dashboard/connectors/ConnectorsBrowser.tsx.
// If you add or rename a connector there, update it here too.
const GROUPS: { title: string; items: Connector[] }[] = [
  {
    title: "Ordering",
    items: [
      { name: "WhatsApp ordering (deep link)", description: "Free. A wa.me button that opens WhatsApp with a pre-filled order message.", status: "available" },
      { name: "WhatsApp Flow ordering", description: "Customers browse your live catalogue and check out inside WhatsApp, no website visit needed.", status: "paid" },
      { name: "Rider delivery", description: "Turn on delivery zones and rider handoff for orders.", status: "available" },
    ],
  },
  {
    title: "Payments",
    items: [
      { name: "EcoCash checkout", description: "Accept EcoCash mobile money payments at checkout.", status: "available" },
      { name: "Layby plans", description: "Let customers pay in instalments with a deposit and schedule.", status: "available" },
      { name: "OneMoney checkout", description: "Accept OneMoney mobile money payments.", status: "soon" },
      { name: "Paynow checkout", description: "Card and bank payments via Paynow.", status: "soon" },
      { name: "Visa & Mastercard", description: "Accept card payments in USD or ZWG.", status: "soon" },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Inventory sync", description: "Keep stock counts in step automatically as orders come in.", status: "available" },
      { name: "Receipts & invoicing", description: "Auto-generate receipts and invoices for every order.", status: "available" },
      { name: "Google Maps sync", description: "Show your location and directions with live map data.", status: "available" },
      { name: "Booking calendar", description: "Let customers book appointments and sync to Google Calendar.", status: "soon" },
    ],
  },
  {
    title: "Local-ready",
    items: [
      { name: "Load-shedding banner", description: "Show customers a banner during scheduled power cuts.", status: "available" },
      { name: "Low-bandwidth mode", description: "Serve a lighter version of the site on slow connections.", status: "available" },
    ],
  },
];

const LABEL: Record<Status, string> = { available: "Available", paid: "Paid add-on", soon: "Coming soon" };
const CHIP: Record<Status, string> = { available: r.chipLive, paid: r.chipPaid, soon: r.chipSoon };

export default function ConnectorsPage() {
  return (
    <MarketingShell>
      <PageTop
        eyebrow="Connectors"
        title="Build from what you already use"
        sub="WhatsApp, mobile money, delivery and local-ready features are switches, not integration projects. Turn on what your business needs."
      />

      {GROUPS.map((group) => (
        <section key={group.title} className={r.group}>
          <h2 className={r.groupHead}>{group.title}</h2>
          <div className={r.grid}>
            {group.items.map((c) => (
              <div key={c.name} className={r.card}>
                <div className={r.chipRow}>
                  <span className={`${r.chip} ${CHIP[c.status]}`}>{LABEL[c.status]}</span>
                </div>
                <h3 className={r.cardTitle}>{c.name}</h3>
                <p className={r.cardText}>{c.description}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <Cta title="Switch on what your business needs" label="Get started" href="/signup" />
    </MarketingShell>
  );
}
