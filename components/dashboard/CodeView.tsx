"use client";

import { useMemo, useState } from "react";
import type { FeatureToggleState } from "@/components/dashboard/FeatureTogglesPanel";
import styles from "./editor-workspace.module.css";

interface CodeViewProps {
  businessId: string;
  businessName: string;
  slug: string;
  status: string;
  version: number;
  publishedAt: string | null;
  templateId: string;
  templateName: string;
  templateCategory: string;
  templateStructure: unknown;
  sectionIds: string[];
  contentBlocks: Record<string, unknown>;
  colorScheme: Record<string, unknown>;
  featureToggles: FeatureToggleState[];
}

interface CodeFile {
  path: string;
  content: string;
}

interface TreeFolder {
  name: string;
  files: CodeFile[];
}

function toJson(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2);
}

// Tiny JSON highlighter: keys, strings, numbers, booleans/null.
const TOKEN_RE = /("(?:\\.|[^"\\])*"\s*:|"(?:\\.|[^"\\])*"|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

function highlightLine(line: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(line)) !== null) {
    if (match.index > last) parts.push(line.slice(last, match.index));
    const token = match[0];
    let cls = styles.tokNum;
    if (token.startsWith('"')) {
      cls = /:\s*$/.test(token) ? styles.tokKey : styles.tokStr;
    } else if (token === "true" || token === "false" || token === "null") {
      cls = styles.tokLit;
    }
    parts.push(
      <span key={match.index} className={cls}>
        {token}
      </span>
    );
    last = match.index + token.length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

export function CodeView({
  businessId,
  businessName,
  slug,
  status,
  version,
  publishedAt,
  templateId,
  templateName,
  templateCategory,
  templateStructure,
  sectionIds,
  contentBlocks,
  colorScheme,
  featureToggles,
}: CodeViewProps) {
  const [query, setQuery] = useState("");
  const [selectedPath, setSelectedPath] = useState("site.json");
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const files = useMemo<CodeFile[]>(() => {
    const list: CodeFile[] = [
      {
        path: "site.json",
        content: toJson({
          business: { id: businessId, name: businessName, slug },
          status,
          version,
          published_at: publishedAt,
          template: { id: templateId, name: templateName, category: templateCategory },
        }),
      },
    ];

    // One file per template section, plus any content block that is not part
    // of the template structure, so nothing stored in the site is hidden.
    const ids = [...sectionIds];
    for (const key of Object.keys(contentBlocks)) {
      if (!ids.includes(key)) ids.push(key);
    }
    for (const id of ids) {
      list.push({ path: `content/${id}.json`, content: toJson(contentBlocks[id] ?? {}) });
    }

    list.push({ path: "design/color_scheme.json", content: toJson(colorScheme) });
    list.push({ path: "design/template_structure.json", content: toJson(templateStructure) });
    list.push({ path: "features/feature_toggles.json", content: toJson(featureToggles) });
    return list;
  }, [
    businessId,
    businessName,
    slug,
    status,
    version,
    publishedAt,
    templateId,
    templateName,
    templateCategory,
    templateStructure,
    sectionIds,
    contentBlocks,
    colorScheme,
    featureToggles,
  ]);

  const needle = query.trim().toLowerCase();
  const visible = needle ? files.filter((f) => f.path.toLowerCase().includes(needle)) : files;

  const folders: TreeFolder[] = [];
  const rootFiles: CodeFile[] = [];
  for (const file of visible) {
    const slash = file.path.indexOf("/");
    if (slash === -1) {
      rootFiles.push(file);
      continue;
    }
    const name = file.path.slice(0, slash);
    let folder = folders.find((f) => f.name === name);
    if (!folder) {
      folder = { name, files: [] };
      folders.push(folder);
    }
    folder.files.push(file);
  }

  const selected = files.find((f) => f.path === selectedPath) ?? files[0];
  const lines = selected.content.split("\n");

  function toggleFolder(name: string) {
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(selected.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (insecure context, permissions) — ignore.
    }
  }

  function renderFile(file: CodeFile, indent: boolean) {
    const label = file.path.slice(file.path.lastIndexOf("/") + 1);
    const active = file.path === selected.path;
    return (
      <button
        key={file.path}
        type="button"
        className={`${styles.treeFile} ${indent ? styles.treeIndent : ""} ${active ? styles.treeFileActive : ""}`}
        onClick={() => setSelectedPath(file.path)}
        title={file.path}
      >
        <span className={styles.treeIcon}>{"{ }"}</span>
        {label}
      </button>
    );
  }

  return (
    <div className={styles.codeRoot}>
      <aside className={styles.codeTree}>
        <input
          className={styles.codeSearch}
          type="search"
          placeholder="Search files"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className={styles.treeScroll}>
          {folders.map((folder) => {
            const open = needle ? true : !closed.has(folder.name);
            return (
              <div key={folder.name}>
                <button type="button" className={styles.treeFolder} onClick={() => toggleFolder(folder.name)}>
                  <span className={styles.treeChevron}>{open ? "▾" : "▸"}</span>
                  {folder.name}
                </button>
                {open && folder.files.map((file) => renderFile(file, true))}
              </div>
            );
          })}
          {rootFiles.map((file) => renderFile(file, false))}
          {visible.length === 0 && <p className={styles.treeEmpty}>No files match.</p>}
        </div>
      </aside>

      <section className={styles.codeViewer}>
        <div className={styles.codeHead}>
          <span className={styles.codePath}>{selected.path}</span>
          <span className={styles.readOnly}>Read only</span>
          <button type="button" className={styles.copyBtn} onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className={styles.codeBody}>
          <pre className={styles.codePre}>
            {lines.map((line, i) => (
              <div key={i} className={styles.codeLine}>
                <span className={styles.codeLn}>{i + 1}</span>
                <span className={styles.codeText}>{highlightLine(line)}</span>
              </div>
            ))}
          </pre>
        </div>
      </section>
    </div>
  );
}
