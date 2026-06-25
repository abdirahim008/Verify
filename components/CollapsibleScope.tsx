"use client";

import { useState } from "react";
import { splitScope } from "./ScopeList";

// Scope/description as an accent-dot list that collapses to the first few
// items with a "Read more" toggle — project scopes can run long. Mirrors
// ScopeList's row markup; adds the collapse. Client component (has state),
// safe to drop into the builder and the public (server) profile alike.
export function CollapsibleScope({ text, dotColor, className, style, collapsed = 3 }: {
  text: string;
  dotColor: string;
  className?: string;
  style?: React.CSSProperties;
  collapsed?: number;
}) {
  const [open, setOpen] = useState(false);
  const items = splitScope(text);
  if (items.length === 0) return null;
  const shown = open ? items : items.slice(0, collapsed);
  const hidden = items.length - collapsed;
  return (
    <div className={className} style={style}>
      {shown.map((it, i) => (
        <div key={i} className="flex gap-2" style={i > 0 ? { marginTop: 6 } : undefined}>
          <span aria-hidden className="rounded-full" style={{ width: 6, height: 6, marginTop: 7, background: dotColor, flex: "none" }} />
          <span style={{ minWidth: 0 }}>{it}</span>
        </div>
      ))}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-2 text-[12.5px] font-medium hover:underline"
          style={{ color: dotColor }}
        >
          {open ? "Show less" : `Read more (${hidden} more)`}
        </button>
      )}
    </div>
  );
}
