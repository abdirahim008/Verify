"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { SectionCard } from "../SectionCard";
import { addSkill, deleteSkill } from "@/lib/actions/profile";

interface SkillRow { id: string; name: string }

export function SkillsCard({ items }: { items: SkillRow[] }) {
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = value.trim();
    if (!name) return;
    if (items.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setError("You already have that skill."); return;
    }
    setError(null);
    startTransition(async () => {
      try { await addSkill(name); setValue(""); }
      catch (e) { setError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  function remove(id: string) {
    startTransition(() => { void deleteSkill(id); });
  }

  return (
    <SectionCard
      eyebrow="Section 4"
      title="Skills"
      metaNoun="skill"
      description="Short labels — software, methods, languages of work. Aim for 6–12."
      required
      defaultOpen={items.length < 3}
      count={items.length}
    >
      <ul className="flex flex-wrap gap-2">
        {items.map((s) => (
          <li key={s.id} className="inline-flex items-center gap-1 rounded-full bg-cream border border-border px-3 py-1 text-[13px] text-ink-soft">
            {s.name}
            <button
              type="button"
              aria-label={`Remove ${s.name}`}
              onClick={() => remove(s.id)}
              className="ml-1 text-muted hover:text-red-700"
            >×</button>
          </li>
        ))}
        {items.length === 0 && <li className="text-[13.5px] text-muted">No skills yet.</li>}
      </ul>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          className="field flex-1"
          placeholder="e.g. Cold-chain logistics"
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
