// Templates that render via a dedicated component instead of the shared
// TemplateRenderer + SECTION_COMPONENTS map. Used when a sourced design
// (nav bars, background-image heroes, etc.) can't be reproduced faithfully
// through the shared section components without changing them for every
// other template too.
//
// Content still comes from the same content_blocks / gallery_content_blocks
// data (hero/services/faq), so AI chat and the dashboard editor keep working
// against the same section ids — only the *rendering* is bespoke, not the
// data model or editing path.
//
// Two ids because two separate systems reference this design:
//  - "professional-2" — the gallery_templates id, used by the public preview page
//  - the uuid below — the real templates.id, used by live tenant sites
export const NYONI_ACCOUNTING_GALLERY_ID = "professional-2";
export const NYONI_ACCOUNTING_TEMPLATE_ID = "19b213d4-ed7b-4fd0-a73c-5ac5e2e7f33b";

export function isNyoniAccountingGalleryTemplate(id: string): boolean {
  return id === NYONI_ACCOUNTING_GALLERY_ID;
}

export function isNyoniAccountingTemplate(id: string): boolean {
  return id === NYONI_ACCOUNTING_TEMPLATE_ID;
}

// "food-1" — the gallery_templates id for Terracotta Table, used by the
// public preview page only for now. Unlike Nyoni Accounting, there is no
// live templates.id / isTerracottaTableTemplate check yet — this design is
// not currently wired into app/_sites/[businessId]/page.tsx for live tenant
// sites. Add a TERRACOTTA_TABLE_TEMPLATE_ID + a real `templates` row and an
// isTerracottaTableTemplate() check there if it should become assignable to
// live tenants, mirroring the Nyoni Accounting pattern above.
export const TERRACOTTA_TABLE_GALLERY_ID = "food-1";

export function isTerracottaTableGalleryTemplate(id: string): boolean {
  return id === TERRACOTTA_TABLE_GALLERY_ID;
}

// "ngo-2" — the gallery_templates id for Green Harare Initiative, reskinned
// with a sourced glamping/retreat-booking design ("Wild Haven"). Content
// (mission, programs, gallery, contact) is unchanged from the prior
// Green Harare Initiative template — only the rendering is new. Gallery
// preview only, same as Terracotta Table above — no live templates.id yet.
export const GREEN_HARARE_GALLERY_ID = "ngo-2";

export function isGreenHarareGalleryTemplate(id: string): boolean {
  return id === GREEN_HARARE_GALLERY_ID;
}

// "events-1" — the gallery_templates id for Rufaro Studio, replacing the
// prior "Lens & Light Photography" content entirely (new Zimbabwean
// independent-designer persona, not a preserved-content reskin). Sourced
// from a dark-mode portfolio design with a light/dark theme toggle. Gallery
// preview only, same as the two above — no live templates.id yet.
export const RUFARO_STUDIO_GALLERY_ID = "events-1";

export function isRufaroStudioGalleryTemplate(id: string): boolean {
  return id === RUFARO_STUDIO_GALLERY_ID;
}

// "ngo-1" — the gallery_templates id for Mwenje Trust, replacing the prior
// "Tariro Trust" content entirely (new Zimbabwean charity persona). Sourced
// from an editorial charity design ("Ember Foundation"): two-word serif hero,
// "Our Story" block, 3-number impact strip, Donate CTA. The stats and cta
// blocks live in gallery_content_blocks only (not in the ngo-1 structure).
// Gallery preview only, same as the others — no live templates.id yet.
export const MWENJE_TRUST_GALLERY_ID = "ngo-1";

export function isMwenjeTrustGalleryTemplate(id: string): boolean {
  return id === MWENJE_TRUST_GALLERY_ID;
}

// "services-2" — the gallery_templates id for Mvura Plumbing, replacing the
// prior generic services-2 content with a sourced plumbing/repair design
// ("Aquafix"): sticky nav with call pill, blue/lime hero with a rotating
// photo collage + rating badge, scrolling marquee strip, 3-col services
// grid, why-us stats block, auto-rotating testimonial card, lime CTA band.
// Content comes from services/about/gallery/proof/marquee/stats/
// testimonials/cta/contact — all already present on services-2's existing
// gallery_content_blocks rows, no schema change needed. Gallery preview
// only, same as the others above — no live templates.id yet.
export const MVURA_PLUMBING_GALLERY_ID = "services-2";

export function isMvuraPlumbingGalleryTemplate(id: string): boolean {
  return id === MVURA_PLUMBING_GALLERY_ID;
}

// "events-2" — the gallery_templates id for Ever After, replacing the prior
// "Bulawayo Wedding Co." planner storefront with a sourced couple's-wedding-
// site design: script-lettered photo hero, live countdown, travel & stay and
// things-to-do card grids, registry buttons, RSVP form. Extra blocks (event,
// travel, things, registry, rsvp) live in gallery_content_blocks only, not in
// the events-2 structure. Gallery preview only — no live templates.id yet.
export const EVER_AFTER_GALLERY_ID = "events-2";

export function isEverAfterGalleryTemplate(id: string): boolean {
  return id === EVER_AFTER_GALLERY_ID;
}

// "retail-1" — the gallery_templates id for Zuva Fresh, replacing the prior
// "Chikwiya Grocers" content entirely (new Harare grocery-delivery persona).
// Sourced from a green/yellow grocery design ("FreshDrop"): sticky header with
// live search + cart counter, blob hero with floating badges, category pills
// that filter the product grid, promo banner, 3-step explainer, footer with
// hours. Extra blocks (highlights, categories, promo, steps) live in
// gallery_content_blocks only, not in the retail-1 structure. Product items
// carry optional category/unit/tag/old_price fields (gallery/bespoke only —
// not in SECTION_FIELD_SCHEMAS). Gallery preview only — no live templates.id yet.
export const ZUVA_FRESH_GALLERY_ID = "retail-1";

export function isZuvaFreshGalleryTemplate(id: string): boolean {
  return id === ZUVA_FRESH_GALLERY_ID;
}

// "professional-1" — the gallery_templates id for Chirara & Partners,
// replacing the prior placeholder "Chirara Law Chambers" content (new
// Harare law-firm persona). Sourced from a dark bronze-on-green law-firm
// design ("Lexford"): sticky blurred header, portrait hero with offset frame,
// marquee strip of practice areas, accordion practice-area list, firm story
// with count-up stats, attorney grid, pull-quote, confidential consultation
// form (with WhatsApp hand-off), disclaimer bar. hero/about/services/contact
// keep the professional-1 structure; extra blocks (firm, marquee, stats,
// team, testimonial) live in gallery_content_blocks only. Gallery preview
// only — no live templates.id yet.
export const LEXFORD_GALLERY_ID = "professional-1";

export function isLexfordGalleryTemplate(id: string): boolean {
  return id === LEXFORD_GALLERY_ID;
}
