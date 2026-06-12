// Central SEO constants + helpers. One place to change the canonical
// domain, brand strings, and social handles. Everything that emits
// metadata or JSON-LD reads from here.

export const SITE = {
  name: "Sahan",
  // Production domain. Set NEXT_PUBLIC_SITE_URL in the Vercel project to
  // the real domain on deploy; this fallback keeps dev + previews sane.
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://sahan.so").replace(/\/$/, ""),
  tagline: "Verified professional profiles & elegant CVs for the Horn of Africa",
  // One-paragraph positioning used as the default meta description.
  description:
    "Sahan is the simplest way for professionals and organisations in Somalia and East Africa to build a structured profile and generate an elegant, recruiter-ready CV or bid-ready company profile — free, on any phone, in minutes. Add verified badges to the experience and projects that matter.",
  locale: "en",
  twitter: "@sahanprofiles", // update if/when the handle exists
};

export function absoluteUrl(path = "/"): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

// JSON-LD blocks. Kept as plain objects so pages can compose them and
// drop them into a <JsonLd> component.

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    areaServed: ["Somalia", "Kenya", "Ethiopia", "South Sudan", "East Africa"],
    knowsAbout: [
      "CV writing", "humanitarian sector careers", "NGO recruitment",
      "company profiles", "tender documents", "professional verification",
    ],
  };
}

export function webSiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
  };
}

export function softwareAppLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android (mobile browser)",
    description:
      "Build a structured professional profile and generate an elegant CV or company profile PDF. Free, mobile-friendly, designed for the East Africa humanitarian and engineering sector.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Free CV generation in three editorial templates",
      "Bid-ready company profile templates",
      "Per-claim verified badges",
      "Curated colour themes",
      "Works on any mobile phone",
    ],
  };
}

export function breadcrumbLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function faqLd(faq: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function articleLd({
  headline, description, path, datePublished, dateModified,
}: { headline: string; description: string; path: string; datePublished: string; dateModified: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url: absoluteUrl(path),
    datePublished,
    dateModified,
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    mainEntityOfPage: absoluteUrl(path),
  };
}
