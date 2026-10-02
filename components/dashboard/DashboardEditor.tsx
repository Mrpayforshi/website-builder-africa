"use client";

import { useState } from "react";
import Link from "next/link";
import type { SiteConfig } from "@/types/database";
import type { Template, GalleryTemplateDetail } from "@/lib/templates/template-store";
import { SectionEditor } from "@/components/dashboard/SectionEditor";
import { FeatureTogglesPanel, type FeatureToggleState } from "@/components/dashboard/FeatureTogglesPanel";
import { EditorChat } from "@/components/dashboard/EditorChat";
import { TemplateSite } from "@/app/templates/[id]/TemplateSite";
import styles from "./editor-workspace.module.css";

interface DashboardEditorProps {
  businessId: string;
  businessName: string;
  slug: string;
  initialConfig: SiteConfig;
  template: Template;
  galleryTemplate: GalleryTemplateDetail | null;
  initialFeatureToggles: FeatureToggleState[];
  welcome: boolean;
}

export function DashboardEditor({
  businessId,
  businessName,
  slug,
  initialConfig,
  template,
  galleryTemplate,
  initialFeatureToggles,
  welcome,
}: DashboardEditorProps) {
  const [tab, setTab] = useState<"chat" | "edit" | "preview">("chat");
  const [config, setConfig] = useState(initialConfig);
  const [contentBlocks, setContentBlocks] = useState<Record<string, unknown>>(initialConfig.content_blocks ?? {});
  const [colorScheme, setColorScheme] = useState<Record<string, unknown>>(initialConfig.color_scheme ?? {});
  const [featureToggles, setFeatureToggles] = useState(initialFeatureToggles);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Live preview: the same component the gallery uses, fed with this site's
  // own (even unsaved) content. Gallery-linked sites keep their bespoke design.
  const previewTemplate: GalleryTemplateDetail = {
    id: galleryTemplate?.id ?? template.id,
    category: template.category,
    categoryLabel: galleryTemplate?.categoryLabel ?? "",
    name: businessName,
    description: galleryTemplate?.description ?? "",
    features: galleryTemplate?.features ?? [],
    structure: galleryTemplate?.structure ?? template.structure,
    contentBlocks,
  };

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

  // The AI chat just changed the site. Pull the new version into the preview,
  // unless the user has unsaved edits — then use the existing conflict banner
  // rather than silently overwriting their typing.
  async function handleChatChanged() {
    if (dirty) {
      setConflict(true);
      return;
    }
    await refetchAndDiscard();
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

  const isLive = config.status === "published";

  return (
    <div className={styles.root} data-tab={tab}>
      <header className={styles.topbar}>
        <div className={styles.topLeft}>
          <Link href="/dashboard" className={styles.back}>
            ← Projects
          </Link>
          <span className={styles.projectName}>{businessName}</span>
        </div>
        <div className={styles.topRight}>
          <Link href={`/dashboard/${businessId}/orders`} className={styles.link}>
            Orders
          </Link>
          <span className={`${styles.status} ${isLive ? styles.statusLive : ""}`}>{isLive ? "Live" : "Draft"}</span>
          <button className={styles.publishBtn} onClick={togglePublish} disabled={saving}>
            {isLive ? "Unpublish" : "Publish"}
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.left}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab !== "edit" && tab !== "preview" ? styles.tabActive : ""}`}
              onClick={() => setTab("chat")}
            >
              Chat
            </button>
            <button className={`${styles.tab} ${tab === "edit" ? styles.tabActive : ""}`} onClick={() => setTab("edit")}>
              Edit content
            </button>
            <button
              className={`${styles.tab} ${styles.previewTab} ${tab === "preview" ? styles.tabActive : ""}`}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
          </div>

          {conflict && (
            <div className={styles.notice}>
              This site was changed elsewhere (chat or another tab) since you loaded it. Your unsaved edits
              haven&apos;t been saved.
              <div>
                <button onClick={refetchAndDiscard}>Reload latest &amp; discard my changes</button>
              </div>
            </div>
          )}
          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.pane} style={{ display: tab === "edit" ? "none" : "flex" }}>
            <EditorChat
              businessId={businessId}
              businessName={businessName}
              welcome={welcome}
              onSiteChanged={handleChatChanged}
            />
          </div>

          <div className={styles.pane} style={{ display: tab === "edit" ? "flex" : "none" }}>
            <div className={styles.editPane}>
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
            </div>
            <div className={styles.saveBar}>
              <button onClick={save} disabled={!dirty || saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
              {savedMessage && <span className={styles.saved}>{savedMessage}</span>}
            </div>
          </div>
        </aside>

        <main className={styles.right}>
          <div className={styles.previewScroller}>
            <div className={styles.browser}>
              <div className={styles.urlBar}>
                <span className={styles.urlDots}>
                  <span />
                  <span />
                  <span />
                </span>
                {slug ? `${slug}.rivo.app` : "your-site.rivo.app"}
              </div>
              <TemplateSite template={previewTemplate} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
