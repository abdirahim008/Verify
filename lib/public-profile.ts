import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { dateRange, yearRange, QUALIFICATION_LABELS, type QualLevel } from "@/lib/format";
import {
  INDIVIDUAL_SECTIONS, COMPANY_SECTIONS, defaultVisibility, canView,
  type VisibilityLevel, type ViewerContext,
} from "@/lib/visibility";
import { FEATURES } from "@/lib/flags";

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
  photoUrl: string | null;
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
  logoUrl: string | null;
  about: string | null;
  mission: string | null;
  vision: string | null;
  country: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  foundedYear: number | null;
  tagline: string | null;
  sectors: string[];
  services: string[];
  servicesFull: Array<{ name: string; description: string }>;
  ceo: { name: string; title: string; photoUrl: string | null; quote: string; message: string } | null;
  visible: Set<string>;
  projects: Array<{ id: string; project_name: string; client_name: string; sector: string; valueLabel: string; dateRange: string; scope: string; verified: boolean; verifiedNote: string; media: Array<{ url: string; caption: string }> }>;
  team: Array<{ id: string; person_name: string; role: string }>;
  certifications: Array<{ id: string; name: string; issuer: string; year: string; verified: boolean; verifiedNote: string }>;
  publicClients: Array<{ name: string; logoUrl: string }>;
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
    const [basicsRes, projRes, teamRes, certRes, clientsRes, servicesRes, mediaRes] = await Promise.all([
      svc.from("company_details").select("*").eq("profile_id", profileId).maybeSingle(),
      svc.from("company_projects").select("*").eq("profile_id", profileId).order("year_end", { ascending: false, nullsFirst: false }),
      svc.from("company_team").select("*").eq("profile_id", profileId).order("order_index").order("created_at"),
      svc.from("company_certifications").select("*").eq("profile_id", profileId).order("year", { ascending: false, nullsFirst: false }),
      svc.from("company_clients").select("*").eq("profile_id", profileId).eq("display_public", true).order("client_name"),
      svc.from("company_services").select("name, description").eq("profile_id", profileId).order("order_index").order("created_at"),
      svc.from("company_project_media").select("project_id, url, caption").eq("profile_id", profileId).order("order_index").order("created_at"),
    ]);
    const mediaByProject = new Map<string, Array<{ url: string; caption: string }>>();
    for (const m of mediaRes.data ?? []) {
      const list = mediaByProject.get(m.project_id) ?? [];
      list.push({ url: m.url, caption: (m.caption as string | null) ?? "" });
      mediaByProject.set(m.project_id, list);
    }
    const b = basicsRes.data;
    if (!b?.company_name) return null;
    return {
      kind: "company",
      name: b.company_name,
      logoUrl: b.logo_url ?? null,
      about: visible.has("summary") ? b.about ?? null : null,
      mission: visible.has("summary") ? b.mission ?? null : null,
      vision: visible.has("summary") ? b.vision ?? null : null,
      country: visible.has("contact") ? b.country ?? null : null,
      website: visible.has("contact") ? b.website ?? null : null,
      email: visible.has("contact") ? b.email ?? null : null,
      phone: visible.has("contact") ? b.phone ?? null : null,
      foundedYear: b.founded_year ?? null,
      tagline: b.tagline ?? null,
      sectors: visible.has("sectors") ? (b.sectors ?? []) : [],
      // Services come from the company_services table (name + description),
      // not the legacy core_services array.
      servicesFull: visible.has("sectors") ? (servicesRes.data ?? []).map((s) => ({ name: s.name, description: (s.description as string | null) ?? "" })) : [],
      services: visible.has("sectors") ? (servicesRes.data ?? []).map((s) => s.name) : [],
      // CEO node (organogram top) + message. Grouped with the leadership /
      // "team" visibility toggle. null when nothing to show or hidden.
      ceo: visible.has("team") && (b.ceo_name || b.ceo_message || b.ceo_quote)
        ? {
            name: b.ceo_name ?? "",
            title: b.ceo_title ?? "",
            photoUrl: b.ceo_photo_url ?? null,
            quote: b.ceo_quote ?? "",
            message: b.ceo_message ?? "",
          }
        : null,
      visible,
      projects: visible.has("projects") ? (projRes.data ?? []).map((p) => ({
        id: p.id, project_name: p.project_name, client_name: p.client_name ?? "", sector: p.sector ?? "",
        valueLabel: p.value_amount != null ? `${p.currency ?? "USD"} ${p.value_amount}` : "",
        dateRange: yearRange(p.year_start, p.year_end),
        scope: p.scope ?? "",
        verified: FEATURES.verification && !!p.verified, verifiedNote: p.verified_note ?? "",
        media: mediaByProject.get(p.id) ?? [],
      })) : [],
      team: visible.has("team") ? (teamRes.data ?? []).map((t) => ({ id: t.id, person_name: t.person_name, role: t.role ?? "" })) : [],
      certifications: visible.has("certifications") ? (certRes.data ?? []).map((c) => ({
        id: c.id, name: c.name, issuer: c.issuer ?? "", year: c.year ? String(c.year) : "",
        verified: FEATURES.verification && !!c.verified, verifiedNote: c.verified_note ?? "",
      })) : [],
      publicClients: visible.has("clients") ? (clientsRes.data ?? []).map((c) => ({ name: c.client_name, logoUrl: (c.logo_url as string | null) ?? "" })) : [],
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
    photoUrl: b.photo_url ?? null,
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
      verified: FEATURES.verification && !!e.verified, verifiedNote: e.verified_note ?? "",
    })) : [],
    educations: visible.has("educations") ? (eduRes.data ?? []).map((e) => ({
      id: e.id, qualification: QUALIFICATION_LABELS[e.qualification_level as QualLevel] ?? e.qualification_level,
      institution: e.institution, field: e.field_of_study ?? "",
      dateRange: yearRange(e.start_year, e.end_year),
      verified: FEATURES.verification && !!e.verified, verifiedNote: e.verified_note ?? "",
    })) : [],
    skills: visible.has("skills") ? (skillsRes.data ?? []).map((s) => ({ id: s.id, name: s.name })) : [],
    certifications: visible.has("certifications") ? (certsRes.data ?? []).map((c) => ({
      id: c.id, name: c.name, issuer: c.issuer ?? "", year: c.year ? String(c.year) : "",
      verified: FEATURES.verification && !!c.verified, verifiedNote: c.verified_note ?? "",
    })) : [],
  };
}

// Decide who's viewing. Caller already has the auth user id.
export function viewerContext(profileId: string, viewerId: string | null): ViewerContext {
  if (!viewerId) return "public";
  if (viewerId === profileId) return "owner";
  return "registered";
}
