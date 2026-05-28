"use client";

import Link from "next/link";
import { Button } from "@/components/Button";
import { VerifiedBadge } from "@/components/VerifiedBadge";

interface Todo { label: string; done: boolean }

export function CompletenessRail({
  percent, todos, hasMinimumCore, verifiedCount,
}: { percent: number; todos: Todo[]; hasMinimumCore: boolean; verifiedCount: number }) {
  return (
    <div className="space-y-4 lg:sticky lg:top-6">
      <div className="card">
        <p className="section-eyebrow">Profile completeness</p>
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="font-serif text-[32px]">{percent}</span>
          <span className="text-muted text-[13px]">%</span>
        </div>
        <div className="h-1 bg-border-soft rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-ink transition-all" style={{ width: `${percent}%` }} />
        </div>
        <ul className="mt-4 space-y-1.5 text-[12.5px]">
          {todos.map((t) => (
            <li key={t.label} className="flex items-center gap-2">
              <span
                aria-hidden
                className={`shrink-0 w-3.5 h-3.5 rounded-full border-[1.5px] ${
                  t.done ? "bg-verified border-verified" : "border-muted"
                }`}
              />
              <span className={t.done ? "line-through text-muted" : "text-ink-soft"}>{t.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <p className="section-eyebrow text-sienna">Minimum core</p>
        <p className="mt-2 text-[13px] text-ink-soft">
          {hasMinimumCore
            ? "You've passed the minimum — your CV is ready to download."
            : "Add basics, one experience, one education, and one skill to unlock your first CV."}
        </p>
        {hasMinimumCore ? (
          <a href="/api/cv/editorial" download className="block mt-3">
            <Button kind="primary" size="md" className="w-full">Download CV →</Button>
          </a>
        ) : (
          <Link href="/templates" className="block mt-3">
            <Button kind="quiet" size="md" className="w-full" disabled>Locked until minimum core</Button>
          </Link>
        )}
      </div>

      <div className="card">
        <p className="section-eyebrow">Verified claims</p>
        {verifiedCount > 0 ? (
          <p className="mt-2 text-[13px] text-ink-soft">
            <span className="text-ink font-medium">{verifiedCount}</span> claim{verifiedCount === 1 ? "" : "s"} verified — they&apos;ll render with a green check on every CV.
          </p>
        ) : (
          <>
            <p className="mt-2 text-[13px] text-ink-soft">
              None yet. Request verification on a specific experience to earn a badge like this:
            </p>
            <div className="mt-3"><VerifiedBadge note="UNICEF Somalia" /></div>
          </>
        )}
      </div>
    </div>
  );
}
