"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeZimPhone, phoneAuthEmail } from "@/lib/auth/phone";
import styles from "@/styles/auth.module.css";

type Method = "email" | "phone";

export function LoginForm() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    let authEmail = identifier.trim();
    if (method === "phone") {
      const normalized = normalizeZimPhone(identifier);
      if (!normalized) {
        setError("Enter a valid Zimbabwean number, e.g. 0771 234 567.");
        return;
      }
      authEmail = phoneAuthEmail(normalized);
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });
    setLoading(false);

    if (signInError) {
      setError("Couldn't log you in — check your details and try again.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className={styles.scene}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.card}>
        <a className={styles.logo} href="/">
          <span className={styles.logoMark}>R</span>
          Rivo
        </a>
        <h1>Welcome back</h1>
        <p className={styles.lede}>Log in to keep building.</p>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${method === "email" ? styles.tabActive : ""}`}
            onClick={() => setMethod("email")}
          >
            Email
          </button>
          <button
            type="button"
            className={`${styles.tab} ${method === "phone" ? styles.tabActive : ""}`}
            onClick={() => setMethod("phone")}
          >
            Phone
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>{method === "email" ? "Email" : "Phone number"}</span>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={method === "email" ? "you@business.co.zw" : "0771 234 567"}
              type={method === "email" ? "email" : "tel"}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className={styles.switch}>
          Don&apos;t have an account? <a href="/signup">Start building</a>
        </p>
      </div>
    </div>
  );
}
