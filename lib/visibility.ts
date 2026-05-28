// Visibility model for §10. Section keys must match what the SQL trigger
// seeds into `profiles.section_visibility` on signup.

export type VisibilityLevel = "public" | "registered_only" | "private";

export const VISIBILITY_LABELS: Record<VisibilityLevel, string> = {
  public: "Public",
  registered_only: "Registered users",
  private: "Private",
};

export const VISIBILITY_HELP: Record<VisibilityLevel, string> = {
  public: "Anyone, including search engines and logged-out visitors.",
  registered_only: "Only signed-in Sahan accounts.",
  private: "Only you (and admin during verification).",
};

export interface SectionDef {
  key: string;
  label: string;
  description: string;
  /** If set, max permissive level allowed. e.g. "registered_only" means
   *  this section can never be set public. */
  cap?: VisibilityLevel;
  /** If true, locked to private — user cannot change. */
  alwaysPrivate?: boolean;
}

export const INDIVIDUAL_SECTIONS: SectionDef[] = [
  { key: "summary",        label: "Summary",        description: "Your short biographical paragraph." },
  { key: "experiences",    label: "Experience",     description: "Your roles and the work you did in each." },
  { key: "educations",     label: "Education",      description: "Your formal qualifications." },
  { key: "skills",         label: "Skills",         description: "The chip list under your experience." },
  { key: "certifications", label: "Certifications", description: "Named credentials with an issuer." },
  { key: "languages",      label: "Languages",      description: "Languages of work." },
  { key: "contact",        label: "Contact (email, phone)", description: "Personal email and phone for your CV.",
    cap: "registered_only" },
  { key: "location",       label: "Location",       description: "Where you currently live.", cap: "registered_only" },
  { key: "referees",       label: "Referees",       description: "Third-party contacts who vouch for your work.",
    alwaysPrivate: true },
];

export const COMPANY_SECTIONS: SectionDef[] = [
  { key: "summary",        label: "About / Mission / Vision", description: "The opening paragraph and the two short quotes." },
  { key: "sectors",        label: "Sectors & services",       description: "What sectors you operate in and what you actually do." },
  { key: "projects",       label: "Projects",                 description: "Selected projects. Verified projects always carry their badge." },
  { key: "team",           label: "Key personnel",            description: "Senior staff and reporting lines." },
  { key: "certifications", label: "Accreditations",           description: "Named credentials with an issuer." },
  { key: "clients",        label: "Clients",                  description: "The aggregate clients list. Per-row 'show publicly' on each client still applies." },
  { key: "contact",        label: "Contact",                  description: "Public email and phone.", cap: "registered_only" },
];

// Hard rules (CLAUDE.md §10). Server action and DB defaults both honour these.
export function clampLevel(def: SectionDef, requested: VisibilityLevel): VisibilityLevel {
  if (def.alwaysPrivate) return "private";
  if (def.cap === "registered_only" && requested === "public") return "registered_only";
  return requested;
}

export function defaultVisibility(def: SectionDef): VisibilityLevel {
  if (def.alwaysPrivate) return "private";
  if (def.cap === "registered_only") return "registered_only";
  return "public";
}

// Should a viewer in `viewerCtx` be able to see a section at `level`?
export type ViewerContext = "owner" | "registered" | "public";
export function canView(level: VisibilityLevel, ctx: ViewerContext): boolean {
  if (ctx === "owner") return true;
  if (ctx === "registered") return level !== "private";
  return level === "public";
}
