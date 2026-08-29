"use client";

import { useState, type FormEvent } from "react";
import type { SectionFormProps } from "@/components/dashboard/forms/types";
import { submitSectionPatch } from "@/lib/dashboard/submit-patch";

interface MenuItemRow {
  name: string;
  price: string;
  description: string;
}

interface MenuCategoryRow {
  name: string;
  items: MenuItemRow[];
}

interface MenuContent {
  categories?: MenuCategoryRow[];
}

const EMPTY_ITEM: MenuItemRow = { name: "", price: "", description: "" };
const EMPTY_CATEGORY: MenuCategoryRow = { name: "", items: [{ ...EMPTY_ITEM }] };

export function MenuForm({
  businessId,
  sectionId,
  allowedFields,
  initialContent,
  expectedVersion,
}: SectionFormProps) {
  const content = initialContent as MenuContent;
  const [categories, setCategories] = useState<MenuCategoryRow[]>(
    content.categories && content.categories.length > 0
      ? content.categories.map((c) => ({
          name: c.name,
          items: c.items?.length ? c.items.map((i) => ({ ...EMPTY_ITEM, ...i })) : [{ ...EMPTY_ITEM }],
        }))
      : [{ ...EMPTY_CATEGORY }]
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function updateCategoryName(catIndex: number, name: string) {
    setCategories((prev) => prev.map((cat, i) => (i === catIndex ? { ...cat, name } : cat)));
  }

  function updateItem(catIndex: number, itemIndex: number, field: keyof MenuItemRow, value: string) {
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === catIndex
          ? { ...cat, items: cat.items.map((item, j) => (j === itemIndex ? { ...item, [field]: value } : item)) }
          : cat
      )
    );
  }

  function addCategory() {
    setCategories((prev) => [...prev, { name: "", items: [{ ...EMPTY_ITEM }] }]);
  }

  function removeCategory(catIndex: number) {
    setCategories((prev) => prev.filter((_, i) => i !== catIndex));
  }

  function addItem(catIndex: number) {
    setCategories((prev) =>
      prev.map((cat, i) => (i === catIndex ? { ...cat, items: [...cat.items, { ...EMPTY_ITEM }] } : cat))
    );
  }

  function removeItem(catIndex: number, itemIndex: number) {
    setCategories((prev) =>
      prev.map((cat, i) => (i === catIndex ? { ...cat, items: cat.items.filter((_, j) => j !== itemIndex) } : cat))
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const cleanedCategories = categories
      .filter((cat) => cat.name.trim() !== "")
      .map((cat) => ({
        name: cat.name,
        items: cat.items
          .filter((item) => item.name.trim() !== "")
          .map((item) => ({
            name: item.name,
            ...(item.price && { price: item.price }),
            ...(item.description && { description: item.description }),
          })),
      }));

    const nextContent: Record<string, unknown> = {};
    if (allowedFields.includes("categories")) nextContent.categories = cleanedCategories;

    const result = await submitSectionPatch({ businessId, sectionId, expectedVersion, content: nextContent });

    if (!result.ok) {
      setStatus("error");
      setError(result.error ?? "Save failed");
      return;
    }
    setStatus("saved");
  }

  if (!allowedFields.includes("categories")) {
    return <p className="section-form">This section has no editable fields.</p>;
  }

  return (
    <form className="section-form section-form--menu" onSubmit={handleSubmit}>
      {categories.map((cat, catIndex) => (
        <fieldset key={catIndex} className="section-form__category">
          <legend>Category {catIndex + 1}</legend>
          <label className="section-form__field">
            Category name
            <input type="text" value={cat.name} onChange={(e) => updateCategoryName(catIndex, e.target.value)} />
          </label>
          {cat.items.map((item, itemIndex) => (
            <fieldset key={itemIndex} className="section-form__item">
              <legend>Item {itemIndex + 1}</legend>
              <label className="section-form__field">
                Name
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(catIndex, itemIndex, "name", e.target.value)}
                />
              </label>
              <label className="section-form__field">
                Price
                <input
                  type="text"
                  value={item.price}
                  onChange={(e) => updateItem(catIndex, itemIndex, "price", e.target.value)}
                />
              </label>
              <label className="section-form__field">
                Description
                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(catIndex, itemIndex, "description", e.target.value)}
                />
              </label>
              <button type="button" onClick={() => removeItem(catIndex, itemIndex)}>
                Remove item
              </button>
            </fieldset>
          ))}
          <button type="button" onClick={() => addItem(catIndex)}>
            Add item
          </button>
          <button type="button" onClick={() => removeCategory(catIndex)}>
            Remove category
          </button>
        </fieldset>
      ))}
      <button type="button" onClick={addCategory}>
        Add category
      </button>
      <button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving..." : "Save"}
      </button>
      {status === "saved" && <p className="section-form__status section-form__status--ok">Saved.</p>}
      {status === "error" && <p className="section-form__status section-form__status--error">{error}</p>}
    </form>
  );
}
