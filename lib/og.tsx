import { ImageResponse } from "next/og";

// Shared OG-image builder. Renders a 1200×630 branded card via Satori
// (next/og). Used by the site-wide image and per-guide images so every
// link shared on WhatsApp / Facebook / LinkedIn shows a proper preview —
// the social channel that drives most of our traffic.
//
// Runs on the EDGE runtime and loads fonts via fetch(import.meta.url)
// rather than node fs. That's deliberate: the node runtime hits a
// Windows-only malformed-URL bug in @vercel/og's default-font loader, and
// the edge path avoids it while working identically on Vercel. Fonts are
// static IBM Plex Serif TTFs in assets/fonts (Satori can't use woff2).

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const C = {
  cream: "#f3f2ef",
  ink: "#1c1c1c",
  muted: "#5e6166",
  sienna: "#0a5cad",
  verified: "#067a5e",
};

// Cache the fetched font buffers across invocations on a warm instance.
let fontCache: Array<{ name: string; data: ArrayBuffer; weight: 400 | 600; style: "normal" }> | null = null;

async function loadFonts() {
  if (fontCache) return fontCache;
  const [regular, semibold] = await Promise.all([
    fetch(new URL("../assets/fonts/serif-regular.ttf", import.meta.url)).then((r) => r.arrayBuffer()),
    fetch(new URL("../assets/fonts/serif-semibold.ttf", import.meta.url)).then((r) => r.arrayBuffer()),
  ]);
  fontCache = [
    { name: "Serif", data: regular, weight: 400, style: "normal" },
    { name: "Serif", data: semibold, weight: 600, style: "normal" },
  ];
  return fontCache;
}

interface OgOptions {
  eyebrow: string;
  title: string;
  kicker?: string;
}

export async function renderOgImage({ eyebrow, title, kicker }: OgOptions) {
  const fonts = await loadFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          background: C.cream, padding: "64px 72px", fontFamily: "Serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: -120, right: -120, width: 460, height: 460, borderRadius: 460, background: "rgba(10,92,173,0.08)" }} />

        <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 600, color: C.ink, letterSpacing: -0.5 }}>
          Sahan<span style={{ color: C.sienna }}>.</span>
        </div>

        <div style={{ marginTop: 56, fontSize: 22, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: C.sienna }}>
          {eyebrow}
        </div>

        <div style={{ marginTop: 18, fontSize: title.length > 60 ? 56 : 68, fontWeight: 600, color: C.ink, lineHeight: 1.06, letterSpacing: -1.5, maxWidth: 980, display: "flex" }}>
          {title}
        </div>

        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 24, color: C.muted, display: "flex" }}>
            {kicker ?? "Free · mobile-friendly · for the Horn of Africa"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#d8eee5", color: C.verified, padding: "10px 20px", borderRadius: 999, fontSize: 22, fontWeight: 600 }}>
            <svg width="22" height="22" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="11" fill={C.verified} />
              <path d="M6 11.2 L9.4 14.6 L16 8" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Verified profiles
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
