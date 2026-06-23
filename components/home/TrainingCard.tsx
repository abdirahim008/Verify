import type { TrainingItem } from "@/lib/feeds/training";

// Free courses & scholarships from ReliefWeb, in a compact two-up grid.
export function TrainingCard({ items }: { items: TrainingItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="card">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="section-eyebrow text-sienna">Learning</p>
          <h2 className="font-serif text-[22px] tracking-tightish mt-1">Free courses &amp; scholarships</h2>
          <p className="text-[12.5px] text-muted mt-0.5">Online and regional training for the sector</p>
        </div>
        <a href="https://reliefweb.int/training" target="_blank" rel="noopener noreferrer" className="shrink-0 text-[13px] font-medium text-sienna hover:underline">See all ↗</a>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((t) => (
          <a
            key={t.link}
            href={t.link}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[12px] border border-border bg-cream/30 p-4 hover:border-ink/30 hover:bg-cream/50 transition flex flex-col"
          >
            <div className="flex items-center gap-2">
              {t.online && <span className="text-[10px] font-semibold text-sienna bg-sienna/[0.08] border border-sienna/20 rounded-full px-2 py-0.5">ONLINE</span>}
              {t.free && <span className="text-[10px] font-semibold text-verified bg-verified/[0.12] rounded-full px-2 py-0.5">FREE</span>}
            </div>
            <h3 className="font-serif text-[15px] tracking-tightish mt-2 leading-snug line-clamp-2">{t.title}</h3>
            {t.org && <p className="text-[12px] text-ink-soft mt-1.5 truncate">{t.org}</p>}
            <p className="text-[11.5px] text-muted mt-auto pt-2">
              {[t.country, t.startDate && `Starts ${t.startDate}`].filter(Boolean).join(" · ")}
            </p>
          </a>
        ))}
      </div>

      <p className="mt-3 text-[11.5px] text-muted">Listed from ReliefWeb. Titles and short details only, with a link back to register.</p>
    </section>
  );
}
