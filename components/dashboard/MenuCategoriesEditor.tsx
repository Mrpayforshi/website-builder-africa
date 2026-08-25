"use client";

import { RepeatableList } from "@/components/dashboard/RepeatableList";
import { MENU_ITEM_FIELDS } from "@/lib/dashboard/field-config";

interface MenuItem {
  name?: string;
  price?: number;
  description?: string;
}

interface MenuCategory {
  name?: string;
  items?: MenuItem[];
}

interface MenuCategoriesEditorProps {
  categories: MenuCategory[];
  onChange: (categories: MenuCategory[]) => void;
}

export function MenuCategoriesEditor({ categories, onChange }: MenuCategoriesEditorProps) {
  function updateCategory(index: number, patch: Partial<MenuCategory>) {
    onChange(categories.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function removeCategory(index: number) {
    onChange(categories.filter((_, i) => i !== index));
  }

  function addCategory() {
    onChange([...categories, { name: "", items: [] }]);
  }

  return (
    <div style={{ marginBottom: "0.6rem" }}>
      {categories.map((cat, index) => (
        <div key={index} style={{ border: "1px solid #ccc", padding: "0.6rem", marginBottom: "0.6rem" }}>
          <label style={{ display: "block", marginBottom: "0.4rem" }}>
            <span style={{ display: "block", fontSize: "0.8rem", color: "#555" }}>Category name</span>
            <input
              type="text"
              value={cat.name ?? ""}
              onChange={(e) => updateCategory(index, { name: e.target.value })}
              style={{ width: "100%", padding: "0.3rem" }}
            />
          </label>
          <RepeatableList
            fields={MENU_ITEM_FIELDS}
            items={(cat.items as Record<string, unknown>[]) ?? []}
            onChange={(items) => updateCategory(index, { items: items as MenuItem[] })}
            addLabel="Add menu item"
          />
          <button type="button" onClick={() => removeCategory(index)}>
            Remove category
          </button>
        </div>
      ))}
      <button type="button" onClick={addCategory}>
        Add category
      </button>
    </div>
  );
}
