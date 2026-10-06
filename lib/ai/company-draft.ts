// The company-profile draft the AI import produces: what the company review
// screen edits and what saveImportedCompany writes. Pure and client-safe,
// like lib/ai/draft.ts (the individual version), whose coercion helpers it
// shares.
//
// normalizeCompanyDraft() is the gate between the model and everything
// else: every field is coerced, trimmed, length-capped and checked with the
// manual-entry rules (lib/schemas.ts). Anything that fails is dropped.
// There is deliberately no "verified" anywhere in this shape.

import { isPhone, isWebsite } from "@/lib/schemas";
import { noLinks } from "@/lib/spam";
import { str, arr, obj, EMAIL, hasLetters, personName, year, type DraftCertification } from "@/lib/ai/draft";

export interface DraftNamed { name: string; description: string }
export interface DraftPerson { name: string; role: string }
export interface DraftProject {
  name: string; client: string; sector: string;
  /** Digits only, or "". */
  value: string; currency: string;
  yearStart: string; yearEnd: string;
  /** One line per scope item, as the builder stores it. */
  scope: string;
}

export interface CompanyDraft {
  companyName: string; tagline: string;
  about: string; mission: string; vision: string;
  country: string; locations: string[];
  foundedYear: string; registrationNumber: string; registrationCountry: string;
  staffCount: string; website: string; email: string; phone: string;
  sectors: string[];
  services: DraftNamed[];
  values: DraftNamed[];
  projects: DraftProject[];
  clients: string[];
  team: DraftPerson[];
  certifications: DraftCertification[];
  ceoName: string; ceoTitle: string; ceoMessage: string;
  /** Short follow-up questions about important missing details. */
  missing: string[];
}

/** Multi-line text: keeps line breaks, tidies spaces inside lines. */
const para = (v: unknown, max: number): string =>
  typeof v === "string"
    ? v.split(/\r?\n/).map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean).join("\n").slice(0, max)
    : "";

const CURRENCIES = new Set(["USD", "EUR", "GBP", "KES", "SOS", "ETB", "UGX", "TZS", "DJF", "AED", "SAR"]);
const digits = (v: unknown): string => {
  const s = str(v, 30).replace(/[,\s]/g, "");
  return /^\d{1,13}(\.\d+)?$/.test(s) && Number(s) > 0 ? s.replace(/\.0+$/, "") : "";
};

function uniqueStrings(v: unknown, max: number, cap: number): string[] {
  const seen = new Set<string>();
  return arr(v).map((x) => str(obj(x).name ?? x, max)).filter((s) => {
    const k = s.toLowerCase(); if (!s || !hasLetters(s) || seen.has(k)) return false; seen.add(k); return true;
  }).slice(0, cap);
}

function named(v: unknown, nameMax: number, descMax: number, cap: number): DraftNamed[] {
  const seen = new Set<string>();
  return arr(v).map((x) => {
    const o = obj(x);
    return { name: str(o.name ?? x, nameMax), description: str(o.description, descMax) };
  }).filter((n) => {
    const k = n.name.toLowerCase(); if (!n.name || !hasLetters(n.name) || seen.has(k)) return false; seen.add(k); return true;
  }).slice(0, cap);
}

export function normalizeCompanyDraft(input: unknown): CompanyDraft {
  const d = obj(input);
  const phone = str(d.phone, 60), email = str(d.email, 254), website = str(d.website, 200);
  const staff = str(d.staff_count, 10).replace(/[,\s]/g, "");
  const companyName = str(d.company_name, 200), tagline = str(d.tagline, 160);

  const projects = arr(d.projects).map((x): DraftProject | null => {
    const p = obj(x);
    const name = str(p.name, 200);
    if (!name || !hasLetters(name)) return null;
    const value = digits(p.value);
    const cur = str(p.currency, 5).toUpperCase();
    let yearStart = year(p.year_start), yearEnd = year(p.year_end);
    if (yearStart && yearEnd && Number(yearEnd) < Number(yearStart)) [yearStart, yearEnd] = [yearEnd, yearStart];
    return {
      name, client: str(p.client, 200), sector: str(p.sector, 120),
      value, currency: value && CURRENCIES.has(cur) ? cur : "",
      yearStart, yearEnd,
      scope: para(Array.isArray(p.scope) ? p.scope.join("\n") : p.scope, 1500)
        .split("\n").map((l) => l.replace(/^[-–•*\s]+/, "")).filter(Boolean).slice(0, 5).join("\n"),
    };
  }).filter((x): x is DraftProject => x !== null).slice(0, 15);

  const teamSeen = new Set<string>();
  const team = arr(d.team).map((x) => {
    const t = obj(x); return { name: personName(str(t.name, 120)), role: str(t.role, 160) };
  }).filter((t) => {
    const k = t.name.toLowerCase(); if (!t.name || teamSeen.has(k)) return false; teamSeen.add(k); return true;
  }).slice(0, 15);

  const certifications = arr(d.certifications).map((x) => {
    const c = obj(x); return { name: str(c.name, 200), issuer: str(c.issuer, 200), year: year(c.year) };
  }).filter((c) => c.name).slice(0, 10);

  return {
    companyName: noLinks(companyName) ? companyName : "",
    tagline: noLinks(tagline) ? tagline : "",
    about: para(d.about, 3000), mission: para(d.mission, 800), vision: para(d.vision, 800),
    country: str(d.country, 80), locations: uniqueStrings(d.locations, 80, 10),
    foundedYear: year(d.founded_year),
    registrationNumber: str(d.registration_number, 80), registrationCountry: str(d.registration_country, 80),
    staffCount: /^\d{1,7}$/.test(staff) ? staff : "",
    website: isWebsite(website) ? website : "",
    email: EMAIL.test(email) ? email : "",
    phone: isPhone(phone) ? phone : "",
    sectors: uniqueStrings(d.sectors, 80, 12),
    services: named(d.services, 120, 600, 12),
    values: named(d.values, 80, 400, 8),
    projects,
    clients: uniqueStrings(d.clients, 200, 30),
    team, certifications,
    ceoName: personName(str(d.ceo_name, 120)), ceoTitle: str(d.ceo_title, 120),
    ceoMessage: para(d.ceo_message, 4000),
    missing: arr(d.missing).map((m) => str(m, 200)).filter(Boolean).slice(0, 4),
  };
}

/** Anything worth reviewing at all (vs. the model finding nothing). */
export function companyDraftHasContent(d: CompanyDraft): boolean {
  return Boolean(d.companyName || d.about || d.projects.length || d.services.length || d.sectors.length);
}
