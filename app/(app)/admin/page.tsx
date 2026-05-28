import Link from "next/link";
import { loadAdminRequests } from "@/lib/verification-data";
import { TARGET_LABELS } from "@/lib/verification";

export const metadata = { title: "Admin" };

const FILTERS = [
  { key: "pending",  label: "Pending" },
  { key: "verified", label: "Verified" },
  { key: "rejected", label: "Rejected" },
  { key: "all",      label: "All" },
] as const;

export default async function AdminPage({
  searchParams,
}: { searchParams: { status?: string } }) {
  const status = (FILTERS.find((f) => f.key === searchParams.status)?.key ?? "pending") as
    "pending" | "verified" | "rejected" | "all";
  const rows = await loadAdminRequests(status);

  return (
    <div>
      <header>
        <p className="section-eyebrow text-sienna">Admin &middot; verification queue</p>
        <h1 className="font-serif text-[32px] sm:text-[40px] tracking-[-0.02em] mt-2">Requests</h1>
        <p className="mt-2 text-[14.5px] text-ink-soft max-w-xl leading-relaxed">
          One row per submitted request. Open a row to review evidence and mark verified or rejected.
        </p>
      </header>

      <nav className="mt-6 flex gap-2 flex-wrap" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin?status=${f.key}`}
            className={`px-3 py-1.5 rounded-full text-[12.5px] font-medium border ${
              status === f.key
                ? "bg-ink text-paper border-ink"
                : "bg-paper text-ink-soft border-border hover:bg-cream"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <section className="mt-6">
        {rows.length === 0 ? (
          <p className="text-[13.5px] text-muted">Nothing in this bucket.</p>
        ) : (
          <ul className="grid gap-3">
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/admin/${r.id}`}
                  className="block card border border-border bg-paper hover:bg-cream/30 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="section-eyebrow">{TARGET_LABELS[r.target_type]}</span>
                        <StatusPill status={r.status} />
                        <span className="text-[10.5px] uppercase tracking-[0.14em] text-muted">{r.requesterAccountType ?? ""}</span>
                      </div>
                      <p className="font-serif text-[17px] tracking-tightish mt-2">{r.requesterName || "(no name)"}</p>
                      <p className="text-[12.5px] text-muted mt-1">
                        {new Date(r.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                        &nbsp;&middot;&nbsp;{r.evidence_urls.length} file{r.evidence_urls.length === 1 ? "" : "s"}
                        {r.price_amount != null && <>&nbsp;&middot;&nbsp;{r.price_currency || "USD"} ${r.price_amount}</>}
                      </p>
                    </div>
                    <span className="text-muted" aria-hidden>→</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatusPill({ status }: { status: "pending" | "verified" | "rejected" }) {
  const styles = {
    pending:  "bg-cream border border-border text-muted",
    verified: "bg-verified-soft text-verified",
    rejected: "bg-red-50 border border-red-200 text-red-700",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.1em] ${styles[status]}`}>
      {status}
    </span>
  );
}
