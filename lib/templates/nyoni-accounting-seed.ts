import type { NyoniAccountingConfig } from "@/components/templates/nyoni-accounting";

export const nyoniAccountingSeedConfig: NyoniAccountingConfig = {
  hero: {
    brandName: "Nyoni Accounting",
    navLinks: [
      { label: "Services", href: "#services" },
      { label: "FAQ", href: "#faq" },
    ],
    signInText: "Client Portal",
    badgeText: "Chartered Accountants — Harare, Zimbabwe",
    headline: "YOUR BOOKS, TAXES AND COMPLIANCE — HANDLED, ON TIME, EVERY TIME.",
    subheadline:
      "Registered tax practitioners and bookkeepers serving SMEs and individuals across Zimbabwe — ZIMRA compliance, payroll, and monthly management accounts without the back-and-forth.",
    primaryCtaText: "Book a consultation",
    primaryCtaHref: "#contact",
    secondaryCtaText: "See our services",
    secondaryCtaHref: "#services",
    backgroundImage:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1800&q=80",
  },
  feature_grid: {
    sectionId: "services",
    sectionTitle: "WHAT WE HANDLE",
    items: [
      {
        iconPath: "M9 14l6-6M9 8h6v6",
        title: "Tax & ZIMRA compliance",
        description: "VAT, PAYE, income tax returns and QPD filings, submitted correctly and on deadline.",
      },
      {
        iconPath: "M3 3v18h18 M7 14l4-4 3 3 5-6",
        title: "Bookkeeping & accounts",
        description: "Monthly management accounts and reconciliations, in USD and ZWL, so you always know where you stand.",
      },
      {
        iconPath: "M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2 M10 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
        title: "Payroll",
        description: "Payslips, statutory deductions and NSSA/NEC returns processed accurately every pay run.",
      },
      {
        iconPath: "M12 2l8 3v6c0 5-3.5 9.4-8 11-4.5-1.6-8-6-8-11V5l8-3z M9 12l2 2 4-4",
        title: "Audit & advisory",
        description: "Statutory audits, business registration, and practical advice on structuring and growth.",
      },
    ],
  },
  faq: {
    sectionId: "faq",
    sectionTitle: "FREQUENTLY ASKED",
    defaultOpenIndex: 0,
    items: [
      {
        question: "Do you handle both USD and ZWL accounts?",
        answer:
          "Yes — we maintain multi-currency books and report in whichever currency ZIMRA and your business require, including dual reporting where applicable.",
      },
      {
        question: "Can you take over bookkeeping mid-year from another accountant?",
        answer:
          "Yes. We do a clean handover review of your existing records, close any gaps, and take over from the current period without disrupting your filings.",
      },
      {
        question: "What do you need from me to get started?",
        answer:
          "Your business registration documents, most recent financial statements or bank statements, and ZIMRA tax reference numbers. We'll guide you through the rest.",
      },
      {
        question: "Do you work with individuals, or only registered businesses?",
        answer:
          "Both — individual income tax returns and personal tax planning, as well as full SME accounting, payroll and compliance packages.",
      },
    ],
  },
  footer: {
    brandName: "Nyoni Accounting",
    tagline: "Chartered Accountants, Harare",
    showBuiltWithRivo: true,
  },
};
