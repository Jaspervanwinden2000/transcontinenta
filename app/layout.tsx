import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lisa — Transcontinenta Dealer Support",
  description: "AI dealer support assistent van Transcontinenta BV",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="h-full">
      <body className="h-full bg-[#0F0F14] text-white antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
