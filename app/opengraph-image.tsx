import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

// Site-wide OG/social card. Next uses this for the root and any route
// without its own opengraph-image. Edge runtime — see lib/og.tsx.
export const runtime = "edge";
export const alt = "Sahan — free CV & company-profile maker for East Africa";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "For Somalia & East Africa",
    title: "A profile that earns trust. A CV that earns interviews.",
  });
}
