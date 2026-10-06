// Per-element style overrides ("edit details"), stored in site_configs.color_scheme.element_styles
// keyed by the content path of the text element (e.g. "hero.headline", "products.items.2.name").
// Values are validated on the way OUT (toCss), so whatever is stored can never inject arbitrary CSS.

export interface ElementStyle {
  mx?: number; // horizontal margin, px
  my?: number; // vertical margin, px
  px?: number; // horizontal padding, px
  py?: number; // vertical padding, px
  size?: string;
  family?: string;
  weight?: string;
  align?: "left" | "center" | "right" | "justify";
  color?: string;
  bg?: string;
}

export type ElementStyles = Record<string, ElementStyle>;

export const SIZE_OPTIONS = [
  { value: "", label: "Template default" },
  { value: "0.875rem", label: "Small" },
  { value: "1rem", label: "Body" },
  { value: "1.25rem", label: "Large" },
  { value: "1.75rem", label: "Heading" },
  { value: "2.5rem", label: "Title" },
  { value: "3.5rem", label: "Display" },
];

export const FAMILY_OPTIONS = [
  { value: "", label: "Template default" },
  { value: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", label: "Sans" },
  { value: "Georgia, 'Times New Roman', serif", label: "Serif" },
  { value: "ui-monospace, SFMono-Regular, Menlo, monospace", label: "Mono" },
];

export const WEIGHT_OPTIONS = [
  { value: "", label: "Template default" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
];

const ALIGNS = new Set(["left", "center", "right", "justify"]);
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const allowed = (opts: { value: string }[], v?: string) => !!v && opts.some((o) => o.value === v);
const toPx = (n?: number) =>
  typeof n === "number" && Number.isFinite(n) ? `${Math.min(200, Math.max(0, Math.round(n)))}px` : null;

export const pathKey = (path: (string | number)[]) => path.join(".");

export function readElementStyles(colorScheme: Record<string, unknown> | null | undefined): ElementStyles {
  const raw = colorScheme?.element_styles;
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as ElementStyles) : {};
}

/** Validated CSS declarations (kebab-case property -> value) for one element's overrides. */
export function toCss(s: ElementStyle): Record<string, string> {
  const out: Record<string, string> = {};
  const mx = toPx(s.mx), my = toPx(s.my), ppx = toPx(s.px), ppy = toPx(s.py);
  if (mx) { out["margin-left"] = mx; out["margin-right"] = mx; }
  if (my) { out["margin-top"] = my; out["margin-bottom"] = my; }
  if (ppx) { out["padding-left"] = ppx; out["padding-right"] = ppx; }
  if (ppy) { out["padding-top"] = ppy; out["padding-bottom"] = ppy; }
  if (allowed(SIZE_OPTIONS, s.size)) out["font-size"] = s.size!;
  if (allowed(FAMILY_OPTIONS, s.family)) out["font-family"] = s.family!;
  if (allowed(WEIGHT_OPTIONS, s.weight)) out["font-weight"] = s.weight!;
  if (s.align && ALIGNS.has(s.align)) out["text-align"] = s.align;
  if (s.color && HEX.test(s.color)) out["color"] = s.color;
  if (s.bg && HEX.test(s.bg)) out["background-color"] = s.bg;
  return out;
}

const APPLIED = "data-rivo-styled";

const isTextLeaf = (el: HTMLElement) => Array.from(el.children).every((c) => c.tagName === "BR");

/**
 * Applies overrides to every plain-text element under `root`.
 * `keyFor` maps an element's whitespace-stripped text to its content-path key.
 * Idempotent: clears what it set last time first. Used by the editor preview and (later) the published site.
 */
export function applyElementStyles(
  root: HTMLElement,
  styles: ElementStyles,
  keyFor: (strippedText: string) => string | undefined
) {
  root.querySelectorAll<HTMLElement>(`[${APPLIED}]`).forEach((el) => {
    (el.getAttribute(APPLIED) ?? "").split(",").forEach((p) => p && el.style.removeProperty(p));
    el.removeAttribute(APPLIED);
  });
  if (!Object.keys(styles).length) return;
  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (!isTextLeaf(el)) return;
    const text = (el.textContent ?? "").replace(/\s+/g, "");
    if (!text) return;
    const key = keyFor(text);
    const style = key ? styles[key] : undefined;
    if (!style) return;
    const css = toCss(style);
    const props = Object.keys(css);
    if (!props.length) return;
    props.forEach((p) => el.style.setProperty(p, css[p]));
    el.setAttribute(APPLIED, props.join(","));
  });
}
