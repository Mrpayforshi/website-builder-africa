// Field-level widget config for Workstream F's dashboard forms. This does
// NOT replace SECTION_FIELD_SCHEMAS (lib/templates/section-schemas.ts) as
// the source of truth for which keys are allowed per section type — it only
// tells the form which input to render for each key. Array item shapes come
// from the field comments in section-schemas.ts.

export interface ItemFieldDef {
  key: string;
  label: string;
  widget: "text" | "textarea" | "number";
}

export const PRODUCT_ITEM_FIELDS: ItemFieldDef[] = [
  { key: "name", label: "Name", widget: "text" },
  { key: "price", label: "Price", widget: "number" },
  { key: "image", label: "Image URL", widget: "text" },
  { key: "description", label: "Description", widget: "textarea" },
  { key: "sku", label: "SKU", widget: "text" },
];

export const SERVICES_ITEM_FIELDS: ItemFieldDef[] = [
  { key: "name", label: "Name", widget: "text" },
  { key: "description", label: "Description", widget: "textarea" },
  { key: "price", label: "Price", widget: "number" },
];

export const PROGRAMS_ITEM_FIELDS: ItemFieldDef[] = [
  { key: "name", label: "Name", widget: "text" },
  { key: "description", label: "Description", widget: "textarea" },
  { key: "image", label: "Image URL", widget: "text" },
];

export const GALLERY_ITEM_FIELDS: ItemFieldDef[] = [
  { key: "url", label: "Image URL", widget: "text" },
  { key: "caption", label: "Caption", widget: "text" },
];

export const MENU_ITEM_FIELDS: ItemFieldDef[] = [
  { key: "name", label: "Item name", widget: "text" },
  { key: "price", label: "Price", widget: "number" },
  { key: "description", label: "Description", widget: "textarea" },
];
