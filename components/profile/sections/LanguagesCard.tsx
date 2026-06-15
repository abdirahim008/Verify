"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { SectionCard } from "../SectionCard";
import { saveLanguages } from "@/lib/actions/profile";

export function LanguagesCard({ initial }: { initial: string[] }) {
  const [items, setItems] = useState(initial);
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    if (items.some((s) => s.toLowerCase() === v.toLowerCase())) {
      setError("Already added."); return;
    }
    setError(null);
    const next = [...items, v];
    setItems(next); setValue("");
    startTransition(async () => {
      try { await saveLanguages({ languages: next }); }
      catch (e) {
        setItems(items); // rollback
        setError(e instanceof Error ? e.message : "Couldn't save");
      }
    });
  }

  function remove(lang: string) {
    const next = items.filter((l) => l !== lang);
    setItems(next);
    startTransition(async () => {
      try { await saveLanguages({ languages: next }); }
      catch { setItems(items); }
    });
  }

  return (
    <SectionCard
      eyebrow="Section 6"
      title="Languages"
      metaNoun="language"
      description="Languages of work. Include proficiency (e.g. Somali (native), English (fluent))."
      defaultOpen={items.length === 0}
      count={items.length}
    >
      <ul className="flex flex-wrap gap-2">
        {items.map((lang) => (
          <li key={lang} className="inline-flex items-center gap-1 rounded-full bg-cream border border-border px-3 py-1 text-[13px] text-ink-soft">
            {lang}
            <button type="button" aria-label={`Remove ${lang}`} onClick={() => remove(lang)} className="ml-1 text-muted hover:text-red-700">×</button>
          </li>
        ))}
        {items.length === 0 && <li className="text-[13.5px] text-muted">No languages yet.</li>}
      </ul>

      <form onSubmit={add} className="mt-4 flex gap-2">
        <input
          className="field flex-1"
          placeholder='e.g. Somali (native)'
          maxLength={80}
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null); }}
        />
        <Button type="submit" kind="primary" size="md" disabled={pending || !value.trim()}>Add</Button>
      </form>
      {error && <p className="helper text-red-600 mt-1">{error}</p>}
    </SectionCard>
  );
}
