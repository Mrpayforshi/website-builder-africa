// Section schema definitions — DB-driven. The canonical structure for each
// template lives in `templates.structure` (Supabase). This file provides
// the TypeScript shapes and content validators that both the AI tool layer
// (Workstream B) and the renderer (Workstream C) validate against.

export type SectionType =
  | "hero"
  | "product_grid"
  | "menu"
  | "services_list"
  | "about"
  | "programs"
  | "gallery"
  | "contact";

export interface TemplateSectionDef {
  id: string;
  type: SectionType;
  fields: string[];
  required: boolean;
}

export interface TemplateStructure {
  sections: TemplateSectionDef[];
}

// Per-type field allowlist — validates `set_section_content` tool calls
// server-side before they're allowed to touch `content_blocks`.
export const SECTION_FIELD_SCHEMAS: Record<SectionType, string[]> = {
  hero: ["headline", "subheadline", "image"],
  product_grid: ["items"], // items[]: { name, price, image, description, sku }
  menu: ["categories"], // categories[]: { name, items[]: { name, price, description } }
  services_list: ["items"], // items[]: { name, description, price }
  about: ["headline", "body", "image", "credentials"],
  programs: ["items"], // items[]: { name, description, image }
  gallery: ["images"], // images[]: { url, caption }
  contact: ["address", "phone", "email", "hours", "map_embed"],
};

export function isKnownSectionType(type: string): type is SectionType {
  return type in SECTION_FIELD_SCHEMAS;
}

export function validateSectionContent(
  type: SectionType,
  content: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const allowedFields = SECTION_FIELD_SCHEMAS[type];
  const errors: string[] = [];

  if (!allowedFields) {
    return { valid: false, errors: [`Unknown section type: ${type}`] };
  }

  for (const key of Object.keys(content)) {
    if (!allowedFields.includes(key)) {
      errors.push(`Field "${key}" is not valid for section type "${type}"`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateAgainstStructure(
  structure: TemplateStructure,
  sectionId: string,
  content: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const sectionDef = structure.sections.find((s) => s.id === sectionId);

  if (!sectionDef) {
    return { valid: false, errors: [`Section "${sectionId}" does not exist in this template`] };
  }

  if (!isKnownSectionType(sectionDef.type)) {
    return { valid: false, errors: [`Section "${sectionId}" has unrecognized type "${sectionDef.type}"`] };
  }

  return validateSectionContent(sectionDef.type, content);
}
