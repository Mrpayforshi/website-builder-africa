"use client";

import { useState } from "react";
import type { SiteConfig } from "@/types/database";
import type { Template } from "@/lib/templates/template-store";
import { SectionEditor } from "@/components/dashboard/SectionEditor";
import { FeatureTogglesPanel, type FeatureToggleState } from "@/components/dashboard/FeatureTogglesPanel";

interface DashboardEditorProps {
  businessId: string;
  initialConfig: SiteConfig;
  template: Template;
  initialFeatureToggles: FeatureToggleState[];
}

export function DashboardEditor({
  businessId,
  initialConfig,
  template,
  initialFeatureToggles,
}: DashboardEditorProps) {
  const [config, setConfig] = useState(initialConfig);
  const [contentBlocks, setContentBlocks] = useState<Record<string, unknown>>(initialConfig.content_blocks ?? {});
  const [colorScheme, setColorScheme] = useState<Record<string, unknown>>(initialConfig.color_scheme ?? {});
  const [featureToggles, setFeatureToggles] = useState(initialFeatureToggles);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function updateSection(sectionId: string, content: Record<string, unknown>) {
    setContentBlocks((prev) => ({ ...prev, [sectionId]: content }));
    setDirty(true);
  }

  function updateColor(key: string, value: string) {
    setColorScheme((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function updateToggle(featureKey: string, enabled: boolean, toggleConfig?: Record<string, unknown>) {
    setFeatureToggles((prev) => {
      const existing = prev.find((f) => f.feature_key === featureKey);
      if (existing) {
        return prev.map((f) =>
          f.feature_key === featureKey ? { ...f, enabled, config: toggleConfig ?? f.config } : f
        );
      }
      return [...prev, { feature_key: featureKey, enabled, config: toggleConfig ?? {} }];
    });
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setConflict(false);
    try {
      const res = await fetch(`/api/site-config/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedVersion: config.version,
          contentBlocksPatch: contentBlocks,
          colorSchemePatch: colorScheme,
          featureTogglesPatch: featureToggles,
        }),
      });

      if (res.status === 409) {
        setConflict(true);
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Save failed (${res.status})`);
      }

      const result = await res.json();
      setConfig((prev) => ({ ...prev, version: result.newVersion }));
      setDirty(false);
      setSavedMessage("Saved");
      setTimeout(() => setSavedMessage(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  async function refetchAndDiscard() {
    const res = await fetch(`/api/site-config/${businessId}`);
    if (!res.ok) return;
    const latest = await res.json();
    setConfig(latest);
    setContentBlocks(latest.content_blocks ?? {});
    setColorScheme(latest.color_scheme ?? {});
    setDirty(false);
    setConflict(false);
  }

  async function togglePublish() {
    setSaving(true);
    setError(null);
    try {
      const nextStatus = config.status === "published" ? "draft" : "published";
      const res = await fetch(`/api/site-config/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedVersion: config.version, configStatus: nextStatus }),
      });

      if (res.status === 409) {
        setConflict(true);
        return;
      }
      if (!res.ok) throw new Error("Publish toggle failed");

      const result = await res.json();
      setConfig((prev) => ({ ...prev, version: result.newVersion, status: nextStatus }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem" }}>Site Editor</h1>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: config.status === "published" ? "green" : "#888" }}>
            {config.status}
          </span>
          <button onClick={togglePublish} disabled={saving}>
            {config.status === "published" ? "Unpublish" : "Publish"}
          </button>
        </div>
      </header>

      {conflict && (
        <div style={{ background: "#fff3cd", border: "1px solid #ffe69c", padding: "0.75rem", marginBottom: "1rem" }}>
          This site was edited elsewhere (chat or another tab) since you loaded it. Your unsaved changes here
          haven&apos;t been saved.
          <div style={{ marginTop: "0.5rem" }}>
            <button onClick={refetchAndDiscard}>Reload latest &amp; discard my changes</button>
          </div>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {template.structure.sections.map((section) => (
        <SectionEditor
          key={section.id}
          section={section}
          content={(contentBlocks[section.id] as Record<string, unknown>) ?? {}}
          onChange={(content) => updateSection(section.id, content)}
        />
      ))}

      <section style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #ddd" }}>
        <h2 style={{ fontSize: "1.1rem" }}>Appearance</h2>
        {(["primary", "secondary", "accent"] as const).map((key) => (
          <label key={key} style={{ display: "block", marginBottom: "0.5rem" }}>
            {key}
            <input
              type="text"
              value={(colorScheme[key] as string) ?? ""}
              placeholder="#000000"
              onChange={(e) => updateColor(key, e.target.value)}
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
        ))}
      </section>

      <FeatureTogglesPanel toggles={featureToggles} onChange={updateToggle} />

      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "white",
          padding: "1rem 0",
          borderTop: "1px solid #ddd",
          marginTop: "2rem",
        }}
      >
        <button onClick={save} disabled={!dirty || saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
        {savedMessage && <span style={{ marginLeft: "0.75rem", color: "green" }}>{savedMessage}</span>}
      </div>
    </div>
  );
}
