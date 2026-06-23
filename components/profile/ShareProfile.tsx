"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

// "Share" affordance for the profile builder. Shows a QR code (and a copy /
// download / open set) for the user's PUBLIC profile (/u/[id]) — which is
// reachable by anyone, logged in or not, with per-section visibility applied.
// The absolute URL is resolved on the client from window.location so it works
// across localhost / preview / production without hard-coding a domain.
export function ShareProfile({ publicHref, businessCard }: { publicHref: string; businessCard?: boolean }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") setUrl(new URL(publicHref, window.location.origin).toString());
  }, [publicHref]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked — the field is selectable as a fallback */ }
  }

  function downloadPng() {
    const canvas = wrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "sahan-profile-qr.png";
    a.click();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[12px] text-sienna font-medium hover:underline"
      >
        <QrGlyph /> Share
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal aria-label="Share your profile">
          <button aria-label="Close" onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
          <div className="relative w-full sm:max-w-md bg-paper rounded-t-2xl sm:rounded-2xl shadow-xl p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="section-eyebrow text-sienna">Share your profile</p>
                <h2 className="font-serif text-[22px] tracking-tightish mt-1">Your public QR</h2>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="w-8 h-8 rounded-full hover:bg-border-soft text-muted text-[18px] leading-none shrink-0">×</button>
            </div>

            <p className="mt-2 text-[12.5px] text-ink-soft leading-relaxed">
              Anyone who scans this sees your public profile on their phone or tablet. You control which sections are visible from your profile settings.
            </p>

            <div ref={wrapRef} className="mt-5 flex justify-center">
              <div className="rounded-2xl border border-border bg-white p-4">
                {url
                  ? <QRCodeCanvas value={url} size={200} level="M" marginSize={1} fgColor="#16130f" />
                  : <div className="w-[200px] h-[200px]" aria-hidden />}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="field flex-1 text-[12.5px]" aria-label="Public profile link" />
              <button type="button" onClick={copy} className="shrink-0 rounded-lg bg-ink text-paper text-[13px] font-semibold px-3.5 py-2 hover:bg-ink/90 transition">
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={downloadPng} className="rounded-lg border border-border text-[13px] font-medium px-3.5 py-2 hover:bg-cream/60 transition">Download QR</button>
              <a href={url || publicHref} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border text-[13px] font-medium px-3.5 py-2 hover:bg-cream/60 transition">Open profile ↗</a>
            </div>

            {businessCard && (
              <div className="mt-5 pt-4 border-t border-border-soft">
                <p className="section-eyebrow text-sienna">Business card</p>
                <p className="mt-1 text-[12.5px] text-ink-soft leading-relaxed">A printable card with your name, contact details and this QR — ready to share or send to a printer.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href="/api/card?format=png" download className="rounded-lg bg-ink text-paper text-[13px] font-semibold px-3.5 py-2 hover:bg-ink/90 transition">Download PNG</a>
                  <a href="/api/card?format=pdf" download className="rounded-lg border border-border text-[13px] font-medium px-3.5 py-2 hover:bg-cream/60 transition">PDF for print</a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function QrGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="10" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="10" width="2" height="2" fill="currentColor" />
      <rect x="14" y="10" width="1.6" height="2" fill="currentColor" />
      <rect x="10" y="14" width="5.6" height="1.6" fill="currentColor" />
    </svg>
  );
}
