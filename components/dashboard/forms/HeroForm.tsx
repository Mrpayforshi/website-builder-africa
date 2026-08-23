"use client";

import { useState, type FormEvent } from "react";
import type { SectionFormProps } from "@/components/dashboard/forms/types";
import { submitSectionPatch } from "@/lib/dashboard/submit-patch";

interface HeroContent {
  headline?: string;
  subheadline?: string;
  image?: string;
}

export function HeroForm({
  businessId,
  sectionId,
  allowedFields,
  initialContent,
  expectedVersion,
}: SectionFormProps) {
  const content = initialContent as HeroContent;
  const [headline, setHeadline] = useState(content.headline ?? "");
  const [subheadline, setSubheadline] = useState(content.subheadline ?? "");
  const [image, setImage] = useState(content.image ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const nextContent: HeroContent = {};
    if (allowedFields.includes("headline")) nextContent.headline = headline;
    if (allowedFields.includes("subheadline")) nextContent.subheadline = subheadline;
    if (allowedFields.includes("image")) nextContent.image = image;

    const result = await submitSectionPatch({
      businessId,
      sectionId,
      expectedVersion,
      content: nextContent,
    });

    if (!result.ok) {
      setStatus("error");
      setError(result.error ?? "Save failed");
      return;
    }

    setStatus("saved");
  }

  return (
    <form className="section-form section-form--hero" onSubmit={handleSubmit}>
      {allowedFields.includes("headline") && (
        <label className="section-form__field">
          Headline
          <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} />
        </label>
      )}
      {allowedFields.includes("subheadline") && (
        <label className="section-form__field">
          Subheadline
          <input type="text" value={subheadline} onChange={(e) => setSubheadline(e.target.value)} />
        </label>
      )}
      {allowedFields.includes("image") && (
        <label className="section-form__field">
          Image URL
          <input type="text" value={image} onChange={(e) => setImage(e.target.value)} />
        </label>
      )}
      <button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving..." : "Save"}
      </button>
      {status === "saved" && <p className="section-form__status section-form__status--ok">Saved.</p>}
      {status === "error" && <p className="section-form__status section-form__status--error">{error}</p>}
    </form>
  );
}
