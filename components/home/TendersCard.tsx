import type { JobItem } from "@/lib/jobs/feed";
import { OpportunityRow } from "./oppRow";

// Tenders, RFPs and consultancies pulled from the same SomKenJobs feed.
// Shown to everyone (consultants and company accounts), no personalisation.
export function TendersCard({ items }: { items: JobItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="card">
      <div className="min-w-0">
        <span className="section-eyebrow text-sienna">Opportunities · SomKenJobs</span>
        <h2 className="font-serif text-[19px] tracking-tightish mt-1 leading-snug">Tenders &amp; consultancies</h2>
        <p className="text-[12px] text-muted mt-0.5">RFPs, ToRs and short-term contracts</p>
      </div>

      <ul className="mt-1.5">
        {items.map((t) => <OpportunityRow key={t.link} item={t} compact />)}
      </ul>

      <a href="https://somkenjobs.com" target="_blank" rel="noopener noreferrer" className="mt-3 pt-3 border-t border-border-soft text-[12.5px] font-medium text-sienna hover:underline">Browse all tenders ↗</a>
    </section>
  );
}
