import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { dateRange, yearRange, QUALIFICATION_LABELS, type QualLevel } from "@/lib/format";
import {
  INDIVIDUAL_SECTIONS, COMPANY_SECTIONS, defaultVisibility, canView,
  type VisibilityLevel, type ViewerContext,
} from "@/lib/visibility";

// Public profile loading. Uses the service-role client because non-admin
// users cannot read other users' rows under default RLS — visibility is
// enforced HERE in app code instead, per the section_visibility JSON.
//
// Returns null if the profile doesn't exist or has nothing visible to the
// given viewer.

export interface PublicIndividual {
  kind: "individual";
  fullName: string;
  headline: string;
  visible: Set<string>;          // section keys this viewer can see
  summary: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  languages: string[];
  experiences: Array<{ id: string; title: string; organization: string; location: string; dateRange: string; description: string; verified: boolean; verifiedNote: string }>;
  educations: Array<{ id: string; qualification: string; institution: string; field: string; dateRange: string; verified: boolean; verifiedNote: string }>;
  skills: Array<{ id: string; name: string }>;
  certifications: Array<{ id: string; name: string; issuer: string; year: string; verified: boolean; verifiedNote: string }>;
}
export interface PublicCompany {
  kind: "company";
  name: string;
  about: string | null;
  mission: string | null;
  vision: string | null;
  country: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  foundedYear: number | null;
  sectors: string[];
  services: string[];
  visible: Set<string>;
  projects: Array<{ id: string; project_name: string; client_name: string; sector: string; valueLabel: string; dateRange: string; scope: string; verified: boolean; verifiedNote: string }>;
  team: Array<{ id: string; person_name: string; role: string }>;
  certifications: Array<{ id: string; name: string; issuer: string; year: string; verified: boolean; verifiedNote: string }>;
  publicClients: string[];
}
export type PublicProfile = PublicIndividual | PublicCompany;

export async function loadPublicProfile(
  profileId: string,
  viewerCtx: ViewerContext,
): Promise<PublicProfile | null> {
  const svc = createSupabaseServiceClient();
  if (!svc) return null;

  const { data: prof } = await svc
    .from("profiles")
    .select("id, account_type, display_name, section_visibility")
    .eq("id", profileId).maybeSingle();
  if (!prof) return null;

  // Build the section_visibility map with defaults filled in.
  const sectionDefs = prof.account_type === "company" ? COMPANY_SECTIONS : INDIVIDUAL_SECTIONS;
  const sectionVis = (prof.section_visibility ?? {}) as Record<string, VisibilityLevel>;
  const visible = new Set<string>();
  for (const def of sectionDefs) {
    const level = sectionVis[def.key] ?? defaultVisibility(def);
    if (canView(level, viewerCtx)) visible.add(def.key);
  }

  if (prof.account_type === "company") {
    const [basicsRes, projRes, teamRes, certRes, clientsRes] = await Promise.all([
      svc.from("company_details").select("*").eq("profile_id", profileId).maybeSingle(),
      svc.from("company_projects").select("*").eq("profile_id", profileId).order("year_end", { ascending: false, nullsFirst: false }),
      svc.from("company_team").select("*").eq("profile_id", profileId).order("order_index").order("created_at"),
      svc.from("company_certifications").select("*").eq("profile_id", profileId).order("year", { ascending: false, nullsFirst: false }),
      svc.from("company_clients").select("*").eq("profile_id", profileId).eq("display_public", true).order("client_name"),
    ]);
    const b = basicsRes.data;
    if (!b?.company_name) return null;
    return {
      kind: "company",
      name: b.company_name,
      about: visible.has("summary") ? b.about ?? null : null,
      mission: visible.has("summary") ? b.mission ?? null : null,
      vision: visible.has("summary") ? b.vision ?? null : null,
      country: visible.has("contact") ? b.country ?? null : null,
      website: visible.has("contact") ? b.website ?? null : null,
      email: visible.has("contact") ? b.email ?? null : null,
      phone: visible.has("contact") ? b.phone ?? null : null,
      foundedYear: b.founded_year ?? null,
      sectors: visible.has("sectors") ? (b.sectors ?? []) : [],
      services: visible.has("sectors") ? (b.core_services ?? []) : [],
      visible,
      projects: visible.has("projects") ? (projRes.data ?? []).map((p) => ({
        id: p.id, project_name: p.project_name, client_name: p.client_name ?? "", sector: p.sector ?? "",
        valueLabel: p.value_amount != null ? `${p.currency ?? "USD"} ${p.value_amount}` : "",
        dateRange: yearRange(p.year_start, p.year_end),
        scope: p.scope ?? "",
        verified: !!p.verified, verifiedNote: p.verified_note ?? "",
      })) : [],
      team: visible.has("team") ? (teamRes.data ?? []).map((t) => ({ id: t.id, person_name: t.person_name, role: t.role ?? "" })) : [],
      certifications: visible.has("certifications") ? (certRes.data ?? []).map((c) => ({
        id: c.id, name: c.name, issuer: c.issuer ?? "", year: c.year ? String(c.year) : "",
        verified: !!c.verified, verifiedNote: c.verified_note ?? "",
      })) : [],
      publicClients: visible.has("clients") ? (clientsRes.data ?? []).map((c) => c.client_name) : [],
    };
  }

  // Individual
  const [basicsRes, expRes, eduRes, skillsRes, certsRes] = await Promise.all([
    svc.from("individual_details").select("*").eq("profile_id", profileId).maybeSingle(),
    svc.from("experiences").select("*").eq("profile_id", profileId).order("end_date", { ascending: false, nullsFirst: true }).order("start_date", { ascending: false, nullsFirst: false }),
    svc.from("educations").select("*").eq("profile_id", profileId).order("end_year", { ascending: false, nullsFirst: true }),
    svc.from("skills").select("*").eq("profile_id", profileId).order("order_index").order("created_at"),
    svc.from("certifications").select("*").eq("profile_id", profileId).order("year", { ascending: false, nullsFirst: false }),
  ]);
  const b = basicsRes.data;
  if (!b?.full_name) return null;
  return {
    kind: "individual",
    fullName: b.full_name,
    headline: b.headline ?? "",
    summary: visible.has("summary") ? b.summary ?? null : null,
    location: visible.has("location") ? b.location ?? null : null,
    email: visible.has("contact") ? b.email ?? null : null,
    phone: visible.has("contact") ? b.phone ?? null : null,
    languages: visible.has("languages") ? (b.languages ?? []) : [],
    visible,
    experiences: visible.has("experiences") ? (expRes.data ?? []).map((e) => ({
      id: e.id, title: e.title, organization: e.organization, location: e.location ?? "",
      dateRange: dateRange(e.start_date, e.end_date),
      description: e.description ?? "",
      verified: !!e.verified, verifiedNote: e.verified_note ?? "",
    })) : [],
    educations: visible.has("educations") ? (eduRes.data ?? []).map((e) => ({
      id: e.id, qualification: QUALIFICATION_LABELS[e.qualification_level as QualLevel] ?? e.qualification_level,
      institution: e.institution, field: e.field_of_study ?? "",
      dateRange: yearRange(e.start_year, e.end_year),
      verified: !!e.verified, verifiedNote: e.verified_note ?? "",
    })) : [],
    skills: visible.has("skills") ? (skillsRes.data ?? []).map((s) => ({ id: s.id, name: s.name })) : [],
    certifications: visible.has("certifications") ? (certsRes.data ?? []).map((c) => ({
      id: c.id, name: c.name, issuer: c.issuer ?? "", year: c.year ? String(c.year) : "",
      verified: !!c.verified, verifiedNote: c.verified_note ?? "",
    })) : [],
  };
}

// Decide who's viewing. Caller already has the auth user id.
export function viewerContext(profileId: string, viewerId: string | null): ViewerContext {
  if (!viewerId) return "public";
  if (viewerId === profileId) return "owner";
  return "registered";
}
