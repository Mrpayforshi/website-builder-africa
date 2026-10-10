/**
 * Zimbabwean mobile prefixes (after the leading 0 / +263):
 * 71 NetOne, 73 Telecel, 77 and 78 Econet.
 */
const ZIM_MOBILE_NATIONAL = /^(71|73|77|78)\d{7}$/;

/**
 * Normalizes Zimbabwean MOBILE numbers to E.164 (+263XXXXXXXXX).
 * Accepts local (0771234567), bare national (771234567), or international
 * (+263771234567 / 263771234567 / 00263771234567), with spaces, dashes,
 * dots or brackets as separators. Returns null for anything else —
 * including letters or stray characters, which are rejected rather than
 * silently stripped — and for numbers that don't start with a valid mobile
 * prefix.
 */
export function normalizeZimPhone(raw: string): string | null {
  const compact = raw.trim().replace(/[\s\-().]/g, "");
  if (!/^\+?\d+$/.test(compact)) return null;

  let national: string;
  if (compact.startsWith("+263")) {
    national = compact.slice(4);
  } else if (compact.startsWith("00263")) {
    national = compact.slice(5);
  } else if (compact.startsWith("263")) {
    national = compact.slice(3);
  } else if (compact.startsWith("0")) {
    national = compact.slice(1);
  } else {
    national = compact;
  }

  if (!ZIM_MOBILE_NATIONAL.test(national)) return null;
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
