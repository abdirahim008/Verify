"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field, NewItemPanel } from "../SectionCard";
import { RowMenu } from "../RowMenu";
import { CheckDot, HollowDot } from "../icons";
import { FEATURES } from "@/lib/flags";
import { RequestVerifyButton } from "@/components/verification/RequestVerifyButton";
import { certificationSchema, type CertificationValues } from "@/lib/schemas";
import { addCertification, updateCertification, deleteCertification } from "@/lib/actions/profile";

interface CertRow {
  id: string; name: string; issuer: string | null; year: number | null;
  verified: boolean; verified_note: string | null;
}

export function CertificationsCard({ items, pendingIds }: { items: CertRow[]; pendingIds: Set<string> }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addButton = <Button kind="primary" size="sm" onClick={() => setAdding(true)}>+ Add certification</Button>;

  return (
    <SectionCard
      eyebrow="Section 5"
      title="Certifications"
      metaNoun="certification"
      description="Issued credentials with an issuer and year."
      defaultOpen={false}
      count={items.length}
      headerAction={!adding ? addButton : undefined}
    >
      {items.length > 0 && (
        <div className="relative">
          <span className="absolute left-[10px] top-2 bottom-2 w-px bg-border" aria-hidden />
          <div className="space-y-5">
            {items.map((item) =>
              editingId === item.id ? (
                <div key={item.id} className="pl-9">
                  <CertForm
                    initial={item}
                    onSubmit={(v) => updateCertification(item.id, v)}
                    onCancel={() => setEditingId(null)}
                    onDone={() => setEditingId(null)}
                    submitLabel="Save changes"
                  />
                </div>
              ) : (
                <CertRowDisplay key={item.id} item={item} pending={pendingIds.has(item.id)} onEdit={() => setEditingId(item.id)} />
              ),
            )}
          </div>
        </div>
      )}

      {items.length === 0 && !adding && (
        <p className="text-[13.5px] text-muted">No certifications yet.</p>
      )}

      {adding && (
        <CertForm onSubmit={addCertification} onCancel={() => setAdding(false)} onDone={() => setAdding(false)} submitLabel="Save certification" asPanel />
      )}
    </SectionCard>
  );
}

function CertRowDisplay({ item, pending: pendingVerify, onEdit }: { item: CertRow; pending: boolean; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <article className="relative pl-9">
      <span className="absolute left-0 top-0.5">{FEATURES.verification && item.verified ? <CheckDot /> : <HollowDot />}</span>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-[17px] tracking-tightish">{item.name}</h3>
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
          {(item.issuer || item.year) && (
            <div className="text-[12.5px] text-ink-soft mt-1.5">
              {[item.issuer, item.year].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
        <RowMenu onEdit={onEdit} pending={pending}
          onDelete={() => { if (confirm("Delete this certification?")) startTransition(() => { void deleteCertification(item.id); }); }} />
      </div>
    </article>
  );
}

function CertForm({
  initial, onSubmit, onCancel, onDone, submitLabel, asPanel,
}: {
  initial?: CertRow;
  onSubmit: (values: CertificationValues) => Promise<void>;
  onCancel: () => void;
  onDone: () => void;
  submitLabel: string;
  asPanel?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<CertificationValues>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      name: initial?.name ?? "",
      issuer: initial?.issuer ?? "",
      year: initial?.year != null ? String(initial.year) : "",
    },
  });

  function submit(values: CertificationValues) {
    setServerError(null);
    startTransition(async () => {
      try { await onSubmit(values); onDone(); }
      catch (e) { setServerError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  const body = (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-3" noValidate>
      <div className="sm:col-span-2">
        <Field label="Certification name" error={errors.name?.message}>
          <input className="field" placeholder="e.g. PMD Pro Level 1" {...register("name")} />
        </Field>
      </div>
      <Field label="Year" error={errors.year?.message}>
        <input type="number" min={1900} max={2100} className="field" {...register("year")} />
      </Field>
      <div className="sm:col-span-3">
        <Field label="Issuer" error={errors.issuer?.message}>
          <input className="field" placeholder="e.g. PM4NGOs" {...register("issuer")} />
        </Field>
      </div>
      {serverError && (
        <div className="sm:col-span-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>
      )}
      <div className="sm:col-span-3 flex justify-end gap-2">
        <Button type="button" kind="ghost" size="md" onClick={onCancel} disabled={pending}>Cancel</Button>
        <Button type="submit" kind="primary" size="md" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );

  return asPanel ? <NewItemPanel title="New certification">{body}</NewItemPanel> : (
    <div className="rounded-[10px] border border-sienna/40 bg-sienna-soft/40 p-4 sm:p-5">{body}</div>
  );
}
