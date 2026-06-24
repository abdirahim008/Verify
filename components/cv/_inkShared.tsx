import "server-only";

// Shared pieces for the white-page "ink" CV templates (Classic, Profile,
// Grid, Crest, …) ported from the Claude Design handoff. Pure monochrome
// ink palette; the one permitted accent is the Sahan verified green.

export const INK = {
  ink: "#16130f",      // headings / strong text
  body: "#3a352f",     // body copy
  bodySoft: "#4a443d",
  muted: "#6a645c",    // org / secondary
  muted2: "#5a544c",
  faint: "#8a847c",    // dates / tertiary
  faint2: "#bdb7ad",   // dashes, index numerals
  hair: "#d7d3cc",     // hairline divider
  hair2: "#e2ded7",
  hair3: "#eceae4",
  verified: "#1d6647", // the only accent — Sahan verified green
};

// Compact inline verified mark — a small green check + "Verified". The issuer
// is intentionally not shown; the green badge alone signals a checked claim.
// `note` is accepted for call-site compatibility but no longer rendered.
export function VerifiedMark({ size = 9 }: { note?: string; size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", color: INK.verified, fontWeight: 600, fontSize: `${size + 0.5}px`, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
      <svg width={size} height={size} viewBox="0 0 11 11" aria-hidden style={{ flex: "none" }}>
        <circle cx="5.5" cy="5.5" r="5.5" fill={INK.verified} />
        <path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
      Verified
    </span>
  );
}

// Colour-band templates (Crest/Endnote/Frame) take an adjustable accent;
// the on-band text/line colours derive from its luminance (light text on
// dark bands, dark on light). Mirrors the handoff's renderVals().
export function bandColors(accent: string) {
  const hex = (accent || "#20304d").replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const dark = lum < 0.6;
  return {
    accent: accent || "#20304d",
    onBand: dark ? "#ffffff" : "#1a1a1a",
    onBandMuted: dark ? "rgba(255,255,255,0.70)" : "#5a544c",
    bandLine: dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.18)",
  };
}

// "Eleanor Whitfield" → "EW"; single token → first two letters.
export function initials(name: string): string {
  const t = name.trim().split(/\s+/).filter(Boolean);
  if (!t.length) return "·";
  if (t.length === 1) return t[0].slice(0, 2).toUpperCase();
  return (t[0][0] + t[t.length - 1][0]).toUpperCase();
}

// A profile description may pack several achievements into one string with
// "• " separators (how the builder stores them) or newlines. Split into
// bullet lines; a single chunk renders as one line.
export function toBullets(description: string): string[] {
  if (!description) return [];
  return description
    .split(/\s*[•·]\s*|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// "English (fluent)" → { name: "English", level: "Fluent" }.
export function splitLang(lang: string): { name: string; level: string } {
  const m = lang.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (m) return { name: m[1].trim(), level: cap(m[2].trim()) };
  return { name: lang.trim(), level: "" };
}

function cap(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

// Contact bits an individual actually has (no website/linkedin in schema).
export function contactParts(d: { location: string; phone: string; email: string }): string[] {
  return [d.location, d.phone, d.email].filter(Boolean);
}
