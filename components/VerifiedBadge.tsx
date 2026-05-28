import { cn } from "@/lib/cn";

// Per-claim verified badge — inline, never global. CLAUDE.md §6+§12: the
// badge means a specific experience/project/education was checked. An
// unverified item shows nothing.
export function VerifiedBadge({ note, className }: { note?: string | null; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-verified-soft px-2 py-0.5 text-[11px] font-medium text-verified",
        className,
      )}
    >
      <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden>
        <circle cx="5.5" cy="5.5" r="5.5" fill="currentColor" />
        <path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {note ? `Verified · ${note}` : "Verified"}
    </span>
  );
}
