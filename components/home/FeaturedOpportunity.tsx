import { labelFor } from "@/lib/jobs/sectors";
import { deadlineLabel, type OppRowData } from "./oppRow";

// The home page's single focal point: one highlighted opportunity on a dark
// ink panel so it breaks the run of white cards below it. For individuals this
// is the strongest role match; for companies, the freshest tender. Purely a
// spotlight on an item that also appears in the lists below — no new data.
export function FeaturedOpportunity({ item, eyebrow }: { item: OppRowData; eyebrow: string }) {
  const dl = deadlineLabel(item);
  const meta = [item.org, item.location].filter(Boolean).join(" · ");
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative overflow-hidden rounded-2xl bg-ink text-paper p-6 sm:p-7 hover:-translate-y-0.5 transition-transform"
    >
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-sienna/25 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-sienna-soft">★ {eyebrow}</span>
          {dl && (
            <span className={`text-[10.5px] font-semibold rounded-full px-2 py-0.5 ${dl.urgent ? "bg-amber-400/20 text-amber-200" : "bg-paper/10 text-paper/70"}`}>
              {dl.text}
            </span>
          )}
        </div>

        <h2 className="font-serif text-[24px] sm:text-[28px] tracking-[-0.01em] leading-[1.15] mt-3 max-w-2xl group-hover:text-sienna-soft transition-colors">
          {item.title}
        </h2>
        {meta && <p className="mt-2 text-[13.5px] text-paper/70">{meta}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {item.sector && (
            <span className="rounded-full border border-paper/20 bg-paper/5 px-2.5 py-1 text-[11.5px] text-paper/80">{labelFor(item.sector)}</span>
          )}
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-paper text-ink text-[13px] font-semibold px-4 py-2 group-hover:bg-sienna-soft transition-colors">
            View &amp; apply ↗
          </span>
        </div>
      </div>
    </a>
  );
}
