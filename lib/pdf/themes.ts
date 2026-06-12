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

export const CV_THEMES: Record<string, PdfTheme[]> = {
  editorial: [
    { id: "ink",      label: "Ink & Cream",      swatch: ["#0d3b66", "#f7f3eb"],
      overrides: {} },
    { id: "forest",   label: "Forest & Cream",   swatch: ["#1d5c43", "#f6f4ec"],
      overrides: { sienna: "#1d5c43", cream: "#f6f4ec", rule: "#d8d3c0" } },
    { id: "oxblood",  label: "Oxblood & Ivory",  swatch: ["#6d2433", "#f9f5ef"],
      overrides: { sienna: "#6d2433", cream: "#f9f5ef", rule: "#e0d6c8" } },
    { id: "graphite", label: "Graphite & White", swatch: ["#2e2e2b", "#ffffff"],
      overrides: { sienna: "#2e2e2b", cream: "#ffffff", rule: "#e3e1da" } },
  ],
  sidebar: [
    { id: "atlantic",   label: "Atlantic",   swatch: ["#091e36", "#c3cedb"],
      overrides: {} },
    { id: "rainforest", label: "Rainforest", swatch: ["#0a2b1f", "#bfd6c8"],
      overrides: { tealDark: "#0a2b1f", teal: "#0e3a2a", sand: "#bfd6c8", dim: "#8fa89b", rule: "#1c4a38", ruleSb: "#15382a" } },
    { id: "charcoal",   label: "Charcoal",   swatch: ["#15171c", "#c9cdd6"],
      overrides: { tealDark: "#15171c", teal: "#1e2128", sand: "#c9cdd6", dim: "#8b909b", rule: "#30343d", ruleSb: "#262a32" } },
    { id: "oxblood",    label: "Oxblood",    swatch: ["#2a0f18", "#d8bfc6"],
      overrides: { tealDark: "#2a0f18", teal: "#3a1622", sand: "#d8bfc6", dim: "#a98f97", rule: "#55222f", ruleSb: "#431a26" } },
  ],
  mono: [
    { id: "blue",   label: "Signal Blue",   swatch: ["#0a5cad", "#fbfaf6"],
      overrides: {} },
    { id: "signal", label: "Signal Orange", swatch: ["#d9530b", "#fbfaf6"],
      overrides: { accent: "#d9530b" } },
    { id: "forest", label: "Forest",        swatch: ["#1d6647", "#fbfaf6"],
      overrides: { accent: "#1d6647" } },
    { id: "ink",    label: "Monochrome",    swatch: ["#131311", "#fbfaf6"],
      overrides: { accent: "#131311" } },
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
