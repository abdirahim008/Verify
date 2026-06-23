"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field } from "../SectionCard";
import { MediaUploader } from "../MediaUploader";
import { companyBasicsSchema, type CompanyBasicsValues } from "@/lib/schemas";
import { saveCompanyBasics, setCompanyLogoUrl } from "@/lib/actions/company";

interface Props { initial: CompanyBasicsValues & { hasRow: boolean } }

export function CompanyBasicsCard({ initial }: Props) {
  const [editing, setEditing] = useState(!initial.hasRow);
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [locations, setLocations] = useState<string[]>(initial.locations ?? []);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CompanyBasicsValues>({
    resolver: zodResolver(companyBasicsSchema),
    defaultValues: {
      company_name: initial.company_name ?? "",
      logo_url: initial.logo_url ?? "",
      tagline: initial.tagline ?? "",
      cover_statement: initial.cover_statement ?? "",
      locations: initial.locations ?? [],
      country: initial.country ?? "",
      registration_number: initial.registration_number ?? "",
      registration_country: initial.registration_country ?? "",
      founded_year: initial.founded_year ?? "",
      staff_count: initial.staff_count ?? "",
      countries_count: initial.countries_count ?? "",
      projects_count: initial.projects_count ?? "",
      website: initial.website ?? "",
      email: initial.email ?? "",
      phone: initial.phone ?? "",
    },
  });

  function onSubmit(values: CompanyBasicsValues) {
    setServerError(null);
    startTransition(async () => {
      try { await saveCompanyBasics({ ...values, locations }); setEditing(false); }
      catch (e) { setServerError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  return (
    <SectionCard
      eyebrow="Section 1"
      title="Basics"
      description="Cover, positioning, registration, offices, and the headline numbers — the front of every company profile."
      required
      defaultOpen={!initial.hasRow || !initial.company_name}
    >
      <div className="mb-5">
        <p className="label">Company logo</p>
        <MediaUploader kind="logo" currentUrl={initial.logo_url || null} onSave={setCompanyLogoUrl} />
      </div>

      {!editing ? (
        <Display initial={{ ...initial, locations }} onEdit={() => setEditing(true)} />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2">
            <Field label="Company name" error={errors.company_name?.message}>
              <input className="field" autoComplete="organization" {...register("company_name")} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Positioning line" error={errors.tagline?.message} hint="Short descriptor under the name, e.g. “Infrastructure & Development Advisory”.">
              <input className="field" {...register("tagline")} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Cover statement" error={errors.cover_statement?.message} hint="One sentence shown on the cover.">
              <textarea className="field min-h-[60px]" rows={2} {...register("cover_statement")} />
            </Field>
          </div>

          <Field label="Country of operation" error={errors.country?.message}>
            <input className="field" placeholder="e.g. Somalia" {...register("country")} />
          </Field>
          <Field label="Founded (year)" error={errors.founded_year?.message}>
            <input type="number" min={1800} max={2100} className="field" {...register("founded_year")} />
          </Field>
          <Field label="Registration number" error={errors.registration_number?.message}>
            <input className="field" placeholder="e.g. MOG-2012-04419" {...register("registration_number")} />
          </Field>
          <Field label="Registration country" error={errors.registration_country?.message}>
            <input className="field" placeholder="e.g. Somalia" {...register("registration_country")} />
          </Field>
          <Field label="Website" error={errors.website?.message}>
            <input className="field" placeholder="example.so" {...register("website")} />
          </Field>
          <input type="hidden" {...register("logo_url")} />
          <Field label="Public email" error={errors.email?.message}>
            <input type="email" className="field" {...register("email")} />
          </Field>
          <Field label="Public phone" error={errors.phone?.message}>
            <input type="tel" className="field" {...register("phone")} />
          </Field>

          <div className="sm:col-span-2">
            <Chips label="Office locations" items={locations} onChange={setLocations} placeholder="e.g. Mogadishu" />
          </div>

          <div className="sm:col-span-2">
            <p className="label">At a glance</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Staff" error={errors.staff_count?.message}>
                <input type="number" min={0} className="field" placeholder="120" {...register("staff_count")} />
              </Field>
              <Field label="Countries" error={errors.countries_count?.message}>
                <input type="number" min={0} className="field" placeholder="7" {...register("countries_count")} />
              </Field>
              <Field label="Projects" error={errors.projects_count?.message}>
                <input type="number" min={0} className="field" placeholder="240" {...register("projects_count")} />
              </Field>
            </div>
          </div>

          {serverError && (
            <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>
          )}
          <div className="sm:col-span-2 flex justify-end gap-2">
            {initial.hasRow && (
              <Button type="button" kind="ghost" size="md" onClick={() => { reset(); setLocations(initial.locations ?? []); setEditing(false); }} disabled={pending}>Cancel</Button>
            )}
            <Button type="submit" kind="primary" size="md" disabled={pending}>
              {pending ? "Saving..." : "Save basics"}
            </Button>
          </div>
        </form>
      )}
    </SectionCard>
  );
}

// Simple add/remove chip editor for a string array (local — saved with the form).
function Chips({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (next: string[]) => void; placeholder: string }) {
  const [value, setValue] = useState("");
  function add(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v || items.some((s) => s.toLowerCase() === v.toLowerCase())) { setValue(""); return; }
    onChange([...items, v]); setValue("");
  }
  return (
    <div>
      <p className="label">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {items.map((s) => (
          <li key={s} className="inline-flex items-center gap-1 rounded-full bg-cream border border-border px-3 py-1 text-[13px] text-ink-soft">
            {s}
            <button type="button" aria-label={`Remove ${s}`} onClick={() => onChange(items.filter((x) => x !== s))} className="ml-1 text-muted hover:text-red-700">×</button>
          </li>
        ))}
        {items.length === 0 && <li className="text-[13px] text-muted">None yet.</li>}
      </ul>
      <div className="mt-3 flex gap-2">
        <input className="field flex-1" placeholder={placeholder} maxLength={80} value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(e); }} />
        <Button type="button" kind="secondary" size="md" disabled={!value.trim()} onClick={add}>Add</Button>
      </div>
    </div>
  );
}

function Display({ initial, onEdit }: { initial: Props["initial"]; onEdit: () => void }) {
  if (!initial.company_name) {
    return (
      <div className="text-[13.5px] text-muted">
        <p>Nothing yet. Add your legal name to start the company profile.</p>
        <Button kind="primary" size="sm" className="mt-3" onClick={onEdit}>Add basics</Button>
      </div>
    );
  }
  const summaryBits = [initial.country, initial.founded_year && `Founded ${initial.founded_year}`, initial.registration_number].filter(Boolean);
  const stats = [
    initial.staff_count && `${initial.staff_count} staff`,
    initial.countries_count && `${initial.countries_count} countries`,
    initial.projects_count && `${initial.projects_count} projects`,
  ].filter(Boolean);
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="font-serif text-[22px] tracking-tightish">{initial.company_name}</div>
        {initial.tagline && <div className="text-[13px] text-sienna mt-0.5">{initial.tagline}</div>}
        {summaryBits.length > 0 && <div className="text-[13px] text-ink-soft mt-1">{summaryBits.join(" · ")}</div>}
        {initial.locations.length > 0 && <div className="text-[13px] text-muted mt-1">{initial.locations.join(" · ")}</div>}
        {stats.length > 0 && <div className="text-[13px] text-muted mt-1">{stats.join(" · ")}</div>}
        {(initial.website || initial.email || initial.phone) && (
          <div className="text-[13px] text-muted mt-2">{[initial.website, initial.email, initial.phone].filter(Boolean).join(" · ")}</div>
        )}
      </div>
      <Button kind="ghost" size="sm" onClick={onEdit}>Edit</Button>
    </div>
  );
}
