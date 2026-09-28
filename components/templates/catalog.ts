// The template choices shown to members, in display order. Each id matches a
// renderer in lib/pdf/templates.ts and a preview image set in
// public/templates/{cv,company}/ (scripts/render-thumbnails.mjs).

export interface TemplateMeta { id: string; name: string; tagline: string }

export const CV_TEMPLATES: TemplateMeta[] = [
  { id: "classic", name: "The Classic", tagline: "Single column · serif · centred" },
  { id: "profile", name: "The Profile", tagline: "Dark sidebar · photo · level bars" },
  { id: "editorial", name: "The Editorial", tagline: "Colour band · grey sidebar · photo" },
  { id: "grid", name: "The Grid", tagline: "Accent strip · photo block · bold" },
  { id: "statement", name: "The Statement", tagline: "Bordered masthead · photo" },
  { id: "crest", name: "The Crest", tagline: "Colour header band · photo" },
  { id: "endnote", name: "The Endnote", tagline: "Heavy sans · accent rule" },
  { id: "frame", name: "The Frame", tagline: "Accent masthead · serif" },
];

export const COMPANY_TEMPLATES: TemplateMeta[] = [
  { id: "standard", name: "The Standard", tagline: "Classic centered · tint boxes" },
  { id: "dossier", name: "The Dossier", tagline: "Sidebar facts · vertical rule" },
  { id: "banner", name: "The Banner", tagline: "Colour header + footer band" },
  { id: "broadsheet", name: "The Broadsheet", tagline: "Two-column editorial" },
  { id: "bento", name: "The Bento", tagline: "Modular cards · stat tile" },
  { id: "wadani", name: "Wadani", tagline: "Dark teal cover · topographic" },
  { id: "annual", name: "Annual", tagline: "Report register · stat tiles" },
  { id: "minimal", name: "Minimal", tagline: "Massive type · one accent" },
];
