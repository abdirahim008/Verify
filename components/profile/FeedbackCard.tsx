"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/cn";
import { submitFeedback, dismissFeedback } from "@/lib/actions/feedback";

// One-time feedback prompt in the profile rail: 1–5 stars plus an optional
// short comment. Submitting or dismissing writes the user's app_feedback row,
// and the server stops rendering this card from then on — so it genuinely
// disappears rather than nagging.
export function FeedbackCard() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [gone, setGone] = useState(false);
  const [thanks, setThanks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (gone) return null;

  if (thanks) {
    return (
      <div className="card border border-border bg-paper p-5">
        <p className="section-eyebrow text-verified">Thank you</p>
        <p className="text-[13.5px] text-ink-soft mt-2 leading-relaxed">
          Your feedback goes straight to the team building Sahan. It genuinely shapes what we do next.
        </p>
      </div>
    );
  }

  function send() {
    if (rating === 0) { setError("Pick a rating first."); return; }
    setError(null);
    startTransition(async () => {
      try { await submitFeedback(rating, comment); setThanks(true); }
      catch (e) { setError(e instanceof Error ? e.message : "Couldn't send"); }
    });
  }

  function notNow() {
    setGone(true);
    startTransition(async () => {
      try { await dismissFeedback(); } catch { /* hidden locally regardless */ }
    });
  }

  const labels = ["", "Poor", "Not great", "Okay", "Good", "Excellent"];
  const shown = hover || rating;

  return (
    <div className="card border border-border bg-paper p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="section-eyebrow text-sienna">How are we doing?</p>
        <button
          type="button" onClick={notNow} aria-label="Dismiss"
          className="text-muted hover:text-ink text-[16px] leading-none -mt-1 shrink-0"
        >
          ×
        </button>
      </div>
      <p className="text-[13px] text-ink-soft mt-2 leading-relaxed">
        Rate Sahan and tell us one thing we could improve. Takes 10 seconds.
      </p>

      <div className="mt-3 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onClick={() => { setRating(n); setError(null); }}
            onMouseEnter={() => setHover(n)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star filled={n <= shown} />
          </button>
        ))}
        {shown > 0 && <span className="ml-1.5 text-[12px] text-muted">{labels[shown]}</span>}
      </div>

      {rating > 0 && (
        <div className="mt-3">
          <textarea
            rows={3}
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={rating >= 4 ? "What worked well? (optional)" : "What should we fix first? (optional)"}
            className="field text-[13px]"
          />
          <div className="mt-2 flex gap-2">
            <Button kind="primary" size="sm" onClick={send} disabled={pending}>
              {pending ? "Sending…" : "Send feedback"}
            </Button>
            <Button kind="ghost" size="sm" onClick={notNow} disabled={pending}>Not now</Button>
          </div>
        </div>
      )}

      {error && <p className="text-[12px] text-red-700 mt-2">{error}</p>}
    </div>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden
      className={cn("transition-colors", filled ? "text-amber-500" : "text-border")}
      fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M12 2.8l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.65l-5.81 3.05 1.11-6.47L2.6 9.65l6.5-.95z" />
    </svg>
  );
}
