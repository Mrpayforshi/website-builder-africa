// lib/resources/content.ts
// Content for the public Resources pages: Guides, Docs and Blog.
// Everything here is plain text so it can be edited without touching any
// page code. Keep statements to what Rivo actually does today.

export type Block =
  | { t: "p"; text: string }
  | { t: "h2"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "note"; text: string };

export interface Article {
  slug: string;
  title: string;
  summary: string;
  category: string;
  /** Reading time in minutes. */
  minutes: number;
  /** ISO date, used by blog posts only. */
  date?: string;
  body: Block[];
}

/* ------------------------------------------------------------------ */
/* Guides                                                              */
/* ------------------------------------------------------------------ */

export const GUIDES: Article[] = [
  {
    slug: "launch-your-site",
    title: "Launch your first site",
    summary: "Go from a one-line description to a live site on your own Rivo address.",
    category: "Getting started",
    minutes: 5,
    body: [
      {
        t: "p",
        text: "Rivo builds your site from a conversation. You describe the business, Rivo asks the questions it needs, and your site fills in as you answer.",
      },
      { t: "h2", text: "1. Describe your business" },
      {
        t: "p",
        text: "From your dashboard, type a sentence or two into the box that says “Describe the business you want to build…” and press Build. For example: “I run a bakery in Avondale and want customers to order on WhatsApp.”",
      },
      { t: "h2", text: "2. Answer Rivo’s questions" },
      {
        t: "p",
        text: "Rivo asks for your business name and type, what you sell or offer, how customers can reach you and your opening hours. It also asks whether you want WhatsApp ordering, EcoCash checkout, layby and delivery, and suggests a colour scheme that suits your kind of business for you to accept or adjust.",
      },
      {
        t: "note",
        text: "Rivo only treats a detail as saved once it has actually recorded it on your site. If something is missing from the preview, tell Rivo again.",
      },
      { t: "h2", text: "3. Check the preview" },
      {
        t: "p",
        text: "Your site appears on the right while the chat stays on the left. Preview shows the site the way a visitor sees it. Edit lets you click straight on the page to change things.",
      },
      { t: "h2", text: "4. Publish" },
      {
        t: "p",
        text: "While you work, your site is a draft that only you can see. When you are happy with it, press Publish in the top bar and it goes live at your Rivo address. Press Unpublish at any time to take it back to draft.",
      },
      {
        t: "p",
        text: "You can find your address, and a button to copy it, under More, then Domain.",
      },
    ],
  },
  {
    slug: "edit-your-site",
    title: "Change your site after it is built",
    summary: "Three ways to edit: ask in chat, click on the page, or use simple forms.",
    category: "Getting started",
    minutes: 4,
    body: [
      {
        t: "p",
        text: "There are three ways to change your site. Pick whichever is quickest for the job.",
      },
      { t: "h2", text: "Ask in chat" },
      {
        t: "p",
        text: "Chat is good for changes you can say in a sentence, such as “change my hours to 9 to 6” or “update the price of the large loaf to $4”. Rivo turns your request into the smallest change that does the job. If a request is vague, like “make it nicer”, Rivo asks what you mean instead of guessing.",
      },
      { t: "h2", text: "Click on the page" },
      {
        t: "p",
        text: "Open the Edit tab, then click any text on your page to rewrite it. Visual controls let you adjust spacing, typography and colour, and you see the result straight away.",
      },
      { t: "h2", text: "Use the forms" },
      {
        t: "p",
        text: "Each section of your site also has a simple form for fields such as prices, text and opening hours. Forms save straight to your site without going through the chat.",
      },
      {
        t: "note",
        text: "Chat edits and form edits share the same version check, so one can never silently overwrite the other. If something was changed in two places at once, Rivo asks you to review and try again instead of losing work.",
      },
    ],
  },
  {
    slug: "whatsapp-ordering",
    title: "Take orders on WhatsApp",
    summary: "Two ways to let customers order where they already chat.",
    category: "Orders and payments",
    minutes: 4,
    body: [
      {
        t: "p",
        text: "Most of your customers are already on WhatsApp. Rivo gives you two ways to take orders there.",
      },
      { t: "h2", text: "Order button (free)" },
      {
        t: "p",
        text: "A button on your site opens WhatsApp with an order message already written, such as “Hi, I’d like to order…” with the item filled in. The customer taps send and the conversation is with you directly.",
      },
      { t: "h2", text: "WhatsApp Flow ordering (paid add-on)" },
      {
        t: "p",
        text: "Customers browse your live catalogue and check out inside WhatsApp without visiting your website. It is a paid add-on, so check the Connectors page for its current status.",
      },
      { t: "h2", text: "Turn it on" },
      {
        t: "ol",
        items: [
          "Open Connectors from your dashboard.",
          "Switch on WhatsApp ordering. You can also tell the chat: “turn on WhatsApp ordering”.",
          "If Rivo does not have your business WhatsApp number yet, it will ask you for it.",
        ],
      },
    ],
  },
  {
    slug: "get-paid-ecocash",
    title: "Take EcoCash payments",
    summary: "How EcoCash checkout works and where paid orders show up.",
    category: "Orders and payments",
    minutes: 4,
    body: [
      {
        t: "p",
        text: "EcoCash checkout lets customers pay for an order with mobile money. Payments are processed through Paynow, so every payment is confirmed by Paynow and recorded against its order.",
      },
      { t: "h2", text: "Switch it on" },
      {
        t: "p",
        text: "Open Connectors and switch on EcoCash checkout, or ask the chat to turn it on. Rivo asks for any setup details it still needs before it enables the feature.",
      },
      { t: "h2", text: "What happens when a customer pays" },
      {
        t: "ol",
        items: [
          "The customer chooses EcoCash at checkout.",
          "They approve the payment prompt on their phone.",
          "Paynow tells Rivo the payment went through.",
          "The order is marked paid and appears in your Orders.",
        ],
      },
      {
        t: "note",
        text: "If a customer closes the page before the confirmation arrives, the order is still marked paid when Paynow confirms it, and it still shows in Orders for you and your staff.",
      },
      { t: "h2", text: "Work the orders" },
      {
        t: "p",
        text: "Open Orders from More, then Settings. You can assign each order to a team member, and every status change is recorded.",
      },
    ],
  },
  {
    slug: "layby-plans",
    title: "Offer layby",
    summary: "Let customers reserve with a deposit and pay the rest over time.",
    category: "Orders and payments",
    minutes: 5,
    body: [
      {
        t: "p",
        text: "Layby lets a customer reserve something with a deposit and pay the rest in instalments. You decide the terms.",
      },
      { t: "h2", text: "Your terms" },
      {
        t: "ul",
        items: [
          "Deposit: the percentage paid up front.",
          "Payment schedule: weekly, every two weeks or every 30 days, and how many instalments.",
          "Forfeiture policy: what happens if payments stop.",
        ],
      },
      {
        t: "p",
        text: "Switch layby on under Connectors first, then set your terms by asking the chat, for example: “set layby to 20% deposit, paid weekly”.",
      },
      { t: "h2", text: "How a plan runs" },
      {
        t: "ol",
        items: [
          "The customer chooses layby at checkout and pays the deposit.",
          "Rivo builds a schedule of due dates from the balance that remains after the deposit. The final instalment absorbs any rounding.",
          "The item is set aside from your available stock so nobody else can buy it.",
          "Each payment is logged against the plan.",
          "When the last payment arrives the plan is completed and the item goes to the customer.",
        ],
      },
      { t: "h2", text: "When someone misses payments" },
      {
        t: "p",
        text: "After a missed payment the plan has a grace period. Once it passes, the plan is forfeited. The cutoff is counted to the end of the day in your local timezone (Africa/Harare unless set otherwise), and Rivo checks for overdue plans every day.",
      },
    ],
  },
  {
    slug: "deliver-with-riders",
    title: "Deliver orders with riders",
    summary: "A WhatsApp broadcast that lets the first available rider claim each delivery.",
    category: "Orders and payments",
    minutes: 4,
    body: [
      {
        t: "p",
        text: "Rivo delivery works like a broadcast. When an order is ready, available riders are told about it on WhatsApp and the first to claim it gets the job.",
      },
      { t: "h2", text: "How it works" },
      {
        t: "ol",
        items: [
          "The order is marked ready for delivery.",
          "Rivo messages available riders on WhatsApp with the order details.",
          "The first rider to claim it gets the delivery. The others are told it has been taken.",
          "The rider updates the status by replying on WhatsApp as they pick up and deliver.",
          "Each status change shows against the order.",
        ],
      },
      { t: "h2", text: "What riders need" },
      {
        t: "p",
        text: "Riders do not install an app. They work entirely inside WhatsApp, so any rider with a phone can take jobs.",
      },
      { t: "h2", text: "If nobody claims it" },
      {
        t: "p",
        text: "Rivo checks open broadcasts every few minutes and flags deliveries that nobody has claimed, so you can reassign them.",
      },
      {
        t: "note",
        text: "Tracking is status-based: claimed, picked up, delivered. Live GPS tracking is not part of Rivo yet.",
      },
    ],
  },
  {
    slug: "load-shedding-and-slow-connections",
    title: "Stay useful during load-shedding and on slow data",
    summary: "A status banner you control, plus a lighter version of your site.",
    category: "Local-ready",
    minutes: 3,
    body: [
      {
        t: "p",
        text: "Power cuts and expensive data are part of doing business here. Two optional features help your site cope.",
      },
      { t: "h2", text: "Load-shedding banner" },
      {
        t: "p",
        text: "You set the banner yourself. Choose one of three states: open as usual, limited hours, or closed. Each comes with a default message that you can reword. The banner stays as you set it until you change it.",
      },
      {
        t: "note",
        text: "Rivo does not read power cut schedules automatically. The banner only says what you tell it to say.",
      },
      { t: "h2", text: "Low-bandwidth mode" },
      {
        t: "p",
        text: "Low-bandwidth mode serves a lighter version of your site, with less to download, for visitors on slow or costly data. Visitors can also choose the lite version themselves.",
      },
      { t: "h2", text: "Turn them on" },
      {
        t: "p",
        text: "Open Connectors and switch on Load-shedding banner or Low-bandwidth mode, or ask the chat to do it for you.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Docs                                                                */
/* ------------------------------------------------------------------ */

export interface DocSection {
  title: string;
  slugs: string[];
}

export const DOC_SECTIONS: DocSection[] = [
  { title: "Start here", slugs: ["how-rivo-works", "publishing"] },
  { title: "Your site", slugs: ["site-data", "chat-tools"] },
  { title: "Run your business", slugs: ["feature-toggles", "orders-and-payments"] },
];

export const DOCS: Article[] = [
  {
    slug: "how-rivo-works",
    title: "How Rivo works",
    summary: "The big picture: sites as data, templates, and where you work.",
    category: "Start here",
    minutes: 3,
    body: [
      {
        t: "p",
        text: "Rivo is one platform that runs many businesses’ sites. Each business gets its own site address, its own data and its own settings.",
      },
      { t: "h2", text: "Sites are data, not code" },
      {
        t: "p",
        text: "Your site is stored as structured content (text, prices, images, hours), a colour scheme and a template. Rivo draws the page from that data every time someone visits, so changing the data changes the page straight away. There is nothing to rebuild or redeploy.",
      },
      { t: "h2", text: "Templates" },
      {
        t: "p",
        text: "Rivo has templates for six kinds of business: retail, services, food, professional, NGO and community, and events and portfolio. A template decides which sections your site has, and your data fills them in.",
      },
      { t: "h2", text: "Where you work" },
      {
        t: "ul",
        items: [
          "Chat, always on the left, for describing and changing things in words.",
          "Preview, to see your site as a visitor does.",
          "Edit, to click on the page and change text and styling.",
          "Code, a read-only view of your site’s data.",
          "More, for analytics, your domain, connectors and settings.",
        ],
      },
    ],
  },
  {
    slug: "publishing",
    title: "Publishing and your site address",
    summary: "Draft versus live, and what visitors see in each case.",
    category: "Start here",
    minutes: 2,
    body: [
      { t: "h2", text: "Draft and live" },
      {
        t: "p",
        text: "Every site is either a draft or live. A draft can be seen only by you. A live site can be opened by anyone with the address. The top bar shows the current state, and one button switches it: Publish when it is a draft, Unpublish when it is live.",
      },
      { t: "h2", text: "Your address" },
      {
        t: "p",
        text: "Each site lives at its own address on Rivo. You can see it, copy it and open it under More, then Domain.",
      },
      { t: "h2", text: "What visitors see otherwise" },
      {
        t: "ul",
        items: [
          "If an address does not belong to any site, visitors see a “site not found” page.",
          "If a site exists but is not published or is unavailable, visitors see a “site unavailable” page.",
        ],
      },
      {
        t: "note",
        text: "Using your own domain name is not self-serve yet.",
      },
    ],
  },
  {
    slug: "site-data",
    title: "Your site’s data",
    summary: "Content, colour scheme, versions and the read-only Code tab.",
    category: "Your site",
    minutes: 3,
    body: [
      { t: "h2", text: "Content" },
      {
        t: "p",
        text: "Each section of your site has an entry in your content. Section types include hero, about, products, menu, services, programmes, gallery, FAQ and contact. Which ones you have depends on your template.",
      },
      { t: "h2", text: "Colour scheme" },
      {
        t: "p",
        text: "Your colours are stored separately from your content, so you can change the look without touching a word of text.",
      },
      { t: "h2", text: "Versions" },
      {
        t: "p",
        text: "Every save increases your site’s version number. A save made against an older version is rejected, which is what stops the chat and the forms from silently overwriting each other.",
      },
      { t: "h2", text: "The Code tab" },
      {
        t: "p",
        text: "Code shows your site’s data files: content, colour scheme, template structure and feature settings. It is read-only and meant for checking what is stored. It is not exported website code.",
      },
    ],
  },
  {
    slug: "chat-tools",
    title: "What the chat can change",
    summary: "The seven actions Rivo’s chat can take, and the rules around them.",
    category: "Your site",
    minutes: 3,
    body: [
      {
        t: "p",
        text: "The chat never writes into your site directly. It asks for one of a fixed set of actions, Rivo checks the request, and only then is anything saved.",
      },
      { t: "h2", text: "The actions" },
      {
        t: "ul",
        items: [
          "set_business_info: business name, description, category and contact details.",
          "set_color_scheme: primary, secondary and accent colours.",
          "set_section_content: the content of one section, checked against your template.",
          "toggle_feature: switch a connector on or off.",
          "set_layby_config: deposit, schedule and forfeiture policy. Only works once layby is switched on.",
          "set_hours: opening and closing times for a day.",
          "publish_site: takes your site live. Only works once the required sections have content.",
        ],
      },
      { t: "h2", text: "The rules" },
      {
        t: "ul",
        items: [
          "A request that points at a section your template does not have is refused, and Rivo tells you.",
          "A feature that needs setup details cannot be switched on until Rivo has them.",
          "Vague requests get a question back, not a guess.",
        ],
      },
      { t: "h2", text: "Attaching references" },
      {
        t: "p",
        text: "You can attach photos, screenshots, PDFs, HTML pages and text files as inspiration, for example a photo of a menu to read prices from. Rivo treats everything inside an attachment as information to look at, never as instructions. Rivo cannot yet place an uploaded file onto your site itself.",
      },
    ],
  },
  {
    slug: "feature-toggles",
    title: "Features and connectors",
    summary: "Every switch available per business, and how they behave.",
    category: "Run your business",
    minutes: 3,
    body: [
      {
        t: "p",
        text: "Each business has its own set of switches. Turning one on or off affects only your site. Manage them under Connectors, or ask the chat.",
      },
      { t: "h2", text: "What you can switch on" },
      {
        t: "ul",
        items: [
          "WhatsApp ordering: an order button that opens WhatsApp with a message ready.",
          "WhatsApp Flow ordering: customers browse and check out inside WhatsApp (paid add-on).",
          "EcoCash checkout: mobile money payments at checkout.",
          "Layby plans: deposit plus scheduled instalments.",
          "Rider delivery: delivery zones and rider handoff.",
          "Inventory sync: stock counts kept in step with orders.",
          "Receipts and invoicing: generated for every order.",
          "Google Maps sync: your location and directions from live map data.",
          "Load-shedding banner: a status banner you control.",
          "Low-bandwidth mode: a lighter version of your site.",
        ],
      },
      {
        t: "note",
        text: "A feature that needs setup details, such as a payment account, cannot be enabled until those details exist.",
      },
    ],
  },
  {
    slug: "orders-and-payments",
    title: "Orders and payments",
    summary: "How orders are recorded, paid, assigned and tracked.",
    category: "Run your business",
    minutes: 3,
    body: [
      { t: "h2", text: "Orders" },
      {
        t: "p",
        text: "Every order is stored with its items, total and payment status. Staff can be assigned to orders, and each status change is recorded as an event so you can see what happened and when.",
      },
      { t: "h2", text: "Payments" },
      {
        t: "p",
        text: "Payments, including EcoCash, are processed through Paynow. Paynow confirms each payment to Rivo, and the order is marked paid whether or not the customer is still on the page.",
      },
      { t: "h2", text: "Layby" },
      {
        t: "p",
        text: "A layby order has a plan with a deposit, a schedule of due dates and a payment log. Overdue plans are checked daily, and the forfeiture cutoff is the end of the day in your local timezone.",
      },
      { t: "h2", text: "Delivery" },
      {
        t: "p",
        text: "Delivery orders are broadcast to riders on WhatsApp, claimed by the first rider to respond and tracked by status.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Blog                                                                */
/* ------------------------------------------------------------------ */

export const POSTS: Article[] = [
  {
    slug: "introducing-rivo",
    title: "Introducing Rivo: describe your business, get a working site",
    summary: "Why we are building a website builder around WhatsApp, mobile money and local realities.",
    category: "Product",
    minutes: 3,
    date: "2026-10-07",
    body: [
      {
        t: "p",
        text: "Most small businesses in Zimbabwe already run on WhatsApp and mobile money. Their websites, if they have one, usually do not. Rivo is built to close that gap.",
      },
      { t: "h2", text: "Describe it, and it is built" },
      {
        t: "p",
        text: "You tell Rivo about your business in a chat. It asks follow-up questions, suggests a colour scheme and builds your site from a template made for your kind of business. Then you refine it by chat, by clicking on the page or with simple forms.",
      },
      { t: "h2", text: "Built for how business works here" },
      {
        t: "ul",
        items: [
          "WhatsApp ordering, so customers order where they already chat.",
          "EcoCash checkout, processed through Paynow.",
          "Layby, with deposits, schedules and held stock.",
          "Rider delivery that runs entirely on WhatsApp.",
          "A load-shedding banner you control, and a lighter version of your site for slow data.",
        ],
      },
      { t: "h2", text: "What comes next" },
      {
        t: "p",
        text: "This is the start. Templates, connectors and these resource pages will keep growing. The best way to shape them is to build a site and see what is missing.",
      },
    ],
  },
  {
    slug: "layby-for-online-shops",
    title: "Layby, online: how Rivo handles pay-over-time",
    summary: "Deposits, schedules, held stock and a fair cutoff, without the spreadsheet.",
    category: "Product",
    minutes: 3,
    date: "2026-10-07",
    body: [
      {
        t: "p",
        text: "Layby is how many people buy things that matter: put down a deposit, pay over time, collect when it is paid. It is rare online because it is hard to run. You have to hold stock, track every payment and decide what happens when someone stops paying. Rivo handles the moving parts so you only set the terms.",
      },
      { t: "h2", text: "Three decisions are yours" },
      {
        t: "ul",
        items: [
          "The deposit, as a percentage of the price.",
          "The schedule: weekly, every two weeks or every 30 days.",
          "The forfeiture policy: what happens when payments stop.",
        ],
      },
      { t: "h2", text: "Stock is held, not sold" },
      {
        t: "p",
        text: "While a plan is active the item is set aside from your available stock, so a second customer cannot buy something that is already promised. When the final payment lands, the plan completes and the item goes to the customer.",
      },
      { t: "h2", text: "A clear end date" },
      {
        t: "p",
        text: "Overdue plans are checked every day. The cutoff is counted to the end of the day in your local timezone, so a payment made late on its due date still counts.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */

export const getGuide = (slug: string) => GUIDES.find((a) => a.slug === slug);
export const getDoc = (slug: string) => DOCS.find((a) => a.slug === slug);
export const getPost = (slug: string) => POSTS.find((a) => a.slug === slug);

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
