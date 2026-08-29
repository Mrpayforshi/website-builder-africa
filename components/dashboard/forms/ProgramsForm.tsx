"use client";

import { useState, type FormEvent } from "react";
import type { SectionFormProps } from "@/components/dashboard/forms/types";
import { submitSectionPatch } from "@/lib/dashboard/submit-patch";

interface ProgramItem {
  name: string;
  description: string;
  image: string;
}

const EMPTY_ITEM: ProgramItem = { name: "", description: "", image: "" };

interface ProgramsContent {
  items?: ProgramItem[];
}

export function ProgramsForm({
  businessId,
  sectionId,
  allowedFields,
  initialContent,
  expectedVersion,
}: SectionFormProps) {
  const content = initialContent as ProgramsContent;
  const [items, setItems] = useState<ProgramItem[]>(
    content.items && content.items.length > 0
      ? content.items.map((i) => ({ ...EMPTY_ITEM, ...i }))
      : [EMPTY_ITEM]
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function updateItem(index: number, field: keyof ProgramItem, value: string) {
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
        ...(item.description && { description: item.description }),
        ...(item.image && { image: item.image }),
      }));

    const nextContent: Record<string, unknown> = {};
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
    <form className="section-form section-form--programs" onSubmit={handleSubmit}>
      {items.map((item, index) => (
        <fieldset key={index} className="section-form__item">
          <legend>Program {index + 1}</legend>
          <label className="section-form__field">
            Name
            <input type="text" value={item.name} onChange={(e) => updateItem(index, "name", e.target.value)} />
          </label>
          <label className="section-form__field">
            Description
            <textarea
              value={item.description}
              onChange={(e) => updateItem(index, "description", e.target.value)}
            />
          </label>
          <label className="section-form__field">
            Image URL
            <input type="text" value={item.image} onChange={(e) => updateItem(index, "image", e.target.value)} />
          </label>
          <button type="button" onClick={() => removeItem(index)}>
            Remove
          </button>
        </fieldset>
      ))}
      <button type="button" onClick={addItem}>
        Add program
      </button>
      <button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving..." : "Save"}
      </button>
      {status === "saved" && <p className="section-form__status section-form__status--ok">Saved.</p>}
      {status === "error" && <p className="section-form__status section-form__status--error">{error}</p>}
    </form>
  );
}
