import type { TrainingItem } from "@/lib/feeds/training";

// Free courses & scholarships from ReliefWeb. Rendered as a warm, tinted
// accent band (not a plain white card) so it breaks the run of white sections
// on /home and gives the page a change of texture. Open-source / free learning
// is a deliberate value signal — hence the "Free & open" framing.
export function TrainingCard({ items }: { items: TrainingItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="rounded-2xl border border-sienna/15 bg-gradient-to-br from-sienna-soft/50 via-cream to-cream p-6 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="section-eyebrow text-sienna">Learning · free &amp; open</p>
          <h2 className="font-serif text-[24px] tracking-tightish mt-1">Free courses &amp; scholarships</h2>
          <p className="text-[12.5px] text-ink-soft mt-0.5">Open-source and regional training for the sector — always free to join.</p>
        </div>
        <a href="https://reliefweb.int/training" target="_blank" rel="noopener noreferrer" className="shrink-0 text-[13px] font-medium text-sienna hover:underline">See all ↗</a>
      </div>

      <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
        {items.map((t) => (
          <a
            key={t.link}
            href={t.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-[14px] border border-border bg-paper p-4 shadow-[0_2px_10px_-6px_rgba(28,28,28,0.25)] hover:shadow-[0_10px_24px_-14px_rgba(28,28,28,0.4)] hover:-translate-y-0.5 transition-all flex flex-col"
          >
            <div className="flex items-center gap-2">
              {t.online && <span className="text-[10px] font-semibold text-sienna bg-sienna/[0.08] border border-sienna/20 rounded-full px-2 py-0.5">ONLINE</span>}
              {t.free && <span className="text-[10px] font-semibold text-verified bg-verified/[0.12] rounded-full px-2 py-0.5">FREE</span>}
            </div>
            <h3 className="font-serif text-[15.5px] tracking-tightish mt-2 leading-snug line-clamp-2 group-hover:text-sienna transition-colors">{t.title}</h3>
            {t.org && <p className="text-[12px] text-ink-soft mt-1.5 truncate">{t.org}</p>}
            <p className="text-[11.5px] text-muted mt-auto pt-3">
              {[t.country, t.startDate && `Starts ${t.startDate}`].filter(Boolean).join(" · ")}
            </p>
          </a>
        ))}
      </div>

      <p className="mt-4 text-[11.5px] text-muted">Listed from ReliefWeb. Titles and short details only, with a link back to register.</p>
    </section>
  );
}
