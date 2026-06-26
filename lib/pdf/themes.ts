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
  // All eight "Company Profile System" layouts share one accent picker — a
  // single adjustable `accent` per template (each template derives every
  // other colour role from it). Each list leads with that template's own
  // default accent, then offers the same curated set. Wadani, Annual and
  // Minimal were rebuilt onto this system, so they join the same picker
  // rather than carrying their own bespoke palette overrides.
  ...companyAccentThemes(),
};

// Build the accent-only theme lists for the company templates. Each gets the
// same curated accents, ordered so the template's design default comes first
// (becomes the picker's initial selection).
function companyAccentThemes(): Record<string, PdfTheme[]> {
  const NAVY = "#20304d", TEAL = "#1d3b3b", CHARCOAL = "#262626", FOREST = "#243d31", OXBLOOD = "#532330";
  const meta: Record<string, [string, string]> = {
    navy: ["navy", "Ink Navy"], teal: ["teal", "Deep Teal"], charcoal: ["charcoal", "Charcoal"],
    forest: ["forest", "Forest"], oxblood: ["oxblood", "Oxblood"],
  };
  const hex: Record<string, string> = { navy: NAVY, teal: TEAL, charcoal: CHARCOAL, forest: FOREST, oxblood: OXBLOOD };
  const order: Record<string, string[]> = {
    standard:   ["navy", "teal", "charcoal", "forest", "oxblood"],
    dossier:    ["teal", "navy", "charcoal", "forest", "oxblood"],
    banner:     ["navy", "teal", "charcoal", "forest", "oxblood"],
    broadsheet: ["forest", "navy", "teal", "charcoal", "oxblood"],
    bento:      ["oxblood", "navy", "teal", "charcoal", "forest"],
    wadani:     ["teal", "navy", "charcoal", "forest", "oxblood"],
    annual:     ["navy", "teal", "charcoal", "forest", "oxblood"],
    minimal:    ["charcoal", "navy", "teal", "forest", "oxblood"],
  };
  const out: Record<string, PdfTheme[]> = {};
  for (const [tpl, ids] of Object.entries(order)) {
    out[tpl] = ids.map((id) => ({
      id: meta[id][0], label: meta[id][1],
      swatch: [hex[id], "#ffffff"] as [string, string],
      overrides: { accent: hex[id] },
    }));
  }
  return out;
}

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
