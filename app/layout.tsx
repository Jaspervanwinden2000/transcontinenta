import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} h-full bg-[#0F0F14] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
