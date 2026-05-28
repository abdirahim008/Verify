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
  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<CompanyBasicsValues>({
    resolver: zodResolver(companyBasicsSchema),
    defaultValues: {
      company_name: initial.company_name ?? "",
      logo_url: initial.logo_url ?? "",
      country: initial.country ?? "",
      registration_number: initial.registration_number ?? "",
      registration_country: initial.registration_country ?? "",
      founded_year: initial.founded_year ?? "",
      website: initial.website ?? "",
      email: initial.email ?? "",
      phone: initial.phone ?? "",
    },
  });

  function onSubmit(values: CompanyBasicsValues) {
    setServerError(null);
    startTransition(async () => {
      try { await saveCompanyBasics(values); reset(values); setEditing(false); }
      catch (e) { setServerError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  return (
    <SectionCard
      eyebrow="Section 1"
      title="Basics"
      description="Legal name, registration, year founded — the cover of every company profile."
      required
      defaultOpen={!initial.hasRow || !initial.company_name}
    >
      <div className="mb-5">
        <p className="label">Company logo</p>
        <MediaUploader kind="logo" currentUrl={initial.logo_url || null} onSave={setCompanyLogoUrl} />
      </div>

      {!editing ? (
        <Display initial={initial} onEdit={() => setEditing(true)} />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2">
            <Field label="Company name" error={errors.company_name?.message}>
              <input className="field" autoComplete="organization" {...register("company_name")} />
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
          {/* logo_url is hidden — the uploader above is the canonical
              way to set it. The hidden input keeps the form values
              shape consistent with the schema. */}
          <input type="hidden" {...register("logo_url")} />
          <Field label="Public email" error={errors.email?.message}>
            <input type="email" className="field" {...register("email")} />
          </Field>
          <Field label="Public phone" error={errors.phone?.message}>
            <input type="tel" className="field" {...register("phone")} />
          </Field>

          {serverError && (
            <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>
          )}
          <div className="sm:col-span-2 flex justify-end gap-2">
            {initial.hasRow && (
              <Button type="button" kind="ghost" size="md" onClick={() => { reset(); setEditing(false); }} disabled={pending}>Cancel</Button>
            )}
            <Button type="submit" kind="primary" size="md" disabled={pending || !isDirty}>
              {pending ? "Saving..." : "Save basics"}
            </Button>
          </div>
        </form>
      )}
    </SectionCard>
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
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="font-serif text-[22px] tracking-tightish">{initial.company_name}</div>
        {summaryBits.length > 0 && <div className="text-[13px] text-ink-soft mt-1">{summaryBits.join(" · ")}</div>}
        {(initial.website || initial.email || initial.phone) && (
          <div className="text-[13px] text-muted mt-2">{[initial.website, initial.email, initial.phone].filter(Boolean).join(" · ")}</div>
        )}
      </div>
      <Button kind="ghost" size="sm" onClick={onEdit}>Edit</Button>
    </div>
  );
}
