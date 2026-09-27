"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { PREVIEW_MANIFEST } from "./previews.generated";

type Kind = keyof typeof PREVIEW_MANIFEST.pages;

// A real rendering of a template, filled with a demo profile. The images are
// printed through the same pipeline as downloads (scripts/render-
// thumbnails.mjs), so what you see is what the PDF looks like.
//
// The thumbnail is page 1; tapping it opens a viewer with every rendered
// page. Arrows, swipe or the keyboard move between pages. Tapping outside
// the page, the × or Escape closes it; tapping the page itself doesn't, so a
// mis-tap on a phone doesn't dismiss it.
export function TemplatePreview({
  kind, id, name, className,
}: {
  kind: Kind;
  id: string;
  name: string;
  /** Classes for the thumbnail <img> (size it here). */
  className?: string;
}) {
  const pages = (PREVIEW_MANIFEST.pages[kind] as Record<string, number>)[id] ?? 0;
  const v = PREVIEW_MANIFEST.version;
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(1);
  const close = useCallback(() => setOpen(false), []);
  const go = useCallback((d: number) => setN((p) => Math.min(pages, Math.max(1, p + d))), [pages]);
  const swipeX = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, close, go]);

  // Warm the neighbouring pages so paging feels instant.
  useEffect(() => {
    if (!open) return;
    for (const p of [n - 1, n + 1]) if (p >= 1 && p <= pages) new Image().src = pageSrc(kind, id, p, v);
  }, [open, n, pages, kind, id, v]);

  if (!pages) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => { setN(1); setOpen(true); }}
        aria-label={`View the ${name} template larger`}
        className="group relative block cursor-zoom-in rounded-[3px] focus:outline-none focus-visible:ring-2 focus-visible:ring-sienna focus-visible:ring-offset-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/templates/${kind}/${id}.webp?v=${v}`}
          alt={`${name} template, shown with a demo profile`}
          width={480}
          height={679}
          loading="lazy"
          decoding="async"
          className={cn("block h-auto bg-white rounded-[3px] shadow-[0_6px_18px_rgba(28,28,28,0.16)] transition group-hover:shadow-[0_10px_26px_rgba(28,28,28,0.22)]", className)}
        />
        <span aria-hidden className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white shadow-sm transition group-hover:bg-black/80">
          <ZoomIcon />
        </span>
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name} template preview`}
          onClick={close}
          className="fixed inset-0 z-[100] flex flex-col bg-black/90 cursor-zoom-out"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-14 shrink-0 text-white" onClick={(e) => e.stopPropagation()}>
            <p className="min-w-0 truncate text-[14px] font-medium cursor-default">
              {name}
              {pages > 1 && <span className="hidden sm:inline ml-2 text-white/60 font-normal">Page {n} of {pages}</span>}
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-[26px] leading-none hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              ×
            </button>
          </div>

          <div className="relative flex-1 min-h-0 flex items-center justify-center px-3 sm:px-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={n}
              src={pageSrc(kind, id, n, v)}
              alt={`${name}, page ${n}`}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => { swipeX.current = e.clientX; }}
              onPointerUp={(e) => {
                if (swipeX.current === null) return;
                const dx = e.clientX - swipeX.current;
                swipeX.current = null;
                if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              }}
              draggable={false}
              className="max-h-full max-w-full object-contain bg-white rounded-[3px] shadow-2xl select-none cursor-default touch-pan-y"
            />
            {pages > 1 && (
              <>
                <PageArrow dir={-1} disabled={n === 1} onClick={() => go(-1)} />
                <PageArrow dir={1} disabled={n === pages} onClick={() => go(1)} />
              </>
            )}
          </div>

          <div className="shrink-0 px-4 pt-2 pb-3 cursor-default" onClick={(e) => e.stopPropagation()}>
            {/* Phones: page controls under the page, where the thumb reaches
                and they don't sit on top of it. Tablet up uses side arrows. */}
            {pages > 1 && (
              <div className="sm:hidden flex items-center justify-center gap-4 mb-2 text-white">
                <PageButton dir={-1} disabled={n === 1} onClick={() => go(-1)} />
                <span className="text-[13px] tabular-nums text-white/80 min-w-[88px] text-center">Page {n} of {pages}</span>
                <PageButton dir={1} disabled={n === pages} onClick={() => go(1)} />
              </div>
            )}
            <p className="text-center text-[12.5px] text-white/60">
              Shown with a demo profile. Your download uses your own details.
            </p>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

function pageSrc(kind: string, id: string, n: number, v: string) {
  return `/templates/${kind}/${id}-${n}.webp?v=${v}`;
}

// Side arrows, tablet and up.
function PageArrow({ dir, disabled, onClick }: { dir: 1 | -1; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={disabled}
      aria-label={dir < 0 ? "Previous page" : "Next page"}
      className={cn(
        "hidden sm:flex absolute top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-0 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
        dir < 0 ? "left-4" : "right-4",
      )}
    >
      <Chevron dir={dir} />
    </button>
  );
}

// Bottom-bar page buttons, phones.
function PageButton({ dir, disabled, onClick }: { dir: 1 | -1; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir < 0 ? "Previous page" : "Next page"}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition active:bg-white/30 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <Chevron dir={dir} />
    </button>
  );
}

function Chevron({ dir }: { dir: 1 | -1 }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
    </svg>
  );
}
