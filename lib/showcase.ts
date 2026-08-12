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
  const svc = createSupabaseServiceClient();
  if (!svc) return [];

  const [profilesRes, indRes, coRes] = await Promise.all([
    svc.from("profiles").select("id, account_type, showcase, created_at")
      .order("created_at", { ascending: false }).limit(200),
    svc.from("individual_details").select("profile_id, full_name, headline, location, photo_url"),
    svc.from("company_details").select("profile_id, company_name, tagline, logo_url, country, sectors"),
  ]);

  // Before migration 0009, `showcase` is missing and the profiles query
  // errors — degrade to an empty gallery rather than breaking /home.
  if (profilesRes.error) return [];

  const ind = new Map((indRes.data ?? []).map((r) => [r.profile_id, r]));
  const co = new Map((coRes.data ?? []).map((r) => [r.profile_id, r]));

  const out: ShowcaseMember[] = [];
  for (const p of profilesRes.data ?? []) {
    if (!p.showcase) continue;
    if (p.account_type === "company") {
      const c = co.get(p.id);
      const line = c?.tagline || (c?.sectors ?? []).slice(0, 2).join(" · ");
      if (!c?.company_name || !c.logo_url || !line) continue;
      out.push({ id: p.id, kind: "company", name: c.company_name, line, location: c.country ?? "", photoUrl: c.logo_url });
    } else {
      const d = ind.get(p.id);
      if (!d?.full_name || !d.photo_url || !d.headline) continue;
      out.push({ id: p.id, kind: "individual", name: d.full_name, line: d.headline, location: d.location ?? "", photoUrl: d.photo_url });
    }
    if (out.length >= limit) break;
  }
  return out;
}
