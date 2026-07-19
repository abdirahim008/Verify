import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

// Data for /admin/metrics. Service-role client: the dashboard aggregates
// across every user, which RLS (correctly) forbids for the anon key. The
// admin gate lives in the /admin layout; this module never runs for
// non-admins.
//
// Scale note: counts are computed in JS from id-only selects. Fine for the
// current user base; switch to SQL aggregates (rpc) when tables grow past a
// few thousand rows.

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  accountType: "individual" | "company";
  isAdmin: boolean;
  joined: string;                 // ISO
  lastSignIn: string | null;      // ISO
  /** Content items in the builder (roles+education+skills+certs, or
   *  projects+services+team+clients for companies). */
  contentCount: number;
  /** Real downloads (CV / company PDF / business card), previews excluded. */
  downloads: number;
  previews: number;
  lastDownload: string | null;    // ISO
}

export interface AdminMetrics {
  totals: {
    users: number; individuals: number; companies: number;
    new7: number; new30: number;
    /** Users with at least one content item. */
    activated: number;
    /** Users with at least one real download. */
    downloaded: number;
  };
  downloads: { cv: number; company: number; card: number; previews: number };
  /** Real downloads per template, most popular first. */
  templates: Array<{ kind: "cv" | "company"; template: string; count: number }>;
  users: AdminUserRow[];
  /** False until migration 0007 (usage_events) is applied. */
  eventsAvailable: boolean;
}

interface EventRow {
  profile_id: string;
  event: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export async function loadAdminMetrics(): Promise<AdminMetrics | null> {
  const svc = createSupabaseServiceClient();
  if (!svc) return null;

  // Owner-id column per content table, fetched in parallel with profiles.
  const contentTables = [
    "experiences", "educations", "skills", "certifications",
    "company_projects", "company_services", "company_team", "company_clients",
  ];

  const [profilesRes, eventsRes, usersRes, ...contentRes] = await Promise.all([
    svc.from("profiles").select("id, display_name, account_type, is_admin, created_at"),
    svc.from("usage_events").select("profile_id, event, meta, created_at")
      .order("created_at", { ascending: false }).limit(5000),
    // Emails + last sign-in live in auth.users; service role can list them.
    svc.auth.admin.listUsers({ page: 1, perPage: 1000 }).catch(() => null),
    ...contentTables.map((t) => svc.from(t).select("profile_id")),
  ]);

  const profiles = profilesRes.data ?? [];
  // "relation does not exist" before migration 0007 → dashboard still works,
  // download columns just show as unavailable.
  const eventsAvailable = !eventsRes.error;
  const events: EventRow[] = (eventsRes.data as EventRow[] | null) ?? [];

  const authById = new Map<string, { email: string; lastSignIn: string | null }>();
  for (const u of usersRes && "data" in usersRes ? usersRes.data.users : []) {
    authById.set(u.id, { email: u.email ?? "", lastSignIn: u.last_sign_in_at ?? null });
  }

  const contentByProfile = new Map<string, number>();
  for (const res of contentRes) {
    for (const row of (res.data as Array<{ profile_id: string }> | null) ?? []) {
      contentByProfile.set(row.profile_id, (contentByProfile.get(row.profile_id) ?? 0) + 1);
    }
  }

  const downloadsByProfile = new Map<string, { real: number; previews: number; last: string | null }>();
  const templateCounts = new Map<string, number>();
  let cv = 0, company = 0, card = 0, previews = 0;
  for (const e of events) {
    const isPreview = e.meta?.preview === true;
    const entry = downloadsByProfile.get(e.profile_id) ?? { real: 0, previews: 0, last: null };
    if (isPreview) { previews++; entry.previews++; }
    else {
      entry.real++;
      entry.last = entry.last ?? e.created_at; // events are newest-first
      if (e.event === "cv_download") cv++;
      else if (e.event === "company_download") company++;
      else if (e.event === "card_download") card++;
      const tpl = typeof e.meta?.template === "string" ? e.meta.template : null;
      if (tpl && (e.event === "cv_download" || e.event === "company_download")) {
        const key = `${e.event === "cv_download" ? "cv" : "company"}:${tpl}`;
        templateCounts.set(key, (templateCounts.get(key) ?? 0) + 1);
      }
    }
    downloadsByProfile.set(e.profile_id, entry);
  }

  const now = Date.now();
  const DAY = 86_400_000;
  const users: AdminUserRow[] = profiles
    .map((p) => {
      const auth = authById.get(p.id);
      const dl = downloadsByProfile.get(p.id);
      return {
        id: p.id,
        name: p.display_name || "(no name)",
        email: auth?.email ?? "",
        accountType: (p.account_type ?? "individual") as "individual" | "company",
        isAdmin: !!p.is_admin,
        joined: p.created_at,
        lastSignIn: auth?.lastSignIn ?? null,
        contentCount: contentByProfile.get(p.id) ?? 0,
        downloads: dl?.real ?? 0,
        previews: dl?.previews ?? 0,
        lastDownload: dl?.last ?? null,
      };
    })
    .sort((a, b) => +new Date(b.joined) - +new Date(a.joined));

  return {
    totals: {
      users: users.length,
      individuals: users.filter((u) => u.accountType === "individual").length,
      companies: users.filter((u) => u.accountType === "company").length,
      new7: users.filter((u) => now - +new Date(u.joined) <= 7 * DAY).length,
      new30: users.filter((u) => now - +new Date(u.joined) <= 30 * DAY).length,
      activated: users.filter((u) => u.contentCount > 0).length,
      downloaded: users.filter((u) => u.downloads > 0).length,
    },
    downloads: { cv, company, card, previews },
    templates: [...templateCounts.entries()]
      .map(([key, count]) => {
        const [kind, template] = key.split(":") as ["cv" | "company", string];
        return { kind, template, count };
      })
      .sort((a, b) => b.count - a.count),
    users,
    eventsAvailable,
  };
}
