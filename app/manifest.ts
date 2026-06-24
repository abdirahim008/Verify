import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

// Web app manifest — enables "Add to home screen" (the app is mobile-first
// for the East Africa sector) and gives search/mobile a richer app signal.
// Icons reuse the App Router icon files (/icon.png, /apple-icon.png), which
// are already excluded from the auth middleware.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sahan — Verified CVs & company profiles",
    short_name: "Sahan",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f3f2ef",
    theme_color: "#f3f2ef",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };
}
