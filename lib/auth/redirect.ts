export const DEFAULT_AFTER_LOGIN = "/dashboard";

/**
 * Validates a post-login return path (the `?next=` query param).
 *
 * Only same-site paths inside /dashboard are allowed. Anything else —
 * absolute URLs, protocol-relative `//evil.com`, backslash tricks, control
 * characters, or paths outside the dashboard — falls back to the default.
 * This closes the open-redirect hole that an unchecked `next` param creates.
 */
export function safeNextPath(
  raw: string | null | undefined,
  fallback: string = DEFAULT_AFTER_LOGIN
): string {
  if (!raw || raw.length > 512) return fallback;
  if (/[\u0000-\u001f\u007f\\]/.test(raw)) return fallback;

  const isDashboardPath =
    raw === "/dashboard" ||
    raw.startsWith("/dashboard/") ||
    raw.startsWith("/dashboard?");

  return isDashboardPath ? raw : fallback;
}

/** Appends `?next=` to an auth-page link only when it differs from the default. */
export function withNext(href: string, next: string): string {
  return next === DEFAULT_AFTER_LOGIN
    ? href
    : `${href}?next=${encodeURIComponent(next)}`;
}
