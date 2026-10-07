// Single source of truth for the Solutions dropdown and /solutions/[slug] pages.
// "For work" and "Founders" keep their own bespoke pages; they're listed here
// so the menu reads from one place.

export type SolutionItem = { title: string; desc: string; href: string };

type Tone = "vBlue" | "vPink" | "vOrange" | "vViolet" | "vSunset";

export type SolutionPage = {
  slug: string;
  title: string; // menu label
  desc: string; // menu description
  group: "who" | "use";
  eyebrow: string;
  headA: string;
  headB: string; // highlighted word
  lede: string;
  features: { title: string; body: string; chips: string[]; tone: Tone }[];
  ctaTitle: string;
};

export const SOLUTION_PAGES: SolutionPage[] = [
  {
    slug: "shops-retail",
    title: "Shops & retail",
    desc: "Sell online in a day.",
    group: "who",
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
    group: "who",
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
    group: "who",
    eyebrow: "Rivo for services & trades",
    headA: "Show your work,",
    headB: "win jobs",
    lede: "Plumbers, electricians, salons and repair shops: list what you do and get enquiries straight to your phone.",
    features: [
      { title: "Services, clearly listed", body: "A list of what you offer with what's included and a starting price, so people know what to ask for.", chips: ["Services list", "From-prices", "Areas served"], tone: "vBlue" },
      { title: "One tap to reach you", body: "Call and WhatsApp buttons sit throughout the page, so a visitor is one tap from booking you.", chips: ["Call", "WhatsApp", "Enquiry form"], tone: "vPink" },
      { title: "Look established from day one", body: "About, contact and location sections that make a one-person business look like a proper company.", chips: ["About", "Hours & map", "Contact"], tone: "vViolet" },
    ],
    ctaTitle: "Get your business found",
  },
  {
    slug: "professional-firms",
    title: "Professional firms",
    desc: "A credible site for your practice.",
    group: "who",
    eyebrow: "Rivo for professional firms",
    headA: "A website that",
    headB: "earns trust",
    lede: "Lawyers, accountants and consultants: present your practice areas and people with a calm, credible design.",
    features: [
      { title: "Practice areas up front", body: "Say what you do and who you do it for in plain language, with room to go deeper.", chips: ["Practice areas", "Team", "Credentials"], tone: "vViolet" },
      { title: "Consultation requests", body: "Visitors book a consultation or message you on WhatsApp with the details you need to qualify them.", chips: ["Consultations", "WhatsApp", "Contact form"], tone: "vBlue" },
      { title: "A design that stays out of the way", body: "Serif headings, generous spacing and a restrained palette, tuned for firms rather than shops.", chips: ["Serif type", "Muted palette"], tone: "vSunset" },
    ],
    ctaTitle: "Give your practice a proper home online",
  },
  {
    slug: "ngos-communities",
    title: "NGOs & communities",
    desc: "Share your programmes and impact.",
    group: "who",
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
    group: "who",
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

export const SOLUTIONS_WHO: SolutionItem[] = [
  { title: "For work", desc: "Run on what you build.", href: "/for-work" },
  { title: "Founders", desc: "Ship before you pitch.", href: "/founders" },
  ...SOLUTION_PAGES.filter((s) => s.group === "who").map((s) => ({
    title: s.title,
    desc: s.desc,
    href: `/solutions/${s.slug}`,
  })),
];

export const SOLUTIONS_USE: SolutionItem[] = SOLUTION_PAGES.filter((s) => s.group === "use").map((s) => ({
  title: s.title,
  desc: s.desc,
  href: `/solutions/${s.slug}`,
}));
