import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { yearRange } from "@/lib/format";

// PDF-ready view of the company profile. CLAUDE.md §10: only public-marked
// clients flow into the PDF; everything else respects RLS via the calling
// user's session.

export interface CompanyProject {
  name: string; client: string; sector: string; value: string;
  valueAmount: number | null;   // raw numeric — cover-page stat tiles sum it
  yearRange: string; scope: string;
  yearStart: number | null; yearEnd: number | null;  // for year filtering
  media: Array<{ url: string; caption: string }>;    // gallery photos (max 4)
  verified: boolean; verifiedNote: string;
}
export interface CompanyTeamMember {
  id: string; name: string; role: string;
  reportsTo: string | null;
  units: string[];              // department tags shown under each leader
}
export interface CompanyCert {
  name: string; issuer: string; year: string;
  verified: boolean; verifiedNote: string;
}
export interface CompanyValue { name: string; description: string; }
export interface CompanyServiceFull { name: string; description: string; }
export interface CompanyClientRef { name: string; logoUrl: string; }
export interface CompanyClientGroup { category: string; clients: CompanyClientRef[]; }
export interface CompanyCeo {
  name: string; title: string; photoUrl: string; quote: string; message: string;
}

export interface CompanyData {
  name: string; tagline: string;
  coverStatement: string;
  logoUrl: string;
  about: string; mission: string; vision: string;
  country: string; registrationNumber: string;
  foundedYear: string; website: string; email: string; phone: string;
  locations: string[];
  staffCount: string; countriesCount: string; projectsCount: string;
  sectors: string[];
  services: string[];                  // names only (legacy templates)
  servicesFull: CompanyServiceFull[];  // name + description (new templates)
  values: CompanyValue[];
  projects: CompanyProject[];
  clients: string[];                   // flat public list of names (fallback)
  clientsFull: CompanyClientRef[];     // flat list with logos (logo strip)
  clientGroups: CompanyClientGroup[];  // grouped by category (new templates)
  team: CompanyTeamMember[];
  boardName: string;
  ceo: CompanyCeo;
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

  const [basicsRes, projectsRes, clientsRes, teamRes, certsRes, servicesRes, valuesRes, mediaRes] = await Promise.all([
    supabase.from("company_details").select("*").eq("profile_id", userId).maybeSingle(),
    supabase.from("company_projects").select("*").eq("profile_id", userId)
      .order("year_end", { ascending: false, nullsFirst: false }),
    supabase.from("company_clients").select("*").eq("profile_id", userId)
      .eq("display_public", true)
      .order("order_index").order("client_name"),
    supabase.from("company_team").select("*").eq("profile_id", userId)
      .order("order_index").order("created_at"),
    supabase.from("company_certifications").select("*").eq("profile_id", userId)
      .order("year", { ascending: false, nullsFirst: false }),
    supabase.from("company_services").select("name, description").eq("profile_id", userId)
      .order("order_index").order("created_at"),
    supabase.from("company_values").select("name, description").eq("profile_id", userId)
      .order("order_index").order("created_at"),
    supabase.from("company_project_media").select("project_id, url, caption").eq("profile_id", userId)
      .order("order_index").order("created_at"),
  ]);

  const b = basicsRes.data;
  if (!b?.company_name) return null;

  const mediaByProject = new Map<string, Array<{ url: string; caption: string }>>();
  for (const m of mediaRes.data ?? []) {
    const list = mediaByProject.get(m.project_id) ?? [];
    list.push({ url: m.url, caption: (m.caption as string | null) ?? "" });
    mediaByProject.set(m.project_id, list);
  }

  // Group public clients by category, preserving insertion order. Rows with
  // no category collapse under a single "Clients" heading.
  const clientRows = clientsRes.data ?? [];
  const toRef = (c: typeof clientRows[number]): CompanyClientRef => ({
    name: c.client_name, logoUrl: (c.logo_url as string | null) ?? "",
  });
  const groupOrder: string[] = [];
  const groupMap = new Map<string, CompanyClientRef[]>();
  for (const c of clientRows) {
    const cat = ((c.category as string | null) ?? "").trim() || "Clients";
    if (!groupMap.has(cat)) { groupMap.set(cat, []); groupOrder.push(cat); }
    groupMap.get(cat)!.push(toRef(c));
  }
  const clientGroups = groupOrder.map((category) => ({ category, clients: groupMap.get(category)! }));
  const clientsFull: CompanyClientRef[] = clientRows.map(toRef);

  const servicesFull: CompanyServiceFull[] = (servicesRes.data ?? []).map((s) => ({
    name: s.name, description: (s.description as string | null) ?? "",
  }));

  return {
    name: b.company_name,
    tagline: b.tagline ?? "",
    coverStatement: b.cover_statement ?? "",
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
    locations: b.locations ?? [],
    staffCount: b.staff_count != null ? String(b.staff_count) : "",
    countriesCount: b.countries_count != null ? String(b.countries_count) : "",
    projectsCount: b.projects_count != null ? String(b.projects_count) : "",
    sectors: b.sectors ?? [],
    services: servicesFull.map((s) => s.name),
    servicesFull,
    values: (valuesRes.data ?? []).map((v) => ({ name: v.name, description: (v.description as string | null) ?? "" })),
    projects: (projectsRes.data ?? []).map((p) => ({
      name: p.project_name,
      client: p.client_name ?? "",
      sector: p.sector ?? "",
      value: formatValue(p.value_amount, p.currency),
      valueAmount: p.value_amount != null ? Number(p.value_amount) : null,
      yearRange: yearRange(p.year_start, p.year_end),
      yearStart: p.year_start ?? null,
      yearEnd: p.year_end ?? null,
      scope: p.scope ?? "",
      media: mediaByProject.get(p.id) ?? [],
      verified: !!p.verified,
      verifiedNote: p.verified_note ?? "",
    })),
    clients: clientRows.map((c) => c.client_name),
    clientsFull,
    clientGroups,
    team: (teamRes.data ?? []).map((t) => ({
      id: t.id,
      name: t.person_name,
      role: t.role ?? "",
      reportsTo: t.reports_to ?? null,
      units: t.units ?? [],
    })),
    boardName: b.board_name ?? "",
    ceo: {
      name: b.ceo_name ?? "",
      title: b.ceo_title ?? "",
      photoUrl: b.ceo_photo_url ?? "",
      quote: b.ceo_quote ?? "",
      message: b.ceo_message ?? "",
    },
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
