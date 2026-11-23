"use client";

import { useState, useTransition } from "react";
import { setMemberEmails } from "@/lib/actions/email-prefs";

// Settings switch for Sahan's member emails. Optimistic — flips immediately,
// rolls back if the save fails. Same flag as the unsubscribe link in the
// emails, so this is also how a member who unsubscribed turns them back on.
export function EmailToggle({ initial, individual }: { initial: boolean; individual: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function flip() {
    const next = !on;
    setOn(next);
    setError(null);
    startTransition(async () => {
      try { await setMemberEmails(next); }
      catch (e) { setOn(!next); setError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  return (
    <div className="mt-6 card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-eyebrow">Emails from Sahan</p>
          <p className="mt-2 text-[13.5px] text-ink-soft leading-relaxed max-w-lg">
            {individual
              ? "A weekly email with new jobs matched to your career interests, and reminders while your profile is unfinished."
              : "Reminders while your company profile is unfinished."}
            {" "}Turn this off to stop them. Sign-in and password emails are always sent.
          </p>
          {error && <p className="mt-2 text-[12.5px] text-red-700">{error}</p>}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Send me emails from Sahan"
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
