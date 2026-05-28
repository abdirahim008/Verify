import Link from "next/link";
import { loadFeedQueue } from "@/lib/feed-data";
import { FeedQueueActions, RefreshFeedButton } from "@/components/admin/FeedQueueActions";

export const metadata = { title: "Admin · feed" };

const FILTERS = [
  { key: "pending",  label: "Pending review" },
  { key: "approved", label: "Approved" },
  { key: "all",      label: "All" },
] as const;

export default async function AdminFeedPage({
  searchParams,
}: { searchParams: { status?: string } }) {
  const filter = (FILTERS.find((f) => f.key === searchParams.status)?.key ?? "pending") as
    "pending" | "approved" | "all";
  const items = await loadFeedQueue(filter);

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow text-sienna">Admin &middot; homepage feed</p>
          <h1 className="font-serif text-[32px] sm:text-[40px] tracking-[-0.02em] mt-2">Syndicated items</h1>
          <p className="mt-2 text-[14.5px] text-ink-soft max-w-xl leading-relaxed">
            Items pulled from approved RSS / API sources (ReliefWeb today). Nothing reaches the user-facing feed until you approve it. Refresh pulls the latest batch and adds new items as <em>Pending</em>.
          </p>
        </div>
        <RefreshFeedButton />
      </header>

      <nav className="mt-6 flex gap-2 flex-wrap" aria-label="Filter">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/feed?status=${f.key}`}
            className={`px-3 py-1.5 rounded-full text-[12.5px] font-medium border ${
              filter === f.key
                ? "bg-ink text-paper border-ink"
                : "bg-paper text-ink-soft border-border hover:bg-cream"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <section className="mt-6">
        {items.length === 0 ? (
          <p className="text-[13.5px] text-muted">Nothing in this bucket. Hit <em>Refresh</em> to pull the latest items.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="card bg-paper">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="section-eyebrow">{item.source_name}</span>
                      {item.tag && <span className="text-[11px] uppercase tracking-[0.12em] text-muted">{item.tag}</span>}
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.12em] font-medium ${
                        item.approved ? "bg-verified-soft text-verified" : "bg-cream border border-border text-muted"
                      }`}>{item.approved ? "Approved" : "Pending"}</span>
                    </div>
                    <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="font-serif text-[18px] tracking-tightish mt-2 inline-block hover:underline">
                      {item.title} ↗
                    </a>
                    {item.snippet && <p className="mt-2 text-[13.5px] text-ink-soft leading-relaxed max-w-3xl">{item.snippet}</p>}
                    <p className="mt-2 text-[12px] text-muted">{item.published_at ? new Date(item.published_at).toLocaleString() : ""}</p>
                  </div>
                  <FeedQueueActions id={item.id} approved={item.approved} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
