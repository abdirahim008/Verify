"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { SectionCard } from "../SectionCard";
import { saveCompanySectors } from "@/lib/actions/company";
import { SECTOR_SUGGESTIONS } from "@/lib/company-sectors";

// Sectors are a string array on company_details. (Detailed services with
// descriptions live in the separate Services card / company_services table.)
export function CompanyOfferingsCard({ initial }: { initial: { sectors: string[] } }) {
  const [sectors, setSectors] = useState(initial.sectors);

  return (
    <SectionCard
      eyebrow="Section 3"
      title="Sectors"
      description="The sectors you operate in. Rendered as a tidy list on the profile."
      defaultOpen={initial.sectors.length === 0}
      count={sectors.length}
    >
      <ChipList
        label="Sectors"
        items={sectors}
        placeholder="e.g. Roads & bridges"
        suggestions={SECTOR_SUGGESTIONS}
        onChange={async (next) => {
          const prev = sectors;
          setSectors(next);
          try { await saveCompanySectors(next); }
          catch { setSectors(prev); }
        }}
      />
    </SectionCard>
  );
}

function ChipList({
  label, items, placeholder, onChange, suggestions = [],
}: {
  label: string;
  items: string[];
  placeholder: string;
  onChange: (next: string[]) => void;
  suggestions?: string[];
}) {
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const has = (v: string) => items.some((s) => s.toLowerCase() === v.toLowerCase());

  function addValue(raw: string) {
    const v = raw.trim();
    if (!v) return;
    if (has(v)) { setError("Already added."); return; }
    setError(null);
    startTransition(() => { onChange([...items, v]); });
    setValue("");
  }
  function addFromInput(e: React.FormEvent) {
    e.preventDefault();
    addValue(value);
  }
  function remove(s: string) {
    startTransition(() => { onChange(items.filter((x) => x !== s)); });
  }

  // Only offer suggestions the user hasn't already picked.
  const available = suggestions.filter((s) => !has(s));

  return (
    <div>
      <p className="label">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {items.map((s) => (
          <li key={s} className="inline-flex items-center gap-1 rounded-full bg-cream border border-border px-3 py-1 text-[13px] text-ink-soft">
            {s}
            <button type="button" aria-label={`Remove ${s}`} onClick={() => remove(s)} className="ml-1 text-muted hover:text-red-700">×</button>
          </li>
        ))}
        {items.length === 0 && <li className="text-[13px] text-muted">None yet.</li>}
      </ul>

      {available.length > 0 && (
        <div className="mt-3">
          <p className="helper text-muted mb-1.5">Suggestions — tap to add</p>
          <ul className="flex flex-wrap gap-2">
            {available.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => addValue(s)}
                  disabled={pending}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-border bg-cream/40 px-3 py-1 text-[13px] text-ink-soft hover:border-ink/40 hover:bg-cream transition disabled:opacity-50"
                >
                  <span aria-hidden className="text-muted">+</span>{s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={addFromInput} className="mt-3 flex gap-2">
        <input className="field flex-1" placeholder={placeholder} maxLength={80} value={value} onChange={(e) => { setValue(e.target.value); setError(null); }} />
        <Button type="submit" kind="primary" size="md" disabled={pending || !value.trim()}>Add</Button>
      </form>
      {error && <p className="helper text-red-600 mt-1">{error}</p>}
    </div>
  );
}
