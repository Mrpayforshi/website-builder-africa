import { FALLBACK_TEMPLATES } from "../data";
import {
  getGalleryTemplateWithContent,
  type GalleryTemplateDetail,
  type TemplateCard,
} from "@/lib/templates/template-store";

export interface LoadedTemplate {
  meta: TemplateCard;
  dbTemplate: GalleryTemplateDetail | null;
}

// Single source of truth for loading a template detail (by gallery id),
// shared by the full /templates/[id] page and the intercepted @modal
// route, so they always render identically.
export async function loadTemplate(id: string): Promise<LoadedTemplate | null> {
  const dbTemplate = await getGalleryTemplateWithContent(id);
  const meta = dbTemplate ?? FALLBACK_TEMPLATES.find((t) => t.id === id);

  if (!meta) return null;

  return { meta, dbTemplate };
}
