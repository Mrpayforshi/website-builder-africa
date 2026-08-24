"use client";

import { useState, type FormEvent } from "react";
import type { SectionFormProps } from "@/components/dashboard/forms/types";
import { submitSectionPatch } from "@/lib/dashboard/submit-patch";

interface GalleryImageRow {
  url: string;
  caption: string;
}

const EMPTY_IMAGE: GalleryImageRow = { url: "", caption: "" };

interface GalleryContent {
  images?: GalleryImageRow[];
}

export function GalleryForm({
  businessId,
  sectionId,
  allowedFields,
  initialContent,
  expectedVersion,
}: SectionFormProps) {
  const content = initialContent as GalleryContent;
  const [images, setImages] = useState<GalleryImageRow[]>(
    content.images && content.images.length > 0
      ? content.images.map((i) => ({ ...EMPTY_IMAGE, ...i }))
      : [EMPTY_IMAGE]
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function updateImage(index: number, field: keyof GalleryImageRow, value: string) {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, [field]: value } : img)));
  }

  function addImage() {
    setImages((prev) => [...prev, { ...EMPTY_IMAGE }]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const cleanedImages = images
      .filter((img) => img.url.trim() !== "")
      .map((img) => ({
        url: img.url,
        ...(img.caption && { caption: img.caption }),
      }));

    const nextContent: GalleryContent = {};
    if (allowedFields.includes("images")) nextContent.images = cleanedImages;

    const result = await submitSectionPatch({ businessId, sectionId, expectedVersion, content: nextContent });

    if (!result.ok) {
      setStatus("error");
      setError(result.error ?? "Save failed");
      return;
    }
    setStatus("saved");
  }

  if (!allowedFields.includes("images")) {
    return <p className="section-form">This section has no editable fields.</p>;
  }

  return (
    <form className="section-form section-form--gallery" onSubmit={handleSubmit}>
      {images.map((img, index) => (
        <fieldset key={index} className="section-form__item">
          <legend>Image {index + 1}</legend>
          <label className="section-form__field">
            Image URL
            <input type="text" value={img.url} onChange={(e) => updateImage(index, "url", e.target.value)} />
          </label>
          <label className="section-form__field">
            Caption
            <input
              type="text"
              value={img.caption}
              onChange={(e) => updateImage(index, "caption", e.target.value)}
            />
          </label>
          <button type="button" onClick={() => removeImage(index)}>
            Remove
          </button>
        </fieldset>
      ))}
      <button type="button" onClick={addImage}>
        Add image
      </button>
      <button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving..." : "Save"}
      </button>
      {status === "saved" && <p className="section-form__status section-form__status--ok">Saved.</p>}
      {status === "error" && <p className="section-form__status section-form__status--error">{error}</p>}
    </form>
  );
}
