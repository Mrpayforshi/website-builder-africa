import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { LiteModeStyles } from "@/components/market-fit/LiteModeStyles";
import { readLiteModeCookie, shouldRenderLiteMode, LITE_MODE_COOKIE } from "@/lib/market-fit/bandwidth";

export const metadata: Metadata = {
  title: "Website Builder Africa",
  description:
    "AI chat-based website builder for small businesses in Zimbabwe/Africa.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const preference = readLiteModeCookie(cookieStore.get(LITE_MODE_COOKIE)?.value);
  const liteMode = shouldRenderLiteMode(preference, headerStore.get("save-data"));

  return (
    <html lang="en">
      <body data-lite-mode={liteMode ? "true" : "false"}>
        {liteMode && <LiteModeStyles />}
        {children}
      </body>
    </html>
  );
}
