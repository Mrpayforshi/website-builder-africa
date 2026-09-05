import { createClient } from "@/lib/supabase/server";
import type { TemplateStructure } from "@/lib/templates/section-schemas";

// --- Real template CRUD (Workstream C's `templates` table) ---------------
// This is what the AI tool layer (tool-executor.ts) and the site renderer
// read from. One row per category in v1 (see templates.category enum).

export interface Template {
  id: string;
  category: string;
  name: string;
  structure: TemplateStructure;
}

export async function getTemplateById(id: string): Promise<Template | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("templates")
    .select("id, category, name, structure")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as Template;
}

export async function listTemplatesByCategory(category: string): Promise<Template[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("templates")
    .select("id, category, name, structure")
    .eq("category", category);

  if (error || !data) return [];
  return data as Template[];
}

// --- Marketing gallery (separate `gallery_templates` table) --------------
// Browsable preview cards shown pre-signup. Distinct concern from the real
// templates above — different table, different shape (category_label,
// description, features[] instead of a structure the AI writes against).

export interface TemplateCard {
  id: string;
  category: string;
  categoryLabel: string;
  name: string;
  description: string;
  features: string[];
}

// Fallback cards for categories/templates that don't have real seeded data
// yet. As each one gets a real row in `gallery_templates`, the DB version
// (via listAllTemplates below) takes over automatically — just remove its
// entry here once that happens, no other wiring needed.
export const FALLBACK_TEMPLATES: TemplateCard[] = [
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

export const CATEGORIES: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "food", label: "Food & Restaurant" },
  { value: "retail", label: "Retail / Shop" },
  { value: "services", label: "Services" },
  { value: "professional", label: "Professional" },
  { value: "ngo_community", label: "NGO / Community" },
  { value: "events_portfolio", label: "Events & Portfolio" },
];

async function listAllTemplates(): Promise<TemplateCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_templates")
    .select("id, category, category_label, name, description, features");

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    category: row.category,
    categoryLabel: row.category_label,
    name: row.name,
    description: row.description,
    features: row.features ?? [],
  }));
}

// Gallery list source of truth: real DB rows override fallback cards by id;
// any fallback id not yet in the DB is shown as-is. Once all twelve have
// real rows, FALLBACK_TEMPLATES can be deleted entirely.
export async function getGalleryTemplateCards(): Promise<TemplateCard[]> {
  const dbTemplates = await listAllTemplates();

  const dbById = new Map(dbTemplates.map((t) => [t.id, t]));

  const merged = FALLBACK_TEMPLATES.map((fallback) => dbById.get(fallback.id) ?? fallback);

  // Include any DB templates that aren't in the fallback list at all
  // (e.g. once real services/professional/ngo/events templates are added).
  for (const [id, card] of dbById) {
    if (!merged.some((c) => c.id === id)) {
      merged.push(card);
    }
  }

  return merged;
}
