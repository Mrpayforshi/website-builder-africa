"use client";

import { useState, type FormEvent } from "react";
import type { SectionFormProps } from "@/components/dashboard/forms/types";
import { submitSectionPatch } from "@/lib/dashboard/submit-patch";

interface AboutContent {
  headline?: string;
  body?: string;
  image?: string;
  credentials?: string[];
}

export function AboutForm({
  businessId,
  sectionId,
  allowedFields,
  initialContent,
  expectedVersion,
}: SectionFormProps) {
  const content = initialContent as AboutContent;
  const [headline, setHeadline] = useState(content.headline ?? "");
  const [body, setBody] = useState(content.body ?? "");
  const [image, setImage] = useState(content.image ?? "");
  const [credentialsText, setCredentialsText] = useState((content.credentials ?? []).join("\n"));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const nextContent: Record<string, unknown> = {};
    if (allowedFields.includes("headline")) nextContent.headline = headline;
    if (allowedFields.includes("body")) nextContent.body = body;
    if (allowedFields.includes("image")) nextContent.image = image;
    if (allowedFields.includes("credentials")) {
      nextContent.credentials = credentialsText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "");
    }

    const result = await submitSectionPatch({ businessId, sectionId, expectedVersion, content: nextContent });

    if (!result.ok) {
      setStatus("error");
      setError(result.error ?? "Save failed");
      return;
    }
    setStatus("saved");
  }

  return (
    <form className="section-form section-form--about" onSubmit={handleSubmit}>
      {allowedFields.includes("headline") && (
        <label className="section-form__field">
          Headline
          <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} />
        </label>
      )}
      {allowedFields.includes("body") && (
        <label className="section-form__field">
          Body
          <textarea value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
      )}
      {allowedFields.includes("image") && (
        <label className="section-form__field">
          Image URL
          <input type="text" value={image} onChange={(e) => setImage(e.target.value)} />
        </label>
      )}
      {allowedFields.includes("credentials") && (
        <label className="section-form__field">
          Credentials (one per line)
          <textarea value={credentialsText} onChange={(e) => setCredentialsText(e.target.value)} />
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
