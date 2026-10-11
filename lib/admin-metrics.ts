import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { CV_TEMPLATES, COMPANY_TEMPLATES, type TemplateMeta } from "@/components/templates/catalog";

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
  /** Featured on the public landing page (null until migration 0010). */
  featured: boolean | null;
  /** Hidden everywhere as spam (null until migration 0011). */
  blocked: boolean | null;
  blockedReason: string;
}

export interface AdminMetrics {
  totals: {
    users: number; individuals: number; companies: number;
    new7: number; new30: number;
    /** Users with at least one content item. */
    activated: number;
    /** Users with at least one real download. */
    downloaded: number;
    /** Hidden as spam. */
    blocked: number;
  };
  downloads: { cv: number; company: number; card: number; previews: number };
  /** Every template (catalog + any retired ids seen in events), most
   *  downloaded first. Zero-download templates are kept on purpose. */
  templates: { cv: TemplateStat[]; company: TemplateStat[] };
  users: AdminUserRow[];
  /** False until migration 0007 (usage_events) is applied. */
  eventsAvailable: boolean;
  feedback: {
    /** Average of submitted ratings (null when nobody has rated). */
    average: number | null;
    count: number;
    items: Array<{ name: string; rating: number | null; comment: string; created_at: string }>;
  };
}

export interface TemplateStat {
  id: string;
  name: string;
  /** Real downloads, previews excluded. */
  downloads: number;
  /** Distinct members who downloaded it. */
  users: number;
  /** Real downloads in the last 30 days. */
  last30: number;
  /** Inline previews from the templates page — interest, not a download. */
  previews: number;
}

// usage_events also logs non-download actions (ai_draft, ai_import_saved);
// only these count towards download totals.
const DOWNLOAD_EVENTS = new Set(["cv_download", "company_download", "card_download"]);

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

  const [profilesRes, eventsRes, feedbackRes, featuredRes, blockedRes, usersRes, ...contentRes] = await Promise.all([
    svc.from("profiles").select("id, display_name, account_type, is_admin, created_at"),
    svc.from("usage_events").select("profile_id, event, meta, created_at")
      .order("created_at", { ascending: false }).limit(5000),
    svc.from("app_feedback").select("profile_id, rating, comment, created_at")
      .order("created_at", { ascending: false }),
    // Separate queries so a missing 0010 / 0011 column can't break the dashboard.
    svc.from("profiles").select("id, featured"),
    svc.from("profiles").select("id, blocked, blocked_reason"),
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

  const now = Date.now();
  const DAY = 86_400_000;

  const downloadsByProfile = new Map<string, { real: number; previews: number; last: string | null }>();
  const cvStats = seedTemplateStats(CV_TEMPLATES);
  const companyStats = seedTemplateStats(COMPANY_TEMPLATES);
  let cv = 0, company = 0, card = 0, previews = 0;
  for (const e of events) {
    if (!DOWNLOAD_EVENTS.has(e.event)) continue;
    const isPreview = e.meta?.preview === true;
    const entry = downloadsByProfile.get(e.profile_id) ?? { real: 0, previews: 0, last: null };
    if (isPreview) { previews++; entry.previews++; }
    else {
      entry.real++;
      entry.last = entry.last ?? e.created_at; // events are newest-first
      if (e.event === "cv_download") cv++;
      else if (e.event === "company_download") company++;
      else if (e.event === "card_download") card++;
    }
    downloadsByProfile.set(e.profile_id, entry);

    const tpl = typeof e.meta?.template === "string" ? e.meta.template : null;
    const stats = e.event === "cv_download" ? cvStats : e.event === "company_download" ? companyStats : null;
    if (tpl && stats) {
      const s = stats.get(tpl) ?? { id: tpl, name: tpl, downloads: 0, users: new Set<string>(), last30: 0, previews: 0 };
      if (isPreview) s.previews++;
      else {
        s.downloads++;
        s.users.add(e.profile_id);
        if (now - +new Date(e.created_at) <= 30 * DAY) s.last30++;
      }
      stats.set(tpl, s);
    }
  }

  // Ratings + comments (null-safe before migration 0008 is applied).
  const nameById = new Map(profiles.map((p) => [p.id, p.display_name || "(no name)"]));
  const fbRows = (feedbackRes.data as Array<{ profile_id: string; rating: number | null; comment: string | null; created_at: string }> | null) ?? [];
  const rated = fbRows.filter((f) => f.rating != null);
  const feedback = {
    average: rated.length ? rated.reduce((s, f) => s + (f.rating ?? 0), 0) / rated.length : null,
    count: rated.length,
    items: fbRows
      .filter((f) => f.rating != null || (f.comment ?? "").trim())
      .map((f) => ({
        name: nameById.get(f.profile_id) ?? "(unknown)",
        rating: f.rating,
        comment: (f.comment ?? "").trim(),
        created_at: f.created_at,
      })),
  };

  const featuredById = featuredRes.error
    ? null
    : new Map((featuredRes.data as Array<{ id: string; featured: boolean }> | null ?? []).map((r) => [r.id, !!r.featured]));
  const blockedById = blockedRes.error
    ? null
    : new Map((blockedRes.data as Array<{ id: string; blocked: boolean; blocked_reason: string | null }> | null ?? [])
        .map((r) => [r.id, { blocked: !!r.blocked, reason: r.blocked_reason ?? "" }]));

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
        featured: featuredById ? (featuredById.get(p.id) ?? false) : null,
        blocked: blockedById ? (blockedById.get(p.id)?.blocked ?? false) : null,
        blockedReason: blockedById?.get(p.id)?.reason ?? "",
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
      blocked: users.filter((u) => u.blocked).length,
    },
    downloads: { cv, company, card, previews },
    templates: { cv: rankTemplateStats(cvStats), company: rankTemplateStats(companyStats) },
    users,
    eventsAvailable,
    feedback,
  };
}

type TemplateAccumulator = Omit<TemplateStat, "users"> & { users: Set<string> };

// Start every catalog template at zero so unused templates still show up.
function seedTemplateStats(catalog: TemplateMeta[]): Map<string, TemplateAccumulator> {
  return new Map(catalog.map((t) => [
    t.id,
    { id: t.id, name: t.name, downloads: 0, users: new Set<string>(), last30: 0, previews: 0 },
  ]));
}

// Most downloaded first; ties broken by previews, then catalog order (stable sort).
function rankTemplateStats(stats: Map<string, TemplateAccumulator>): TemplateStat[] {
  return [...stats.values()]
    .map((s) => ({ ...s, users: s.users.size }))
    .sort((a, b) => b.downloads - a.downloads || b.previews - a.previews);
}
