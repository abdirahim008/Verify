"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { SectionCard } from "../SectionCard";
import { saveCompanySectors } from "@/lib/actions/company";

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
  label, items, placeholder, onChange,
}: { label: string; items: string[]; placeholder: string; onChange: (next: string[]) => void }) {
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    if (items.some((s) => s.toLowerCase() === v.toLowerCase())) { setError("Already added."); return; }
    setError(null);
    startTransition(() => { onChange([...items, v]); setValue(""); });
  }
  function remove(s: string) {
    startTransition(() => { onChange(items.filter((x) => x !== s)); });
  }

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
      <form onSubmit={add} className="mt-3 flex gap-2">
        <input className="field flex-1" placeholder={placeholder} maxLength={80} value={value} onChange={(e) => { setValue(e.target.value); setError(null); }} />
        <Button type="submit" kind="primary" size="md" disabled={pending || !value.trim()}>Add</Button>
      </form>
      {error && <p className="helper text-red-600 mt-1">{error}</p>}
    </div>
  );
}
