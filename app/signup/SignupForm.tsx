"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeZimPhone, phoneAuthEmail } from "@/lib/auth/phone";
import { withNext } from "@/lib/auth/redirect";
import styles from "@/styles/auth.module.css";

type Method = "email" | "phone";

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 72; // bcrypt ignores everything past 72 bytes

const EXISTING_ACCOUNT_MESSAGE =
  "We couldn't create that account. If you already have one, log in instead.";
const RATE_LIMIT_MESSAGE = "Too many attempts. Wait a few minutes and try again.";

/**
 * Maps Supabase signup errors to fixed, friendly copy. The raw error message
 * is never shown, so internals (and the exact "already registered" wording)
 * don't leak to the page.
 */
function friendlySignupError(err: {
  code?: string;
  status?: number;
  message: string;
}): string {
  if (err.status === 429) return RATE_LIMIT_MESSAGE;

  switch (err.code) {
    case "user_already_exists":
    case "email_exists":
      return EXISTING_ACCOUNT_MESSAGE;
    case "weak_password":
      return "That password is too weak or has appeared in a known data breach. Choose a longer, less common one.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return RATE_LIMIT_MESSAGE;
    case "email_address_invalid":
      return "That email address doesn't look valid.";
    case "signup_disabled":
      return "Sign-ups are paused right now. Please try again later.";
  }

  if (/already (been )?registered/i.test(err.message)) return EXISTING_ACCOUNT_MESSAGE;
  return "We couldn't create your account. Check your details and try again.";
}

export function SignupForm({ next }: { next: string }) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("email");
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

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
    let phone: string | null = null;

    if (method === "phone") {
      const normalized = normalizeZimPhone(identifier);
      if (!normalized) {
        setError("Enter a valid Zimbabwean mobile number, e.g. 0771 234 567.");
        return;
      }
      phone = normalized;
      authEmail = phoneAuthEmail(normalized);
    }

    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password.length > MAX_PASSWORD) {
      setError(`Password can be at most ${MAX_PASSWORD} characters.`);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: authEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim().slice(0, 100) || null,
            phone,
          },
        },
      });

      if (signUpError) {
        setError(friendlySignupError(signUpError));
        return;
      }

      if (data.session) {
        router.push(next);
        router.refresh();
        return;
      }

      // No session returned — either email confirmation is required on this
      // project, or (for phone signups) there's no real inbox behind the
      // synthetic address. Either way, don't leave the person stuck.
      setNeedsConfirmation(true);
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
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
          <a className={styles.link} href={withNext("/login", next)}>
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
            <span>Full name</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tadiwa Moyo"
              autoComplete="name"
              maxLength={100}
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
              autoComplete="new-password"
              minLength={MIN_PASSWORD}
              maxLength={MAX_PASSWORD}
              required
            />
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className={styles.switch}>
          Already have an account? <a href={withNext("/login", next)}>Log in</a>
        </p>
      </div>
    </div>
  );
}
