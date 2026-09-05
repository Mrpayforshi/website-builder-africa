import type { TemplateStructure } from "@/lib/templates/section-schemas";

export interface TemplateCard {
  id: string;
  category: string;
  categoryLabel: string;
  name: string;
  description: string;
  features: string[];
}

// TODO(templates): replace with a real query once templates are seeded —
// e.g. `await listAllTemplates()` from lib/templates/template-store.ts.
// Category values match lib/ai/tools.ts / NewProjectForm.tsx exactly.
export const PLACEHOLDER_TEMPLATES: TemplateCard[] = [
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

// Only these two have a full mock TemplateStructure + content_blocks behind
// them (see supabase/migrations/20260904120000_seed_food_retail_templates.sql
// for the real structure this mirrors). Everything else in
// PLACEHOLDER_TEMPLATES shows a "preview coming soon" state on its detail
// page until it has real seeded content.

  "food-1": {
    structure: {
      sections: [
        { id: "hero", type: "hero", fields: ["headline", "subheadline", "image"], required: true },
        { id: "menu", type: "menu", fields: ["categories"], required: true },
        { id: "gallery", type: "gallery", fields: ["images"], required: false },
        { id: "contact", type: "contact", fields: ["address", "phone", "email", "hours", "map_embed"], required: true },
      ],
    },
    contentBlocks: {
      hero: {
        headline: "Sadza Kitchen",
        subheadline: "Home-style Zimbabwean meals, ready for pickup or delivery across Harare.",
        image: "https://placehold.co/640x480/e2652b/fff?text=Sadza+Kitchen",
      },
      menu: {
        categories: [
          {
            name: "Mains",
            items: [
              { name: "Sadza & Beef Stew", price: "$6", description: "Slow-cooked beef in a rich tomato gravy, served with sadza and greens." },
              { name: "Chicken Peri-Peri", price: "$7", description: "Grilled chicken quarter with peri-peri sauce and rice." },
              { name: "Vegetable Curry", price: "$5", description: "Seasonal vegetables in a mild curry, served with rice." },
            ],
          },
          {
            name: "Sides",
            items: [
              { name: "Muriwo unedovi", price: "$2", description: "Leafy greens in peanut butter sauce." },
              { name: "Sadza (extra)", price: "$1" },
            ],
          },
        ],
      },
      gallery: {
        images: [
          { url: "https://placehold.co/300x300/f6b04a/2b1608?text=Sunday+lunch", caption: "Sunday lunch plate" },
          { url: "https://placehold.co/300x300/e2652b/fff?text=Our+kitchen", caption: "Our kitchen" },
          { url: "https://placehold.co/300x300/f6b04a/2b1608?text=Peri-peri", caption: "Chicken peri-peri" },
          { url: "https://placehold.co/300x300/e2652b/fff?text=Fresh+sides", caption: "Fresh sides daily" },
        ],
      },
      contact: {
        address: "14 Robson Manyika Ave, Harare",
        phone: "+263 77 123 4567",
        email: "hello@sadzakitchen.rivo.app",
        hours: {
          mon: { open: "08:00", close: "20:00" },
          tue: { open: "08:00", close: "20:00" },
          wed: { open: "08:00", close: "20:00" },
          thu: { open: "08:00", close: "20:00" },
          fri: { open: "08:00", close: "21:00" },
          sat: { open: "09:00", close: "21:00" },
          sun: { open: "10:00", close: "18:00" },
        },
      },
    },
  },
  "retail-1": {
    structure: {
      sections: [
        { id: "hero", type: "hero", fields: ["headline", "subheadline", "image"], required: true },
        { id: "products", type: "product_grid", fields: ["items"], required: true },
        { id: "about", type: "about", fields: ["headline", "body", "image", "credentials"], required: false },
        { id: "contact", type: "contact", fields: ["address", "phone", "email", "hours", "map_embed"], required: true },
      ],
    },
    contentBlocks: {
      hero: {
        headline: "Chikwiya Grocers",
        subheadline: "Fresh produce, pantry staples, and household essentials — delivered across Chikwiya and beyond.",
        image: "https://placehold.co/640x480/f0921a/14110c?text=Chikwiya+Grocers",
      },
      products: {
        items: [
          { name: "10kg Mealie Meal", price: "$8.50", description: "Roller meal, locally milled.", sku: "GR-001", image: "https://placehold.co/300x300/fff8ec/14110c?text=Mealie+Meal" },
          { name: "2L Cooking Oil", price: "$4.00", sku: "GR-002", image: "https://placehold.co/300x300/fff8ec/14110c?text=Cooking+Oil" },
          { name: "1kg Sugar", price: "$1.80", sku: "GR-003", image: "https://placehold.co/300x300/fff8ec/14110c?text=Sugar" },
          { name: "Washing Powder 2kg", price: "$3.20", sku: "GR-004", image: "https://placehold.co/300x300/fff8ec/14110c?text=Washing+Powder" },
        ],
      },
      about: {
        headline: "Family-run since 2014",
        body: "Chikwiya Grocers has served the neighbourhood for over a decade — same fair prices, same friendly service.",
        credentials: ["Layby available on bulk orders", "EcoCash & cash accepted", "Free delivery over $30"],
      },
      contact: {
        address: "22 Chikwiya Rd, Harare",
        phone: "+263 77 987 6543",
        email: "orders@chikwiyagrocers.rivo.app",
        hours: {
          mon: { open: "08:00", close: "18:00" },
          tue: { open: "08:00", close: "18:00" },
          wed: { open: "08:00", close: "18:00" },
          thu: { open: "08:00", close: "18:00" },
          fri: { open: "08:00", close: "18:00" },
          sat: { open: "08:00", close: "16:00" },
        },
      },
    },
  },
};
