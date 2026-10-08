import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

// Used by the dashboard editor (components/dashboard/editor-workspace.module.css).
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Rivo",
  description:
    "Rivo — the AI chat-based website builder for small businesses in Zimbabwe/Africa.",
};

// Runs before first paint so the page never flashes the wrong theme. Order of
// preference: the visitor's saved choice, then their system setting, then dark.
// Only the marketing pages (home, founders, for-work, resources) read this
// attribute; the dashboard and published tenant sites ignore it.
// Keep the storage key in sync with components/marketing/ThemeToggle.tsx.
const THEME_INIT = `(function(){var t=null;try{t=localStorage.getItem("rivo-theme")}catch(e){}if(t!=="light"&&t!=="dark"){try{t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}catch(e){t="dark"}}document.documentElement.setAttribute("data-theme",t)})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
