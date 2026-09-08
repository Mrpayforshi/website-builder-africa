// Re-exports the gallery data from the single source of truth
// (lib/templates/template-store.ts) so this route's imports stay stable
// without duplicating FALLBACK_TEMPLATES/CATEGORIES/getGalleryTemplateCards
// here. See template-store.ts for the DB-merge logic.

export type { TemplateCard } from "@/lib/templates/template-store";
export {
  FALLBACK_TEMPLATES,
  CATEGORIES,
  getGalleryTemplateCards,
} from "@/lib/templates/template-store";
