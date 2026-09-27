"use client";

import { CV_TEMPLATES } from "@/components/templates/catalog";
import { TemplatePreview } from "@/components/templates/TemplatePreview";
import { TemplateActions } from "@/components/templates/TemplateActions";
import { CV_THEMES } from "@/lib/pdf/themes";

// Template chooser shown when the user clicks "Download CV" from the
// profile rail. Each card shows a thumbnail, a curated colour-theme
// picker, a live on-screen PDF preview, and the themed download — the
// full set of controls that used to live on the standalone /templates
// page, now folded in here so download is a single, self-contained step.
export function CvDownloadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal aria-label="Choose a CV template">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
      <div className="relative w-full sm:max-w-3xl bg-paper rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92dvh] overflow-y-auto">
        <header className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-border-soft sticky top-0 bg-paper z-10">
          <div>
            <p className="section-eyebrow text-sienna">Download your CV</p>
            <h2 className="font-serif text-[22px] tracking-tightish mt-1">Pick a template</h2>
            <p className="text-[12.5px] text-muted mt-1">Eight templates, one set of details. Tap a page to see it larger, pick a colour, then download.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full hover:bg-border-soft text-muted text-[18px] leading-none shrink-0">×</button>
        </header>

        <div className="px-4 sm:px-6 py-5 grid gap-4 sm:gap-5 sm:grid-cols-3">
          {CV_TEMPLATES.map(({ id, name, tagline }) => (
            // Phones: preview left, details right. Tablet up: preview on top.
            <div key={id} className="rounded-[12px] border border-border bg-cream/40 overflow-hidden flex sm:flex-col">
              <div className="shrink-0 w-[112px] sm:w-auto flex items-start sm:items-center justify-center bg-[#ece8df] p-3 sm:py-5">
                <TemplatePreview kind="cv" id={id} name={name} className="w-full sm:w-[150px]" />
              </div>
              <div className="p-3 flex-1 min-w-0 flex flex-col">
                <h3 className="font-serif text-[16px] tracking-tightish">{name}</h3>
                <p className="text-[11.5px] text-muted mt-0.5">{tagline}</p>
                <div className="mt-3">
                  <TemplateActions href={`/api/cv/${id}`} storageKey={`cv:${id}`} templateName={name} themes={CV_THEMES[id]} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
