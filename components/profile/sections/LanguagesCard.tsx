"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/cn";
import { SectionCard } from "../SectionCard";
import { RowMenu } from "../RowMenu";
import { saveLanguages } from "@/lib/actions/profile";
import {
  LANGUAGE_SKILLS, LEVEL_WORDS, LEVEL_HINTS, SKILL_LABEL, REGIONAL_LANGUAGES, OTHER_LANGUAGES,
  type LanguageEntry, type LanguageSkill, type Level,
  emptyLanguage, parseLanguage, formatLanguage, hasRatings, levelWord,
  cleanLanguageName, canonicalLanguage,
} from "@/lib/languages";

// Languages: each one rated separately for reading, writing and speaking on
// one five-step scale (Basic → Native), plus a "Mother tongue" flag. Every
// rating is optional. Stored as one string per language (lib/languages.ts),
// so entries typed before this design still show and can be rated.

const OTHER = "__other__";
// Selects/inputs at 16px on phones stop iOS Safari zooming in on focus.
const CONTROL = "field text-[16px] sm:text-[14px] min-h-[46px]";

export function LanguagesCard({ initial }: { initial: string[] }) {
  const [items, setItems] = useState(initial);
  // null = form closed, -1 = adding, n = editing items[n]
  const [editing, setEditing] = useState<number | null>(initial.length === 0 ? -1 : null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function persist(next: string[], prev: string[]) {
    setItems(next);
    startTransition(async () => {
      try { await saveLanguages({ languages: next }); }
      catch (e) {
        setItems(prev);
        setError(e instanceof Error ? e.message : "Couldn't save");
      }
    });
  }

  const keyOf = (n: string) => (canonicalLanguage(n) ?? n).toLowerCase();

  function save(entry: LanguageEntry) {
    const value = formatLanguage(entry);
    const clash = items.findIndex((s, i) => i !== editing && keyOf(parseLanguage(s).name) === keyOf(entry.name));
    if (clash >= 0) { setError(`${parseLanguage(items[clash]).name} is already on your list.`); return; }
    setError(null);
    persist(editing === null || editing < 0 ? [...items, value] : items.map((s, i) => (i === editing ? value : s)), items);
    setEditing(null);
  }

  function remove(i: number) {
    setError(null);
    setEditing(null);
    persist(items.filter((_, j) => j !== i), items);
  }

  const open = (i: number) => { setError(null); setEditing(i); };

  return (
    <SectionCard
      eyebrow="Section 6"
      title="Languages"
      metaNoun="language"
      description="Rate how well you read, write and speak each language. This is what employers see on your CV."
      defaultOpen={items.length === 0}
      count={items.length}
      headerAction={items.length > 0 && editing === null ? (
        <Button type="button" kind="primary" size="sm" onClick={() => open(-1)}>
          <PlusIcon /> Add language
        </Button>
      ) : undefined}
    >
      {items.length > 0 && (
        <div className="rounded-[12px] border border-border-soft overflow-hidden">
          {/* Column labels, tablet and up. Phones label each meter instead. */}
          <div className="hidden sm:flex items-center gap-4 pl-5 pr-2 py-2.5 bg-cream/50 border-b border-border-soft text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            <span className="w-[150px] shrink-0">Language</span>
            <span className="flex-1 grid grid-cols-3 gap-5">
              {LANGUAGE_SKILLS.map((k) => <span key={k}>{SKILL_LABEL[k]}</span>)}
            </span>
            <span className="w-7 shrink-0" />
          </div>

          <ul className="divide-y divide-border-soft">
            {items.map((raw, i) => {
              const e = parseLanguage(raw);
              const badge = e.mother ? "Mother tongue" : hasRatings(e) ? "" : e.note;
              return (
                <li key={`${i}-${raw}`} className={cn("pl-4 sm:pl-5 pr-2 py-4 sm:flex sm:items-center sm:gap-4", editing === i && "bg-cream/50")}>
                  <div className="flex items-center gap-2 sm:w-[150px] sm:shrink-0 sm:flex-col sm:items-start sm:gap-1.5">
                    <span className="text-[16.5px] font-semibold text-ink leading-tight">{e.name}</span>
                    {badge && <Badge>{badge}</Badge>}
                    <span className="flex-1 sm:hidden" />
                    <span className="sm:hidden"><RowMenu pending={pending} onEdit={() => open(i)} onDelete={() => remove(i)} /></span>
                  </div>

                  <div className="mt-3 pr-2 sm:mt-0 sm:pr-0 flex-1 min-w-0">
                    {hasRatings(e) ? (
                      <div className="grid gap-2.5 sm:grid-cols-3 sm:gap-5">
                        {LANGUAGE_SKILLS.map((k) => <Meter key={k} skill={k} level={e[k]} />)}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => open(i)}
                        className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-cream/30 text-[14px] font-semibold text-sienna hover:border-muted transition"
                      >
                        <PlusIcon /> Set reading, writing &amp; speaking levels
                      </button>
                    )}
                  </div>

                  <span className="hidden sm:block"><RowMenu pending={pending} onEdit={() => open(i)} onDelete={() => remove(i)} /></span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {items.length > 0 && editing === null && <ScaleLegend />}

      {editing !== null && (
        <LanguageForm
          key={editing}
          initial={editing >= 0 ? parseLanguage(items[editing]) : emptyLanguage()}
          isEdit={editing >= 0}
          taken={items.filter((_, i) => i !== editing).map((s) => keyOf(parseLanguage(s).name))}
          pending={pending}
          onSave={save}
          onRemove={editing >= 0 ? () => remove(editing) : undefined}
          onCancel={items.length > 0 ? () => { setError(null); setEditing(null); } : undefined}
        />
      )}
      {error && <p className="helper text-red-600 mt-2">{error}</p>}
    </SectionCard>
  );
}

// ── Display pieces ──────────────────────────────────────────────────────

function Bars({ level, className }: { level: Level; className?: string }) {
  return (
    <span className={cn("flex gap-[3px]", className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cn("flex-1 h-1.5 rounded-full", i <= level ? "bg-sienna" : "bg-border")} />
      ))}
    </span>
  );
}

// Phones: "Reading ▬▬▬▬▭ Fluent" on one line. Tablet up: bars over the word
// under the column label.
function Meter({ skill, level }: { skill: LanguageSkill; level: Level }) {
  const word = levelWord(level);
  return (
    <div
      className="grid grid-cols-[72px_1fr_104px] items-center gap-3 sm:flex sm:flex-col sm:items-stretch sm:gap-2"
      aria-label={`${SKILL_LABEL[skill]}: ${word ? `${word}, ${level} of 5` : "not rated"}`}
    >
      <span className="text-[13.5px] text-ink-soft sm:hidden">{SKILL_LABEL[skill]}</span>
      <Bars level={level} className="sm:max-w-[112px]" />
      <span className={cn("text-right sm:text-left text-[13.5px]", word ? "font-medium text-ink" : "text-muted")}>{word || "Not rated"}</span>
    </div>
  );
}

function ScaleLegend() {
  return (
    <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-muted">
      <span className="font-semibold text-ink-soft">Scale</span>
      {LEVEL_WORDS.map((w, i) => (
        <span key={w} className="inline-flex items-center gap-1.5">
          <span className="inline-flex gap-[2px]" aria-hidden>
            {[1, 2, 3, 4, 5].map((j) => <span key={j} className={cn("w-1.5 h-1.5 rounded-[2px]", j <= i + 1 ? "bg-sienna" : "bg-border")} />)}
          </span>
          {w}
        </span>
      ))}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center h-[22px] px-2 rounded-full bg-cream border border-border text-[12px] font-medium text-ink-soft whitespace-nowrap">{children}</span>;
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M7 1.5v11M1.5 7h11" />
    </svg>
  );
}

// ── Add / edit ──────────────────────────────────────────────────────────

function LanguageForm({
  initial, isEdit, taken, pending, onSave, onRemove, onCancel,
}: {
  initial: LanguageEntry;
  isEdit: boolean;
  taken: string[];
  pending: boolean;
  onSave: (e: LanguageEntry) => void;
  onRemove?: () => void;
  onCancel?: () => void;
}) {
  // An older typed entry ("Somalia", "Swahili") snaps to the list's name.
  const known = initial.name ? canonicalLanguage(initial.name) : null;
  const [choice, setChoice] = useState(initial.name ? (known ?? OTHER) : "");
  const [otherName, setOtherName] = useState(known ? "" : initial.name);
  const [mother, setMother] = useState(initial.mother);
  const [levels, setLevels] = useState<Record<LanguageSkill, Level>>({
    reading: initial.reading, writing: initial.writing, speaking: initial.speaking,
  });

  const name = choice === OTHER ? cleanLanguageName(otherName) : choice;
  const avail = (list: string[]) => list.filter((l) => l === choice || !taken.includes(l.toLowerCase()));
  const draft: LanguageEntry = { ...initial, name, mother, ...levels };

  function toggleMother(on: boolean) {
    setMother(on);
    // A first language is spoken natively; reading and writing stay the
    // member's call (many people speak Somali natively but read it less).
    if (on) setLevels((l) => ({ ...l, speaking: 5 }));
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (name) onSave(draft);
  }

  return (
    <form onSubmit={submit} noValidate className="mt-4 rounded-[12px] border border-border bg-paper shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-border-soft">
        <p className="section-eyebrow text-sienna">{isEdit ? "Edit language" : "Add a language"}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="label">Language</span>
              <select className={CONTROL} value={choice} onChange={(e) => setChoice(e.target.value)} aria-required>
                <option value="" disabled>Choose a language</option>
                <optgroup label="Most used">
                  {avail(REGIONAL_LANGUAGES).map((l) => <option key={l} value={l}>{l}</option>)}
                </optgroup>
                <optgroup label="More languages">
                  {avail(OTHER_LANGUAGES).map((l) => <option key={l} value={l}>{l}</option>)}
                </optgroup>
                <option value={OTHER}>Another language…</option>
              </select>
            </label>
            {choice === OTHER && (
              <label className="block">
                <span className="label">Language name</span>
                <input className={CONTROL} value={otherName} maxLength={60} placeholder="e.g. Kirundi" onChange={(e) => setOtherName(e.target.value)} />
              </label>
            )}
          </div>
          <label className={cn(
            "flex items-center gap-2.5 min-h-[46px] px-3.5 rounded-lg border cursor-pointer transition",
            mother ? "border-sienna/40 bg-sienna/5" : "border-border bg-paper hover:border-muted",
          )}>
            <input type="checkbox" checked={mother} onChange={(e) => toggleMother(e.target.checked)} className="w-[18px] h-[18px] accent-sienna" />
            <span className="text-[14.5px] font-medium text-ink">Mother tongue</span>
          </label>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 space-y-5">
        {LANGUAGE_SKILLS.map((k) => (
          <SkillPicker key={k} skill={k} level={levels[k]} onChange={(n) => setLevels((l) => ({ ...l, [k]: n }))} />
        ))}
        {!hasRatings(draft) && initial.note && (
          <p className="helper">Currently shown as “{initial.note}”. Rate the skills above to replace it.</p>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2 px-4 sm:px-6 py-4 border-t border-border-soft bg-cream/30 rounded-b-[12px]">
        {onRemove && (
          <button type="button" onClick={onRemove} disabled={pending} className="min-h-[44px] px-1 text-[14px] font-semibold text-red-700 hover:underline sm:mr-auto">
            Remove language
          </button>
        )}
        {!onRemove && <span className="hidden sm:block sm:mr-auto" />}
        {onCancel && <Button type="button" kind="secondary" size="md" className="w-full sm:w-auto" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" kind="primary" size="md" className="w-full sm:w-auto" disabled={pending || !name}>
          {isEdit ? "Save language" : "Add language"}
        </Button>
      </div>
    </form>
  );
}

// Five steps, each a real button. Tablet up: bar + word in each step.
// Phones: bars only (the word would be too cramped), with the chosen word in
// the heading and Basic / Native under the ends. Tapping the chosen step
// again clears it, since every rating is optional.
function SkillPicker({ skill, level, onChange }: { skill: LanguageSkill; level: Level; onChange: (n: Level) => void }) {
  const word = levelWord(level);
  return (
    <fieldset>
      <legend className="w-full flex items-baseline justify-between sm:justify-start gap-2.5 mb-2.5">
        <span className="text-[15px] font-bold text-ink">{SKILL_LABEL[skill]}</span>
        <span className={cn("text-[14px]", word ? "font-semibold text-sienna" : "text-muted")}>{word || "Not rated"}</span>
      </legend>
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5" role="radiogroup" aria-label={SKILL_LABEL[skill]}>
        {LEVEL_WORDS.map((w, i) => {
          const n = (i + 1) as Level;
          const on = n === level;
          const filled = n <= level;
          return (
            <button
              key={w}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={w}
              onClick={() => onChange(on ? 0 : n)}
              className={cn(
                "min-h-[44px] sm:min-h-[52px] rounded-lg flex flex-col items-center justify-center gap-1.5 px-1 transition",
                "sm:border",
                on ? "sm:bg-sienna sm:border-sienna sm:text-white"
                  : filled ? "sm:bg-sienna/10 sm:border-sienna/25 sm:text-ink"
                  : "sm:bg-paper sm:border-border sm:text-ink-soft sm:hover:border-muted",
              )}
            >
              <span className={cn(
                "w-full sm:w-6 rounded-full transition-all",
                on ? "h-3.5 sm:h-1 bg-sienna sm:bg-white/85" : filled ? "h-2 sm:h-1 bg-sienna" : "h-2 sm:h-1 bg-border",
              )} />
              <span className={cn("hidden sm:block text-[12.5px] leading-none", on ? "font-bold" : "font-medium")}>{w}</span>
            </button>
          );
        })}
      </div>
      <div className="sm:hidden flex justify-between text-[12px] text-muted mt-1">
        <span>Basic</span><span>Native</span>
      </div>
      <p className="mt-2 text-[13.5px] leading-snug text-muted min-h-[1.25em]">
        {level ? LEVEL_HINTS[skill][level - 1] : "Tap a step to rate, or leave it blank."}
      </p>
    </fieldset>
  );
}
