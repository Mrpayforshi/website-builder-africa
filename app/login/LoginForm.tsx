"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeZimPhone, phoneAuthEmail } from "@/lib/auth/phone";
import { withNext } from "@/lib/auth/redirect";
import styles from "@/styles/auth.module.css";

type Method = "email" | "phone";

const GENERIC_LOGIN_ERROR = "Couldn't log you in — check your details and try again.";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMethod(m: Method) {
    setMethod(m);
    setIdentifier("");
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    let authEmail = identifier.trim().toLowerCase();
    if (method === "phone") {
      const normalized = normalizeZimPhone(identifier);
      if (!normalized) {
        setError("Enter a valid Zimbabwean mobile number, e.g. 0771 234 567.");
        return;
      }
      authEmail = phoneAuthEmail(normalized);
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });

      if (signInError) {
        // Same message for wrong password and unknown account, so the form
        // can't be used to discover which emails/numbers are registered.
        // Rate limiting is the one case worth distinguishing — it applies
        // to everyone and reveals nothing about any account.
        setError(
          signInError.status === 429
            ? "Too many attempts. Wait a few minutes and try again."
            : GENERIC_LOGIN_ERROR
        );
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
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
            onClick={() => switchMethod("email")}
          >
            Email
          </button>
          <button
            type="button"
            className={`${styles.tab} ${method === "phone" ? styles.tabActive : ""}`}
            onClick={() => switchMethod("phone")}
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
              autoComplete={method === "email" ? "email" : "tel"}
              maxLength={254}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              maxLength={72}
              required
            />
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className={styles.switch}>
          Don&apos;t have an account? <a href={withNext("/signup", next)}>Start building</a>
        </p>
      </div>
    </div>
  );
}
