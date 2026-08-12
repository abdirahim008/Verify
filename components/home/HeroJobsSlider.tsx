"use client";

import { useEffect, useState } from "react";

export interface SlideJob {
  title: string;
  org: string | null;
  location: string | null;
  link: string;
  deadline: string | null;
  /** Small chip shown on the slide, e.g. "Role" / "Tender". */
  tag?: string;
}

// Auto-rotating showcase of curated opportunities inside the /home hero.
// Crossfades every 5s, pauses on hover/focus, dots jump directly. Replaces
// the old single "featured opportunity" card so the same role isn't shown
// twice on the page.
export function HeroJobsSlider({ jobs, eyebrow }: { jobs: SlideJob[]; eyebrow: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = jobs.length;

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 5000);
    return () => clearInterval(t);
  }, [paused, n]);

  if (n === 0) return null;

  return (
    <div
      className="rounded-[14px] border border-border bg-paper px-5 py-4 sm:px-6 sm:py-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10.5px] uppercase tracking-[0.16em] text-sienna font-semibold">{eyebrow}</p>
        {n > 1 && (
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Curated opportunities">
            {jobs.map((_, d) => (
              <button
                key={d}
                type="button"
                role="tab"
                aria-selected={d === i}
                aria-label={`Opportunity ${d + 1} of ${n}`}
                onClick={() => setI(d)}
                className={`h-[7px] rounded-full transition-all ${d === i ? "w-5 bg-sienna" : "w-[7px] bg-border hover:bg-muted-soft"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stacked slides, opacity crossfade. The grid keeps the panel's height
          equal to the tallest slide so rotation never causes layout shift. */}
      <div className="relative mt-2 grid">
        {jobs.map((j, d) => (
          <div
            key={j.link}
            aria-hidden={d !== i}
            className={`col-start-1 row-start-1 transition-opacity duration-500 ${d === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <a
              href={j.link}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={d === i ? 0 : -1}
              className="font-serif text-[19px] sm:text-[21px] tracking-tightish leading-snug hover:underline line-clamp-2"
            >
              {j.title} ↗
            </a>
            <p className="mt-1 text-[12.5px] text-muted">
              {j.tag && (
                <span className={`inline-block align-[1px] mr-2 rounded-full border px-2 py-[1px] text-[10px] font-semibold uppercase tracking-[0.1em] ${
                  j.tag === "Tender" ? "border-sienna/40 text-sienna" : "border-border text-ink-soft"
                }`}>{j.tag}</span>
              )}
              {[j.org, j.location].filter(Boolean).join(" · ")}
              {j.deadline && <span className="text-sienna font-medium"> · closes {j.deadline}</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
