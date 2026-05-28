import { cn } from "@/lib/cn";

// Wordmark: "Sahan" with a sienna terminal dot. Mirror of the JSX prototype
// in verify/brand.jsx — kept minimal so it scales cleanly inline.
export function SahanMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center font-semibold tracking-tightish text-ink", className)}
      style={{ fontSize: size }}
    >
      Sahan<span className="text-sienna">.</span>
    </span>
  );
}
