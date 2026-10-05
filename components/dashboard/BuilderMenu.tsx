"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./editor-workspace.module.css";

export interface ProjectLink {
  id: string;
  name: string;
}

interface BuilderMenuProps {
  open: boolean;
  onClose: () => void;
  projects: ProjectLink[];
  currentId: string;
  userEmail: string;
  /** True when the editor has unsaved changes — leaving asks for confirmation. */
  dirty: boolean;
}

const RECENTS_LIMIT = 6;

const ICONS = {
  new: "M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-4.3-4.3",
  dashboard: "M3 11l9-8 9 8M5 10v10h14V10",
  templates: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  connectors: "M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0V7zM12 16v5",
};

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export function BuilderMenu({ open, onClose, projects, currentId, userEmail, dirty }: BuilderMenuProps) {
  const router = useRouter();
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && searching) searchRef.current?.focus();
  }, [open, searching]);

  if (!open) return null;

  function confirmLeave(): boolean {
    return !dirty || window.confirm("You have unsaved changes. Leave without saving?");
  }

  function handleLinkClick(e: MouseEvent) {
    if (!confirmLeave()) {
      e.preventDefault();
      return;
    }
    onClose();
  }

  async function newProject() {
    if (creating || !confirmLeave()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/businesses", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.businessId) {
        setError(data?.error ?? "Couldn't start a new project. Try again.");
        return;
      }
      onClose();
      router.push(`/dashboard/${data.businessId}/intake`);
    } catch {
      setError("Couldn't start a new project. Try again.");
    } finally {
      setCreating(false);
    }
  }

  async function logOut() {
    if (!confirmLeave()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push("/login");
    router.refresh();
  }

  const needle = query.trim().toLowerCase();
  const listed = searching
    ? projects.filter((p) => p.name.toLowerCase().includes(needle))
    : projects.slice(0, RECENTS_LIMIT);

  return (
    <>
      <div className={styles.menuBackdrop} onClick={onClose} />
      <nav className={styles.menuPanel} aria-label="Rivo menu">
        <div className={styles.menuUser}>
          <span className={styles.menuAvatar}>{(userEmail.charAt(0) || "R").toUpperCase()}</span>
          <span className={styles.menuUserText}>{userEmail || "Your account"}</span>
        </div>

        <button type="button" className={styles.menuItem} onClick={newProject} disabled={creating}>
          <Icon d={ICONS.new} />
          {creating ? "Starting…" : "New project"}
        </button>
        <button
          type="button"
          className={`${styles.menuItem} ${searching ? styles.menuItemActive : ""}`}
          onClick={() => {
            setSearching((v) => !v);
            setQuery("");
          }}
        >
          <Icon d={ICONS.search} />
          Search
        </button>
        {searching && (
          <input
            ref={searchRef}
            className={styles.menuSearch}
            type="search"
            placeholder="Search your projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}

        <Link className={styles.menuItem} href="/dashboard" onClick={handleLinkClick}>
          <Icon d={ICONS.dashboard} />
          Dashboard
        </Link>
        <Link className={styles.menuItem} href="/dashboard/templates" onClick={handleLinkClick}>
          <Icon d={ICONS.templates} />
          Templates
        </Link>
        <Link className={styles.menuItem} href="/dashboard/connectors" onClick={handleLinkClick}>
          <Icon d={ICONS.connectors} />
          Connectors
        </Link>

        <p className={styles.menuSection}>{searching ? "Projects" : "Recents"}</p>
        <div className={styles.menuRecents}>
          {listed.length === 0 ? (
            <p className={styles.menuEmpty}>{searching ? "No projects match." : "No projects yet"}</p>
          ) : (
            listed.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/${p.id}`}
                className={`${styles.menuRecent} ${p.id === currentId ? styles.menuRecentActive : ""}`}
                onClick={handleLinkClick}
              >
                {p.name}
              </Link>
            ))
          )}
        </div>

        {error && <p className={styles.menuError}>{error}</p>}

        <div className={styles.menuFooter}>
          <button type="button" className={styles.menuLogout} onClick={logOut}>
            Log out
          </button>
        </div>
      </nav>
    </>
  );
}
