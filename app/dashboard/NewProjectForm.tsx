"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

export function NewProjectForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startProject(description: string) {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/businesses", { method: "POST" });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setError(data?.error ?? "Couldn't start a new project — try again.");
      setLoading(false);
      return;
    }

    const intakeUrl = description
      ? `/dashboard/${data.businessId}/intake?first=${encodeURIComponent(description)}`
      : `/dashboard/${data.businessId}/intake`;

    router.push(intakeUrl);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    startProject(value.trim());
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) startProject(value.trim());
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.promptForm}>
      <textarea
        className={styles.promptTextarea}
        placeholder="Describe the business you want to build…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        rows={2}
      />
      <div className={styles.promptToolbar}>
        <span className={styles.promptAdd} aria-hidden="true">
          +
        </span>
        <button type="submit" className={styles.promptSubmit} disabled={loading}>
          {loading ? "Starting…" : "Build"}
        </button>
      </div>
      {error && <p className={styles.promptError}>{error}</p>}
    </form>
  );
}
