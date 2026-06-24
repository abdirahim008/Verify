import * as React from "react";

// Renders multi-line scope / description text as an accent-dot list: each
// paragraph or list row (split on newlines) becomes its own bulleted item.
// Presentational only (no hooks) — safe in both server and client components.
export function ScopeList({ text, dotColor, className, style }: {
  text: string;
  dotColor: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const items = text.split(/\n{2,}|\n/).map((s) => s.trim()).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div className={className} style={style}>
      {items.map((it, i) => (
        <div key={i} className="flex gap-2" style={i > 0 ? { marginTop: 6 } : undefined}>
          <span aria-hidden className="rounded-full" style={{ width: 6, height: 6, marginTop: 7, background: dotColor, flex: "none" }} />
          <span style={{ minWidth: 0 }}>{it}</span>
        </div>
      ))}
    </div>
  );
}
