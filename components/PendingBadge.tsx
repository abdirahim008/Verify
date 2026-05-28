import { cn } from "@/lib/cn";

// Small inline marker shown next to a claim while its verification request
// is in flight. Visually quieter than VerifiedBadge — same shape, no
// green, mutes the visual contract until the admin actually approves.
export function PendingBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-cream border border-border px-2 py-0.5 text-[11px] font-medium text-muted",
        className,
      )}
    >
      <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden>
        <circle cx="5.5" cy="5.5" r="4.5" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M5.5 3v3l2 1" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </svg>
      Pending review
    </span>
  );
}
