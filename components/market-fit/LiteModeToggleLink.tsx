import Link from "next/link";
import { LiteModePreference } from "@/lib/market-fit/bandwidth";

/**
 * Renders "Switch to lite version" / "Switch to full version" depending on
 * current preference. Hits a plain GET route (no auth — this is a visitor
 * preference, not a business setting) that sets the override cookie and
 * redirects back.
 */
export function LiteModeToggleLink({
  currentPreference,
  returnTo,
}: {
  currentPreference: LiteModePreference;
  returnTo: string;
}) {
  const switchingTo = currentPreference === "on" ? "off" : "on";
  const label = currentPreference === "on" ? "Switch to full version" : "View lite version";

  return (
    <Link
      href={`/api/features/lite-mode?set=${switchingTo}&returnTo=${encodeURIComponent(returnTo)}`}
      style={{ fontSize: "0.8rem", textDecoration: "underline" }}
    >
      {label}
    </Link>
  );
}
