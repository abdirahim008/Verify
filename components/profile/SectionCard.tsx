"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { useWorkspaceMode } from "./SectionChrome";

interface Props {
  title: string;
  /** "Section 2" — the number is parsed from here for the header label. */
  eyebrow?: string;
  /** e.g. "role" → header reads "SECTION 02 — 3 ROLES". Falls back to a
   *  generic count when omitted. */
  metaNoun?: string;
  description?: string;
  count?: number;
  required?: boolean;
  defaultOpen?: boolean;
  /** Primary action shown in the header (e.g. a "+ Add role" button). */
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

// Collapsible section card. New header: a small all-caps "SECTION 0X — …"
// kicker over a serif title, an optional action on the right, and a
// chevron toggle. The header is NOT one big button (so the action stays
// independently clickable) — the title area and chevron both toggle.
export function SectionCard({
  title, eyebrow, metaNoun, description, count, required,
  defaultOpen = false, headerAction, children, actions,
}: Props) {
  const workspace = useWorkspaceMode();
  const [stateOpen, setOpen] = React.useState(defaultOpen);
  // In the sidebar workspace one section shows at a time, so it's always
  // expanded and the collapse chevron is hidden.
  const open = workspace ? true : stateOpen;
  const id = React.useId();
  const num = parseSectionNo(eyebrow);
  const meta = buildMeta(num, count, metaNoun);

  return (
    <section className="card p-0 overflow-hidden">
      <div className={cn("flex items-center gap-3 px-5 sm:px-7 py-4", open && "border-b border-border-soft")}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={id}
          disabled={workspace}
          className={cn("flex-1 min-w-0 text-left", workspace && "cursor-default")}
        >
          <p className="text-[10.5px] uppercase tracking-[0.16em] text-muted font-semibold">{meta}</p>
          <h2 className="font-serif text-[21px] sm:text-[24px] tracking-tightish mt-0.5 flex items-center gap-2">
            {title}
            {required && <span aria-label="Required for download" className="inline-block w-1.5 h-1.5 rounded-full bg-sienna" />}
          </h2>
        </button>

        {headerAction && <div className="shrink-0">{headerAction}</div>}

        {!workspace && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={id}
            aria-label={open ? "Collapse section" : "Expand section"}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-muted hover:bg-cream transition"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
              className={cn("transition-transform", open && "rotate-180")}>
              <path d="M4 7l5 5 5-5" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div id={id} className="px-5 sm:px-7 pb-6 pt-5">
          {description && <p className="text-[13.5px] text-muted max-w-2xl -mt-1 mb-4">{description}</p>}
          {children}
          {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
    </section>
  );
}

// "Section 2" → "02". Falls back to "—" when no/odd eyebrow.
function parseSectionNo(eyebrow?: string): string {
  const m = eyebrow?.match(/(\d+)/);
  return m ? m[1].padStart(2, "0") : "";
}
function buildMeta(num: string, count?: number, noun?: string): string {
  const head = num ? `Section ${num}` : "Section";
  if (typeof count === "number" && noun) {
    return `${head} — ${count} ${count === 1 ? noun : pluralize(noun)}`.toUpperCase();
  }
  if (typeof count === "number" && count > 0) {
    return `${head} — ${count}`.toUpperCase();
  }
  return head.toUpperCase();
}
function pluralize(n: string): string {
  if (/y$/.test(n)) return n.replace(/y$/, "ies");
  if (/(s|x|z|ch|sh)$/.test(n)) return n + "es";
  return n + "s";
}

// Inline field group — label + control + hint/error.
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

// Dashed-bordered "new item" container — used by list sections on Add.
export function NewItemPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-[10px] border border-dashed border-border bg-cream/60 p-5">
      <p className="section-eyebrow text-sienna">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

// Small rounded action buttons (pencil / trash) used in row corners.
export function IconButton({
  onClick, label, disabled, danger, children,
}: { onClick: () => void; label: string; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center transition disabled:opacity-50",
        danger ? "text-muted hover:text-red-700 hover:bg-red-50" : "text-muted hover:text-sienna hover:bg-cream",
      )}
    >
      {children}
    </button>
  );
}

// A small read-more toggle for long body text. Clamp classes are literal
// so Tailwind compiles them (dynamic `line-clamp-${n}` would be purged).
const CLAMP: Record<number, string> = { 2: "line-clamp-2", 3: "line-clamp-3", 4: "line-clamp-4" };
export function Clamp({ text, lines = 3, className }: { text: string; lines?: 2 | 3 | 4; className?: string }) {
  const [open, setOpen] = React.useState(false);
  const longish = text.length > 180;
  return (
    <div className={className}>
      <p className={cn("text-[13.5px] text-ink-soft leading-relaxed whitespace-pre-line", !open && longish && CLAMP[lines])}>
        {text}
      </p>
      {longish && (
        <button type="button" onClick={() => setOpen((o) => !o)} className="mt-1 text-[12.5px] text-sienna font-medium hover:underline">
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
