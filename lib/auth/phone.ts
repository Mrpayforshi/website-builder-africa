/**
 * Normalizes Zimbabwean phone numbers to E.164 (+263XXXXXXXXX).
 * Accepts local (0771234567), bare national (771234567), or already-
 * international (+263771234567 / 263771234567) formats. Returns null if
 * the input doesn't reduce to a plausible 9-digit national number.
 */
export function normalizeZimPhone(raw: string): string | null {
  const digits = raw.trim().replace(/[^\d+]/g, "");

  let national: string | null = null;
  if (digits.startsWith("+263")) {
    national = digits.slice(4);
  } else if (digits.startsWith("263")) {
    national = digits.slice(3);
  } else if (digits.startsWith("0")) {
    national = digits.slice(1);
  } else if (/^\d{9}$/.test(digits)) {
    national = digits;
  }

  if (!national || !/^\d{9}$/.test(national)) return null;
  return `+263${national}`;
}

/**
 * Supabase Auth is email-based under the hood. Phone signups get a
 * synthetic internal address derived from the normalized E.164 number, so
 * the same auth.users table backs both signup methods.
 */
export function phoneAuthEmail(normalizedPhone: string): string {
  return `${normalizedPhone.replace("+", "")}@phone.internal`;
}
