import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getGuide } from "@/lib/content/guides";

// Per-guide social card — shows the guide's own title so a shared link
// previews distinctly. Edge runtime (see lib/og.tsx).
export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Sahan guide";

export default function Image({ params }: { params: { slug: string } }) {
  const g = getGuide(params.slug);
  return renderOgImage({
    eyebrow: g ? (g.category === "cv" ? "Guide · For professionals" : "Guide · For organisations") : "Guide",
    title: g?.h1 ?? "Sahan guides",
    kicker: "Read free · sahan",
  });
}
