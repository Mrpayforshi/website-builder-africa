// Single source of truth for every Solutions menu (SiteNav + home page) and
// the /solutions/[slug] pages. "For work" and "Founders" keep bespoke pages.

export type SolutionItem = { title: string; desc: string; href: string };

type Tone = "vBlue" | "vPink" | "vOrange" | "vViolet" | "vSunset";

export type SolutionPage = {
  slug: string;
  title: string;
  desc: string;
  group: "team" | "industry" | "use";
  eyebrow: string;
  headA: string;
  headB: string;
  lede: string;
  features: { title: string; body: string; chips: string[]; tone: Tone }[];
  ctaTitle: string;
};

export const SOLUTION_PAGES: SolutionPage[] = [
  // ───────────── Teams ─────────────
  {
    slug: "marketing",
    title: "Marketing",
    desc: "If you can picture it, build it.",
    group: "team",
    eyebrow: "Rivo for marketing",
    headA: "Launch campaigns",
    headB: "faster",
    lede: "Promo pages, seasonal offers and event landing pages, built from a chat and live the same day, with orders landing on WhatsApp.",
    features: [
      { title: "Campaign pages in an afternoon", body: "Describe the offer and Rivo builds a focused landing page you can tweak by clicking straight on it.", chips: ["Promo pages", "Seasonal offers", "Event pages"], tone: "vPink" },
      { title: "Every visitor one tap from buying", body: "WhatsApp order buttons and EcoCash checkout sit on the page, so interest turns into orders without a detour.", chips: ["WhatsApp CTA", "EcoCash", "Order form"], tone: "vBlue" },
      { title: "Keep what works", body: "Duplicate last month's best page, change the offer and publish again.", chips: ["Templates", "Duplicate", "Republish"], tone: "vSunset" },
    ],
    ctaTitle: "Build your next campaign page",
  },
  {
    slug: "sales",
    title: "Sales",
    desc: "Build the room for the deal.",
    group: "team",
    eyebrow: "Rivo for sales",
    headA: "Close deals from",
    headB: "one link",
    lede: "Give every customer a catalogue, a price list and a way to order or pay a deposit, without waiting on a developer.",
    features: [
      { title: "Catalogues that sell", body: "Product pages with prices and photos you can send on WhatsApp, always in sync with your stock.", chips: ["Catalogue", "Price lists", "Live stock"], tone: "vBlue" },
      { title: "From quote to order", body: "Customers choose what they want and confirm in WhatsApp, and the order reaches your dashboard with their details.", chips: ["Order form", "Customer details", "Order list"], tone: "vPink" },
      { title: "Deposits and layby", body: "Let buyers reserve with a deposit and pay the rest in instalments.", chips: ["Deposit", "Layby", "Balance"], tone: "vOrange" },
    ],
    ctaTitle: "Give your sales team a storefront",
  },
  {
    slug: "customer-support",
    title: "Customer support",
    desc: "Answer once, serve everyone.",
    group: "team",
    eyebrow: "Rivo for customer support",
    headA: "Fewer questions,",
    headB: "faster answers",
    lede: "Put your hours, location, delivery areas and order status where customers look, so your team stops answering the same message all day.",
    features: [
      { title: "The answers, on the page", body: "Hours, address, delivery areas and prices on one clear page, so common questions never reach your inbox.", chips: ["Hours & map", "Delivery areas", "Prices"], tone: "vViolet" },
      { title: "Orders you can look up", body: "Find any order with the customer's details and status in a single list.", chips: ["Order list", "Status", "Customer"], tone: "vBlue" },
      { title: "Always one tap to a person", body: "Call and WhatsApp buttons on every section for the questions that need you.", chips: ["WhatsApp", "Call", "Contact"], tone: "vPink" },
    ],
    ctaTitle: "Cut the repeat questions",
  },
  {
    slug: "operations",
    title: "Operations",
    desc: "The spreadsheet did its best.",
    group: "team",
    eyebrow: "Rivo for operations",
    headA: "Make the spreadsheet",
    headB: "an app",
    lede: "Orders, stock and deliveries in one place instead of three notebooks and a WhatsApp group.",
    features: [
      { title: "One list for every order", body: "Orders from your site and WhatsApp arrive in the same dashboard, ready to prepare and dispatch.", chips: ["Order list", "Status", "Assign"], tone: "vOrange" },
      { title: "Inventory that stays in sync", body: "Mark items sold out and they come off the storefront and the order form together.", chips: ["Inventory sync", "Sold out", "Low stock"], tone: "vBlue" },
      { title: "Delivery without the chaos", body: "Choose rider delivery or collection per order, and keep going through load-shedding with a low-bandwidth mode.", chips: ["Rider delivery", "Collection", "Low-bandwidth"], tone: "vSunset" },
    ],
    ctaTitle: "Put operations on one dashboard",
  },
  {
    slug: "finance",
    title: "Finance",
    desc: "Stop emailing the model around.",
    group: "team",
    eyebrow: "Rivo for finance",
    headA: "Know what came in,",
    headB: "every day",
    lede: "Payments tied to the order they belong to, and invoices created from orders without retyping a thing.",
    features: [
      { title: "Payments matched to orders", body: "EcoCash payments and layby instalments are recorded against each order, so reconciling is a glance, not an evening.", chips: ["EcoCash", "Layby", "Per-order"], tone: "vBlue" },
      { title: "Invoices from orders", body: "Turn an order into an invoice in one step.", chips: ["Invoicing", "From order", "Customer"], tone: "vViolet" },
      { title: "Prices in the currency you trade in", body: "Show and settle in USD or ZiG, with one dashboard to see it all.", chips: ["USD", "ZiG", "One dashboard"], tone: "vOrange" },
    ],
    ctaTitle: "Bring your payments together",
  },
  {
    slug: "project-managers",
    title: "Project managers",
    desc: "Plans everyone can see.",
    group: "team",
    eyebrow: "Rivo for project managers",
    headA: "Ship the client site,",
    headB: "on schedule",
    lede: "Build and hand over websites for your clients without waiting on a dev queue, and keep every change visible and under control.",
    features: [
      { title: "From brief to live site", body: "Paste the client's brief or attach their references. Rivo drafts the site and you refine it with the client in the room.", chips: ["Chat to build", "Attach references", "Templates"], tone: "vViolet" },
      { title: "Nothing goes live by accident", body: "Edits stay in draft until you publish, and edits from the chat and the dashboard can't silently overwrite each other.", chips: ["Draft", "Publish", "Version safe"], tone: "vBlue" },
      { title: "Hand over cleanly", body: "Give each client their own site, orders and dashboard, ready to run once you step back.", chips: ["Client sites", "Own dashboard", "Handover"], tone: "vSunset" },
    ],
    ctaTitle: "Deliver your next client site faster",
  },
  {
    slug: "designers",
    title: "Designers",
    desc: "Screens aren't enough. Ship the real thing.",
    group: "team",
    eyebrow: "Rivo for designers",
    headA: "Your design,",
    headB: "live",
    lede: "Turn a design into a working storefront: pick a template, set the type and colour, and publish a site customers can order from.",
    features: [
      { title: "Design directly on the page", body: "Click any text, then adjust spacing, typography and colour with visual controls.", chips: ["Spacing", "Typography", "Colour"], tone: "vPink" },
      { title: "Start from a real design", body: "Begin with a template built for your kind of business, or attach a reference and have Rivo match it.", chips: ["Templates", "Attach reference"], tone: "vViolet" },
      { title: "Handed over working", body: "Orders, WhatsApp and EcoCash are switches, so the design ships already working.", chips: ["WhatsApp", "EcoCash", "Publish"], tone: "vSunset" },
    ],
    ctaTitle: "Ship your next design for real",
  },

  // ───────────── Industries ─────────────
  {
    slug: "shops-retail",
    title: "Shops & retail",
    desc: "Sell online in a day.",
    group: "industry",
    eyebrow: "Rivo for shops & retail",
    headA: "Open your shop",
    headB: "online",
    lede: "From a corner grocer to a fashion boutique: list your products, take orders on WhatsApp and get paid with EcoCash.",
    features: [
      { title: "A storefront that fills itself", body: "Tell Rivo what you sell and it builds a product grid with prices, photos and categories you can edit any time.", chips: ["Product grid", "Categories", "Prices"], tone: "vBlue" },
      { title: "Orders land on WhatsApp", body: "Customers pick items, check out, and the order reaches you with their name, phone and delivery details.", chips: ["WhatsApp ordering", "Delivery or pickup"], tone: "vPink" },
      { title: "Stock that stays honest", body: "Mark an item sold out and it disappears from the storefront and the WhatsApp order form.", chips: ["Inventory sync", "Sold out", "Low stock"], tone: "vOrange" },
    ],
    ctaTitle: "Put your shop online this week",
  },
  {
    slug: "restaurants-cafes",
    title: "Restaurants & cafés",
    desc: "Menus that take orders.",
    group: "industry",
    eyebrow: "Rivo for restaurants & cafés",
    headA: "A menu that",
    headB: "takes orders",
    lede: "Publish your menu, take orders on WhatsApp and send them out for delivery, with no marketplace commission.",
    features: [
      { title: "Your menu, beautifully laid out", body: "Sections, prices, photos and daily specials. Change the day's menu in one sentence.", chips: ["Menu sections", "Specials", "Photos"], tone: "vOrange" },
      { title: "An order form inside WhatsApp", body: "Customers choose items and quantities, enter their address and confirm without leaving WhatsApp.", chips: ["Menu screen", "Checkout", "Confirmation"], tone: "vPink" },
      { title: "Rider delivery on a switch", body: "Turn on rider delivery when you need it, or keep it to collection only.", chips: ["Rider delivery", "Collection"], tone: "vSunset" },
    ],
    ctaTitle: "Start taking orders tonight",
  },
  {
    slug: "services-trades",
    title: "Services & trades",
    desc: "Enquiries, not just visits.",
    group: "industry",
    eyebrow: "Rivo for services & trades",
    headA: "Show your work,",
    headB: "win jobs",
    lede: "Plumbers, electricians, salons and repair shops: list what you do and get enquiries straight to your phone.",
    features: [
      { title: "Services, clearly listed", body: "What you offer, what's included and a starting price, so people know what to ask for.", chips: ["Services list", "From-prices", "Areas served"], tone: "vBlue" },
      { title: "One tap to reach you", body: "Call and WhatsApp buttons throughout the page, so a visitor is one tap from booking you.", chips: ["Call", "WhatsApp", "Enquiry form"], tone: "vPink" },
      { title: "Look established from day one", body: "About, contact and location sections that make a one-person business look like a proper company.", chips: ["About", "Hours & map", "Contact"], tone: "vViolet" },
    ],
    ctaTitle: "Get your business found",
  },
  {
    slug: "professional-firms",
    title: "Professional firms",
    desc: "A credible site for your practice.",
    group: "industry",
    eyebrow: "Rivo for professional firms",
    headA: "A website that",
    headB: "earns trust",
    lede: "Lawyers, accountants and consultants: present your practice areas and people with a calm, credible design.",
    features: [
      { title: "Practice areas up front", body: "Say what you do and who you do it for in plain language, with room to go deeper.", chips: ["Practice areas", "Team", "Credentials"], tone: "vViolet" },
      { title: "Consultation requests", body: "Visitors book a consultation or message you on WhatsApp with the details you need.", chips: ["Consultations", "WhatsApp", "Contact form"], tone: "vBlue" },
      { title: "A design that stays out of the way", body: "Serif headings, generous spacing and a restrained palette, tuned for firms rather than shops.", chips: ["Serif type", "Muted palette"], tone: "vSunset" },
    ],
    ctaTitle: "Give your practice a proper home online",
  },
  {
    slug: "ngos-communities",
    title: "NGOs & communities",
    desc: "Share your programmes and impact.",
    group: "industry",
    eyebrow: "Rivo for NGOs & communities",
    headA: "Tell your",
    headB: "story",
    lede: "Trusts, churches, clubs and community groups: show your programmes, share photos and make it easy to get involved.",
    features: [
      { title: "Programmes and impact", body: "Describe each programme, who it serves and what it has achieved.", chips: ["Programmes", "Impact", "Stories"], tone: "vOrange" },
      { title: "A living gallery", body: "Photos from events and fieldwork, easy to refresh as your work grows.", chips: ["Gallery", "Events"], tone: "vPink" },
      { title: "Ways to get involved", body: "Volunteer, donate and contact details where supporters will look for them.", chips: ["Volunteer", "Donate", "Contact"], tone: "vBlue" },
    ],
    ctaTitle: "Help more people find your work",
  },
  {
    slug: "events-portfolios",
    title: "Events & portfolios",
    desc: "Show the work, take bookings.",
    group: "industry",
    eyebrow: "Rivo for events & portfolios",
    headA: "Let the work",
    headB: "speak",
    lede: "Photographers, wedding planners and creatives: a gallery-first site that turns admirers into bookings.",
    features: [
      { title: "Gallery-first layouts", body: "Large, fast-loading images that put your best work in front of every visitor.", chips: ["Full-bleed gallery", "Albums"], tone: "vViolet" },
      { title: "Event and wedding pages", body: "Schedule, location and details for one occasion, shared as a single link.", chips: ["Schedule", "Location", "RSVP"], tone: "vPink" },
      { title: "Bookings on WhatsApp", body: "Packages and availability on the page, with a booking message that arrives ready to answer.", chips: ["Packages", "WhatsApp booking"], tone: "vSunset" },
    ],
    ctaTitle: "Turn your portfolio into bookings",
  },

  // ───────────── Use cases ─────────────
  {
    slug: "websites",
    title: "Websites",
    desc: "From idea to live site.",
    group: "use",
    eyebrow: "Build a website with Rivo",
    headA: "From idea to",
    headB: "live site",
    lede: "Describe your business in a chat. Rivo picks a template, builds the site and publishes it on your own address.",
    features: [
      { title: "Start with a chat", body: "Tell Rivo what you do. It chooses the right template and fills it with your details.", chips: ["Chat to build", "Template match", "Attach references"], tone: "vBlue" },
      { title: "Edit right on the page", body: "Click any text to rewrite it, then adjust spacing, type and colour with visual controls.", chips: ["Click to edit", "Typography", "Colour"], tone: "vViolet" },
      { title: "Publish in one click", body: "Hosting, SSL and your database are handled. Go live, or pull back to draft whenever you like.", chips: ["Hosting", "SSL", "Draft / Publish"], tone: "vSunset" },
    ],
    ctaTitle: "Build your website today",
  },
  {
    slug: "whatsapp-ordering",
    title: "WhatsApp ordering",
    desc: "Orders where customers already are.",
    group: "use",
    eyebrow: "WhatsApp ordering",
    headA: "Take orders in",
    headB: "WhatsApp",
    lede: "Your customers already live in WhatsApp. Give them a real order form there instead of a screenshot of your price list.",
    features: [
      { title: "A real order form", body: "Customers choose items and quantities, add their details and confirm, all inside WhatsApp.", chips: ["Menu", "Checkout", "Confirmation"], tone: "vPink" },
      { title: "Always your live catalogue", body: "The form reads your inventory, so sold-out items never get ordered.", chips: ["Live inventory", "Your prices"], tone: "vBlue" },
      { title: "Orders in your dashboard", body: "Every order is saved with the customer's details, ready to prepare, dispatch and track.", chips: ["Order list", "Status", "Customer"], tone: "vOrange" },
    ],
    ctaTitle: "Switch on WhatsApp ordering",
  },
  {
    slug: "ecocash-checkout",
    title: "EcoCash checkout",
    desc: "Get paid the local way.",
    group: "use",
    eyebrow: "EcoCash checkout",
    headA: "Get paid with",
    headB: "EcoCash",
    lede: "Let customers pay with the wallet they already use, from your site or from WhatsApp, with layby for bigger purchases.",
    features: [
      { title: "Pay with a mobile number", body: "Customers enter their EcoCash number and approve the payment on their phone.", chips: ["EcoCash", "Phone approval", "Receipt"], tone: "vOrange" },
      { title: "Layby for bigger purchases", body: "Set a deposit and an instalment plan, then track who has paid and what's left.", chips: ["Layby", "Instalments", "Balance"], tone: "vPink" },
      { title: "More ways to pay, coming", body: "OneMoney, Paynow and cards are planned, so you can offer more as you grow.", chips: ["OneMoney", "Paynow", "Cards"], tone: "vViolet" },
    ],
    ctaTitle: "Start accepting EcoCash",
  },
];

const toItem = (s: SolutionPage): SolutionItem => ({
  title: s.title,
  desc: s.desc,
  href: `/solutions/${s.slug}`,
});

export const TEAM_PAGES = SOLUTION_PAGES.filter((s) => s.group === "team");

// Column 1, "Who is it for?"
export const SOLUTIONS_WHO: SolutionItem[] = [
  { title: "For work", desc: "Run on what you build.", href: "/for-work" },
  { title: "Founders", desc: "Ship before you pitch.", href: "/founders" },
  ...TEAM_PAGES.map(toItem),
];

// Column 2, "Industries & use cases"
export const SOLUTIONS_USE: SolutionItem[] = SOLUTION_PAGES.filter(
  (s) => s.group === "industry" || s.group === "use",
).map(toItem);
