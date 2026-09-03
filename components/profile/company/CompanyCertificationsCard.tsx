"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field, NewItemPanel } from "../SectionCard";
import { RequestVerifyButton } from "@/components/verification/RequestVerifyButton";
import { companyCertificationSchema, type CompanyCertificationValues } from "@/lib/schemas";
import { addCompanyCertification, updateCompanyCertification, deleteCompanyCertification } from "@/lib/actions/company";
import { YearSelect } from "../DateSelect";
import { CERTIFICATION_YEARS } from "@/lib/dates";

interface CertRow {
  id: string; name: string; issuer: string | null; year: number | null;
  verified: boolean; verified_note: string | null;
}

export function CompanyCertificationsCard({ items, pendingIds }: { items: CertRow[]; pendingIds: Set<string> }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <SectionCard
      eyebrow="Section 7"
      title="Accreditations"
      description="ISO, FIDIC, sector certifications — issuer and year."
      defaultOpen={false}
      count={items.length}
    >
      <div className="space-y-3">
        {items.map((item) =>
          editingId === item.id ? (
            <CertForm
              key={item.id}
              initial={item}
              onSubmit={(v) => updateCompanyCertification(item.id, v)}
              onCancel={() => setEditingId(null)}
              onDone={() => setEditingId(null)}
              submitLabel="Save changes"
            />
          ) : (
            <CertRowDisplay key={item.id} item={item} pending={pendingIds.has(item.id)} onEdit={() => setEditingId(item.id)} />
          ),
        )}
      </div>

      {items.length === 0 && !adding && (
        <p className="text-[13.5px] text-muted">No accreditations yet.</p>
      )}

      {adding ? (
        <CertForm onSubmit={addCompanyCertification} onCancel={() => setAdding(false)} onDone={() => setAdding(false)} submitLabel="Save accreditation" asPanel />
      ) : (
        <div className="mt-4">
          <Button kind="quiet" size="md" onClick={() => setAdding(true)}>+ Add accreditation</Button>
        </div>
      )}
    </SectionCard>
  );
}

function CertRowDisplay({ item, pending: pendingVerify, onEdit }: { item: CertRow; pending: boolean; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <article className="rounded-[10px] border border-border bg-paper p-4 flex items-start justify-between gap-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-serif text-[16px] tracking-tightish">{item.name}</h3>
          <RequestVerifyButton
            verified={item.verified} verifiedNote={item.verified_note}
            pending={pendingVerify}
            target={{
              type: "certification", id: item.id,
              label: item.name,
              sublabel: [item.issuer, item.year].filter(Boolean).join(" · "),
            }}
          />
        </div>
        <div className="text-[13px] text-ink-soft mt-1">{[item.issuer, item.year].filter(Boolean).join(" · ")}</div>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button kind="ghost" size="sm" onClick={onEdit}>Edit</Button>
        <Button kind="ghost" size="sm" disabled={pending}
          onClick={() => { if (confirm("Delete this accreditation?")) startTransition(() => { void deleteCompanyCertification(item.id); }); }}
          className="text-red-700 hover:bg-red-50">
          {pending ? "..." : "Delete"}
        </Button>
      </div>
    </article>
  );
}

function CertForm({
  initial, onSubmit, onCancel, onDone, submitLabel, asPanel,
}: {
  initial?: CertRow;
  onSubmit: (values: CompanyCertificationValues) => Promise<void>;
  onCancel: () => void; onDone: () => void;
  submitLabel: string; asPanel?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyCertificationValues>({
    resolver: zodResolver(companyCertificationSchema),
    defaultValues: {
      name: initial?.name ?? "",
      issuer: initial?.issuer ?? "",
      year: initial?.year != null ? String(initial.year) : "",
    },
  });

  function submit(values: CompanyCertificationValues) {
    setServerError(null);
    startTransition(async () => {
      try { await onSubmit(values); onDone(); }
      catch (e) { setServerError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  const body = (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-3" noValidate>
      <div className="sm:col-span-2">
        <Field label="Accreditation name" error={errors.name?.message}>
          <input className="field" placeholder="e.g. ISO 9001:2015" {...register("name")} />
        </Field>
      </div>
      <Field label="Year" error={errors.year?.message}>
        <YearSelect years={CERTIFICATION_YEARS} {...register("year")} />
      </Field>
      <div className="sm:col-span-3">
        <Field label="Issuer" error={errors.issuer?.message}>
          <input className="field" placeholder="e.g. Bureau Veritas" {...register("issuer")} />
        </Field>
      </div>
      {serverError && <div className="sm:col-span-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>}
      <div className="sm:col-span-3 flex justify-end gap-2">
        <Button type="button" kind="ghost" size="md" onClick={onCancel} disabled={pending}>Cancel</Button>
        <Button type="submit" kind="primary" size="md" disabled={pending}>{pending ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );

  return asPanel ? <NewItemPanel title="New accreditation">{body}</NewItemPanel> : (
    <div className="rounded-[10px] border border-sienna/40 bg-sienna-soft/40 p-4 sm:p-5">{body}</div>
  );
}
