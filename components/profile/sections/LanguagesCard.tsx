"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/cn";
import { SectionCard, NewItemPanel } from "../SectionCard";
import { RowMenu } from "../RowMenu";
import { saveLanguages } from "@/lib/actions/profile";
import {
  LANGUAGE_LEVELS, LANGUAGE_SKILLS, REGIONAL_LANGUAGES, OTHER_LANGUAGES,
  type LanguageEntry, emptyLanguage, parseLanguage, formatLanguage, describeLanguage,
  cleanLanguageName, skillLabel, canonicalLanguage,
} from "@/lib/languages";

// Languages: pick from a list (or type one), then optionally an overall
// level and separate speaking / reading / writing levels. Every level is
// optional. Stored as one string per language (see lib/languages.ts), so
// entries typed before this picker still show and can be edited.

const OTHER = "__other__";

// Selects/inputs at 16px on phones stop iOS Safari zooming in on focus.
const CONTROL = "field text-[16px] sm:text-[14px] min-h-[44px] sm:min-h-[40px]";

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

  function save(entry: LanguageEntry) {
    const value = formatLanguage(entry);
    const key = (n: string) => (canonicalLanguage(n) ?? n).toLowerCase();
    const name = key(parseLanguage(value).name);
    const clash = items.findIndex((s, i) => i !== editing && key(parseLanguage(s).name) === name);
    if (clash >= 0) { setError(`${parseLanguage(items[clash]).name} is already on your list.`); return; }
    setError(null);
    const next = editing === null || editing < 0
      ? [...items, value]
      : items.map((s, i) => (i === editing ? value : s));
    persist(next, items);
    setEditing(null);
  }

  function remove(i: number) {
    setError(null);
    persist(items.filter((_, j) => j !== i), items);
    if (editing === i) setEditing(null);
  }

  const taken = items.map((s) => {
    const n = parseLanguage(s).name;
    return (canonicalLanguage(n) ?? n).toLowerCase();
  });

  return (
    <SectionCard
      eyebrow="Section 6"
      title="Languages"
      metaNoun="language"
      description="Pick the languages you work in. Levels are optional."
      defaultOpen={items.length === 0}
      count={items.length}
      headerAction={items.length > 0 && editing === null ? (
        <Button type="button" kind="secondary" size="sm" onClick={() => { setError(null); setEditing(-1); }}>+ Add</Button>
      ) : undefined}
    >
      {items.length > 0 && (
        <ul className="divide-y divide-border-soft rounded-[10px] border border-border-soft">
          {items.map((raw, i) => {
            const { name, level, detail } = describeLanguage(raw);
            return (
              <li key={`${i}-${raw}`} className={cn("flex items-start gap-3 px-3.5 sm:px-4 py-3", editing === i && "bg-cream/50")}>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[14.5px] font-medium text-ink">{name}</span>
                    {level && (
                      <span className="rounded-full bg-cream border border-border px-2 py-0.5 text-[11.5px] text-ink-soft">{level}</span>
                    )}
                  </div>
                  {detail && <p className="mt-1 text-[12.5px] text-muted leading-snug">{detail}</p>}
                </div>
                <RowMenu pending={pending} onEdit={() => { setError(null); setEditing(i); }} onDelete={() => remove(i)} />
              </li>
            );
          })}
        </ul>
      )}

      {editing !== null && (
        <LanguageForm
          key={editing}
          initial={editing >= 0 ? parseLanguage(items[editing]) : emptyLanguage()}
          isEdit={editing >= 0}
          taken={taken.filter((_, i) => i !== editing)}
          pending={pending}
          onSave={save}
          onCancel={items.length > 0 ? () => { setError(null); setEditing(null); } : undefined}
        />
      )}
      {error && <p className="helper text-red-600 mt-2">{error}</p>}
    </SectionCard>
  );
}

function LanguageForm({
  initial, isEdit, taken, pending, onSave, onCancel,
}: {
  initial: LanguageEntry;
  isEdit: boolean;
  taken: string[];
  pending: boolean;
  onSave: (e: LanguageEntry) => void;
  onCancel?: () => void;
}) {
  // An older typed entry ("Somalia", "Swahili") snaps to the list's name.
  const known = initial.name ? canonicalLanguage(initial.name) : null;
  const [choice, setChoice] = useState(initial.name ? (known ?? OTHER) : "");
  const [otherName, setOtherName] = useState(known ? "" : initial.name);
  const [level, setLevel] = useState(initial.level);
  const [skills, setSkills] = useState({ speaking: initial.speaking, reading: initial.reading, writing: initial.writing });
  const [showSkills, setShowSkills] = useState(Boolean(initial.speaking || initial.reading || initial.writing));

  const name = choice === OTHER ? cleanLanguageName(otherName) : choice;
  const avail = (list: string[]) => list.filter((l) => l === choice || !taken.includes(l.toLowerCase()));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    onSave({ name, level, ...(showSkills ? skills : { speaking: "", reading: "", writing: "" }) });
  }

  return (
    <NewItemPanel title={isEdit ? "Edit language" : "Add a language"}>
      <form onSubmit={submit} className="space-y-4" noValidate>
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
              <input
                className={CONTROL}
                value={otherName}
                maxLength={60}
                autoFocus={!isEdit}
                placeholder="e.g. Kirundi"
                onChange={(e) => setOtherName(e.target.value)}
              />
            </label>
          )}
        </div>

        <fieldset>
          <legend className="label">Overall level <span className="font-normal text-muted">(optional)</span></legend>
          <div className="flex flex-wrap gap-2" role="radiogroup">
            {LANGUAGE_LEVELS.map((l) => {
              const on = level === l;
              return (
                <button
                  key={l}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setLevel(on ? "" : l)}
                  className={cn(
                    "rounded-full border px-3.5 min-h-[40px] text-[13.5px] transition",
                    on ? "border-ink bg-ink text-paper" : "border-border bg-paper text-ink-soft hover:border-muted",
                  )}
                >
                  {l}
                </button>
              );
            })}
          </div>
          {level && !LANGUAGE_LEVELS.includes(level as (typeof LANGUAGE_LEVELS)[number]) && (
            <p className="helper">Currently “{level}”. Pick a level above to replace it.</p>
          )}
        </fieldset>

        {showSkills ? (
          <fieldset>
            <legend className="label">
              Speaking, reading and writing <span className="font-normal text-muted">(optional)</span>
            </legend>
            {/* Phones: label beside each select, one row per skill. Tablet
                and up: three columns with the label on top. */}
            <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-3">
              {LANGUAGE_SKILLS.map((k) => (
                <label key={k} className="grid grid-cols-[72px_1fr] items-center gap-2 sm:block">
                  <span className="text-[13px] sm:text-[12px] text-ink-soft sm:text-muted sm:block sm:mb-1">{skillLabel(k)}</span>
                  <select
                    className={CONTROL}
                    value={skills[k]}
                    onChange={(e) => setSkills((s) => ({ ...s, [k]: e.target.value }))}
                  >
                    <option value="">Not specified</option>
                    {LANGUAGE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    {skills[k] && !LANGUAGE_LEVELS.includes(skills[k] as (typeof LANGUAGE_LEVELS)[number]) && (
                      <option value={skills[k]}>{skills[k]}</option>
                    )}
                  </select>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <button
            type="button"
            onClick={() => setShowSkills(true)}
            className="text-[13px] font-medium text-sienna hover:underline min-h-[36px]"
          >
            + Add speaking, reading and writing levels
          </button>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
          {onCancel && <Button type="button" kind="ghost" size="md" className="w-full sm:w-auto" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" kind="primary" size="md" className="w-full sm:w-auto" disabled={pending || !name}>
            {isEdit ? "Save language" : "Add language"}
          </Button>
        </div>
      </form>
    </NewItemPanel>
  );
}
