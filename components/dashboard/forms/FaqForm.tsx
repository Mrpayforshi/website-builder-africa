"use client";

import { useState, type FormEvent } from "react";
import type { SectionFormProps } from "@/components/dashboard/forms/types";
import { submitSectionPatch } from "@/lib/dashboard/submit-patch";

interface FaqItem {
  question: string;
  answer: string;
}

const EMPTY_ITEM: FaqItem = { question: "", answer: "" };

interface FaqContent {
  items?: FaqItem[];
}

export function FaqForm({
  businessId,
  sectionId,
  allowedFields,
  initialContent,
  expectedVersion,
}: SectionFormProps) {
  const content = initialContent as FaqContent;
  const [items, setItems] = useState<FaqItem[]>(
    content.items && content.items.length > 0
      ? content.items.map((i) => ({ ...EMPTY_ITEM, ...i }))
      : [EMPTY_ITEM]
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function updateItem(index: number, field: keyof FaqItem, value: string) {
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
      .filter((item) => item.question.trim() !== "" && item.answer.trim() !== "")
      .map((item) => ({ question: item.question, answer: item.answer }));

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
    <form className="section-form section-form--faq" onSubmit={handleSubmit}>
      {items.map((item, index) => (
        <fieldset key={index} className="section-form__item">
          <legend>Question {index + 1}</legend>
          <label className="section-form__field">
            Question
            <input type="text" value={item.question} onChange={(e) => updateItem(index, "question", e.target.value)} />
          </label>
          <label className="section-form__field">
            Answer
            <textarea value={item.answer} onChange={(e) => updateItem(index, "answer", e.target.value)} />
          </label>
          <button type="button" onClick={() => removeItem(index)}>
            Remove
          </button>
        </fieldset>
      ))}
      <button type="button" onClick={addItem}>
        Add question
      </button>
      <button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving..." : "Save"}
      </button>
      {status === "saved" && <p className="section-form__status section-form__status--ok">Saved.</p>}
      {status === "error" && <p className="section-form__status section-form__status--error">{error}</p>}
    </form>
  );
}
