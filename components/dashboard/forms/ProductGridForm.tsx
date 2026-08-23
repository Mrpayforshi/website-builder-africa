"use client";

import { useState, type FormEvent } from "react";
import type { SectionFormProps } from "@/components/dashboard/forms/types";
import { submitSectionPatch } from "@/lib/dashboard/submit-patch";

interface ProductItem {
  name: string;
  price: string;
  image: string;
  description: string;
  sku: string;
}

const EMPTY_ITEM: ProductItem = { name: "", price: "", image: "", description: "", sku: "" };

interface ProductGridContent {
  items?: ProductItem[];
}

export function ProductGridForm({
  businessId,
  sectionId,
  allowedFields,
  initialContent,
  expectedVersion,
}: SectionFormProps) {
  const content = initialContent as ProductGridContent;
  const [items, setItems] = useState<ProductItem[]>(
    content.items && content.items.length > 0
      ? content.items.map((i) => ({ ...EMPTY_ITEM, ...i }))
      : [EMPTY_ITEM]
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function updateItem(index: number, field: keyof ProductItem, value: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const cleanedItems = items
      .filter((item) => item.name.trim() !== "")
      .map((item) => ({
        name: item.name,
        price: item.price,
        ...(item.image && { image: item.image }),
        ...(item.description && { description: item.description }),
        ...(item.sku && { sku: item.sku }),
      }));

    const nextContent: ProductGridContent = {};
    if (allowedFields.includes("items")) nextContent.items = cleanedItems;

    const result = await submitSectionPatch({ businessId, sectionId, expectedVersion, content: nextContent });

    if (!result.ok) {
      setStatus("error");
      setError(result.error ?? "Save failed");
      return;
    }
    setStatus("saved");
  }

  if (!allowedFields.includes("items")) {
    return <p className="section-form">This section has no editable fields.</p>;
  }

  return (
    <form className="section-form section-form--product-grid" onSubmit={handleSubmit}>
      {items.map((item, index) => (
        <fieldset key={index} className="section-form__item">
          <legend>Product {index + 1}</legend>
          <label className="section-form__field">
            Name
            <input type="text" value={item.name} onChange={(e) => updateItem(index, "name", e.target.value)} />
          </label>
          <label className="section-form__field">
            Price
            <input type="text" value={item.price} onChange={(e) => updateItem(index, "price", e.target.value)} />
          </label>
          <label className="section-form__field">
            SKU
            <input type="text" value={item.sku} onChange={(e) => updateItem(index, "sku", e.target.value)} />
          </label>
          <label className="section-form__field">
            Image URL
            <input type="text" value={item.image} onChange={(e) => updateItem(index, "image", e.target.value)} />
          </label>
          <label className="section-form__field">
            Description
            <textarea
              value={item.description}
              onChange={(e) => updateItem(index, "description", e.target.value)}
            />
          </label>
          <button type="button" onClick={() => removeItem(index)}>
            Remove
          </button>
        </fieldset>
      ))}
      <button type="button" onClick={addItem}>
        Add product
      </button>
      <button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving..." : "Save"}
      </button>
      {status === "saved" && <p className="section-form__status section-form__status--ok">Saved.</p>}
      {status === "error" && <p className="section-form__status section-form__status--error">{error}</p>}
    </form>
  );
}
