"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { SectionCard } from "../SectionCard";
import { addSkill, deleteSkill } from "@/lib/actions/profile";

interface SkillRow { id: string; name: string }

export function SkillsCard({ items }: { items: SkillRow[] }) {
  // Optimistic local copy: the card owns the immediate update so adds/removes
  // feel instant. New rows use a temporary id until the server returns the real
  // one (reconciled below); errors roll back.
  const [rows, setRows] = useState<SkillRow[]>(items);
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = value.trim();
    if (!name) return;
    if (rows.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setError("You already have that skill."); return;
    }
    setError(null);
    const tempId = `temp:${name}`;
    setRows((cur) => [...cur, { id: tempId, name }]);
    setValue("");
    startTransition(async () => {
      try {
        const { id } = await addSkill(name);
        setRows((cur) => cur.map((r) => (r.id === tempId ? { id, name } : r)));
      } catch (e) {
        setRows((cur) => cur.filter((r) => r.id !== tempId)); // rollback
        setError(e instanceof Error ? e.message : "Couldn't save");
      }
    });
  }

  function remove(id: string) {
    const prev = rows;
    setRows((cur) => cur.filter((r) => r.id !== id));
    startTransition(async () => {
      try { await deleteSkill(id); }
      catch { setRows(prev); } // rollback
    });
  }

  return (
    <SectionCard
      eyebrow="Section 4"
      title="Skills"
      metaNoun="skill"
      description="Short labels — software, methods, languages of work. Aim for 6–12."
      required
      defaultOpen={items.length < 3}
      count={rows.length}
    >
      <ul className="flex flex-wrap gap-1.5">
        {rows.map((s) => (
          <li key={s.id} className="group inline-flex items-center gap-1.5 rounded-full bg-cream/70 border border-border-soft pl-3 pr-1.5 py-1 text-[12.5px] text-ink-soft transition hover:border-border">
            {s.name}
            <button
              type="button"
              aria-label={`Remove ${s.name}`}
              onClick={() => remove(s.id)}
              className="w-4 h-4 rounded-full flex items-center justify-center text-[14px] leading-none text-muted/70 hover:bg-red-50 hover:text-red-600 transition"
            >×</button>
          </li>
        ))}
        {rows.length === 0 && <li className="text-[13.5px] text-muted">No skills yet.</li>}
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
