import { loadAdminMetrics, type AdminUserRow, type TemplateStat } from "@/lib/admin-metrics";
import { FeatureToggle } from "@/components/admin/FeatureToggle";
import { BlockToggle } from "@/components/admin/BlockToggle";

export const metadata = { title: "Metrics" };
export const dynamic = "force-dynamic";

// Admin usage dashboard: signups, activation (added content), and download
// activity per user + per template. Gated by the /admin layout (is_admin).
export default async function MetricsPage() {
  const m = await loadAdminMetrics();
  if (!m) {
    return <p className="text-[13.5px] text-muted">Service-role key not configured — set SUPABASE_SERVICE_ROLE_KEY.</p>;
  }

  const tiles: Array<[string, string | number, string]> = [
    ["Users", m.totals.users - m.totals.blocked,
      `${m.totals.individuals} individual · ${m.totals.companies} company${m.totals.blocked ? ` · ${m.totals.blocked} blocked as spam` : ""}`],
    ["New this week", m.totals.new7, `${m.totals.new30} in the last 30 days`],
    ["Activated", m.totals.activated, "added at least one profile item"],
    ["Downloaded", m.eventsAvailable ? m.totals.downloaded : "—", "got a CV, profile or card"],
  ];

  return (
    <div>
      <header>
        <p className="section-eyebrow text-sienna">Admin &middot; usage</p>
        <h1 className="font-serif text-[32px] sm:text-[40px] tracking-[-0.02em] mt-2">Metrics</h1>
        <p className="mt-2 text-[14.5px] text-ink-soft max-w-xl leading-relaxed">
          Who signed up, who filled in a profile, and who&rsquo;s downloading. Refreshes on every load.
        </p>
      </header>

      {!m.eventsAvailable && (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          Download tracking is off until migration <code className="font-mono">0007_usage_events.sql</code> is applied
          in the Supabase SQL editor. Signup and content metrics below are live.
        </div>
      )}

      {/* Stat tiles */}
      <div className="mt-7 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map(([label, value, sub]) => (
          <div key={label} className="card border border-border bg-paper p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted font-semibold">{label}</p>
            <p className="font-serif text-[32px] tracking-tightish mt-1 leading-none">{value}</p>
            <p className="text-[11.5px] text-muted mt-2">{sub}</p>
          </div>
        ))}
      </div>

      {/* Downloads summary */}
      {m.eventsAvailable && (
        <section className="mt-8">
          <h2 className="font-serif text-[22px] tracking-tightish">Downloads</h2>
          <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {([["CVs", m.downloads.cv], ["Company profiles", m.downloads.company], ["Business cards", m.downloads.card], ["Previews", m.downloads.previews]] as const).map(([label, n]) => (
              <div key={label} className="rounded-[10px] border border-border bg-cream/50 px-4 py-3">
                <span className="font-serif text-[22px]">{n}</span>
                <span className="ml-2 text-[12.5px] text-muted">{label}</span>
              </div>
            ))}
          </div>

        </section>
      )}

      {/* Template popularity */}
      {m.eventsAvailable && (
        <section className="mt-8">
          <h2 className="font-serif text-[22px] tracking-tightish">Most downloaded templates</h2>
          <p className="mt-1 text-[12.5px] text-muted max-w-xl leading-relaxed">
            Real downloads per template, most popular first. Previews are people opening a template
            without downloading it.
          </p>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <TemplateRanking title="CV templates" stats={m.templates.cv} />
            <TemplateRanking title="Company profile templates" stats={m.templates.company} />
          </div>
        </section>
      )}

      {/* Feedback */}
      {m.feedback.items.length > 0 && (
        <section className="mt-8">
          <div className="flex items-baseline gap-3">
            <h2 className="font-serif text-[22px] tracking-tightish">Feedback</h2>
            {m.feedback.average != null && (
              <span className="text-[13px] text-muted">
                <span className="text-amber-500">★</span>{" "}
                <span className="font-semibold text-ink">{m.feedback.average.toFixed(1)}</span> from {m.feedback.count} rating{m.feedback.count === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <ul className="mt-3 grid gap-2">
            {m.feedback.items.map((f, i) => (
              <li key={i} className="rounded-[10px] border border-border bg-paper px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] font-medium">{f.name}</span>
                  <span className="text-[11.5px] text-muted whitespace-nowrap">
                    {f.rating != null && <span className="text-amber-500 mr-2">{"★".repeat(f.rating)}<span className="text-border">{"★".repeat(5 - f.rating)}</span></span>}
                    {fmtDate(f.created_at)}
                  </span>
                </div>
                {f.comment && <p className="text-[13px] text-ink-soft mt-1.5 leading-relaxed whitespace-pre-line">{f.comment}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Per-user table */}
      <section className="mt-8">
        <h2 className="font-serif text-[22px] tracking-tightish">Users</h2>
        <div className="mt-3 overflow-x-auto rounded-[12px] border border-border bg-paper">
          <table className="w-full text-[13px] min-w-[720px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-muted border-b border-border">
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-3 py-3 font-semibold">Type</th>
                <th className="px-3 py-3 font-semibold">Joined</th>
                <th className="px-3 py-3 font-semibold">Last sign-in</th>
                <th className="px-3 py-3 font-semibold text-right">Items</th>
                <th className="px-3 py-3 font-semibold text-right">Downloads</th>
                <th className="px-3 py-3 font-semibold">Last download</th>
                <th className="px-3 py-3 font-semibold" title="Feature on the public landing page (with the member's consent)">Feat.</th>
                <th className="px-4 py-3 font-semibold" title="Hide as spam from the gallery, landing page, public profile and member count">Block</th>
              </tr>
            </thead>
            <tbody>
              {m.users.map((u) => <UserRow key={u.id} u={u} eventsAvailable={m.eventsAvailable} />)}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12px] text-muted">
          &ldquo;Items&rdquo; counts builder entries (roles, education, skills, certs — or projects, services, team, clients).
          Previews aren&rsquo;t counted as downloads.
        </p>
      </section>
    </div>
  );
}

function TemplateRanking({ title, stats }: { title: string; stats: TemplateStat[] }) {
  const total = stats.reduce((s, t) => s + t.downloads, 0);
  return (
    <div className="rounded-[12px] border border-border bg-paper p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted font-semibold">{title}</p>
        <span className="text-[11.5px] text-muted">{total} download{total === 1 ? "" : "s"}</span>
      </div>
      <ol className="mt-3 grid gap-3">
        {stats.map((t, i) => {
          const share = total ? Math.round((t.downloads / total) * 100) : 0;
          return (
            <li key={t.id} className={t.downloads === 0 ? "opacity-60" : ""}>
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="min-w-0 truncate">
                  <span className="text-muted tabular-nums mr-2">{i + 1}.</span>
                  <span className="font-medium">{t.name}</span>
                </span>
                <span className="whitespace-nowrap">
                  <span className="font-semibold tabular-nums">{t.downloads}</span>
                  <span className="ml-1.5 text-[11.5px] text-muted tabular-nums">{share}%</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-cream overflow-hidden">
                <div className="h-full rounded-full bg-sienna" style={{ width: `${share}%` }} />
              </div>
              <p className="mt-1 text-[11.5px] text-muted">
                {t.users} member{t.users === 1 ? "" : "s"} &middot; {t.last30} in last 30 days &middot; {t.previews} preview{t.previews === 1 ? "" : "s"}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function UserRow({ u, eventsAvailable }: { u: AdminUserRow; eventsAvailable: boolean }) {
  return (
    <tr className={`border-b border-border-soft last:border-0 ${u.blocked ? "opacity-50" : ""}`}>
      <td className="px-4 py-3">
        <a href={`/u/${u.id}`} className="font-medium text-ink hover:underline">{u.name}</a>
        {u.isAdmin && <span className="ml-1.5 text-[10px] uppercase tracking-[0.1em] text-sienna font-semibold">admin</span>}
        {u.email && <div className="text-[11.5px] text-muted">{u.email}</div>}
      </td>
      <td className="px-3 py-3 text-ink-soft">{u.accountType}</td>
      <td className="px-3 py-3 text-ink-soft whitespace-nowrap">{fmtDate(u.joined)}</td>
      <td className="px-3 py-3 text-ink-soft whitespace-nowrap">{u.lastSignIn ? fmtDate(u.lastSignIn) : "—"}</td>
      <td className="px-3 py-3 text-right">
        <span className={u.contentCount > 0 ? "font-semibold" : "text-muted"}>{u.contentCount}</span>
      </td>
      <td className="px-3 py-3 text-right">
        {eventsAvailable
          ? <span className={u.downloads > 0 ? "font-semibold text-verified" : "text-muted"}>{u.downloads}</span>
          : <span className="text-muted">—</span>}
        {eventsAvailable && u.previews > 0 && <span className="ml-1 text-[11px] text-muted">(+{u.previews}p)</span>}
      </td>
      <td className="px-3 py-3 text-ink-soft whitespace-nowrap">{u.lastDownload ? fmtDate(u.lastDownload) : "—"}</td>
      <td className="px-3 py-3">
        {u.featured == null
          ? <span className="text-muted" title="Run migration 0010 to enable featuring">—</span>
          : <FeatureToggle profileId={u.id} initial={u.featured} name={u.name} />}
      </td>
      <td className="px-4 py-3">
        {u.blocked == null
          ? <span className="text-muted" title="Run migration 0011 to enable blocking">—</span>
          : u.isAdmin
            ? <span className="text-muted">—</span>
            : <BlockToggle profileId={u.id} initial={u.blocked} reason={u.blockedReason} name={u.name} />}
      </td>
    </tr>
  );
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
