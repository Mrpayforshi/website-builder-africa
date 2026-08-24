"use client";

import { useState, type FormEvent } from "react";
import type { SectionFormProps } from "@/components/dashboard/forms/types";
import { submitSectionPatch } from "@/lib/dashboard/submit-patch";

interface HoursRow {
  day: string;
  open: string;
  close: string;
}

interface ContactContent {
  address?: string;
  phone?: string;
  email?: string;
  hours?: Record<string, { open: string; close: string }>;
  map_embed?: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function hoursObjectToRows(hours?: Record<string, { open: string; close: string }>): HoursRow[] {
  return DAYS.map((day) => ({
    day,
    open: hours?.[day]?.open ?? "",
    close: hours?.[day]?.close ?? "",
  }));
}

export function ContactForm({
  businessId,
  sectionId,
  allowedFields,
  initialContent,
  expectedVersion,
}: SectionFormProps) {
  const content = initialContent as ContactContent;
  const [address, setAddress] = useState(content.address ?? "");
  const [phone, setPhone] = useState(content.phone ?? "");
  const [email, setEmail] = useState(content.email ?? "");
  const [hoursRows, setHoursRows] = useState<HoursRow[]>(hoursObjectToRows(content.hours));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function updateHours(index: number, field: "open" | "close", value: string) {
    setHoursRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const nextContent: ContactContent = {};
    if (allowedFields.includes("address")) nextContent.address = address;
    if (allowedFields.includes("phone")) nextContent.phone = phone;
    if (allowedFields.includes("email")) nextContent.email = email;
    if (allowedFields.includes("hours")) {
      const hours: Record<string, { open: string; close: string }> = {};
      for (const row of hoursRows) {
        if (row.open.trim() !== "" || row.close.trim() !== "") {
          hours[row.day] = { open: row.open, close: row.close };
        }
      }
      nextContent.hours = hours;
    }
    // map_embed is written by Workstream G's Maps sync, not editable here.
    if (allowedFields.includes("map_embed") && content.map_embed) {
      nextContent.map_embed = content.map_embed;
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
    <form className="section-form section-form--contact" onSubmit={handleSubmit}>
      {allowedFields.includes("address") && (
        <label className="section-form__field">
          Address
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
      )}
      {allowedFields.includes("phone") && (
        <label className="section-form__field">
          Phone
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
      )}
      {allowedFields.includes("email") && (
        <label className="section-form__field">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      )}
      {allowedFields.includes("hours") && (
        <fieldset className="section-form__hours">
          <legend>Hours</legend>
          {hoursRows.map((row, index) => (
            <div key={row.day} className="section-form__hours-row">
              <span>{row.day}</span>
              <input
                type="time"
                value={row.open}
                onChange={(e) => updateHours(index, "open", e.target.value)}
              />
              <input
                type="time"
                value={row.close}
                onChange={(e) => updateHours(index, "close", e.target.value)}
              />
            </div>
          ))}
        </fieldset>
      )}
      {allowedFields.includes("map_embed") && (
        <p className="section-form__note">
          Map embed is set automatically by Google Maps sync and isn&apos;t editable here.
        </p>
      )}
      <button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving..." : "Save"}
      </button>
      {status === "saved" && <p className="section-form__status section-form__status--ok">Saved.</p>}
      {status === "error" && <p className="section-form__status section-form__status--error">{error}</p>}
    </form>
  );
}
