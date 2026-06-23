"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

// Collapsible long text with a "Read more" / "Show less" toggle — mirrors the
// builder's Clamp, but the caller supplies the paragraph styling so it can sit
// in the larger type of the public profile. Line breaks are preserved.
const CLAMP: Record<number, string> = {
  2: "line-clamp-2", 3: "line-clamp-3", 4: "line-clamp-4", 5: "line-clamp-5", 6: "line-clamp-6",
};

export function ReadMore({
  text, className, lines = 4, threshold = 240,
}: { text: string; className?: string; lines?: 2 | 3 | 4 | 5 | 6; threshold?: number }) {
  const [open, setOpen] = useState(false);
  const longish = text.length > threshold;
  return (
    <div>
      <p className={cn(className, "whitespace-pre-line", !open && longish && CLAMP[lines])}>{text}</p>
      {longish && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-1.5 text-[12.5px] text-sienna font-medium hover:underline"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
