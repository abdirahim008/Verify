"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { SectionCard } from "../SectionCard";
import { saveCompanyOfferings } from "@/lib/actions/company";

// Sectors + core_services are both string arrays on company_details. Single
// card with two chip lists.
export function CompanyOfferingsCard({ initial }: { initial: { sectors: string[]; core_services: string[] } }) {
  const [sectors, setSectors] = useState(initial.sectors);
  const [services, setServices] = useState(initial.core_services);

  return (
    <SectionCard
      eyebrow="Section 3"
      title="Sectors & core services"
      description="What you operate in (sectors) and what you actually do (services). Both render side-by-side on the PDF."
      defaultOpen={initial.sectors.length === 0 && initial.core_services.length === 0}
      count={sectors.length + services.length}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <ChipList
          label="Sectors"
          items={sectors}
          placeholder="e.g. Roads & bridges"
          onChange={async (next) => {
            const prev = sectors;
            setSectors(next);
            try { await saveCompanyOfferings({ sectors: next, core_services: services }); }
            catch { setSectors(prev); }
          }}
        />
        <ChipList
          label="Core services"
          items={services}
          placeholder="e.g. Design & feasibility studies"
          onChange={async (next) => {
            const prev = services;
            setServices(next);
            try { await saveCompanyOfferings({ sectors, core_services: next }); }
            catch { setServices(prev); }
          }}
        />
      </div>
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
