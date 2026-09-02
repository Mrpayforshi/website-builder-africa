import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { LiteModeStyles } from "@/components/market-fit/LiteModeStyles";
import { readLiteModeCookie, shouldRenderLiteMode, LITE_MODE_COOKIE } from "@/lib/market-fit/bandwidth";

export const metadata: Metadata = {
  title: "Website Builder Africa",
  description:
    "AI chat-based website builder for small businesses in Zimbabwe/Africa.",
};

// Lite mode is a bandwidth-saving degrade for public tenant sites. It must
// never apply to the staff dashboard — a business owner who turned lite
// mode on while browsing their own public site would otherwise have image
// previews and map-embed iframes silently hidden inside their own editing
// forms, with no indication why. Scoped off via the x-pathname header
// middleware sets on every platform-host request.
const LITE_MODE_EXCLUDED_PREFIXES = ["/dashboard"];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const pathname = headerStore.get("x-pathname") ?? "";
  const isLiteModeExcluded = LITE_MODE_EXCLUDED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const preference = readLiteModeCookie(cookieStore.get(LITE_MODE_COOKIE)?.value);
  const liteMode =
    !isLiteModeExcluded && shouldRenderLiteMode(preference, headerStore.get("save-data"));

  return (
    <html lang="en">
      <body data-lite-mode={liteMode ? "true" : "false"}>
        {liteMode && <LiteModeStyles />}
        {children}
      </body>
    </html>
  );
}
