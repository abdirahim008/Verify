import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

// Members for the home-page "Profiles on Sahan" gallery. Service-role client:
// profiles RLS is owner-or-admin, but this needs a cross-member read. Shown
// only to signed-in users, and only members who (a) haven't opted out
// (profiles.showcase, migration 0009) and (b) have a name plus one line of
// context. A photo is NOT required — members without one get a standard
// initials avatar — but members with photos are ordered first so the top of
// the grid always looks its best.

export interface ShowcaseMember {
  id: string;
  kind: "individual" | "company";
  name: string;
  /** Headline (individuals) or tagline/sectors line (companies). */
  line: string;
  location: string;
  /** Empty when the member has no photo/logo — render `initials` instead. */
  photoUrl: string;
  /** "AM" for people (first + last name), "XE" for companies (first two words). */
  initials: string;
}

export async function loadShowcaseMembers(limit = 16): Promise<ShowcaseMember[]> {
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

// "Mohamed Sheikh Ahmed" → "MA"; "Xuub Engineering Limited" (company) → "XE";
// single-word names fall back to one letter. Honorifics ("Eng.", "Dr") and
// non-letter tokens ("04", "&") are skipped so an engineer doesn't become
// "EY" and "Cahill 04 Uganda" doesn't become "C0".
export function memberInitials(name: string, kind: "individual" | "company"): string {
  const words = name.trim().split(/\s+/).filter((w) =>
    /^\p{L}/u.test(w) && !/^(eng|dr|mr|mrs|ms|prof|hon)\.?$/i.test(w));
  if (words.length === 0) return "·";
  const first = words[0][0];
  const second = kind === "company" ? words[1]?.[0] : words[words.length - 1]?.[0];
  return ((first ?? "") + (words.length > 1 && second ? second : "")).toUpperCase();
}

async function loadMembers(mode: "showcase" | "featured", limit: number): Promise<ShowcaseMember[]> {
  const svc = createSupabaseServiceClient();
  if (!svc) return [];

  // "featured" needs its own select so a missing 0010 column can't break the
  // /home showcase (and vice versa for 0009 on the landing page).
  const profilesQuery = mode === "featured"
    ? svc.from("profiles").select("id, account_type, showcase, featured, created_at")
        .eq("featured", true).order("created_at", { ascending: false }).limit(300)
    : svc.from("profiles").select("id, account_type, showcase, created_at")
        .order("created_at", { ascending: false }).limit(300);

  const [profilesRes, indRes, coRes] = await Promise.all([
    profilesQuery,
    svc.from("individual_details").select("profile_id, full_name, headline, location, photo_url"),
    svc.from("company_details").select("profile_id, company_name, tagline, logo_url, country, sectors"),
  ]);

  // Before the relevant migration the flag column is missing and the query
  // errors — degrade to an empty gallery rather than breaking the page.
  if (profilesRes.error) return [];

  const ind = new Map((indRes.data ?? []).map((r) => [r.profile_id, r]));
  const co = new Map((coRes.data ?? []).map((r) => [r.profile_id, r]));

  const all: ShowcaseMember[] = [];
  for (const p of profilesRes.data ?? []) {
    if (!p.showcase) continue;
    if (p.account_type === "company") {
      const c = co.get(p.id);
      const line = c?.tagline || (c?.sectors ?? []).slice(0, 2).join(" · ");
      if (!c?.company_name || !line) continue;
      all.push({
        id: p.id, kind: "company", name: c.company_name, line,
        location: c.country ?? "", photoUrl: c.logo_url ?? "",
        initials: memberInitials(c.company_name, "company"),
      });
    } else {
      const d = ind.get(p.id);
      if (!d?.full_name || !d.headline) continue;
      all.push({
        id: p.id, kind: "individual", name: d.full_name, line: d.headline,
        location: d.location ?? "", photoUrl: d.photo_url ?? "",
        initials: memberInitials(d.full_name, "individual"),
      });
    }
  }

  // Photos first (each group keeps its newest-first order), then cap.
  const withPhoto = all.filter((m) => m.photoUrl);
  const withoutPhoto = all.filter((m) => !m.photoUrl);
  return [...withPhoto, ...withoutPhoto].slice(0, limit);
}
