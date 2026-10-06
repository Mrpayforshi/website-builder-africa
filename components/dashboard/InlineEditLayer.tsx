"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { applyElementStyles, pathKey, type ElementStyles } from "@/lib/dashboard/element-styles";

type Path = (string | number)[];
type Target = { path: Path; paragraph?: number };
type Saved = { node: Node; data: string | null };

const SKIP_KEYS = new Set([
  "image", "images", "img", "photo", "src", "url", "href", "link",
  "icon", "id", "slug", "map_embed", "video", "color",
]);

const strip = (s: string) => s.replace(/\s+/g, "");

function add(map: Map<string, Target[]>, key: string, t: Target) {
  if (!key) return;
  const list = map.get(key);
  if (list) list.push(t);
  else map.set(key, [t]);
}

// Index every editable string in contentBlocks by its whitespace-stripped text.
function collect(node: unknown, path: Path, out: Map<string, Target[]>) {
  if (typeof node === "string") {
    const text = node.trim();
    if (text.length < 2 || /^(https?:|data:|\/)/i.test(text)) return;
    add(out, strip(text), { path });
    const paras = node.split(/\n{2,}/);
    if (paras.length > 1) paras.forEach((p, i) => add(out, strip(p), { path, paragraph: i }));
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => collect(v, [...path, i], out));
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (!SKIP_KEYS.has(k)) collect(v, [...path, k], out);
    }
  }
}

function getIn(obj: unknown, path: Path): unknown {
  return path.reduce<unknown>((acc, k) => (acc as Record<string | number, unknown> | undefined)?.[k], obj);
}

function setIn(obj: unknown, path: Path, value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const clone: Record<string | number, unknown> = Array.isArray(obj)
    ? ([...obj] as unknown as Record<string | number, unknown>)
    : { ...((obj as Record<string, unknown>) ?? {}) };
  clone[head] = setIn(clone[head], rest, value);
  return clone;
}

// Only plain text elements (text + <br>) are editable; anything with nested markup is skipped.
const isTextLeaf = (el: HTMLElement) => Array.from(el.children).every((c) => c.tagName === "BR");

function findMatch(start: Element | null, root: HTMLElement, map: Map<string, Target[]>) {
  let el: Element | null = start;
  while (el && el !== root) {
    if (el instanceof HTMLElement && isTextLeaf(el)) {
      const list = map.get(strip(el.textContent ?? ""));
      if (list) return { el, target: list[0] };
    }
    el = el.parentElement;
  }
  return null;
}

function readText(el: HTMLElement) {
  let s = "";
  el.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) s += (n as Text).data;
    else if ((n as Element).tagName === "BR") s += "\n";
    else s += n.textContent ?? "";
  });
  return s.replace(/\u00a0/g, " ").replace(/\n+$/, "");
}

function placeCaret(el: HTMLElement, x: number, y: number) {
  const sel = window.getSelection();
  if (!sel) return;
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  let range: Range | null = null;
  if (doc.caretPositionFromPoint) {
    const p = doc.caretPositionFromPoint(x, y);
    if (p) {
      range = document.createRange();
      range.setStart(p.offsetNode, p.offset);
    }
  } else if (doc.caretRangeFromPoint) {
    range = doc.caretRangeFromPoint(x, y);
  }
  if (!range || !el.contains(range.startContainer)) {
    range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
  } else {
    range.collapse(true);
  }
  sel.removeAllRanges();
  sel.addRange(range);
}

/** Content path of the clicked element, e.g. "hero.headline" — the key its style overrides are stored under. */
export type InlineSelection = { key: string };

interface Props {
  enabled: boolean;
  contentBlocks: Record<string, unknown>;
  onChange: (sectionId: string, content: Record<string, unknown>) => void;
  /** Saved per-element style overrides (color_scheme.element_styles). Re-applied after every render. */
  elementStyles?: ElementStyles;
  /** Fired when an element is clicked (or null when empty space is clicked). */
  onSelect?: (selection: InlineSelection | null) => void;
  children: ReactNode;
}

export function InlineEditLayer({ enabled, contentBlocks, onChange, elementStyles, onSelect, children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const targets = useMemo(() => {
    const m = new Map<string, Target[]>();
    collect(contentBlocks, [], m);
    return m;
  }, [contentBlocks]);

  // Always-fresh values for the long-lived listeners below.
  const targetsRef = useRef(targets);
  targetsRef.current = targets;
  const blocksRef = useRef(contentBlocks);
  blocksRef.current = contentBlocks;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Re-apply saved style overrides to the matching elements after every render
  // (the template re-renders on every keystroke, and React won't know about our inline styles).
  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;
    applyElementStyles(root, elementStyles ?? {}, (text) => {
      const t = targets.get(text)?.[0];
      return t ? pathKey(t.path) : undefined;
    });
  });

  useEffect(() => {
    const root = wrapRef.current;
    if (!root || !enabled) return;

    let hover: HTMLElement | null = null;
    let editing: { el: HTMLElement; target: Target; original: string; saved: Saved[] } | null = null;

    const styleOn = (el: HTMLElement, solid: boolean) => {
      el.style.outline = solid ? "2px solid #6366f1" : "2px dashed rgba(99,102,241,.8)";
      el.style.outlineOffset = "3px";
      el.style.cursor = "text";
    };
    const styleOff = (el: HTMLElement) => {
      el.style.outline = "";
      el.style.outlineOffset = "";
      el.style.cursor = "";
    };
    const clearHover = () => {
      if (hover) styleOff(hover);
      hover = null;
    };

    const write = (target: Target, text: string) => {
      const sectionId = String(target.path[0]);
      const rest = target.path.slice(1);
      const section = blocksRef.current[sectionId] ?? {};
      let value = text;
      if (target.paragraph !== undefined) {
        const paras = String(getIn(section, rest) ?? "").split(/\n{2,}/);
        paras[target.paragraph] = text;
        value = paras.join("\n\n");
      }
      onChangeRef.current(sectionId, setIn(section, rest, value) as Record<string, unknown>);
    };

    const finish = (commit: boolean) => {
      if (!editing) return;
      const cur = editing;
      editing = null;
      const text = commit ? readText(cur.el) : null;
      cur.el.removeAttribute("contenteditable");
      styleOff(cur.el);
      // Put React's original nodes back so its next render updates a pristine tree.
      cur.el.replaceChildren(...cur.saved.map((s) => s.node));
      cur.saved.forEach((s) => {
        if (s.data !== null) (s.node as Text).data = s.data;
      });
      if (text !== null && text.trim() !== cur.original.trim()) write(cur.target, text);
    };

    const begin = (el: HTMLElement, target: Target, e: MouseEvent) => {
      clearHover();
      editing = {
        el,
        target,
        original: readText(el),
        saved: Array.from(el.childNodes).map((n) => ({
          node: n,
          data: n.nodeType === Node.TEXT_NODE ? (n as Text).data : null,
        })),
      };
      try {
        el.contentEditable = "plaintext-only";
      } catch {
        el.contentEditable = "true";
      }
      styleOn(el, true);
      el.focus();
      placeCaret(el, e.clientX, e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      if (editing) return;
      const hit = findMatch(e.target as Element, root, targetsRef.current);
      if ((hit?.el ?? null) === hover) return;
      clearHover();
      if (hit) {
        hover = hit.el;
        styleOn(hit.el, false);
      }
    };

    // Capture phase: swallow the click before the template's own handlers
    // (nav scrolling, add-to-cart, links) can run while in edit mode.
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element;
      if (editing?.el.contains(t)) return;
      e.preventDefault();
      e.stopPropagation();
      const hit = findMatch(t, root, targetsRef.current);
      onSelectRef.current?.(hit ? { key: pathKey(hit.target.path) } : null);
      if (hit) begin(hit.el, hit.target, e);
    };

    const onFocusOut = (e: FocusEvent) => {
      if (editing && e.target === editing.el) finish(true);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!editing) return;
      if (e.key === "Enter") {
        e.preventDefault();
        editing.el.blur();
      } else if (e.key === "Escape") {
        e.preventDefault();
        finish(false);
      }
    };

    const onPaste = (e: ClipboardEvent) => {
      if (!editing) return;
      e.preventDefault();
      document.execCommand("insertText", false, e.clipboardData?.getData("text/plain") ?? "");
    };

    root.addEventListener("mouseover", onOver);
    root.addEventListener("mouseleave", clearHover);
    root.addEventListener("click", onClick, true);
    root.addEventListener("focusout", onFocusOut);
    root.addEventListener("keydown", onKeyDown, true);
    root.addEventListener("paste", onPaste, true);

    return () => {
      finish(true);
      clearHover();
      root.removeEventListener("mouseover", onOver);
      root.removeEventListener("mouseleave", clearHover);
      root.removeEventListener("click", onClick, true);
      root.removeEventListener("focusout", onFocusOut);
      root.removeEventListener("keydown", onKeyDown, true);
      root.removeEventListener("paste", onPaste, true);
    };
  }, [enabled]);

  return (
    <div ref={wrapRef} data-inline-edit={enabled ? "on" : "off"}>
      {children}
    </div>
  );
}
