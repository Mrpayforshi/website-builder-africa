import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Builder Africa",
  description:
    "AI chat-based website builder for small businesses in Zimbabwe/Africa.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
