"use client";

import { useState, useTransition } from "react";
import { setBlocked } from "@/lib/actions/blocked";

// Per-user Block / Unblock control in the admin metrics table. Optimistic;
// rolls back on failure. Blocking is reversible, so the confirm is light.
export function BlockToggle({ profileId, initial, reason, name }: {
  profileId: string; initial: boolean; reason: string; name: string;
}) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  function flip() {
    if (!on && !confirm(`Block ${name}?\n\nThey'll disappear from the gallery, landing page, their public profile and the member count. You can unblock later.`)) return;
    const next = !on;
    setOn(next);
    startTransition(async () => {
      try { await setBlocked(profileId, next, "manual"); }
      catch { setOn(!next); }
    });
  }

  return (
    <button
      type="button"
      onClick={flip}
      disabled={pending}
      aria-pressed={on}
      title={on ? `Blocked (${reason || "manual"}) — click to unblock` : "Block this profile"}
      className={`rounded-full border px-2.5 py-[3px] text-[11px] font-semibold transition disabled:opacity-50 ${
        on ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100" : "border-border text-muted hover:border-muted hover:text-ink"
      }`}
    >
      {on ? "Blocked" : "Block"}
    </button>
  );
}
