"use client";

import { useState, useTransition } from "react";
import { setFeatured } from "@/lib/actions/featured";

// Per-user "feature on landing page" star in the admin metrics table.
// Optimistic; rolls back on failure. Consent is a human step — the confirm
// text reminds the admin to ask the member first.
export function FeatureToggle({ profileId, initial, name }: { profileId: string; initial: boolean; name: string }) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  function flip() {
    if (!on && !confirm(`Feature ${name} on the public landing page?\n\nMake sure they've agreed to this first.`)) return;
    const next = !on;
    setOn(next);
    startTransition(async () => {
      try { await setFeatured(profileId, next); }
      catch { setOn(!next); }
    });
  }

  return (
    <button
      type="button"
      onClick={flip}
      disabled={pending}
      aria-pressed={on}
      title={on ? "Featured on the landing page — click to remove" : "Feature on the landing page (ask the member first)"}
      className={`text-[16px] leading-none transition disabled:opacity-50 ${on ? "text-amber-500" : "text-border hover:text-muted"}`}
    >
      {on ? "★" : "☆"}
    </button>
  );
}
