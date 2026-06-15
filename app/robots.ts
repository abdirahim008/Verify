import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

// Crawlers may index the marketing site, guides, and public profiles
// (/u/*). Everything behind auth and all API routes are disallowed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/guides", "/u/"],
      disallow: ["/home", "/profile", "/settings", "/verification", "/admin", "/api/", "/auth/"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
