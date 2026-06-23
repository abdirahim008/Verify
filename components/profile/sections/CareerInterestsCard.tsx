"use client";

import { useState, useTransition } from "react";
import { SectionCard } from "../SectionCard";
import { saveCareerCategories } from "@/lib/actions/profile";
import { JOB_SECTORS } from "@/lib/jobs/sectors";

// Career interests = the SomKenJobs sectors a user follows. Drives the
// "Roles matched to your profile" feed on /home. Toggle chips; each change
// saves immediately (optimistic, with rollback on failure).
export function CareerInterestsCard({ initial }: { initial: string[] }) {
  const [selected, setSelected] = useState<string[]>(initial);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(value: string) {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    const prev = selected;
    setSelected(next);
    setError(null);
    startTransition(async () => {
      try { await saveCareerCategories({ categories: next }); }
      catch (e) {
        setSelected(prev); // rollback
        setError(e instanceof Error ? e.message : "Couldn't save");
      }
    });
  }

  return (
    <SectionCard
      eyebrow="Interests"
      title="Career interests"
      metaNoun="interest"
      description="Pick the sectors you work in. We use these to surface matching roles from SomKenJobs on your home page."
      defaultOpen={selected.length === 0}
      count={selected.length}
    >
      <div className="flex flex-wrap gap-2">
        {JOB_SECTORS.map((s) => {
          const on = selected.includes(s.value);
          return (
            <button
              key={s.value}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(s.value)}
              className={
                on
                  ? "rounded-full border border-ink bg-ink text-paper px-3 py-1.5 text-[13px] font-medium transition"
                  : "rounded-full border border-border bg-cream/40 text-ink-soft px-3 py-1.5 text-[13px] hover:border-ink/40 transition"
              }
            >
              {s.label}
            </button>
          );
        })}
      </div>
      {error && <p className="helper text-red-600 mt-2">{error}</p>}
      {selected.length === 0 && (
        <p className="helper text-muted mt-3">Nothing selected yet — your home feed will show the newest roles until you pick a few.</p>
      )}
    </SectionCard>
  );
}
