"use client";

import { useId, useMemo, useRef, useState } from "react";
import { rankSkills } from "@/lib/skills";

/**
 * Type-ahead for the skills field. Suggestions steer members toward the
 * vocabulary recruiters actually scan for, but free-add stays open — anything
 * typed can be submitted whether or not it's on the list.
 */
export function SkillCombobox({
  value, onChange, onPick, exclude, disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  /** Called when a suggestion is chosen, or Enter is pressed on one. */
  onPick: (name: string) => void;
  /** Lowercased names already on the profile — never suggested again. */
  exclude: ReadonlySet<string>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => rankSkills(value, exclude), [value, exclude]);
  const showList = open && matches.length > 0;

  function choose(name: string) {
    onPick(name);
    setOpen(false);
    setActive(-1);
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!showList) { setOpen(true); return; }
      const step = e.key === "ArrowDown" ? 1 : -1;
      // -1 is "nothing highlighted" — the free-add state. Wrapping through it
      // lets the member get back to their own typed text without deleting.
      setActive((i) => {
        const next = i + step;
        if (next < -1) return matches.length - 1;
        if (next >= matches.length) return -1;
        return next;
      });
    } else if (e.key === "Enter" && active >= 0 && showList) {
      // Let the parent form's submit handle a plain Enter with nothing
      // highlighted — that's the free-add path.
      e.preventDefault();
      choose(matches[active]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <div
      className="relative flex-1"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
          setActive(-1);
        }
      }}
    >
      <input
        ref={inputRef}
        className="field w-full"
        placeholder="e.g. Cash & Voucher Assistance"
        maxLength={80}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        value={value}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(-1); }}
        onKeyDown={onKeyDown}
      />

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 w-full max-h-64 overflow-auto rounded-[10px] border border-border bg-white py-1 shadow-lg"
        >
          {!value.trim() && (
            <li className="px-3 pb-1 pt-0.5 text-[11px] uppercase tracking-wide text-muted">Popular skills</li>
          )}
          {matches.map((s, i) => (
            <li key={s} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                tabIndex={-1}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()} // keep focus; blur would close first
                onClick={() => choose(s)}
                className={`block w-full px-3 py-1.5 text-left text-[13.5px] transition ${
                  i === active ? "bg-sienna-soft/60 text-ink" : "text-ink-soft hover:bg-cream/70"
                }`}
              >
                <Highlight text={s} query={value} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Bolds the typed fragment inside a suggestion so the match is obvious. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-semibold text-ink">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}
