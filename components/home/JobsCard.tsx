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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="section-eyebrow text-sienna">Jobs · SomKenJobs</span>
          <h2 className="font-serif text-[19px] tracking-tightish mt-1 leading-snug">
            {personalised ? "Matched to your profile" : "Latest roles in the sector"}
          </h2>
          {personalised && labels.length > 0 ? (
            <p className="text-[12px] text-muted mt-0.5 truncate">{labels.join(" · ")}</p>
          ) : (
            <p className="text-[12px] text-muted mt-0.5">
              <Link href="/profile" className="text-sienna font-medium hover:underline">Pick interests</Link> to personalise.
            </p>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-[13px] text-ink-soft">
          {personalised ? "No current openings match your interests. " : "No openings to show right now. "}
          <a href="https://somkenjobs.com" target="_blank" rel="noopener noreferrer" className="text-sienna font-medium hover:underline">Browse all ↗</a>
        </p>
      ) : (
        <ul className="mt-1.5">
          {items.map((job) => (
            <OpportunityRow key={job.link} item={job} compact badge={topMatchLink === job.link ? "MATCH" : undefined} />
          ))}
        </ul>
      )}

      <a href="https://somkenjobs.com" target="_blank" rel="noopener noreferrer" className="mt-3 pt-3 border-t border-border-soft text-[12.5px] font-medium text-sienna hover:underline">Browse all roles ↗</a>
    </section>
  );
}
