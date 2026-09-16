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
