import * as React from "react";

// Split scope/description text into list items. Breaks on newlines AND inline
// bullet glyphs (• ▪ ‣ ◦), then strips any leading bullet/dash marker the user
// typed — so both "one bullet per line" and "all on one line separated by •"
// render as a clean list.
export function splitScope(text: string): string[] {
  return text
    .split(/\r?\n+|\s*[•▪‣◦]\s*/)
    .map((s) => s.replace(/^[-–—*]\s+/, "").trim())
    .filter(Boolean);
}

// Renders multi-line scope / description text as an accent-dot list: each
// paragraph or list row becomes its own bulleted item.
// Presentational only (no hooks) — safe in both server and client components.
export function ScopeList({ text, dotColor, className, style }: {
  text: string;
  dotColor: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const items = splitScope(text);
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
