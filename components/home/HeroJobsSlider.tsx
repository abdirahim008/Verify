"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface SlideJob {
  title: string;
  org: string | null;
  location: string | null;
  link: string;
  deadline: string | null;
  /** Small chip shown on the card, e.g. "Role" / "Tender". */
  tag?: string;
}

// Curated-opportunity carousel — the /home masthead. Shows as many cards as
// the viewport fits (1 phone / 2 tablet / 3 desktop) rather than one slide
// across the full width, and pages through them every 6s.
//
// Built on a native scroll-snap track rather than a transform: it gives
// touch-swipe for free on phones (most of the audience), degrades to a plain
// scrollable row without JS, and keeps keyboard focus working.

// Above this many pages the dot row stops being scannable and we show a
// "3 / 12" counter instead.
const MAX_DOTS = 6;
export function HeroJobsSlider({ jobs, eyebrow }: { jobs: SlideJob[]; eyebrow: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [paused, setPaused] = useState(false);
  const n = jobs.length;

  // A page is `perView` cards wide. Measured from the DOM so the same code
  // works at every breakpoint without duplicating the CSS widths in JS.
  const geometry = useCallback(() => {
    const el = trackRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return null;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
    const step = first.offsetWidth + gap;
    if (!step) return null;
    const perView = Math.max(1, Math.round(el.clientWidth / step));
    return { el, pageWidth: step * perView, perView };
  }, []);

  const measure = useCallback(() => {
    const g = geometry();
    if (!g) return;
    setPages(Math.max(1, Math.ceil(n / g.perView)));
    setPage(Math.round(g.el.scrollLeft / g.pageWidth));
  }, [geometry, n]);

  useEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    if (paused || pages < 2) return;
    const t = setInterval(() => {
      const g = geometry();
      if (!g) return;
      // Wrap once the track is scrolled to its end.
      const atEnd = g.el.scrollLeft + g.el.clientWidth >= g.el.scrollWidth - 8;
      g.el.scrollTo({ left: atEnd ? 0 : g.el.scrollLeft + g.pageWidth, behavior: "smooth" });
    }, 6000);
    return () => clearInterval(t);
  }, [paused, pages, geometry]);

  function goto(p: number) {
    const g = geometry();
    if (!g) return;
    g.el.scrollTo({ left: p * g.pageWidth, behavior: "smooth" });
  }

  if (n === 0) return null;

  return (
    <section
      aria-label="Curated opportunities"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="section-eyebrow text-sienna">{eyebrow}</p>
        {pages > 1 && (
          <div className="flex items-center gap-2.5">
            {/* Dots only while they stay countable — a phone showing one card
                at a time would otherwise render a dot per job. Past that, a
                plain counter reads better and takes no room. */}
            {pages <= MAX_DOTS ? (
              <div className="flex items-center gap-1.5">
                {Array.from({ length: pages }).map((_, d) => (
                  <button
                    key={d}
                    type="button"
                    aria-label={`Page ${d + 1} of ${pages}`}
                    aria-current={d === page}
                    onClick={() => goto(d)}
                    className={`h-[7px] rounded-full transition-all ${d === page ? "w-5 bg-sienna" : "w-[7px] bg-border hover:bg-muted-soft"}`}
                  />
                ))}
              </div>
            ) : (
              <span className="text-[12px] tabular-nums text-muted" aria-live="polite">
                {Math.min(page + 1, pages)} / {pages}
              </span>
            )}
            <div className="flex items-center gap-1">
              <Arrow dir="prev" onClick={() => goto(Math.max(0, page - 1))} disabled={page === 0} />
              <Arrow dir="next" onClick={() => goto(Math.min(pages - 1, page + 1))} disabled={page >= pages - 1} />
            </div>
          </div>
        )}
      </div>

      <div
        ref={trackRef}
        onScroll={measure}
        className="mt-3 flex gap-3.5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1"
      >
        {jobs.map((j) => (
          <a
            key={j.link}
            href={j.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group snap-start shrink-0 w-full sm:w-[calc((100%-14px)/2)] lg:w-[calc((100%-28px)/3)]
              rounded-[14px] border border-border bg-paper p-5 flex flex-col transition
              hover:border-muted/60 hover:shadow-card hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between gap-2">
              {j.tag && (
                <span className={`rounded-full border px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.1em] ${
                  j.tag === "Tender" ? "border-sienna/40 text-sienna" : "border-border text-ink-soft"
                }`}>{j.tag}</span>
              )}
              {j.deadline && (
                <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-sienna whitespace-nowrap">
                  <CalendarIcon />closes {j.deadline}
                </span>
              )}
            </div>

            <h3 className="mt-2.5 font-serif text-[17px] tracking-tightish leading-snug text-ink group-hover:text-sienna transition-colors line-clamp-2">
              {j.title}
            </h3>

            {j.org && (
              <p className="mt-1.5 inline-flex items-start gap-1.5 text-[13px] font-medium text-ink-soft leading-snug">
                <OrgIcon />
                <span className="line-clamp-1">{j.org}</span>
              </p>
            )}

            {j.location && (
              <p className="mt-auto pt-2.5 inline-flex items-center gap-1.5 text-[12px] text-muted">
                <PinIcon />
                <span className="line-clamp-1">{j.location}</span>
              </p>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}

function Arrow({ dir, onClick, disabled }: { dir: "prev" | "next"; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous" : "Next"}
      className="w-7 h-7 rounded-full border border-border text-muted flex items-center justify-center transition hover:border-muted hover:text-ink disabled:opacity-35 disabled:hover:border-border disabled:hover:text-muted"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d={dir === "prev" ? "M15 5 L8 12 L15 19" : "M9 5 L16 12 L9 19"} />
      </svg>
    </button>
  );
}

function OrgIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="shrink-0 mt-[2px] text-muted" aria-hidden>
      <path d="M4 21V7l7-3v17M11 21h9V11l-9-3M7.5 10h0M7.5 14h0M15 14h0M15 17h0" strokeLinecap="round" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0" aria-hidden>
      <path d="M12 21s7-5.7 7-11a7 7 0 10-14 0c0 5.3 7 11 7 11z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0" aria-hidden>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}
