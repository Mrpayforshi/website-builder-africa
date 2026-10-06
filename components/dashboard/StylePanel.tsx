"use client";

import {
  FAMILY_OPTIONS,
  SIZE_OPTIONS,
  WEIGHT_OPTIONS,
  type ElementStyle,
} from "@/lib/dashboard/element-styles";
import styles from "./style-panel.module.css";

export interface Selection {
  key: string; // content path, e.g. "hero.headline"
  label: string; // human label, e.g. "Hero · Headline"
}

interface StylePanelProps {
  selection: Selection | null;
  value: ElementStyle;
  onChange: (patch: Partial<ElementStyle>) => void;
  onReset: () => void;
}

const SWATCHES = ["#111111", "#ffffff", "#e2652b", "#2563eb", "#16a34a", "#f5f1ea"];

export function labelFromKey(key: string) {
  const parts = key.split(".").filter((p) => !/^\d+$/.test(p));
  return parts.map((p) => p.replace(/_/g, " ")).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" · ");
}

export function StylePanel({ selection, value, onChange, onReset }: StylePanelProps) {
  if (!selection) {
    return (
      <div className={styles.card}>
        <p className={styles.empty}>
          Select any text on your page to change its spacing, typography and colour.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div>
          <div className={styles.eyebrow}>Editing</div>
          <div className={styles.target}>{selection.label}</div>
        </div>
        <button type="button" className={styles.reset} onClick={onReset}>
          Reset
        </button>
      </div>

      <Group title="Spacing">
        <div className={styles.row}>
          <Field label="Margin">
            <div className={styles.pair}>
              <Num glyph="↔" label="Horizontal margin" value={value.mx} onChange={(n) => onChange({ mx: n })} />
              <Num glyph="↕" label="Vertical margin" value={value.my} onChange={(n) => onChange({ my: n })} />
            </div>
          </Field>
          <Field label="Padding">
            <div className={styles.pair}>
              <Num glyph="↔" label="Horizontal padding" value={value.px} onChange={(n) => onChange({ px: n })} />
              <Num glyph="↕" label="Vertical padding" value={value.py} onChange={(n) => onChange({ py: n })} />
            </div>
          </Field>
        </div>
      </Group>

      <Group title="Typography">
        <div className={styles.row}>
          <Field label="Font size">
            <Select value={value.size ?? ""} options={SIZE_OPTIONS} onChange={(v) => onChange({ size: v || undefined })} />
          </Field>
          <Field label="Font family">
            <Select value={value.family ?? ""} options={FAMILY_OPTIONS} onChange={(v) => onChange({ family: v || undefined })} />
          </Field>
        </div>
        <div className={styles.row}>
          <Field label="Font weight">
            <Select value={value.weight ?? ""} options={WEIGHT_OPTIONS} onChange={(v) => onChange({ weight: v || undefined })} />
          </Field>
          <Field label="Alignment">
            <Align value={value.align} onChange={(a) => onChange({ align: a })} />
          </Field>
        </div>
      </Group>

      <Group title="Color">
        <div className={styles.row}>
          <Field label="Text color">
            <Color value={value.color} onChange={(c) => onChange({ color: c })} />
          </Field>
          <Field label="Background color">
            <Color value={value.bg} onChange={(c) => onChange({ bg: c })} />
          </Field>
        </div>
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
    </div>
  );
}

function Num({
  glyph,
  label,
  value,
  onChange,
}: {
  glyph: string;
  label: string;
  value?: number;
  onChange: (n: number | undefined) => void;
}) {
  return (
    <label className={styles.num} title={label}>
      <span aria-hidden>{glyph}</span>
      <input
        type="number"
        min={0}
        max={200}
        inputMode="numeric"
        aria-label={label}
        value={value ?? ""}
        placeholder="0"
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
    </label>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles.select}>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.label} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const ALIGN_ICONS: Record<NonNullable<ElementStyle["align"]>, string> = {
  left: "M4 6h16M4 10h10M4 14h16M4 18h10",
  center: "M4 6h16M7 10h10M4 14h16M7 18h10",
  right: "M4 6h16M10 10h10M4 14h16M10 18h10",
  justify: "M4 6h16M4 10h16M4 14h16M4 18h16",
};

function Align({ value, onChange }: { value?: ElementStyle["align"]; onChange: (a: ElementStyle["align"]) => void }) {
  return (
    <div className={styles.segment} role="group" aria-label="Text alignment">
      {(Object.keys(ALIGN_ICONS) as NonNullable<ElementStyle["align"]>[]).map((a) => (
        <button
          key={a}
          type="button"
          aria-label={`Align ${a}`}
          aria-pressed={value === a}
          className={value === a ? styles.segOn : ""}
          onClick={() => onChange(value === a ? undefined : a)}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d={ALIGN_ICONS[a]} />
          </svg>
        </button>
      ))}
    </div>
  );
}

function Color({ value, onChange }: { value?: string; onChange: (c: string | undefined) => void }) {
  const valid = value && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : undefined;
  return (
    <div>
      <div className={styles.colorBox}>
        <input
          type="color"
          className={styles.colorWell}
          aria-label="Pick colour"
          value={valid && valid.length === 7 ? valid : "#000000"}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          spellCheck={false}
          placeholder="Default"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value.trim() || undefined)}
        />
      </div>
      <div className={styles.swatches}>
        {SWATCHES.map((s) => (
          <button
            key={s}
            type="button"
            aria-label={s}
            className={valid?.toLowerCase() === s ? styles.swatchOn : ""}
            style={{ background: s }}
            onClick={() => onChange(s)}
          />
        ))}
      </div>
    </div>
  );
}

/** Site-wide brand colours (replaces the unstyled "Appearance" block in the Edit tab). */
export function BrandColors({
  colorScheme,
  onChange,
}: {
  colorScheme: Record<string, unknown>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className={styles.card}>
      <Group title="Brand colours">
        {(["primary", "secondary", "accent"] as const).map((key) => (
          <div key={key} className={styles.brandRow}>
            <span className={styles.label} style={{ textTransform: "capitalize" }}>
              {key}
            </span>
            <Color
              value={(colorScheme[key] as string) ?? ""}
              onChange={(c) => onChange(key, c ?? "")}
            />
          </div>
        ))}
      </Group>
    </div>
  );
}
