import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

// Members for the home-page "Profiles on Sahan" gallery. Service-role client:
// profiles RLS is owner-or-admin, but this needs a cross-member read. Shown
// only to signed-in users, and only members who (a) haven't opted out
// (profiles.showcase, migration 0009) and (b) actually look good in a card —
// photo + name + a line of context. Half-filled ghost cards would undercut
// the whole point, which is making new users want one.

export interface ShowcaseMember {
  id: string;
  kind: "individual" | "company";
  name: string;
  /** Headline (individuals) or tagline/sectors line (companies). */
  line: string;
  location: string;
  photoUrl: string;
}

export async function loadShowcaseMembers(limit = 12): Promise<ShowcaseMember[]> {
  return loadMembers("showcase", limit);
}

// Featured members for the LOGGED-OUT landing page. Stricter than the
// members-only showcase: admin-curated with the member's consent
// (profiles.featured, migration 0010), and still respects the showcase
// opt-out as an override.
export async function loadFeaturedMembers(limit = 8): Promise<ShowcaseMember[]> {
  return loadMembers("featured", limit);
}

// Live member count for the landing hero's social-proof line. Excludes
// nothing — a profile row is a signup.
export async function countMembers(): Promise<number> {
  const svc = createSupabaseServiceClient();
  if (!svc) return 0;
  const { count, error } = await svc.from("profiles").select("id", { count: "exact", head: true });
  return error ? 0 : (count ?? 0);
}

async function loadMembers(mode: "showcase" | "featured", limit: number): Promise<ShowcaseMember[]> {
  const svc = createSupabaseServiceClient();
  if (!svc) return [];

  // "featured" needs its own select so a missing 0010 column can't break the
  // /home showcase (and vice versa for 0009 on the landing page).
  const profilesQuery = mode === "featured"
    ? svc.from("profiles").select("id, account_type, showcase, featured, created_at")
        .eq("featured", true).order("created_at", { ascending: false }).limit(200)
    : svc.from("profiles").select("id, account_type, showcase, created_at")
        .order("created_at", { ascending: false }).limit(200);

  const [profilesRes, indRes, coRes, expRes, projRes] = await Promise.all([
    profilesQuery,
    svc.from("individual_details").select("profile_id, full_name, headline, location, photo_url"),
    svc.from("company_details").select("profile_id, company_name, tagline, logo_url, country, sectors"),
    svc.from("experiences").select("profile_id"),
    svc.from("company_projects").select("profile_id"),
  ]);

  // Before the relevant migration the flag column is missing and the query
  // errors — degrade to an empty gallery rather than breaking the page.
  if (profilesRes.error) return [];

  const ind = new Map((indRes.data ?? []).map((r) => [r.profile_id, r]));
  const co = new Map((coRes.data ?? []).map((r) => [r.profile_id, r]));
  const hasExperience = new Set((expRes.data ?? []).map((r) => r.profile_id));
  const hasProject = new Set((projRes.data ?? []).map((r) => r.profile_id));

  const out: ShowcaseMember[] = [];
  for (const p of profilesRes.data ?? []) {
    if (!p.showcase) continue;
    if (p.account_type === "company") {
      const c = co.get(p.id);
      const line = c?.tagline || (c?.sectors ?? []).slice(0, 2).join(" · ");
      // Presentation (name + logo + a line) AND substance (>=1 project) —
      // a card that looks finished but opens onto an empty profile
      // undermines the gallery's whole point.
      if (!c?.company_name || !c.logo_url || !line || !hasProject.has(p.id)) continue;
      out.push({ id: p.id, kind: "company", name: c.company_name, line, location: c.country ?? "", photoUrl: c.logo_url });
    } else {
      const d = ind.get(p.id);
      // Same rule for individuals: photo + headline AND >=1 real experience.
      if (!d?.full_name || !d.photo_url || !d.headline || !hasExperience.has(p.id)) continue;
      out.push({ id: p.id, kind: "individual", name: d.full_name, line: d.headline, location: d.location ?? "", photoUrl: d.photo_url });
    }
    if (out.length >= limit) break;
  }
  return out;
}
