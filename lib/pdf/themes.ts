// Curated theme palettes for the PDF templates.
//
// Deliberately NOT a free color picker: every palette here is chosen and
// contrast-checked so any combination a user picks still looks designed
// and prints clean (CLAUDE.md §6 — if the PDF looks generic or broken,
// the value proposition fails). Users get control; the design stays safe.
//
// Each theme's `overrides` keys map 1:1 onto the target template's colour
// constants and are spread over them at render time. `swatch` drives the
// picker UI. The FIRST theme in each list is the template's default.
//
// Pure module — imported by both the PDF routes (server) and the
// templates page picker (client). Keep it dependency-free.

export interface PdfTheme {
  id: string;
  label: string;
  /** [primary, secondary] chips for the picker UI. */
  swatch: [string, string];
  overrides: Record<string, string>;
}

// White-page CV templates. Classic / Profile / Grid are strictly
// monochrome — a single "ink" entry so the picker stays hidden. Crest has
// an adjustable header-band accent (its only colour); the override sets
// `accent`, and CrestCV derives on-band text from its luminance.
export const CV_THEMES: Record<string, PdfTheme[]> = {
  classic: [
    { id: "ink", label: "Ink", swatch: ["#16130f", "#ffffff"], overrides: {} },
  ],
  profile: [
    { id: "ink", label: "Ink", swatch: ["#16130f", "#ffffff"], overrides: {} },
  ],
  grid: [
    { id: "ink", label: "Ink", swatch: ["#16130f", "#ffffff"], overrides: {} },
  ],
  crest: [
    { id: "navy",     label: "Ink Navy",  swatch: ["#20304d", "#ffffff"], overrides: { accent: "#20304d" } },
    { id: "teal",     label: "Deep Teal", swatch: ["#1d3b3b", "#ffffff"], overrides: { accent: "#1d3b3b" } },
    { id: "charcoal", label: "Charcoal",  swatch: ["#262626", "#ffffff"], overrides: { accent: "#262626" } },
    { id: "forest",   label: "Forest",    swatch: ["#243d31", "#ffffff"], overrides: { accent: "#243d31" } },
    { id: "burgundy", label: "Burgundy",  swatch: ["#532330", "#ffffff"], overrides: { accent: "#532330" } },
    { id: "sand",     label: "Sand",      swatch: ["#ece6da", "#16130f"], overrides: { accent: "#ece6da" } },
  ],
  editorial: [
    { id: "ink", label: "Ink", swatch: ["#16130f", "#ffffff"], overrides: {} },
  ],
  statement: [
    { id: "ink", label: "Ink", swatch: ["#16130f", "#ffffff"], overrides: {} },
  ],
  endnote: [
    { id: "ink", label: "Ink", swatch: ["#16130f", "#ffffff"], overrides: {} },
  ],
  frame: [
    { id: "navy",     label: "Ink Navy",  swatch: ["#20304d", "#ffffff"], overrides: { accent: "#20304d" } },
    { id: "teal",     label: "Deep Teal", swatch: ["#1d3b3b", "#ffffff"], overrides: { accent: "#1d3b3b" } },
    { id: "charcoal", label: "Charcoal",  swatch: ["#262626", "#ffffff"], overrides: { accent: "#262626" } },
    { id: "forest",   label: "Forest",    swatch: ["#243d31", "#ffffff"], overrides: { accent: "#243d31" } },
    { id: "burgundy", label: "Burgundy",  swatch: ["#532330", "#ffffff"], overrides: { accent: "#532330" } },
    { id: "sand",     label: "Sand",      swatch: ["#ece6da", "#16130f"], overrides: { accent: "#ece6da" } },
  ],
};

export const COMPANY_THEMES: Record<string, PdfTheme[]> = {
  wadani: [
    { id: "horizon",  label: "Horizon",  swatch: ["#0a1a2e", "#bfcad6"],
      overrides: {} },
    { id: "forest",   label: "Forest",   swatch: ["#081f15", "#b9d2c2"],
      overrides: { tealDark: "#081f15", teal: "#0d2f20", sand: "#b9d2c2", sand2: "#c4dacb", paperOnTeal: "#e7f0e9", sienna: "#14573f" } },
    { id: "charcoal", label: "Charcoal", swatch: ["#101216", "#c6cad2"],
      overrides: { tealDark: "#101216", teal: "#1a1d24", sand: "#c6cad2", sand2: "#d0d4dc", paperOnTeal: "#eceef2", sienna: "#39465e" } },
    { id: "maroon",   label: "Maroon",   swatch: ["#220a12", "#d4b9c1"],
      overrides: { tealDark: "#220a12", teal: "#36101d", sand: "#d4b9c1", sand2: "#ddc4cc", paperOnTeal: "#f1e7ea", sienna: "#6d2433" } },
  ],
  annual: [
    { id: "navy",     label: "Navy",     swatch: ["#0d3b66", "#cfd6e0"],
      overrides: {} },
    { id: "forest",   label: "Forest",   swatch: ["#1d5c43", "#cfe0d5"],
      overrides: { navy: "#1d5c43", navyDeep: "#0c2e20", banner: "#cfe0d5", bannerDim: "#b3cdbd" } },
    { id: "burgundy", label: "Burgundy", swatch: ["#6d2433", "#e3ccd2"],
      overrides: { navy: "#6d2433", navyDeep: "#3a0f1a", banner: "#e3ccd2", bannerDim: "#d0aeb8" } },
    { id: "slate",    label: "Slate",    swatch: ["#3b4757", "#d3d9e0"],
      overrides: { navy: "#3b4757", navyDeep: "#1c232e", banner: "#d3d9e0", bannerDim: "#b9c2cd" } },
  ],
  minimal: [
    { id: "blue",   label: "Signal Blue",   swatch: ["#0a5cad", "#fbfbfa"],
      overrides: {} },
    { id: "signal", label: "Signal Orange", swatch: ["#d9530b", "#fbfbfa"],
      overrides: { accent: "#d9530b" } },
    { id: "forest", label: "Forest",        swatch: ["#1d6647", "#fbfbfa"],
      overrides: { accent: "#1d6647" } },
    { id: "ink",    label: "Monochrome",    swatch: ["#0e1116", "#fbfbfa"],
      overrides: { accent: "#0e1116" } },
  ],
};

// Resolve a theme id (e.g. from a query param) to its override map.
// Unknown ids fall back to the template's default — never throws, so a
// stale bookmarked URL still downloads fine.
export function resolveThemeOverrides(
  kind: "cv" | "company",
  template: string,
  themeId: string | null | undefined,
): Record<string, string> {
  const list = (kind === "cv" ? CV_THEMES : COMPANY_THEMES)[template] ?? [];
  const found = themeId ? list.find((t) => t.id === themeId) : undefined;
  return (found ?? list[0])?.overrides ?? {};
}
