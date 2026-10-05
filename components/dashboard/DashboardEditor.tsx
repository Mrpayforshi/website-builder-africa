"use client";

import { useState } from "react";
import Link from "next/link";
import type { SiteConfig } from "@/types/database";
import type { Template, GalleryTemplateDetail } from "@/lib/templates/template-store";
import { SectionEditor } from "@/components/dashboard/SectionEditor";
import { FeatureTogglesPanel, type FeatureToggleState } from "@/components/dashboard/FeatureTogglesPanel";
import { EditorChat } from "@/components/dashboard/EditorChat";
import { InlineEditLayer } from "@/components/dashboard/InlineEditLayer";
import { CodeView } from "@/components/dashboard/CodeView";
import { MorePanel } from "@/components/dashboard/MorePanel";
import { BuilderMenu, type ProjectLink } from "@/components/dashboard/BuilderMenu";
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
  projects: ProjectLink[];
  userEmail: string;
}

type RightTab = "preview" | "edit" | "code" | "more";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "rivo.app";

const RIGHT_TABS: { key: RightTab; label: string; icon: React.ReactNode }[] = [
  {
    key: "preview",
    label: "Preview",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
      </svg>
    ),
  },
  {
    key: "edit",
    label: "Edit",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 20h4L19 9l-4-4L4 16v4z" />
        <path d="M13 7l4 4" />
      </svg>
    ),
  },
  {
    key: "code",
    label: "Code",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
      </svg>
    ),
  },
  {
    key: "more",
    label: "More",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 3l9 5-9 5-9-5 9-5z" />
        <path d="M3 13l9 5 9-5" />
      </svg>
    ),
  },
];

export function DashboardEditor({
  businessId,
  businessName,
  slug,
  initialConfig,
  template,
  galleryTemplate,
  initialFeatureToggles,
  welcome,
  projects,
  userEmail,
}: DashboardEditorProps) {
  const [rightTab, setRightTab] = useState<RightTab>("preview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"chat" | "site">("chat");
  const [inlineEdit, setInlineEdit] = useState(true);
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
  const siteHost = slug ? `${slug}.${ROOT_DOMAIN}` : null;
  const siteUrl = siteHost ? `https://${siteHost}` : null;

  function panelClass(tab: RightTab) {
    return `${styles.panel} ${rightTab === tab ? "" : styles.panelHidden}`;
  }

  return (
    <div className={styles.root} data-mobile={mobileView}>
      <header className={styles.topbar}>
        <div className={styles.topLeft}>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            title="Menu"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <rect x="3" y="4" width="18" height="16" rx="3" />
              <path d="M9 4v16" />
            </svg>
          </button>
          <span className={styles.projectName}>{businessName}</span>
        </div>

        <div className={styles.mobileSwitch} role="tablist" aria-label="Chat or site">
          <button
            type="button"
            className={`${styles.mobileBtn} ${mobileView === "chat" ? styles.mobileBtnActive : ""}`}
            onClick={() => setMobileView("chat")}
          >
            Chat
          </button>
          <button
            type="button"
            className={`${styles.mobileBtn} ${mobileView === "site" ? styles.mobileBtnActive : ""}`}
            onClick={() => setMobileView("site")}
          >
            Site
          </button>
        </div>

        <div className={styles.topCenter}>
          <div className={styles.tabGroup} role="tablist" aria-label="Site views">
            {RIGHT_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={rightTab === t.key}
                className={`${styles.tabBtn} ${rightTab === t.key ? styles.tabBtnActive : ""}`}
                onClick={() => setRightTab(t.key)}
                title={t.label}
              >
                {t.icon}
                <span className={styles.tabBtnLabel}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.topRight}>
          {siteHost && <span className={styles.hostChip}>{siteHost}</span>}
          {isLive && siteUrl && (
            <a className={styles.openLink} href={siteUrl} target="_blank" rel="noreferrer">
              Open ↗
            </a>
          )}
          <Link href={`/dashboard/${businessId}/orders`} className={styles.link}>
            Orders
          </Link>
          <span className={`${styles.status} ${isLive ? styles.statusLive : ""}`}>{isLive ? "Live" : "Draft"}</span>
          {savedMessage && <span className={styles.saved}>{savedMessage}</span>}
          {dirty && (
            <button className={styles.saveTop} onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          )}
          <button className={styles.publishBtn} onClick={togglePublish} disabled={saving}>
            {isLive ? "Unpublish" : "Publish"}
          </button>
        </div>
      </header>

      <BuilderMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        projects={projects}
        currentId={businessId}
        userEmail={userEmail}
        dirty={dirty}
      />

      {(conflict || error) && (
        <div className={styles.alerts}>
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
        </div>
      )}

      <div className={styles.body}>
        <aside className={styles.left}>
          <div className={styles.pane}>
            <EditorChat
              businessId={businessId}
              businessName={businessName}
              welcome={welcome}
              onSiteChanged={handleChatChanged}
            />
          </div>
        </aside>

        <main className={styles.right}>
          <div className={styles.panels}>
            <div className={`${panelClass("preview")} ${styles.previewPanel}`}>
              <div className={styles.previewScroller}>
                <div className={styles.browser}>
                  <div className={styles.urlBar}>
                    <span className={styles.urlDots}>
                      <span />
                      <span />
                      <span />
                    </span>
                    {siteHost ?? `your-site.${ROOT_DOMAIN}`}
                  </div>
                  <InlineEditLayer enabled={inlineEdit} contentBlocks={contentBlocks} onChange={updateSection}>
                    <TemplateSite template={previewTemplate} />
                  </InlineEditLayer>
                </div>
              </div>

              <div className={styles.editDock}>
                <div className={styles.editPill}>
                  <button
                    type="button"
                    className={inlineEdit ? styles.pillOn : ""}
                    onClick={() => setInlineEdit((v) => !v)}
                  >
                    ✎ Edit on page
                  </button>
                  {inlineEdit && <span className={styles.pillHint}>Click any text · Enter saves · Esc cancels</span>}
                </div>
              </div>
            </div>

            <div className={`${panelClass("edit")} ${styles.editPanel}`}>
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

            <div className={panelClass("code")}>
              <CodeView
                businessId={businessId}
                businessName={businessName}
                slug={slug}
                status={config.status}
                version={config.version}
                publishedAt={config.published_at}
                templateId={template.id}
                templateName={template.name}
                templateCategory={template.category}
                templateStructure={template.structure}
                sectionIds={template.structure.sections.map((s) => s.id)}
                contentBlocks={contentBlocks}
                colorScheme={colorScheme}
                featureToggles={featureToggles}
              />
            </div>

            <div className={panelClass("more")}>
              <MorePanel
                businessId={businessId}
                businessName={businessName}
                slug={slug}
                isLive={isLive}
                version={config.version}
                siteHost={siteHost}
                siteUrl={siteUrl}
                featureToggles={featureToggles}
                busy={saving}
                onTogglePublish={togglePublish}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
