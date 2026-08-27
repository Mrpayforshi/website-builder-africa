"use client";

import type { ItemFieldDef } from "@/lib/dashboard/field-config";

interface RepeatableListProps {
  fields: ItemFieldDef[];
  items: Record<string, unknown>[];
  onChange: (items: Record<string, unknown>[]) => void;
  addLabel: string;
}

/**
 * Generic repeatable-item editor shared by every array-shaped section field
 * (product grids, service lists, programs, gallery images, menu items).
 * Field set per item comes from lib/dashboard/field-config.ts; this
 * component only knows how to render the three widget types defined there.
 */
export function RepeatableList({ fields, items, onChange, addLabel }: RepeatableListProps) {
  function updateItem(index: number, key: string, value: unknown) {
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...items, {}]);
  }

  return (
    <div style={{ marginBottom: "0.6rem" }}>
      {items.map((item, index) => (
        <div key={index} style={{ border: "1px solid #ddd", padding: "0.6rem", marginBottom: "0.6rem" }}>
          {fields.map((field) => (
            <label key={field.key} style={{ display: "block", marginBottom: "0.4rem" }}>
              <span style={{ display: "block", fontSize: "0.8rem", color: "#555" }}>{field.label}</span>
              {field.widget === "textarea" ? (
                <textarea
                  value={(item[field.key] as string) ?? ""}
                  onChange={(e) => updateItem(index, field.key, e.target.value)}
                  style={{ width: "100%", padding: "0.3rem" }}
                  rows={3}
                />
              ) : (
                <input
                  type={field.widget === "number" ? "number" : "text"}
                  value={(item[field.key] as string | number) ?? ""}
                  onChange={(e) =>
                    updateItem(
                      index,
                      field.key,
                      field.widget === "number" ? Number(e.target.value) : e.target.value
                    )
                  }
                  style={{ width: "100%", padding: "0.3rem" }}
                />
              )}
            </label>
          ))}
          <button type="button" onClick={() => removeItem(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={addItem}>
        {addLabel}
      </button>
    </div>
  );
}
