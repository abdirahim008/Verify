"use client";

import { cn } from "@/lib/cn";

interface Step { id: string; label: string; done: boolean }

// Banner at the top of the builder while the download is still locked. It
// turns eight stacked sections into the few steps that actually matter and
// jumps to the next one. Sits in the centre column, so on phones it's the
// first thing under the section tabs rather than below every section.
export function StarterSteps({
  heading, noun, steps,
}: { heading: string; noun: string; steps: Step[] }) {
  const next = steps.find((s) => !s.done);
  const doneCount = steps.filter((s) => s.done).length;

  function go(id: string) {
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="card border-sienna/30 bg-cream/40">
      <p className="section-eyebrow text-sienna">{doneCount} of {steps.length} done</p>
      <h2 className="font-serif text-[22px] tracking-tightish mt-1 leading-tight">{heading}</h2>
      <p className="mt-1.5 text-[13.5px] text-ink-soft leading-relaxed">
        Your {noun} unlocks after these {steps.length} steps. Most people finish in about 10 minutes.
      </p>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {steps.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => go(s.id)}
              className={cn(
                "w-full flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-[13.5px] transition min-h-[44px]",
                s.done
                  ? "border-border-soft bg-paper/60 text-muted"
                  : s.id === next?.id
                    ? "border-sienna bg-paper text-ink font-medium"
                    : "border-border bg-paper text-ink-soft hover:border-muted",
              )}
            >
              {s.done ? (
                <svg width="18" height="18" viewBox="0 0 22 22" className="shrink-0" aria-hidden>
                  <circle cx="11" cy="11" r="11" fill="#067a5e" />
                  <path d="M6 11.2 L9.4 14.6 L16 8" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span className="shrink-0 w-[18px] h-[18px] rounded-full border-[1.5px] border-muted/60 flex items-center justify-center text-[10px] font-semibold text-muted" aria-hidden>{i + 1}</span>
              )}
              <span className={cn("flex-1", s.done && "line-through")}>{s.label}</span>
              {s.id === next?.id && <span className="text-sienna text-[12.5px] font-semibold">Start →</span>}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
