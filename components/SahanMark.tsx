import Image from "next/image";
import { cn } from "@/lib/cn";

// Brand lockup: the S-and-check icon mark + the "Sahan" wordmark. The wordmark
// inherits the surrounding text colour (so it reads on light and dark
// surfaces); the icon is the full-colour mark in /public/sahan-mark.png.
// `size` drives the wordmark font-size; the icon scales with it.
// Pass `iconOnly` for a compact, text-free mark.
const MARK_ASPECT = 0.8; // width / height of /public/sahan-mark.png

export function SahanMark({
  size = 22,
  className,
  iconOnly = false,
}: {
  size?: number;
  className?: string;
  iconOnly?: boolean;
}) {
  const h = Math.round(size * 1.15);
  const w = Math.round(h * MARK_ASPECT);
  return (
    <span
      className={cn("inline-flex items-center font-semibold tracking-tightish text-ink", className)}
      style={{ fontSize: size, gap: Math.round(size * 0.32) }}
    >
      <Image
        src="/sahan-mark.png"
        alt={iconOnly ? "Sahan" : ""}
        width={w}
        height={h}
        style={{ width: w, height: h }}
        aria-hidden={iconOnly ? undefined : true}
      />
      {!iconOnly && <span>Sahan</span>}
    </span>
  );
}
