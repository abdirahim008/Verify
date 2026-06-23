import type { JobItem } from "@/lib/jobs/feed";
import { OpportunityRow } from "./oppRow";

// Tenders, RFPs and consultancies pulled from the same SomKenJobs feed.
// Shown to everyone (consultants and company accounts), no personalisation.
export function TendersCard({ items }: { items: JobItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="card">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="section-eyebrow text-sienna">Opportunities</span>
            <span className="text-[10.5px] font-semibold text-sienna bg-sienna/[0.08] border border-sienna/20 rounded-full px-2 py-0.5">SomKenJobs.com</span>
          </div>
          <h2 className="font-serif text-[22px] tracking-tightish mt-1">Tenders &amp; consultancies</h2>
          <p className="text-[12.5px] text-muted mt-0.5">RFPs, terms of reference and short-term contracts</p>
        </div>
        <a href="https://somkenjobs.com" target="_blank" rel="noopener noreferrer" className="shrink-0 text-[13px] font-medium text-sienna hover:underline">Browse all ↗</a>
      </div>

      <ul className="mt-2">
        {items.map((t) => <OpportunityRow key={t.link} item={t} />)}
      </ul>

      <p className="mt-3 text-[11.5px] text-muted">Syndicated from SomKenJobs.com. Titles and short details only, with a link back to apply.</p>
    </section>
  );
}
