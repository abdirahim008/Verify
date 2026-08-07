"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { FEATURES } from "@/lib/flags";
import { CvDownloadModal } from "./CvDownloadModal";

interface Todo { label: string; done: boolean }

export function CompletenessRail({
  percent, todos, hasMinimumCore, verifiedCount, children,
}: { percent: number; todos: Todo[]; hasMinimumCore: boolean; verifiedCount: number; children?: React.ReactNode }) {
  const complete = percent >= 100;
  const [chooser, setChooser] = useState(false);
  return (
    <div className="space-y-4 lg:sticky lg:top-6">
      <div className="card">
        <p className="section-eyebrow">Profile completeness</p>
        <div className="mt-3 flex items-center gap-4">
          <Ring percent={percent} />
          <p className="text-[13px] text-ink-soft leading-relaxed">
            {complete
              ? "Every section complete. Your CV is ready to download in every template."
              : hasMinimumCore
                ? "Your CV is ready — add the remaining sections to make it shine."
                : "Fill the required sections to unlock your first CV."}
          </p>
        </div>
        <ul className="mt-4 space-y-2 text-[13px]">
          {todos.map((t) => (
            <li key={t.label} className="flex items-center gap-2.5">
              {t.done ? <MiniCheck /> : <span className="shrink-0 w-[18px] h-[18px] rounded-full border-[1.6px] border-border" aria-hidden />}
              <span className={t.done ? "text-ink-soft" : "text-muted"}>{t.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card bg-ink text-paper">
        <p className="section-eyebrow text-sienna-soft">{hasMinimumCore ? "Minimum core passed" : "Minimum core"}</p>
        <p className="font-serif text-[19px] tracking-tightish mt-2">
          {hasMinimumCore ? "Your CV is ready to download." : "Almost there."}
        </p>
        {!hasMinimumCore && (
          <p className="mt-1.5 text-[12.5px] text-paper/70">Add basics, one experience, one education, and one skill to unlock your first CV.</p>
        )}
        {hasMinimumCore ? (
          <Button kind="sienna" size="md" className="w-full mt-4" onClick={() => setChooser(true)}>Download CV →</Button>
        ) : (
          <Button kind="quiet" size="md" className="w-full mt-4" disabled>Locked until minimum core</Button>
        )}
      </div>

      <CvDownloadModal open={chooser} onClose={() => setChooser(false)} />

      {FEATURES.verification && (
      <div className="card">
        <p className="section-eyebrow">Verified claims</p>
        {verifiedCount > 0 ? (
          <>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-serif text-[30px] text-verified">{verifiedCount}</span>
              <span className="text-[13px] text-ink-soft">claim{verifiedCount === 1 ? "" : "s"} verified</span>
            </div>
            <p className="mt-1.5 text-[12.5px] text-muted leading-relaxed">
              These render with a green check on every CV and on your public profile.
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-[13px] text-ink-soft">
              None yet. Request verification on a specific experience to earn a badge like this:
            </p>
            <div className="mt-3"><VerifiedBadge /></div>
          </>
        )}
      </div>
      )}

      {children}
    </div>
  );
}

// Circular progress ring with the percentage in the centre.
function Ring({ percent }: { percent: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, percent));
  const offset = c * (1 - pct / 100);
  const color = pct >= 100 ? "#067a5e" : "#0a5cad";
  return (
    <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e9e6df" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset .5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-serif text-[16px]" style={{ color }}>{pct}<span className="text-[10px]">%</span></span>
      </div>
    </div>
  );
}

function MiniCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" className="shrink-0" aria-hidden>
      <circle cx="11" cy="11" r="11" fill="#067a5e" />
      <path d="M6 11.2 L9.4 14.6 L16 8" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
