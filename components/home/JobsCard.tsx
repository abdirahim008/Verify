import Link from "next/link";
import type { MatchedJobs } from "@/lib/jobs/feed";
import { labelFor } from "@/lib/jobs/sectors";

// "Roles matched to your profile" — live jobs from SomKenJobs on /home.
// Server-rendered, links out to each listing; no client JS needed. Styled
// to match the rest of the Sahan home (card / sienna / serif).
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
          {personalised
            ? "No current openings match your interests. "
            : "No openings to show right now. "}
          <a href="https://somkenjobs.com" target="_blank" rel="noopener noreferrer" className="text-sienna font-medium hover:underline">Browse all roles on SomKenJobs ↗</a>
        </p>
      ) : (
        <ul className="mt-2">
          {items.map((job) => (
            <li key={job.link}>
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 py-3.5 border-t border-border-soft hover:bg-cream/40 rounded-lg px-2 -mx-2 transition"
              >
                <span className="shrink-0 w-11 h-11 rounded-full bg-cream border border-border flex items-center justify-center font-serif text-[13px] text-ink-soft">
                  {initials(job.org || job.title)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif text-[16px] text-ink truncate">{job.title}</span>
                    {topMatchLink === job.link && (
                      <span className="text-[10px] font-semibold tracking-wide text-verified bg-verified/[0.12] rounded-full px-2 py-0.5">TOP MATCH</span>
                    )}
                  </span>
                  {job.org && <span className="block text-[13px] text-ink-soft mt-0.5 truncate">{job.org}</span>}
                  <span className="flex gap-1.5 mt-2 flex-wrap">
                    {job.location && <Chip>{job.location}</Chip>}
                    {job.sector && <Chip>{labelFor(job.sector)}</Chip>}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  {(() => {
                    const dl = deadlineLabel(job);
                    if (dl) return <span className={`block text-[11.5px] font-medium ${dl.urgent ? "text-amber-700" : "text-muted"}`}>{dl.text}</span>;
                    if (job.postedAt) return <span className="block text-[11.5px] text-muted">{ago(job.postedAt)}</span>;
                    return null;
                  })()}
                  <span className="block text-[12.5px] font-medium text-sienna mt-2">View ↗</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[11.5px] text-muted">Jobs are syndicated from SomKenJobs.com. Titles and short details only, with a link back to apply.</p>
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="border border-border rounded-full px-2.5 py-0.5 text-[11px] text-muted">{children}</span>;
}

// Prefer a countdown from the resolved deadline; fall back to the raw text
// ("Closes Jul, 09") if we couldn't resolve a date. Returns null when the
// deadline has already passed so a stale listing doesn't show "−3 days".
function deadlineLabel(job: { deadlineISO: string | null; deadline: string | null }): { text: string; urgent: boolean } | null {
  if (job.deadlineISO) {
    const endOfDay = Date.parse(job.deadlineISO) + 86_400_000;
    const days = Math.ceil((endOfDay - Date.now()) / 86_400_000);
    if (days < 0) return null;
    if (days === 0) return { text: "Closes today", urgent: true };
    if (days === 1) return { text: "1 day left", urgent: true };
    return { text: `${days} days left`, urgent: days <= 7 };
  }
  if (job.deadline) return { text: `Closes ${job.deadline}`, urgent: false };
  return null;
}

function initials(s: string): string {
  const words = s.trim().split(/\s+/).filter(Boolean).slice(0, 3);
  const letters = words.map((w) => w[0]).join("");
  return (letters || s.slice(0, 2)).toUpperCase().slice(0, 3);
}

function ago(iso: string): string {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (Number.isNaN(days)) return "";
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}
