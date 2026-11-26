import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crab Catcher — Scam message analyzer",
  description:
    "Paste a suspicious SMS, WhatsApp message or email and see why it might be a phishing scam: urgency tricks, fake links, impersonation and credential requests.",
  applicationName: "Crab Catcher",
  keywords: ["phishing", "scam", "fraud", "Malaysia", "SMS scam", "WhatsApp scam"],
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="app-shell min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
