"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/cn";
import type { PdfTheme } from "@/lib/pdf/themes";

interface Props {
  /** API path without query, e.g. /api/cv/editorial */
  href: string;
  /** Storage key namespace, e.g. cv:editorial */
  storageKey: string;
  templateName: string;
  themes: PdfTheme[];
}

// Per-template action block on /templates: curated-palette swatches, a
// real PDF preview (the actual route rendered inline in an iframe), and
// the themed download link. The chosen palette is remembered per template
// in localStorage — no schema, survives reloads on this device.
export function TemplateActions({ href, storageKey, templateName, themes }: Props) {
  const lsKey = `sahan-theme:${storageKey}`;
  const [themeId, setThemeId] = useState(themes[0]?.id ?? "");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);

  // Restore the saved palette after mount (not in the initializer — the
  // server render must match the first client render or React complains).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(lsKey);
      if (saved && themes.some((t) => t.id === saved)) setThemeId(saved);
    } catch { /* private mode etc. — default stands */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pick(id: string) {
    setThemeId(id);
    try { localStorage.setItem(lsKey, id); } catch { /* ignore */ }
  }

  const active = themes.find((t) => t.id === themeId) ?? themes[0];
  const qs = `?theme=${encodeURIComponent(themeId)}`;

  return (
    <div>
      {themes.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1.5" role="radiogroup" aria-label={`${templateName} colour theme`}>
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={t.id === themeId}
                title={t.label}
                onClick={() => pick(t.id)}
                className={cn(
                  "w-7 h-7 rounded-full border-2 transition shrink-0",
                  t.id === themeId ? "border-ink scale-110" : "border-border hover:border-muted",
                )}
                style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)` }}
              />
            ))}
          </div>
          <span className="text-[11.5px] text-muted">{active?.label}</span>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Button kind="secondary" size="md" className="flex-1" onClick={() => { setPreviewLoading(true); setPreviewOpen(true); }}>
          Preview
        </Button>
        <a href={`${href}${qs}`} download className="flex-1">
          <Button kind="primary" size="md" className="w-full">Download</Button>
        </a>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-8" role="dialog" aria-modal aria-label={`${templateName} preview`}>
          <button aria-label="Close preview" onClick={() => setPreviewOpen(false)} className="absolute inset-0 bg-ink/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-3xl h-[85dvh] bg-paper rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <header className="flex items-center justify-between gap-3 px-4 sm:px-5 h-12 border-b border-border shrink-0">
              <p className="text-[13px] font-medium truncate">
                {templateName} <span className="text-muted">· {active?.label}</span>
              </p>
              <div className="flex items-center gap-2">
                <a href={`${href}${qs}`} download>
                  <Button kind="sienna" size="sm">Download</Button>
                </a>
                <button onClick={() => setPreviewOpen(false)} aria-label="Close" className="w-8 h-8 rounded-full hover:bg-border-soft text-muted text-[18px] leading-none">×</button>
              </div>
            </header>
            <div className="relative flex-1 bg-cream">
              {previewLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted">
                  <span className="w-8 h-8 rounded-full border-2 border-border border-t-sienna animate-spin" aria-hidden />
                  <span className="text-[13px]">Rendering your PDF…</span>
                </div>
              )}
              {/* The REAL route, rendered inline — what you see is exactly
                  the file you download. Keyed by theme so re-picking a
                  swatch mid-preview re-renders. */}
              <iframe
                key={themeId}
                src={`${href}${qs}&preview=1`}
                title={`${templateName} preview`}
                className="w-full h-full"
                onLoad={() => setPreviewLoading(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
