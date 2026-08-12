import { loadAdminMetrics, type AdminUserRow } from "@/lib/admin-metrics";
import { FeatureToggle } from "@/components/admin/FeatureToggle";

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
    ["Users", m.totals.users, `${m.totals.individuals} individual · ${m.totals.companies} company`],
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

          {m.templates.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted font-semibold">By template</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {m.templates.map((t) => (
                  <span key={`${t.kind}:${t.template}`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-paper px-3 py-1 text-[12.5px]">
                    <span className="text-[10.5px] uppercase tracking-[0.1em] text-muted">{t.kind}</span>
                    <span className="font-medium">{t.template}</span>
                    <span className="text-sienna font-semibold">{t.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
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
                <th className="px-4 py-3 font-semibold" title="Feature on the public landing page (with the member's consent)">Feat.</th>
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

function UserRow({ u, eventsAvailable }: { u: AdminUserRow; eventsAvailable: boolean }) {
  return (
    <tr className="border-b border-border-soft last:border-0">
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
      <td className="px-4 py-3">
        {u.featured == null
          ? <span className="text-muted" title="Run migration 0010 to enable featuring">—</span>
          : <FeatureToggle profileId={u.id} initial={u.featured} name={u.name} />}
      </td>
    </tr>
  );
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
