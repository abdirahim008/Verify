// Shared bits for the five "Company Profile System" templates (Standard,
// Dossier, Banner, Broadsheet, Bento). Each design ships with an adjustable
// `accent`; the rest of its colour roles derive from that one hex by
// luminance — ported verbatim from the design handoff's renderVals().

export interface AccentSet {
  accent: string;
  onAccent: string;        // text/icon colour on top of an accent fill
  onAccentMuted: string;   // secondary text on an accent fill
  accentLine: string;      // org-chart connector lines
  tint: string;            // 6%-opacity accent wash (callout backgrounds)
  tintBorder: string;      // 16%-opacity accent border
}

export function deriveAccent(accent: string): AccentSet {
  const hex = (accent || "#20304d").replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) || 0;
  const g = parseInt(hex.slice(2, 4), 16) || 0;
  const b = parseInt(hex.slice(4, 6), 16) || 0;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const dark = lum < 0.6;
  return {
    accent,
    onAccent: dark ? "#ffffff" : "#1a1a1a",
    onAccentMuted: dark ? "rgba(255,255,255,0.72)" : "#5a544c",
    accentLine: "rgba(0,0,0,0.22)",
    tint: `rgba(${r},${g},${b},0.06)`,
    tintBorder: `rgba(${r},${g},${b},0.16)`,
  };
}

// Single-letter company monogram (first letter of the name).
export function monogram(name: string): string {
  return (name.trim()[0] ?? "·").toUpperCase();
}

// Up to two initials for the CEO avatar circle ("Daniel Okafor" → "DO").
export function ceoInitials(name: string): string {
  const toks = name.trim().split(/\s+/).filter(Boolean);
  return ((toks[0]?.[0] ?? "") + (toks[1]?.[0] ?? "")).toUpperCase() || "—";
}

// "Company Profile · 2026" run-line used in headers/covers.
export function profileLine(year: number): string {
  return `Company Profile · ${year}`;
}
