import styles from "./templates.module.css";
import { TemplatesGallery, type TemplateCard } from "./TemplatesGallery";

// TODO(templates): replace with a real query once templates are seeded —
// e.g. `await listAllTemplates()` from lib/templates/template-store.ts.
// Category values match lib/ai/tools.ts / NewProjectForm.tsx exactly.
const PLACEHOLDER_TEMPLATES: TemplateCard[] = [
  {
    id: "food-1",
    category: "food",
    categoryLabel: "Food",
    name: "Sadza Kitchen",
    description: "Menu, daily specials, and order-by-WhatsApp for home cooks and small eateries.",
    features: ["whatsapp", "ecocash", "delivery"],
  },
  {
    id: "food-2",
    category: "food",
    categoryLabel: "Food",
    name: "Mazoe Café",
    description: "Coffee-shop layout with a light gallery and table-booking contact block.",
    features: ["whatsapp", "ecocash"],
  },
  {
    id: "retail-1",
    category: "retail",
    categoryLabel: "Retail",
    name: "Chikwiya Grocers",
    description: "Product grid built for a stocked shop, with layby and delivery toggles ready.",
    features: ["layby", "delivery"],
  },
  {
    id: "retail-2",
    category: "retail",
    categoryLabel: "Retail",
    name: "Harare Fashion House",
    description: "Boutique storefront with lookbook gallery and installment checkout.",
    features: ["layby", "ecocash"],
  },
  {
    id: "services-1",
    category: "services",
    categoryLabel: "Services",
    name: "Fix It Harare",
    description: "Callout-based repairs business — service list, coverage area, quote-by-WhatsApp.",
    features: ["whatsapp"],
  },
  {
    id: "services-2",
    category: "services",
    categoryLabel: "Services",
    name: "CleanPro Zimbabwe",
    description: "Recurring home & office cleaning packages with booking hours built in.",
    features: ["whatsapp", "ecocash"],
  },
  {
    id: "professional-1",
    category: "professional",
    categoryLabel: "Professional",
    name: "Chirara Law Chambers",
    description: "Credentials-forward layout for legal and consulting practices.",
    features: [],
  },
  {
    id: "professional-2",
    category: "professional",
    categoryLabel: "Professional",
    name: "Nyoni Accounting",
    description: "Services list, team credentials, and an enquiry line for firms.",
    features: ["whatsapp"],
  },
  {
    id: "ngo-1",
    category: "ngo_community",
    categoryLabel: "NGO",
    name: "Tariro Trust",
    description: "Mission, programs, and gallery layout for community organizations.",
    features: [],
  },
  {
    id: "ngo-2",
    category: "ngo_community",
    categoryLabel: "NGO",
    name: "Green Harare Initiative",
    description: "Environmental-project layout with photo-heavy programs and about sections.",
    features: [],
  },
  {
    id: "events-1",
    category: "events_portfolio",
    categoryLabel: "Events",
    name: "Lens & Light Photography",
    description: "Portfolio-first gallery layout built for photographers and videographers.",
    features: ["whatsapp"],
  },
  {
    id: "events-2",
    category: "events_portfolio",
    categoryLabel: "Events",
    name: "Bulawayo Wedding Co.",
    description: "Event planning storefront with package pricing and deposit checkout.",
    features: ["whatsapp", "ecocash"],
  },
];

const CATEGORIES: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "food", label: "Food & Restaurant" },
  { value: "retail", label: "Retail / Shop" },
  { value: "services", label: "Services" },
  { value: "professional", label: "Professional" },
  { value: "ngo_community", label: "NGO / Community" },
  { value: "events_portfolio", label: "Events & Portfolio" },
];

export default function TemplatesPage() {
  return (
    <div className={styles.scene}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <header className={styles.nav}>
        <div className={styles.navInner}>
          <a className={styles.logo} href="/">
            <span className={styles.logoMark}>R</span>
            Rivo
          </a>
          <nav className={styles.navLinks}>
            <a href="/#product">Product</a>
            <a href="/templates" className={styles.active}>Templates</a>
            <a href="/#pricing">Pricing</a>
            <a href="/#resources">Resources</a>
            <a href="/#payments">WhatsApp &amp; EcoCash</a>
          </nav>
          <div className={styles.navRight}>
            <a className={styles.navSignin} href="/login">Log in</a>
            <a className={styles.btnWhite} href="/signup">Get started</a>
          </div>
        </div>
      </header>

      <div className={styles.wrap}>
        <header className={styles.pageHead}>
          <span className={styles.eyebrowTag}>Template library</span>
          <h1>Start from a site that already knows your business</h1>
          <p>
            Every template ships with WhatsApp ordering, EcoCash checkout, and layby
            wired in — pick the closest match, then describe what&apos;s different.
          </p>
        </header>

        <TemplatesGallery templates={PLACEHOLDER_TEMPLATES} categories={CATEGORIES} />
      </div>
    </div>
  );
}
