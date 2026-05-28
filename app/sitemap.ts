import type { MetadataRoute } from "next";

// Minimal sitemap. Only marketing routes — public profile URLs are
// per-user and we don't expose an index of them (consistent with §3
// "no public search/browse of all profiles").
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://sahan.example";
  const now = new Date().toISOString();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
