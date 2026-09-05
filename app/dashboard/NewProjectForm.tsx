"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

export function NewProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/businesses", { method: "POST" });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setError(data?.error ?? "Couldn't start a new project — try again.");
      setLoading(false);
      return;
    }

    router.push(`/dashboard/${data.businessId}/intake`);
  }

  return (
    <div className={styles.newProjectBlock}>
      <button type="button" className={styles.newProjectTrigger} onClick={handleClick} disabled={loading}>
        <span className={styles.newProjectPlus}>+</span>
        {loading ? "Starting…" : "New project"}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
