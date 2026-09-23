"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Gallery thumbnail that opens a full-size lightbox. Tap/click the image (or
// the zoom badge) to open; click the backdrop, the × button, or press Escape
// to close. Clicking the enlarged image itself does NOT close it, so a mis-
// tap on a phone doesn't dismiss what the user just opened.
//
// The badge is always visible rather than hover-only — most of the audience
// is on phones, where hover doesn't exist. Portalled to <body> so it escapes
// any parent transform/overflow (the public page's sticky nav creates one).
export function ZoomableImage({ src, alt, caption, className, style }: {
  src: string;
  alt: string;
  caption?: string | null;
  /** Classes for the inline thumbnail <img>. */
  className?: string;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    // Lock page scroll behind the lightbox (restore whatever it was before).
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Zoom: ${alt}`}
        className="group relative block w-full text-left cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-sienna"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={className} style={style} loading="lazy" />
        <span
          aria-hidden
          className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white shadow-sm backdrop-blur-[2px] transition group-hover:bg-black/75"
        >
          <ZoomIcon />
        </span>
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={close}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 sm:p-8 cursor-zoom-out"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 sm:right-5 sm:top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white text-[26px] leading-none hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            ×
          </button>
          <figure
            onClick={(e) => e.stopPropagation()}
            className="m-0 flex max-h-full max-w-full flex-col items-center cursor-default"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-[82vh] max-w-[95vw] sm:max-w-[90vw] object-contain rounded-md shadow-2xl select-none"
              draggable={false}
            />
            {caption && (
              <figcaption className="mt-3 max-w-[90vw] text-center text-[13px] leading-snug text-white/80">{caption}</figcaption>
            )}
          </figure>
        </div>,
        document.body,
      )}
    </>
  );
}

function ZoomIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
    </svg>
  );
}
