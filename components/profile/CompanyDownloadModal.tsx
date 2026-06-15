"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { COMPANY_TEMPLATES } from "@/components/templates/CompanyThumbnails";

// Template chooser shown when the user clicks "Download company profile"
// from the profile rail. Shows a thumbnail of each template; clicking
// Download grabs that one — honouring any colour theme the user already
// picked on the /templates page (stored per-template in localStorage). For
// full control (themes + live preview) it links through to /templates.
export function CompanyDownloadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [themes, setThemes] = useState<Record<string, string>>({});

  // Read the saved per-template theme ids after mount.
  useEffect(() => {
    if (!open) return;
    const next: Record<string, string> = {};
    for (const t of COMPANY_TEMPLATES) {
      try {
        const v = localStorage.getItem(`sahan-theme:company:${t.id}`);
        if (v) next[t.id] = v;
      } catch { /* private mode */ }
    }
    setThemes(next);
  }, [open]);

  if (!open) return null;

  function hrefFor(id: string) {
    const theme = themes[id];
    return `/api/company/${id}${theme ? `?theme=${encodeURIComponent(theme)}` : ""}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal aria-label="Choose a company profile template">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
      <div className="relative w-full sm:max-w-2xl bg-paper rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92dvh] overflow-y-auto">
        <header className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-border-soft">
          <div>
            <p className="section-eyebrow text-sienna">Download your profile</p>
            <h2 className="font-serif text-[22px] tracking-tightish mt-1">Pick a template</h2>
            <p className="text-[12.5px] text-muted mt-1">Same details, three registers. Choose one — switch any time.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full hover:bg-border-soft text-muted text-[18px] leading-none shrink-0">×</button>
        </header>

        <div className="px-6 py-5 grid gap-4 sm:grid-cols-3">
          {COMPANY_TEMPLATES.map(({ id, name, tagline, Thumb }) => (
            <div key={id} className="rounded-[12px] border border-border bg-cream/40 overflow-hidden flex flex-col">
              <div className="h-40 flex items-center justify-center bg-[#ece8df]">
                <div className="scale-90"><Thumb /></div>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-serif text-[16px] tracking-tightish">{name}</h3>
                <p className="text-[11.5px] text-muted mt-0.5">{tagline}</p>
                <a href={hrefFor(id)} download className="mt-3">
                  <Button kind="primary" size="sm" className="w-full">Download</Button>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 -mt-1">
          <Link href="/templates" className="text-[13px] text-sienna font-medium hover:underline">
            Customise colours &amp; preview on screen →
          </Link>
        </div>
      </div>
    </div>
  );
}
