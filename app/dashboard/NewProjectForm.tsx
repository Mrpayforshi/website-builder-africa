"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "retail", label: "Retail / Shop" },
  { value: "services", label: "Services" },
  { value: "food", label: "Food & Restaurant" },
  { value: "professional", label: "Professional" },
  { value: "ngo_community", label: "NGO / Community" },
  { value: "events_portfolio", label: "Events & Portfolio" },
];

export function NewProjectForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give your project a name.");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), category }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Couldn't create the project — try again.");
      return;
    }

    router.push(`/dashboard/${data.businessId}`);
  }

  if (!open) {
    return (
      <button type="button" className={styles.newProjectTrigger} onClick={() => setOpen(true)}>
        <span className={styles.newProjectPlus}>+</span> New project
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.newProjectForm}>
      <div className={styles.newProjectRow}>
        <label className={styles.field}>
          <span>Business name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Chikwiya Grocers"
            autoFocus
          />
        </label>
        <label className={styles.field}>
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.newProjectActions}>
        <button type="button" className={styles.cancel} onClick={() => setOpen(false)} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? "Creating…" : "Create project"}
        </button>
      </div>
    </form>
  );
}
