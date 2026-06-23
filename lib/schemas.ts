import { z } from "zod";

// Shared zod schemas. Used by both react-hook-form on the client AND by
// server actions for server-side re-validation (defense in depth — don't
// trust client validation alone).
//
// Schemas keep input and output types identical (no `.transform()` /
// `coerce.number()` mid-schema) so the react-hook-form + zodResolver
// generic doesn't degrade to FieldValues. Numeric inputs stay as strings;
// actions convert at the boundary via toIntOrNull().

const optTrimmed = z.string().trim().max(500).optional();
const longText = z.string().trim().max(5000).optional();
const yearStr = z.string()
  .refine((v) => v === "" || /^\d{4}$/.test(v), "Use a 4-digit year")
  .refine((v) => v === "" || (Number(v) >= 1900 && Number(v) <= 2100), "Year out of range")
  .optional();

export const basicsSchema = z.object({
  full_name: z.string().trim().min(1, "Required").max(120),
  headline: optTrimmed,
  summary: longText,
  location: optTrimmed,
  phone: optTrimmed,
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  photo_url: z.string().url("Use a full URL").or(z.literal("")).optional(),
});
export type BasicsValues = z.infer<typeof basicsSchema>;

// <input type="month"> emits YYYY-MM strings; empty allowed.
const monthOrEmpty = z.string()
  .refine((v) => v === "" || /^\d{4}-\d{2}$/.test(v), "Use YYYY-MM")
  .optional();

export const experienceSchema = z.object({
  organization: z.string().trim().min(1, "Required").max(200),
  title: z.string().trim().min(1, "Required").max(200),
  location: optTrimmed,
  start_date: monthOrEmpty,
  end_date: monthOrEmpty,
  description: longText,
  is_current: z.boolean().optional(),
});
export type ExperienceValues = z.infer<typeof experienceSchema>;

export const educationSchema = z.object({
  institution: z.string().trim().min(1, "Required").max(200),
  qualification_level: z.enum([
    "high_school", "diploma", "degree", "masters", "phd", "certificate",
  ]),
  field_of_study: optTrimmed,
  start_year: yearStr,
  end_year: yearStr,
});
export type EducationValues = z.infer<typeof educationSchema>;

export const skillSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const certificationSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  issuer: optTrimmed,
  year: yearStr,
});
export type CertificationValues = z.infer<typeof certificationSchema>;

export const refereeSchema = z.object({
  name: z.string().trim().min(1, "Required").max(120),
  position: optTrimmed,
  organization: optTrimmed,
  phone: optTrimmed,
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  relationship: optTrimmed,
  // "" means "no link"; the action treats blank/null as null.
  experience_id: z.string().optional().nullable(),
});
export type RefereeValues = z.infer<typeof refereeSchema>;

export const languagesSchema = z.object({
  languages: z.array(z.string().trim().min(1).max(80)).max(30),
});

// Non-negative integer entered as a string (form input); actions coerce.
const countStr = z.string()
  .refine((v) => v === "" || /^\d{1,7}$/.test(v), "Numbers only")
  .optional();

// ─── Company schemas ───────────────────────────────────────────────
export const companyBasicsSchema = z.object({
  company_name: z.string().trim().min(1, "Required").max(200),
  logo_url: z.string().url("Use a full URL").or(z.literal("")).optional(),
  tagline: optTrimmed,
  cover_statement: z.string().trim().max(400).optional(),
  locations: z.array(z.string().trim().min(1).max(80)).max(20),
  country: optTrimmed,
  registration_number: optTrimmed,
  registration_country: optTrimmed,
  founded_year: yearStr,
  staff_count: countStr,
  countries_count: countStr,
  projects_count: countStr,
  website: z.string().trim().max(200).optional(),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  phone: optTrimmed,
});
export type CompanyBasicsValues = z.infer<typeof companyBasicsSchema>;

// Message from the CEO + the organogram's top label.
export const companyCeoSchema = z.object({
  ceo_name: optTrimmed,
  ceo_title: optTrimmed,
  ceo_photo_url: z.string().url("Use a full URL").or(z.literal("")).optional(),
  ceo_quote: z.string().trim().max(600).optional(),
  ceo_message: z.string().trim().max(5000).optional(),
  board_name: optTrimmed,
});
export type CompanyCeoValues = z.infer<typeof companyCeoSchema>;

// A company value (name + short blurb).
export const companyValueSchema = z.object({
  name: z.string().trim().min(1, "Required").max(80),
  description: z.string().trim().max(400).optional(),
});
export type CompanyValueValues = z.infer<typeof companyValueSchema>;

// A detailed service (name + description).
export const companyServiceSchema = z.object({
  name: z.string().trim().min(1, "Required").max(120),
  description: z.string().trim().max(600).optional(),
});
export type CompanyServiceValues = z.infer<typeof companyServiceSchema>;

export const companyAboutSchema = z.object({
  about: z.string().trim().max(5000).optional(),
  mission: z.string().trim().max(1000).optional(),
  vision: z.string().trim().max(1000).optional(),
});
export type CompanyAboutValues = z.infer<typeof companyAboutSchema>;

export const companyOfferingsSchema = z.object({
  sectors: z.array(z.string().trim().min(1).max(80)).max(30),
  core_services: z.array(z.string().trim().min(1).max(80)).max(30),
});

export const companyProjectSchema = z.object({
  project_name: z.string().trim().min(1, "Required").max(200),
  client_name: optTrimmed,
  sector: optTrimmed,
  value_amount: z.string()
    .refine((v) => v === "" || /^\d+(\.\d+)?$/.test(v), "Numbers only")
    .optional(),
  currency: optTrimmed,
  year_start: yearStr,
  year_end: yearStr,
  scope: z.string().trim().max(3000).optional(),
});
export type CompanyProjectValues = z.infer<typeof companyProjectSchema>;

export const companyClientSchema = z.object({
  client_name: z.string().trim().min(1, "Required").max(200),
  // Free-text group label, e.g. "Multilateral & Donors", "Government".
  category: optTrimmed,
  display_public: z.boolean().optional(),
  note: optTrimmed,
});
export type CompanyClientValues = z.infer<typeof companyClientSchema>;

export const companyTeamSchema = z.object({
  person_name: z.string().trim().min(1, "Required").max(120),
  role: optTrimmed,
  // Department/unit tags shown under each leader in the organogram.
  units: z.array(z.string().trim().min(1).max(60)).max(12),
  reports_to: z.string().optional().nullable(),
});
export type CompanyTeamValues = z.infer<typeof companyTeamSchema>;

export const companyCertificationSchema = certificationSchema;
export type CompanyCertificationValues = CertificationValues;

export function toNumOrNull(v: string | undefined | null): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Helpers — used by server actions to coerce form strings to DB types.
export function toIntOrNull(v: string | undefined | null): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}
