import { z } from "zod";
import { noLinks, NO_LINKS_MSG } from "@/lib/spam";

// Shared zod schemas. Used by both react-hook-form on the client AND by
// server actions for server-side re-validation (defense in depth — don't
// trust client validation alone).
//
// Schemas keep input and output types identical (no `.transform()` /
// `coerce.number()` mid-schema) so the react-hook-form + zodResolver
// generic doesn't degrade to FieldValues. Numeric inputs stay as strings;
// actions convert at the boundary via toIntOrNull().

const optTrimmed = z.string().trim().max(500).optional();

// ── Contact-field rules ───────────────────────────────────────────────
// Shared by the forms (react-hook-form) and the server actions, so the same
// check runs on both sides.

/** One phone number: an optional leading "+", then digits with the usual
 *  spacing characters, 7–15 digits in all (the international maximum).
 *  Letters are never allowed. */
const ONE_PHONE = /^\+?[\d\s().-]+$/;
const digitCount = (s: string) => (s.match(/\d/g) ?? []).length;
/** Up to three numbers may be listed, separated by "/", "," or ";" — common
 *  for members with a Somali and a Kenyan line. */
export function isPhone(v: string): boolean {
  const parts = v.split(/[/,;]/).map((p) => p.trim());
  if (parts.length > 3 || parts.some((p) => p === "")) return false;
  return parts.every((p) => ONE_PHONE.test(p) && digitCount(p) >= 7 && digitCount(p) <= 15);
}
export const PHONE_MSG = "Enter a phone number in digits, e.g. +252 61 555 0142";
const phoneField = z.string().trim().max(60)
  .refine((v) => v === "" || isPhone(v), PHONE_MSG)
  .optional();

/** Email: surrounding spaces are ignored (phone keyboards add them), then it
 *  must be a real address — "12345", "hello" or "name@gmail" are rejected. */
const emailField = z.string().trim().max(254)
  .email("Enter a full email address, e.g. name@example.com")
  .or(z.literal(""))
  .optional();

/** Website: a domain with an optional http(s):// and path — "example.so",
 *  "www.example.so", "https://example.so/about". No spaces, no plain words. */
const WEBSITE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d{2,5})?(\/\S*)?$/i;
const websiteField = z.string().trim().max(200)
  .refine((v) => v === "" || WEBSITE.test(v), "Enter a website address, e.g. example.so")
  .optional();

/** A person's name: must contain letters and no digits. Hyphens,
 *  apostrophes, dots and titles ("Dr.", "Eng.") are fine. */
const NAME_MSG = "Use letters only — no numbers";
const personName = (max: number) => z.string().trim().max(max)
  .refine((v) => v === "" || (/\p{L}/u.test(v) && !/\d/.test(v)), NAME_MSG);
const longText = z.string().trim().max(5000).optional();
const yearStr = z.string()
  .refine((v) => v === "" || /^\d{4}$/.test(v), "Use a 4-digit year")
  .refine((v) => v === "" || (Number(v) >= 1900 && Number(v) <= 2100), "Year out of range")
  .optional();

export const basicsSchema = z.object({
  // Links in a name or headline are the signature of SEO-spam signups —
  // reject at save time so the profile never exists (see lib/spam.ts).
  full_name: personName(120).refine((v) => v.length > 0, "Required").refine(noLinks, NO_LINKS_MSG),
  headline: optTrimmed.refine(noLinks, NO_LINKS_MSG),
  summary: longText,
  location: optTrimmed,
  phone: phoneField,
  email: emailField,
  photo_url: z.string().url("Use a full URL").or(z.literal("")).optional(),
});
export type BasicsValues = z.infer<typeof basicsSchema>;

// The month/year dropdowns emit YYYY-MM; empty allowed. A half-filled value
// ("2019-" / "-03") is deliberately invalid so the user sees an error instead
// of silently losing the half they did pick.
const monthOrEmpty = z.string()
  .refine((v) => v === "" || /^\d{4}-\d{2}$/.test(v), "Pick both a month and a year")
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
    "high_school", "diploma", "degree", "postgraduate_diploma", "masters",
    "phd", "certificate",
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
  name: personName(120).refine((v) => v.length > 0, "Required"),
  position: optTrimmed,
  organization: optTrimmed,
  phone: phoneField,
  email: emailField,
  relationship: optTrimmed,
  // "" means "no link"; the action treats blank/null as null.
  experience_id: z.string().optional().nullable(),
});
export type RefereeValues = z.infer<typeof refereeSchema>;

export const languagesSchema = z.object({
  languages: z.array(z.string().trim().min(1).max(160)).max(30),
});

// Non-negative integer entered as a string (form input); actions coerce.
const countStr = z.string()
  .refine((v) => v === "" || /^\d{1,7}$/.test(v), "Numbers only")
  .optional();

// ─── Company schemas ───────────────────────────────────────────────
export const companyBasicsSchema = z.object({
  company_name: z.string().trim().min(1, "Required").max(200).refine(noLinks, NO_LINKS_MSG),
  logo_url: z.string().url("Use a full URL").or(z.literal("")).optional(),
  tagline: optTrimmed.refine(noLinks, NO_LINKS_MSG),
  cover_statement: z.string().trim().max(400).optional(),
  locations: z.array(z.string().trim().min(1).max(80)).max(20),
  country: optTrimmed,
  registration_number: optTrimmed,
  registration_country: optTrimmed,
  founded_year: yearStr,
  staff_count: countStr,
  countries_count: countStr,
  projects_count: countStr,
  website: websiteField,
  email: emailField,
  phone: phoneField,
});
export type CompanyBasicsValues = z.infer<typeof companyBasicsSchema>;

// Message from the CEO + the organogram's top label.
export const companyCeoSchema = z.object({
  ceo_name: personName(500).optional(),
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
  // "1200000", "1,200,000" or "1 200 000" (and decimals); separators are
  // stripped when saved (toNumOrNull).
  value_amount: z.string().trim()
    .refine((v) => v === "" || /^\d{1,3}([,\s]?\d{3})*(\.\d+)?$/.test(v), "Numbers only, e.g. 1,200,000")
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
  // Public URL of an uploaded logo (profile-media bucket). Optional — clients
  // with no logo fall back to their name in the logo strip.
  logo_url: optTrimmed,
});
export type CompanyClientValues = z.infer<typeof companyClientSchema>;

export const companyTeamSchema = z.object({
  person_name: personName(120).refine((v) => v.length > 0, "Required"),
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
  const n = Number(v.replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

// Helpers — used by server actions to coerce form strings to DB types.
export function toIntOrNull(v: string | undefined | null): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}
