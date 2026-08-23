/**
 * Low-bandwidth mode: an alternate render path that strips heavy assets.
 * Two ways it can turn on:
 *  1. Automatic — the browser sends the `Save-Data: on` Client Hint
 *     (widely supported, no Accept-CH negotiation required, unlike
 *     Sec-CH-Downlink which would need this app to opt in via a response
 *     header first — left as a follow-up if finer-grained auto-detection
 *     is wanted later).
 *  2. Manual — the visitor picks "lite version" via LiteModeToggleLink,
 *     which sets a cookie that overrides auto-detection either way.
 *
 * This is intentionally decoupled from Workstream C's section components:
 * rather than threading a lowBandwidth prop through TemplateRenderer and
 * every section (which would require edits I can't safely make without
 * seeing that code), it renders a scoped stylesheet that degrades what's
 * already on the page — hides all but the first couple of images,
 * disables background-image/animation, forces system fonts. It's a lower
 * ceiling on savings than component-level omission, but it works today
 * with zero changes to C's components.
 */

export type LiteModePreference = "auto" | "on" | "off";

export function readLiteModeCookie(cookieValue: string | undefined): LiteModePreference {
  if (cookieValue === "on" || cookieValue === "off") return cookieValue;
  return "auto";
}

export function shouldRenderLiteMode(
  cookiePreference: LiteModePreference,
  saveDataHeader: string | null
): boolean {
  if (cookiePreference === "on") return true;
  if (cookiePreference === "off") return false;
  return saveDataHeader === "on";
}

export const LITE_MODE_COOKIE = "wba_lite_mode";
