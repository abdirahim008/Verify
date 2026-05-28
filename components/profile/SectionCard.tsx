"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

interface Props {
  title: string;
  eyebrow?: string;
  description?: string;
  count?: number;
  required?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

// Collapsible section card. Used as the shell for every profile section so
// they all look and behave the same. Mobile-friendly — long sections fold
// away below the fold and only open when tapped.
export function SectionCard({
  title, eyebrow, description, count, required, defaultOpen = false, children, actions,
}: Props) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId();
  return (
    <section className="card p-0 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className={cn(
          "w-full text-left px-5 sm:px-7 py-5 flex items-start gap-4 transition",
          "hover:bg-cream/40",
        )}
      >
        <div className="flex-1 min-w-0">
          {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
          <h2 className="font-serif text-[22px] sm:text-[24px] tracking-tightish mt-1 flex items-center gap-2">
            {title}
            {required && <span aria-label="Required for download" className="inline-block w-1.5 h-1.5 rounded-full bg-sienna" />}
          </h2>
          {description && <p className="mt-1 text-[13.5px] text-muted max-w-2xl">{description}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0 pt-1">
          {typeof count === "number" && (
            <span className="text-[12px] text-muted tabular-nums">{count}</span>
          )}
          <svg
            width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round"
            className={cn("text-muted transition-transform", open && "rotate-180")}
          >
            <path d="M4 7l5 5 5-5" />
          </svg>
        </div>
      </button>

      {open && (
        <div id={id} className="px-5 sm:px-7 pb-6 pt-1 border-t border-border-soft">
          {children}
          {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
    </section>
  );
}

// Inline field group — same as Tailwind's `label` + `field` but encapsulated
// so we can swap visuals in one place if the design changes.
export function Field({
  label, error, children, hint,
}: { label: string; error?: string | null; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && !error && <p className="helper">{hint}</p>}
      {error && <p className="helper text-red-600">{error}</p>}
    </label>
  );
}

// Dashed-bordered "new item" container — used by every list section when
// the user clicks Add.
export function NewItemPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-[10px] border border-dashed border-border bg-cream/60 p-5">
      <p className="section-eyebrow text-sienna">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
