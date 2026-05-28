import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { yearRange } from "@/lib/format";

// PDF-ready view of the company profile. CLAUDE.md §10: only public-marked
// clients flow into the PDF; everything else respects RLS via the calling
// user's session.

export interface CompanyProject {
  name: string; client: string; sector: string; value: string;
  yearRange: string; scope: string;
  verified: boolean; verifiedNote: string;
}
export interface CompanyTeamMember {
  id: string; name: string; role: string;
  reportsTo: string | null;
}
export interface CompanyCert {
  name: string; issuer: string; year: string;
  verified: boolean; verifiedNote: string;
}

export interface CompanyData {
  name: string; tagline: string;
  logoUrl: string;
  about: string; mission: string; vision: string;
  country: string; registrationNumber: string;
  foundedYear: string; website: string; email: string; phone: string;
  sectors: string[]; services: string[];
  projects: CompanyProject[];
  clients: string[]; // public-only
  team: CompanyTeamMember[];
  certifications: CompanyCert[];
  year: number;
}

function formatValue(amount: number | null, currency: string | null): string {
  if (amount == null) return "";
  const c = currency || "USD";
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(amount >= 10_000_000 ? 0 : 1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `${c} ${amount}`;
}

export async function loadCompanyDataForPdf(userId: string): Promise<CompanyData | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const [basicsRes, projectsRes, clientsRes, teamRes, certsRes] = await Promise.all([
    supabase.from("company_details").select("*").eq("profile_id", userId).maybeSingle(),
    supabase.from("company_projects").select("*").eq("profile_id", userId)
      .order("year_end", { ascending: false, nullsFirst: false }),
    supabase.from("company_clients").select("*").eq("profile_id", userId)
      .eq("display_public", true)
      .order("client_name"),
    supabase.from("company_team").select("*").eq("profile_id", userId)
      .order("order_index").order("created_at"),
    supabase.from("company_certifications").select("*").eq("profile_id", userId)
      .order("year", { ascending: false, nullsFirst: false }),
  ]);

  const b = basicsRes.data;
  if (!b?.company_name) return null;

  return {
    name: b.company_name,
    tagline: "", // future: a dedicated tagline field. For now keep blank.
    logoUrl: b.logo_url ?? "",
    about: b.about ?? "",
    mission: b.mission ?? "",
    vision: b.vision ?? "",
    country: b.country ?? "",
    registrationNumber: b.registration_number ?? "",
    foundedYear: b.founded_year ? String(b.founded_year) : "",
    website: b.website ?? "",
    email: b.email ?? "",
    phone: b.phone ?? "",
    sectors: b.sectors ?? [],
    services: b.core_services ?? [],
    projects: (projectsRes.data ?? []).map((p) => ({
      name: p.project_name,
      client: p.client_name ?? "",
      sector: p.sector ?? "",
      value: formatValue(p.value_amount, p.currency),
      yearRange: yearRange(p.year_start, p.year_end),
      scope: p.scope ?? "",
      verified: !!p.verified,
      verifiedNote: p.verified_note ?? "",
    })),
    clients: (clientsRes.data ?? []).map((c) => c.client_name),
    team: (teamRes.data ?? []).map((t) => ({
      id: t.id,
      name: t.person_name,
      role: t.role ?? "",
      reportsTo: t.reports_to ?? null,
    })),
    certifications: (certsRes.data ?? []).map((c) => ({
      name: c.name,
      issuer: c.issuer ?? "",
      year: c.year ? String(c.year) : "",
      verified: !!c.verified,
      verifiedNote: c.verified_note ?? "",
    })),
    year: new Date().getFullYear(),
  };
}
