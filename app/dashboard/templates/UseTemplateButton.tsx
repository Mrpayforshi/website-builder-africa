"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UseTemplateButton({
  templateName,
  categoryLabel,
  className,
}: {
  templateName: string;
  categoryLabel: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (loading) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/businesses", { method: "POST" });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setError(data?.error ?? "Couldn't start a project — try again.");
      setLoading(false);
      return;
    }

    const first = `I want to start from the "${templateName}" template (${categoryLabel}).`;
    router.push(`/dashboard/${data.businessId}/intake?first=${encodeURIComponent(first)}`);
  }

  return (
    <>
      <button type="button" className={className} onClick={start} disabled={loading}>
        {loading ? "Starting…" : "Use template"}
      </button>
      {error && <span style={{ color: "#ff6b6b", fontSize: 12, marginLeft: 8 }}>{error}</span>}
    </>
  );
}
