// The profile draft the AI import produces: what the review screen edits
// and what saveImportedProfile writes. Pure and client-safe (no server
// imports) so the review screen and the server share one shape.
//
// normalizeDraft() is the gate between the model and everything else: the
// model's JSON is untrusted, so every field is coerced to the right type,
// trimmed, length-capped and checked with the same rules as manual entry
// (lib/schemas.ts). Anything that fails is dropped, never "fixed up" into
// something the member didn't say.

import { isPhone } from "@/lib/schemas";
import { canonicalLanguage, formatLanguage, emptyLanguage, type Level } from "@/lib/languages";

export const QUAL_LEVELS = ["high_school", "certificate", "diploma", "degree", "postgraduate_diploma", "masters", "phd"] as const;
export type QualLevelId = (typeof QUAL_LEVELS)[number];

export interface DraftExperience {
  title: string; organization: string; location: string;
  /** YYYY-MM or "". */
  start: string; end: string;
  current: boolean;
  /** True when the source gave only a year: the month is a placeholder (January) to confirm. */
  monthGuessed: boolean;
  /** One achievement per line, as the builder stores descriptions. */
  description: string;
}
export interface DraftEducation {
  qualification: QualLevelId; field: string; institution: string;
  startYear: string; endYear: string;
}
export interface DraftCertification { name: string; issuer: string; year: string }
export interface DraftReferee { name: string; position: string; organization: string; phone: string; email: string }

export interface ProfileDraft {
  fullName: string; headline: string; summary: string;
  location: string; phone: string; email: string;
  experiences: DraftExperience[];
  educations: DraftEducation[];
  skills: string[];
  /** Stored-format language strings, e.g. "Somali (Mother tongue)". */
  languages: string[];
  certifications: DraftCertification[];
  referees: DraftReferee[];
  /** Short follow-up questions about important missing details. */
  missing: string[];
}

export const EMPTY_DRAFT: ProfileDraft = {
  fullName: "", headline: "", summary: "", location: "", phone: "", email: "",
  experiences: [], educations: [], skills: [], languages: [], certifications: [], referees: [], missing: [],
};

// ── coercion helpers (also used by lib/ai/company-draft.ts) ─────────────
export const str = (v: unknown, max: number): string =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : typeof v === "number" ? String(v).slice(0, max) : "";
export const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
export const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
export const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
export const hasLetters = (s: string) => /\p{L}/u.test(s);
export const personName = (s: string) => (hasLetters(s) && !/\d/.test(s) ? s : "");
export const year = (v: unknown): string => {
  const m = /\b(19[5-9]\d|20[0-4]\d)\b/.exec(str(v, 20));
  return m ? m[1] : "";
};

/** "2019-03", "2019-3", "Mar 2019", "2019" → { month: "2019-03", guessed } */
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
function month(v: unknown): { value: string; guessed: boolean; present: boolean } {
  const s = str(v, 30).toLowerCase();
  if (!s) return { value: "", guessed: false, present: false };
  if (/present|current|now|hadda|ilaa hadda/.test(s)) return { value: "", guessed: false, present: true };
  const y = year(s);
  if (!y) return { value: "", guessed: false, present: false };
  let mm = /\b\d{4}-(\d{1,2})\b/.exec(s)?.[1] ?? /\b(\d{1,2})[/.-]\d{4}\b/.exec(s)?.[1];
  if (!mm) { const i = MONTHS.findIndex((m) => s.includes(m)); if (i >= 0) mm = String(i + 1); }
  const n = mm ? Number(mm) : 0;
  return n >= 1 && n <= 12
    ? { value: `${y}-${String(n).padStart(2, "0")}`, guessed: false, present: false }
    : { value: `${y}-01`, guessed: true, present: false };
}

const QUAL_ALIASES: [RegExp, QualLevelId][] = [
  [/phd|doctor/i, "phd"],
  [/postgrad|pgd/i, "postgraduate_diploma"],
  [/master|msc|\bma\b|mba|meng|\bmed\b|llm/i, "masters"],
  [/bachelor|degree|bsc|\bba\b|beng|\bbed\b|llb/i, "degree"],
  [/diploma/i, "diploma"],
  [/certificate/i, "certificate"],
  [/high school|secondary|form four|grade 12/i, "high_school"],
];
function qualification(v: unknown): QualLevelId | null {
  const s = str(v, 60);
  if ((QUAL_LEVELS as readonly string[]).includes(s)) return s as QualLevelId;
  for (const [re, id] of QUAL_ALIASES) if (re.test(s)) return id;
  return null;
}

const LEVEL: Record<string, Level> = { basic: 1, conversational: 2, professional: 3, fluent: 4, native: 5 };
function language(v: unknown): string {
  const o = obj(v);
  const raw = str(o.name ?? v, 40).replace(/[()[\];]/g, "");
  if (!hasLetters(raw)) return "";
  const name = canonicalLanguage(raw) ?? raw.charAt(0).toUpperCase() + raw.slice(1);
  const lvl = str(o.level, 30).toLowerCase();
  const e = emptyLanguage(name);
  if (/native|mother/.test(lvl)) e.mother = true;
  else if (LEVEL[lvl]) e.note = lvl.charAt(0).toUpperCase() + lvl.slice(1); // overall level only — never invented per-skill ratings
  return formatLanguage(e);
}

export function bullets(v: unknown): string {
  const list = Array.isArray(v) ? v : typeof v === "string" ? v.split(/\n|•/) : [];
  return list.map((b) => str(b, 300).replace(/^[-–•*\s]+/, "")).filter(Boolean).slice(0, 8).join("\n");
}

export function normalizeDraft(input: unknown): ProfileDraft {
  const d = obj(input);
  const experiences = arr(d.experiences).map((x): DraftExperience | null => {
    const e = obj(x);
    const title = str(e.title, 200), organization = str(e.organization, 200);
    if (!title || !organization) return null;
    const s = month(e.start), en = month(e.end);
    const current = en.present || e.current === true;
    return {
      title, organization, location: str(e.location, 120),
      start: s.value, end: current ? "" : en.value, current,
      monthGuessed: s.guessed || (!current && en.guessed),
      description: bullets(e.bullets ?? e.description),
    };
  }).filter((x): x is DraftExperience => x !== null).slice(0, 15);

  const educations = arr(d.educations).map((x): DraftEducation | null => {
    const e = obj(x);
    const institution = str(e.institution, 200);
    const q = qualification(e.qualification);
    if (!institution || !q) return null;
    return { qualification: q, field: str(e.field, 200), institution, startYear: year(e.start_year), endYear: year(e.end_year) };
  }).filter((x): x is DraftEducation => x !== null).slice(0, 10);

  const seen = new Set<string>();
  const skills = arr(d.skills).map((s) => str(s, 60)).filter((s) => {
    const k = s.toLowerCase(); if (!s || !hasLetters(s) || seen.has(k)) return false; seen.add(k); return true;
  }).slice(0, 15);

  const langSeen = new Set<string>();
  const languages = arr(d.languages).map(language).filter((l) => {
    const k = l.split(" (")[0].toLowerCase(); if (!l || langSeen.has(k)) return false; langSeen.add(k); return true;
  }).slice(0, 8);

  const certifications = arr(d.certifications).map((x) => {
    const c = obj(x); return { name: str(c.name, 200), issuer: str(c.issuer, 200), year: year(c.year) };
  }).filter((c) => c.name).slice(0, 10);

  const referees = arr(d.referees).map((x) => {
    const r = obj(x);
    const phone = str(r.phone, 60), email = str(r.email, 254);
    return {
      name: personName(str(r.name, 120)), position: str(r.position, 200), organization: str(r.organization, 200),
      phone: isPhone(phone) ? phone : "", email: EMAIL.test(email) ? email : "",
    };
  }).filter((r) => r.name).slice(0, 5);

  const phone = str(d.phone, 60), email = str(d.email, 254);
  return {
    fullName: personName(str(d.full_name, 120)),
    headline: str(d.headline, 160),
    summary: str(d.summary, 1200),
    location: str(d.location, 120),
    phone: isPhone(phone) ? phone : "",
    email: EMAIL.test(email) ? email : "",
    experiences, educations, skills, languages, certifications, referees,
    missing: arr(d.missing).map((m) => str(m, 200)).filter(Boolean).slice(0, 4),
  };
}

/** Anything worth reviewing at all (vs. the model finding nothing). */
export function draftHasContent(d: ProfileDraft): boolean {
  return Boolean(d.fullName || d.headline || d.experiences.length || d.educations.length || d.skills.length);
}
