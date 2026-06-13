import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { JsonLd } from "@/components/JsonLd";
import { SITE, organizationLd, webSiteLd, softwareAppLd } from "@/lib/seo";

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
  title: {
    default: "Sahan — Free CV & company-profile maker for East Africa",
    template: "%s · Sahan",
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  keywords: [
    "humanitarian CV template", "NGO CV maker", "CV format Somalia",
    "CV format Kenya", "company profile template for tender",
    "make CV on phone", "free CV maker East Africa", "verified CV",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Sahan — Free CV & company-profile maker for East Africa",
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: "en",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sahan — Free CV & company-profile maker for East Africa",
    description: "Build a structured profile and generate an elegant CV or company profile — free, on any phone.",
  },
  robots: { index: true, follow: true },
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
      <head>
        {/* Site-wide structured data — identifies the brand + app to
            search engines and AI answer engines. */}
        <JsonLd data={[organizationLd(), webSiteLd(), softwareAppLd()]} />
      </head>
      <body className="min-h-screen bg-cream text-ink">
        {children}
        {/* Privacy-friendly, cookieless analytics + Core Web Vitals.
            No-ops outside Vercel; collects once deployed. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
