import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/content/guides";
import { SITE } from "@/lib/seo";

// Sitemap: marketing routes + every guide landing page. Public profile
// URLs are per-user and intentionally NOT indexed (CLAUDE.md §3 — no
// public browse of all profiles). In-app routes live behind auth and are
// disallowed in robots.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const now = new Date().toISOString();

  const marketing: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const guides: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${base}/guides/${g.slug}`,
    lastModified: g.updated,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...marketing, ...guides];
}
