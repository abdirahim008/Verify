import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function loadCompanyProfile(userId: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      profile: null, basics: null,
      projects: [], clients: [], team: [], certifications: [], values: [], services: [],
    };
  }
  const [
    profileRes, basicsRes, projectsRes, clientsRes, teamRes, certsRes, valuesRes, servicesRes, mediaRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("company_details").select("*").eq("profile_id", userId).maybeSingle(),
    supabase.from("company_projects").select("*").eq("profile_id", userId).order("order_index").order("year_end", { ascending: false, nullsFirst: false }),
    supabase.from("company_clients").select("*").eq("profile_id", userId).order("order_index").order("client_name"),
    supabase.from("company_team").select("*").eq("profile_id", userId).order("order_index").order("created_at"),
    supabase.from("company_certifications").select("*").eq("profile_id", userId).order("year", { ascending: false, nullsFirst: false }),
    supabase.from("company_values").select("*").eq("profile_id", userId).order("order_index").order("created_at"),
    supabase.from("company_services").select("*").eq("profile_id", userId).order("order_index").order("created_at"),
    supabase.from("company_project_media").select("*").eq("profile_id", userId).order("order_index").order("created_at"),
  ]);

  // Attach each project's photos (max 4) so the builder can manage them inline.
  const mediaByProject = new Map<string, Array<{ id: string; url: string; caption: string | null }>>();
  for (const m of mediaRes.data ?? []) {
    const list = mediaByProject.get(m.project_id) ?? [];
    list.push({ id: m.id, url: m.url, caption: m.caption ?? null });
    mediaByProject.set(m.project_id, list);
  }

  return {
    profile: profileRes.data,
    basics: basicsRes.data,
    projects: (projectsRes.data ?? []).map((p) => ({ ...p, media: mediaByProject.get(p.id) ?? [] })),
    clients: clientsRes.data ?? [],
    team: teamRes.data ?? [],
    certifications: certsRes.data ?? [],
    values: valuesRes.data ?? [],
    services: servicesRes.data ?? [],
  };
}

export type CompanyProfileData = Awaited<ReturnType<typeof loadCompanyProfile>>;

// Company "minimum core" = name + about + 1 project. CLAUDE.md §2.
export function hasCompanyMinimumCore(data: CompanyProfileData) {
  return Boolean(
    data.basics?.company_name &&
    (data.basics?.about?.length ?? 0) > 0 &&
    data.projects.length >= 1,
  );
}

export function companyCompleteness(data: CompanyProfileData) {
  let score = 0;
  if (data.basics?.company_name) score += 12;
  if (data.basics?.about && data.basics.about.length > 80) score += 12;
  if (data.basics?.mission) score += 6;
  if (data.basics?.vision) score += 6;
  if ((data.basics?.sectors?.length ?? 0) >= 1) score += 6;
  if ((data.basics?.core_services?.length ?? 0) >= 1) score += 6;
  if (data.basics?.country) score += 4;
  if (data.basics?.founded_year) score += 4;
  if (data.basics?.website) score += 4;
  if (data.projects.length >= 1) score += 12;
  if (data.projects.length >= 3) score += 6;
  if (data.clients.length >= 1) score += 6;
  if (data.team.length >= 1) score += 6;
  if (data.certifications.length >= 1) score += 5;
  return Math.min(100, score);
}
