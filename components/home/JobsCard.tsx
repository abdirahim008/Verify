import Link from "next/link";
import type { MatchedJobs } from "@/lib/jobs/feed";
import { labelFor } from "@/lib/jobs/sectors";
import { OpportunityRow } from "./oppRow";

// "Roles matched to your profile" — live jobs from SomKenJobs on /home.
// Server-rendered, links out to each listing. Styled to match the rest of
// the Sahan home (card / sienna / serif).
export function JobsCard({ matched, categories }: { matched: MatchedJobs; categories: string[] }) {
  const { items, personalised, topMatchLink } = matched;
  const labels = categories.map(labelFor);

  return (
    <section className="card">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="section-eyebrow text-sienna">Jobs</span>
            <span className="text-[10.5px] font-semibold text-sienna bg-sienna/[0.08] border border-sienna/20 rounded-full px-2 py-0.5">SomKenJobs.com</span>
          </div>
          <h2 className="font-serif text-[22px] tracking-tightish mt-1">
            {personalised ? "Roles matched to your profile" : "Latest roles in the sector"}
          </h2>
          {personalised && labels.length > 0 ? (
            <p className="text-[12.5px] text-muted mt-0.5 truncate">{labels.join(" · ")}</p>
          ) : (
            <p className="text-[12.5px] text-muted mt-0.5">
              <Link href="/profile" className="text-sienna font-medium hover:underline">Pick your career interests</Link> to personalise this.
            </p>
          )}
        </div>
        <a href="https://somkenjobs.com" target="_blank" rel="noopener noreferrer" className="shrink-0 text-[13px] font-medium text-sienna hover:underline">Browse all ↗</a>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-[13.5px] text-ink-soft">
          {personalised ? "No current openings match your interests. " : "No openings to show right now. "}
          <a href="https://somkenjobs.com" target="_blank" rel="noopener noreferrer" className="text-sienna font-medium hover:underline">Browse all roles on SomKenJobs ↗</a>
        </p>
      ) : (
        <ul className="mt-2">
          {items.map((job) => (
            <OpportunityRow key={job.link} item={job} badge={topMatchLink === job.link ? "TOP MATCH" : undefined} />
          ))}
        </ul>
      )}

      <p className="mt-3 text-[11.5px] text-muted">Jobs are syndicated from SomKenJobs.com. Titles and short details only, with a link back to apply.</p>
    </section>
  );
}
