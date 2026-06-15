"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field, NewItemPanel, IconButton } from "../SectionCard";
import { CheckDot, HollowDot, CapIcon, CalendarIcon, PencilIcon, TrashIcon } from "../icons";
import { RequestVerifyButton } from "@/components/verification/RequestVerifyButton";
import { educationSchema, type EducationValues } from "@/lib/schemas";
import { addEducation, updateEducation, deleteEducation } from "@/lib/actions/profile";
import { QUALIFICATION_LABELS, yearRange, type QualLevel } from "@/lib/format";

interface EducationRow {
  id: string;
  institution: string;
  qualification_level: QualLevel;
  field_of_study: string | null;
  start_year: number | null;
  end_year: number | null;
  verified: boolean;
  verified_note: string | null;
}

export function EducationCard({ items, pendingIds }: { items: EducationRow[]; pendingIds: Set<string> }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addButton = <Button kind="primary" size="sm" onClick={() => setAdding(true)}>+ Add education</Button>;

  return (
    <SectionCard
      eyebrow="Section 3"
      title="Education"
      metaNoun="qualification"
      description="Degrees, diplomas, and formal qualifications."
      required
      defaultOpen={items.length === 0}
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
                  <EducationForm
                    initial={item}
                    onSubmit={(v) => updateEducation(item.id, v)}
                    onCancel={() => setEditingId(null)}
                    onDone={() => setEditingId(null)}
                    submitLabel="Save changes"
                  />
                </div>
              ) : (
                <EducationRowDisplay key={item.id} item={item} pending={pendingIds.has(item.id)} onEdit={() => setEditingId(item.id)} />
              ),
            )}
          </div>
        </div>
      )}

      {items.length === 0 && !adding && (
        <p className="text-[13.5px] text-muted">No education yet. Add your highest qualification first.</p>
      )}

      {adding && (
        <EducationForm onSubmit={addEducation} onCancel={() => setAdding(false)} onDone={() => setAdding(false)} submitLabel="Save education" asPanel />
      )}
    </SectionCard>
  );
}

function EducationRowDisplay({ item, pending: pendingVerify, onEdit }: { item: EducationRow; pending: boolean; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  const qualLabel = QUALIFICATION_LABELS[item.qualification_level];
  const dateStr = yearRange(item.start_year, item.end_year);
  return (
    <article className="relative pl-9">
      <span className="absolute left-0 top-0.5">{item.verified ? <CheckDot /> : <HollowDot />}</span>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-[18px] tracking-tightish">{qualLabel}{item.field_of_study ? ` · ${item.field_of_study}` : ""}</h3>
            <RequestVerifyButton
              verified={item.verified} verifiedNote={item.verified_note}
              pending={pendingVerify}
              target={{
                type: "education", id: item.id,
                label: `${qualLabel}${item.field_of_study ? ` · ${item.field_of_study}` : ""}`,
                sublabel: [item.institution, dateStr].filter(Boolean).join(" · "),
              }}
            />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px]">
            <span className="inline-flex items-center gap-1.5 text-sienna font-medium">
              <CapIcon size={13} className="text-sienna/70" />{item.institution}
            </span>
            {dateStr && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream border border-border px-2.5 py-1 text-ink-soft">
                <CalendarIcon size={12} className="text-muted" />{dateStr}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-0.5 shrink-0">
          <IconButton label="Edit" onClick={onEdit}><PencilIcon size={15} /></IconButton>
          <IconButton label="Delete" danger disabled={pending}
            onClick={() => { if (confirm("Delete this education?")) startTransition(() => { void deleteEducation(item.id); }); }}>
            <TrashIcon size={15} />
          </IconButton>
        </div>
      </div>
    </article>
  );
}

function EducationForm({
  initial, onSubmit, onCancel, onDone, submitLabel, asPanel,
}: {
  initial?: EducationRow;
  onSubmit: (values: EducationValues) => Promise<void>;
  onCancel: () => void;
  onDone: () => void;
  submitLabel: string;
  asPanel?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<EducationValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: initial?.institution ?? "",
      qualification_level: initial?.qualification_level ?? "degree",
      field_of_study: initial?.field_of_study ?? "",
      start_year: initial?.start_year != null ? String(initial.start_year) : "",
      end_year: initial?.end_year != null ? String(initial.end_year) : "",
    },
  });

  function submit(values: EducationValues) {
    setServerError(null);
    startTransition(async () => {
      try { await onSubmit(values); onDone(); }
      catch (e) { setServerError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  const body = (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Field label="Institution" error={errors.institution?.message}>
        <input className="field" placeholder="e.g. London School of Hygiene & Tropical Medicine" {...register("institution")} />
      </Field>
      <Field label="Qualification" error={errors.qualification_level?.message}>
        <select className="field" {...register("qualification_level")}>
          {Object.entries(QUALIFICATION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </Field>
      <Field label="Field of study" error={errors.field_of_study?.message}>
        <input className="field" placeholder="e.g. Public Health" {...register("field_of_study")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start year" error={errors.start_year?.message}>
          <input type="number" min={1900} max={2100} className="field" {...register("start_year")} />
        </Field>
        <Field label="End year" error={errors.end_year?.message}>
          <input type="number" min={1900} max={2100} className="field" {...register("end_year")} />
        </Field>
      </div>
      {serverError && (
        <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>
      )}
      <div className="sm:col-span-2 flex justify-end gap-2">
        <Button type="button" kind="ghost" size="md" onClick={onCancel} disabled={pending}>Cancel</Button>
        <Button type="submit" kind="primary" size="md" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );

  return asPanel ? <NewItemPanel title="New education">{body}</NewItemPanel> : (
    <div className="rounded-[10px] border border-sienna/40 bg-sienna-soft/40 p-4 sm:p-5">{body}</div>
  );
}
