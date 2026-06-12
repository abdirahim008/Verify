"use client";

import { useEffect, useRef, useState } from "react";

// Renders a PDF as a stack of page images, client-side, via PDF.js.
//
// Why not an <iframe>: iOS Safari and several Android browsers refuse to
// display PDFs inline — they show a blank frame or force a download. Most
// of our users are on phones, so the preview fetches the exact PDF bytes
// and rasterises each page to a JPEG in the browser instead. Images work
// everywhere, scroll naturally, and pinch-zoom for free.
//
// We load the LEGACY pdf.js build — the modern one needs
// Promise.withResolvers (Safari ≥17.4), which is too new for a chunk of
// the Android/iOS fleet in our market. Loaded lazily so the ~350KB only
// ships when someone actually opens a preview.

type State = "loading" | "ready" | "error";

export function PdfPreview({ src }: { src: string }) {
  const [state, setState] = useState<State>("loading");
  const [pages, setPages] = useState<string[]>([]);
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setState("loading");
      setPages([]);
      try {
        // Same-origin fetch carries the auth cookies automatically.
        const res = await fetch(src);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.arrayBuffer();
        if (cancelled) return;

        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        // Worker is served from /public (copied by scripts/copy-pdf-worker
        // on postinstall) — bundling it via new URL() breaks Next's Terser
        // pass on the .mjs.
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const doc = await pdfjs.getDocument({ data }).promise;
        if (cancelled) return;

        // Render at the holder's CSS width × devicePixelRatio (capped at 2
        // so a 3-page A4 doesn't allocate tens of MB of canvas on a phone).
        const holderW = holderRef.current?.clientWidth ?? 720;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const out: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const base = page.getViewport({ scale: 1 });
          const scale = (Math.min(holderW, 840) / base.width) * dpr;
          const vp = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(vp.width);
          canvas.height = Math.floor(vp.height);
          // pdfjs v6 takes the canvas itself (it grabs the 2d context).
          await page.render({ canvas, viewport: vp }).promise;
          out.push(canvas.toDataURL("image/jpeg", 0.92));
          // Free the canvas between pages.
          canvas.width = 0; canvas.height = 0;
          if (cancelled) return;
        }
        if (!cancelled) { setPages(out); setState("ready"); }
      } catch (e) {
        console.error("[pdf-preview]", e);
        if (!cancelled) setState("error");
      }
    })();
    return () => { cancelled = true; };
  }, [src]);

  return (
    <div ref={holderRef} className="h-full overflow-y-auto overscroll-contain bg-[#e6e3dc] px-2 sm:px-6 py-4">
      {state === "loading" && (
        <div className="h-full flex flex-col items-center justify-center gap-3 text-muted">
          <span className="w-8 h-8 rounded-full border-2 border-border border-t-sienna animate-spin" aria-hidden />
          <span className="text-[13px]">Rendering your PDF…</span>
        </div>
      )}

      {state === "error" && (
        <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
          <p className="text-[14px] text-ink-soft">Couldn&apos;t render the preview on this device.</p>
          <a href={src.replace(/([?&])preview=1&?/, "$1").replace(/[?&]$/, "")} download className="text-sienna font-medium text-[13.5px] hover:underline">
            Download the PDF instead →
          </a>
        </div>
      )}

      {state === "ready" && (
        <div className="mx-auto max-w-[840px] space-y-4 pb-4">
          {pages.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={p}
              alt={`Page ${i + 1}`}
              className="w-full h-auto rounded-[3px] shadow-[0_2px_12px_rgba(0,0,0,0.18)] bg-white"
            />
          ))}
        </div>
      )}
    </div>
  );
}
