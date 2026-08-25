"use client";

import type { TemplateSectionDef } from "@/lib/templates/section-schemas";
import { SECTION_FIELD_SCHEMAS } from "@/lib/templates/section-schemas";
import { RepeatableList } from "@/components/dashboard/RepeatableList";
import { MenuCategoriesEditor } from "@/components/dashboard/MenuCategoriesEditor";
import { HoursEditor } from "@/components/dashboard/HoursEditor";
import {
  PRODUCT_ITEM_FIELDS,
  SERVICES_ITEM_FIELDS,
  PROGRAMS_ITEM_FIELDS,
  GALLERY_ITEM_FIELDS,
} from "@/lib/dashboard/field-config";

interface SectionEditorProps {
  section: TemplateSectionDef;
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function SectionEditor({ section, content, onChange }: SectionEditorProps) {
  const allowedFields = SECTION_FIELD_SCHEMAS[section.type];

  function setField(key: string, value: unknown) {
    onChange({ ...content, [key]: value });
  }

  if (!allowedFields) {
    return (
      <section style={{ margin: "1.5rem 0", color: "#a00" }}>
        Unknown section type &quot;{section.type}&quot; for section &quot;{section.id}&quot; — skipped.
      </section>
    );
  }

  return (
    <section style={{ margin: "1.5rem 0", paddingBottom: "1rem", borderBottom: "1px solid #eee" }}>
      <h2 style={{ fontSize: "1.1rem", textTransform: "capitalize" }}>
        {section.id.replace(/_/g, " ")}{" "}
        {section.required && <span style={{ color: "#a00", fontSize: "0.75rem" }}>required</span>}
      </h2>

      {section.type === "hero" && (
        <>
          <TextField label="Headline" value={content.headline as string} onChange={(v) => setField("headline", v)} />
          <TextField
            label="Subheadline"
            value={content.subheadline as string}
            onChange={(v) => setField("subheadline", v)}
          />
          <TextField label="Image URL" value={content.image as string} onChange={(v) => setField("image", v)} />
        </>
      )}

      {section.type === "about" && (
        <>
          <TextField label="Headline" value={content.headline as string} onChange={(v) => setField("headline", v)} />
          <TextAreaField label="Bio / Body" value={content.body as string} onChange={(v) => setField("body", v)} />
          <TextField label="Image URL" value={content.image as string} onChange={(v) => setField("image", v)} />
          <ListField
            label="Credentials"
            value={(content.credentials as string[]) ?? []}
            onChange={(v) => setField("credentials", v)}
          />
        </>
      )}

      {section.type === "contact" && (
        <>
          <TextField label="Address" value={content.address as string} onChange={(v) => setField("address", v)} />
          <TextField label="Phone" value={content.phone as string} onChange={(v) => setField("phone", v)} />
          <TextField label="Email" value={content.email as string} onChange={(v) => setField("email", v)} />
          <TextAreaField
            label="Map embed"
            value={content.map_embed as string}
            onChange={(v) => setField("map_embed", v)}
          />
          <HoursEditor
            value={(content.hours as Record<string, { open: string; close: string }>) ?? {}}
            onChange={(v) => setField("hours", v)}
          />
        </>
      )}

      {section.type === "product_grid" && (
        <RepeatableList
          fields={PRODUCT_ITEM_FIELDS}
          items={(content.items as Record<string, unknown>[]) ?? []}
          onChange={(items) => setField("items", items)}
          addLabel="Add product"
        />
      )}

      {section.type === "services_list" && (
        <RepeatableList
          fields={SERVICES_ITEM_FIELDS}
          items={(content.items as Record<string, unknown>[]) ?? []}
          onChange={(items) => setField("items", items)}
          addLabel="Add service"
        />
      )}

      {section.type === "programs" && (
        <RepeatableList
          fields={PROGRAMS_ITEM_FIELDS}
          items={(content.items as Record<string, unknown>[]) ?? []}
          onChange={(items) => setField("items", items)}
          addLabel="Add program"
        />
      )}

      {section.type === "gallery" && (
        <RepeatableList
          fields={GALLERY_ITEM_FIELDS}
          items={(content.images as Record<string, unknown>[]) ?? []}
          onChange={(images) => setField("images", images)}
          addLabel="Add image"
        />
      )}

      {section.type === "menu" && (
        <MenuCategoriesEditor
          categories={(content.categories as { name?: string; items?: Record<string, unknown>[] }[]) ?? []}
          onChange={(categories) => setField("categories", categories)}
        />
      )}
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "block", marginBottom: "0.6rem" }}>
      <span style={{ display: "block", fontSize: "0.85rem", color: "#555" }}>{label}</span>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "0.4rem" }}
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "block", marginBottom: "0.6rem" }}>
      <span style={{ display: "block", fontSize: "0.85rem", color: "#555" }}>{label}</span>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        style={{ width: "100%", padding: "0.4rem" }}
      />
    </label>
  );
}

function ListField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  function updateAt(i: number, v: string) {
    const next = [...value];
    next[i] = v;
    onChange(next);
  }
  function removeAt(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }
  return (
    <div style={{ marginBottom: "0.6rem" }}>
      <span style={{ display: "block", fontSize: "0.85rem", color: "#555" }}>{label}</span>
      {value.map((v, i) => (
        <div key={i} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.3rem" }}>
          <input type="text" value={v} onChange={(e) => updateAt(i, e.target.value)} style={{ flex: 1, padding: "0.4rem" }} />
          <button type="button" onClick={() => removeAt(i)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, ""])}>
        Add {label.toLowerCase()}
      </button>
    </div>
  );
}
