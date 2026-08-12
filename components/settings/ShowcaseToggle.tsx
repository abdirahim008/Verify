"use client";

import { useState, useTransition } from "react";
import { setShowcase } from "@/lib/actions/showcase";

// Settings switch for the /home community showcase. Optimistic — flips
// immediately, rolls back if the save fails.
export function ShowcaseToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function flip() {
    const next = !on;
    setOn(next);
    setError(null);
    startTransition(async () => {
      try { await setShowcase(next); }
      catch (e) { setOn(!next); setError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  return (
    <div className="mt-6 card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-eyebrow">Community showcase</p>
          <p className="mt-2 text-[13.5px] text-ink-soft leading-relaxed max-w-lg">
            Members&rsquo; home pages include a gallery of profiles — photo, name, headline and location only.
            Turn this off to remove yourself. Your public profile link is unaffected.
          </p>
          {error && <p className="mt-2 text-[12.5px] text-red-700">{error}</p>}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Show my profile in the community showcase"
          onClick={flip}
          disabled={pending}
          className={`relative shrink-0 w-[46px] h-[26px] rounded-full transition-colors disabled:opacity-60 ${on ? "bg-verified" : "bg-border"}`}
        >
          <span className={`absolute top-[3px] w-[20px] h-[20px] rounded-full bg-white shadow transition-all ${on ? "left-[23px]" : "left-[3px]"}`} />
        </button>
      </div>
    </div>
  );
}
