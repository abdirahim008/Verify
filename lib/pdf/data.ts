import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dateRange, yearRange, QUALIFICATION_LABELS, type QualLevel } from "@/lib/format";
import { FEATURES } from "@/lib/flags";

// PDF-ready view of the individual profile. Shapes the DB rows into the
// exact fields the templates render — keeps each template clean and means
// when the schema changes, only this mapper updates.
export interface CVExperience {
  title: string;
  organization: string;
  location: string;
  dateRange: string;
  description: string;
  verified: boolean;
  verifiedNote: string;
}
export interface CVEducation {
  qualification: string;
  institution: string;
  field: string;
  /** The degree as it should lead the entry: "Master's degree in Civil
   *  Engineering", "BSc Civil Engineering", or just "Diploma". */
  title: string;
  dateRange: string;
  verified: boolean;
  verifiedNote: string;
}

// Words that mean the field of study already names the qualification, e.g.
// "Bsc Civil Engineering" or "Mini Diploma in Public Health".
const QUAL_IN_FIELD = /\b(b\.?\s?sc|m\.?\s?sc|b\.?\s?eng|m\.?\s?eng|b\.?\s?ed|m\.?\s?ed|b\.?\s?a|m\.?\s?a|phd|mba|llb|llm|bachelor|master|diploma|certificate|degree|doctorate)\b/i;
const ABBREV: Record<string, string> = {
  bsc: "BSc", msc: "MSc", beng: "BEng", meng: "MEng", bed: "BEd", med: "MEd",
  ba: "BA", ma: "MA", phd: "PhD", mba: "MBA", llb: "LLB", llm: "LLM",
};

// Build the line that leads an education entry. The subject is what a
// recruiter scans for, so it belongs in the heading, not a grey sub-line.
export function degreeTitle(qualification: string, field: string): string {
  const f = field.trim().replace(/[.,;:]+$/, "");
  if (!/\p{L}/u.test(f)) return qualification;              // "", "2"
  if (QUAL_IN_FIELD.test(f)) {
    // Normalise a leading abbreviation's case: "Bsc Civil" → "BSc Civil".
    return f.replace(/^([a-z.]+)(?=\s|$)/i, (w) => ABBREV[w.replace(/\./g, "").toLowerCase()] ?? w);
  }
  if (/^high school$/i.test(qualification)) return `${qualification} · ${f}`;
  return `${qualification} in ${f}`;
}
export interface CVCertification {
  name: string; issuer: string; year: string;
  verified: boolean; verifiedNote: string;
}
export interface CVReferee {
  name: string; position: string; organization: string;
  email: string; phone: string;
}

export interface CVData {
  fullName: string;
  headline: string;
  summary: string;
  location: string;
  email: string;
  phone: string;
  photoUrl: string;
  languages: string[];
  experiences: CVExperience[];
  educations: CVEducation[];
  certifications: CVCertification[];
  referees: CVReferee[];
  skills: string[];
  // ISO year for the folio header.
  year: number;
}

export async function loadCVData(userId: string): Promise<CVData | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const [basicsRes, expRes, eduRes, skillRes, certRes, refRes] = await Promise.all([
    supabase.from("individual_details").select("*").eq("profile_id", userId).maybeSingle(),
    supabase.from("experiences").select("*").eq("profile_id", userId)
      .order("end_date", { ascending: false, nullsFirst: true })
      .order("start_date", { ascending: false, nullsFirst: false }),
    supabase.from("educations").select("*").eq("profile_id", userId)
      .order("end_year", { ascending: false, nullsFirst: true })
      .order("start_year", { ascending: false, nullsFirst: false }),
    supabase.from("skills").select("*").eq("profile_id", userId).order("order_index").order("created_at"),
    supabase.from("certifications").select("*").eq("profile_id", userId)
      .order("year", { ascending: false, nullsFirst: false }),
    supabase.from("referees").select("*").eq("profile_id", userId).order("created_at"),
  ]);

  const basics = basicsRes.data;
  if (!basics?.full_name) return null;

  return {
    fullName: basics.full_name,
    headline: basics.headline ?? "",
    summary: basics.summary ?? "",
    location: basics.location ?? "",
    email: basics.email ?? "",
    phone: basics.phone ?? "",
    photoUrl: basics.photo_url ?? "",
    languages: basics.languages ?? [],
    skills: (skillRes.data ?? []).map((s) => s.name),
    experiences: (expRes.data ?? []).map((e) => ({
      title: e.title,
      organization: e.organization,
      location: e.location ?? "",
      dateRange: dateRange(e.start_date, e.end_date),
      description: e.description ?? "",
      verified: FEATURES.verification && !!e.verified,
      verifiedNote: e.verified_note ?? "",
    })),
    educations: (eduRes.data ?? []).map((e) => ({
      qualification: QUALIFICATION_LABELS[e.qualification_level as QualLevel] ?? e.qualification_level,
      institution: e.institution,
      field: e.field_of_study ?? "",
      title: degreeTitle(
        QUALIFICATION_LABELS[e.qualification_level as QualLevel] ?? e.qualification_level,
        e.field_of_study ?? "",
      ),
      dateRange: yearRange(e.start_year, e.end_year),
      verified: FEATURES.verification && !!e.verified,
      verifiedNote: e.verified_note ?? "",
    })),
    certifications: (certRes.data ?? []).map((c) => ({
      name: c.name,
      issuer: c.issuer ?? "",
      year: c.year ? String(c.year) : "",
      verified: FEATURES.verification && !!c.verified,
      verifiedNote: c.verified_note ?? "",
    })),
    referees: (refRes.data ?? []).map((r) => ({
      name: r.name,
      position: r.position ?? "",
      organization: r.organization ?? "",
      email: r.email ?? "",
      phone: r.phone ?? "",
    })),
    year: new Date().getFullYear(),
  };
}
