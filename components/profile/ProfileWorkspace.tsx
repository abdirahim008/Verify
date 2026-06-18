"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { WorkspaceMode } from "./SectionChrome";

export interface WorkspaceSection {
  id: string;
  label: string;
  /** Item count shown as a trailing badge (omit or 0 to hide). */
  count?: number;
  /** Renders a green check when true, otherwise the step number. */
  done: boolean;
  node: React.ReactNode;
}

// Three-pane profile builder: a sticky left sidebar that switches which
// single section is shown in the centre, plus the right rail. Every
// section stays mounted (toggled with `hidden`) so switching never loses
// in-progress form input.
export function ProfileWorkspace({
  eyebrow, title, publicHref, sections, rail, minCore,
}: {
  eyebrow: string;
  title: string;
  publicHref: string;
  sections: WorkspaceSection[];
  rail: React.ReactNode;
  minCore: { passed: boolean; label: string; hint: string };
}) {
  const [active, setActive] = React.useState(sections[0]?.id ?? "");

  return (
    <div className="grid gap-6 lg:grid-cols-[212px_1fr_300px] items-start">
      {/* ── Left sidebar: section navigation ─────────────────────────── */}
      <aside className="lg:sticky lg:top-6">
        <div className="px-1">
          <p className="section-eyebrow text-sienna">{eyebrow}</p>
          <h1 className="font-serif text-[22px] tracking-tightish mt-1 leading-tight">{title}</h1>
          <Link href={publicHref} target="_blank" rel="noopener noreferrer"
            className="inline-block mt-1.5 text-[12px] text-sienna font-medium hover:underline">
            View public profile ↗
          </Link>
        </div>

        <nav aria-label="Profile sections"
          className="mt-4 flex gap-1 overflow-x-auto pb-1 lg:block lg:gap-0 lg:space-y-0.5 lg:overflow-visible lg:pb-0">
          {sections.map((s, i) => {
            const on = s.id === active;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "shrink-0 lg:w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px] transition whitespace-nowrap",
                  on ? "bg-cream text-ink font-medium" : "text-ink-soft hover:bg-cream/60",
                )}
              >
                <StatusDot done={s.done} step={i + 1} />
                <span className="flex-1 min-w-0 truncate">{s.label}</span>
                {typeof s.count === "number" && s.count > 0 && (
                  <span className={cn("text-[11.5px] tabular-nums", on ? "text-muted" : "text-muted/80")}>{s.count}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className={cn("mt-4 rounded-xl p-4", minCore.passed ? "bg-ink text-paper" : "bg-cream border border-border-soft")}>
          <p className={cn("section-eyebrow", minCore.passed ? "text-sienna-soft" : "text-sienna")}>Minimum core</p>
          <p className={cn("mt-1.5 text-[12.5px] leading-snug", minCore.passed ? "text-paper/80" : "text-ink-soft")}>
            {minCore.passed ? minCore.label : minCore.hint}
          </p>
        </div>
      </aside>

      {/* ── Centre: the active section (all stay mounted) ────────────── */}
      <main className="min-w-0">
        <WorkspaceMode.Provider value={true}>
          {sections.map((s) => (
            <div key={s.id} hidden={s.id !== active}>{s.node}</div>
          ))}
        </WorkspaceMode.Provider>
      </main>

      {/* ── Right rail: completeness, download, verified ─────────────── */}
      <div>{rail}</div>
    </div>
  );
}

function StatusDot({ done, step }: { done: boolean; step: number }) {
  if (done) {
    return (
      <svg width="18" height="18" viewBox="0 0 22 22" className="shrink-0" aria-hidden>
        <circle cx="11" cy="11" r="11" fill="#067a5e" />
        <path d="M6 11.2 L9.4 14.6 L16 8" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <span className="shrink-0 w-[18px] h-[18px] rounded-full border-[1.5px] border-border flex items-center justify-center text-[10px] font-semibold text-muted" aria-hidden>
      {step}
    </span>
  );
}
