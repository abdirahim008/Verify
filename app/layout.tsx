import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Self-host the brand fonts via next/font (subset, optimised, no runtime
// CDN call). Replaces the earlier <link> tag and resolves the build-time
// "no-page-custom-font" warning.
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: { default: "Sahan — Verified professional profiles", template: "%s · Sahan" },
  description:
    "Build a structured profile and download a beautiful CV or company profile. Verified claims, designed for the East Africa humanitarian sector.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  openGraph: {
    title: "Sahan — Verified professional profiles",
    description: "Build a structured profile and download a beautiful CV or company profile.",
    type: "website",
  },
};

// Next 14 inserts a default viewport tag, but we set it explicitly so
// the maximum-scale isn't capped (a11y), and so iOS Safari respects the
// safe-area insets we may use later.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f3f2ef",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${sourceSerif.variable}`}>
      <body className="min-h-screen bg-cream text-ink">{children}</body>
    </html>
  );
}
