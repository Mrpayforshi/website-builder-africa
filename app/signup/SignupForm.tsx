"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeZimPhone, phoneAuthEmail } from "@/lib/auth/phone";
import styles from "@/styles/auth.module.css";

type Method = "email" | "phone";

export function SignupForm() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("email");
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    let authEmail = identifier.trim();
    let phone: string | null = null;

    if (method === "phone") {
      const normalized = normalizeZimPhone(identifier);
      if (!normalized) {
        setError("Enter a valid Zimbabwean number, e.g. 0771 234 567.");
        return;
      }
      phone = normalized;
      authEmail = phoneAuthEmail(normalized);
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        data: {
          full_name: fullName || null,
          phone,
        },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    // No session returned — either email confirmation is required on this
    // project, or (for phone signups) there's no real inbox behind the
    // synthetic address. Either way, don't leave the person stuck.
    setNeedsConfirmation(true);
  }

  if (needsConfirmation) {
    return (
      <div className={styles.scene}>
        <div className={styles.glow} aria-hidden="true" />
        <div className={styles.card}>
          <a className={styles.logo} href="/">
            <span className={styles.logoMark}>R</span>
            Rivo
          </a>
          <h1>Almost there</h1>
          <p className={styles.lede}>
            {method === "phone"
              ? "Your account was created. Phone sign-up needs a quick manual confirmation right now — reach out and we'll activate it, or try logging in directly."
              : "We've sent a confirmation link to your email. Click it, then come back and log in."}
          </p>
          <a className={styles.link} href="/login">
            Go to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.scene}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.card}>
        <a className={styles.logo} href="/">
          <span className={styles.logoMark}>R</span>
          Rivo
        </a>
        <h1>Start building for free</h1>
        <p className={styles.lede}>Describe your business in chat and get a live site in minutes.</p>

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
            <span>Full name</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tadiwa Moyo"
              required
            />
          </label>

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
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              minLength={8}
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className={styles.switch}>
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
}
