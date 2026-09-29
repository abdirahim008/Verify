"use client";

import { CV_TEMPLATES } from "@/components/templates/catalog";
import { TemplateGrid } from "@/components/templates/TemplateGrid";
import { TemplateActions } from "@/components/templates/TemplateActions";
import { CV_THEMES } from "@/lib/pdf/themes";

// Template chooser shown when the user clicks "Download CV" from the
// profile rail. Each card shows a thumbnail, a curated colour-theme
// picker, a live on-screen PDF preview, and the themed download — the
// full set of controls that used to live on the standalone /templates
// page, now folded in here so download is a single, self-contained step.
// Starred templates become the default view (TemplateGrid).
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
            <p className="text-[12.5px] text-muted mt-1">{CV_TEMPLATES.length} templates, one set of details. Tap a page to see it larger, pick a colour, then download.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full hover:bg-border-soft text-muted text-[18px] leading-none shrink-0">×</button>
        </header>

        <TemplateGrid
          kind="cv"
          templates={CV_TEMPLATES}
          renderActions={({ id, name }) => (
            <TemplateActions href={`/api/cv/${id}`} storageKey={`cv:${id}`} templateName={name} themes={CV_THEMES[id]} />
          )}
        />
      </div>
    </div>
  );
}
