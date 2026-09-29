"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { TemplateMeta } from "./catalog";
import { TemplatePreview } from "./TemplatePreview";
import { useFavouriteTemplates, type TemplateKind } from "./favourites";

// The card grid inside the download choosers (CV and company). Each card
// has a star to mark the template as a favourite. Once a member has
// favourites, the chooser opens on just those — with one tap back to the
// full set — so they aren't scrolling past every template on each download.
export function TemplateGrid({ kind, templates, renderActions }: {
  kind: TemplateKind;
  templates: TemplateMeta[];
  renderActions: (t: TemplateMeta) => ReactNode;
}) {
  const { favs, isFav, toggle } = useFavouriteTemplates(kind, templates.map((t) => t.id));
  // The view is chosen when the chooser opens — favourites if there are
  // any — not live: starring templates while browsing the full set must not
  // make the rest vanish mid-choice. Un-starring the last favourite in the
  // favourites view falls back to the full list on its own.
  const [showAll, setShowAll] = useState(() => favs.length === 0);
  const favView = favs.length > 0 && !showAll;
  const shown = favView ? templates.filter((t) => isFav(t.id)) : templates;

  return (
    <div className="px-4 sm:px-6 py-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[12.5px]">
        {favs.length === 0 ? (
          <p className="text-muted">
            <StarIcon filled={false} className="inline w-3.5 h-3.5 -mt-0.5 mr-1" />
            Tip: star the templates you like — next time you&rsquo;ll see just those.
          </p>
        ) : favView ? (
          <>
            <p className="text-ink-soft font-medium">
              <StarIcon filled className="inline w-3.5 h-3.5 -mt-0.5 mr-1 text-sienna" />
              Your favourites ({favs.length})
            </p>
            <button type="button" onClick={() => setShowAll(true)} className="text-sienna font-medium hover:underline">
              Show all {templates.length} templates
            </button>
          </>
        ) : (
          <>
            <p className="text-ink-soft font-medium">All {templates.length} templates</p>
            <button type="button" onClick={() => setShowAll(false)} className="text-sienna font-medium hover:underline">
              Show only favourites ({favs.length})
            </button>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:gap-5 sm:grid-cols-3">
        {shown.map((t) => {
          const fav = isFav(t.id);
          return (
            // Phones: preview left, details right. Tablet up: preview on top.
            <div key={t.id} className={cn(
              "relative rounded-[12px] border bg-cream/40 overflow-hidden flex sm:flex-col",
              fav ? "border-sienna/60" : "border-border",
            )}>
              <button
                type="button"
                onClick={() => toggle(t.id)}
                aria-pressed={fav}
                aria-label={fav ? `Remove ${t.name} from favourites` : `Add ${t.name} to favourites`}
                title={fav ? "Remove from favourites" : "Add to favourites"}
                className={cn(
                  "absolute top-2 right-2 z-[1] w-9 h-9 rounded-full flex items-center justify-center transition shadow-sm",
                  fav ? "bg-sienna text-white hover:bg-ochre" : "bg-paper/90 text-muted hover:text-sienna border border-border",
                )}
              >
                <StarIcon filled={fav} className="w-[18px] h-[18px]" />
              </button>
              <div className="shrink-0 w-[112px] sm:w-auto flex items-start sm:items-center justify-center bg-[#ece8df] p-3 sm:py-5">
                <TemplatePreview kind={kind} id={t.id} name={t.name} className="w-full sm:w-[150px]" />
              </div>
              <div className="p-3 flex-1 min-w-0 flex flex-col">
                {/* Right padding keeps a long name clear of the star on phones. */}
                <h3 className="font-serif text-[16px] tracking-tightish pr-10 sm:pr-0">{t.name}</h3>
                <p className="text-[11.5px] text-muted mt-0.5">{t.tagline}</p>
                <div className="mt-3">{renderActions(t)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={className}>
      <path
        d="M10 2.2l2.35 4.77 5.27.77-3.81 3.71.9 5.24L10 14.22l-4.71 2.47.9-5.24L2.38 7.74l5.27-.77L10 2.2z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
