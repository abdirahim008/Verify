"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field, NewItemPanel } from "../SectionCard";
import { RequestVerifyButton } from "@/components/verification/RequestVerifyButton";
import { experienceSchema, type ExperienceValues } from "@/lib/schemas";
import {
  addExperience, updateExperience, deleteExperience,
} from "@/lib/actions/profile";
import { dateRange, dateToMonthInput } from "@/lib/format";

interface ExperienceRow {
  id: string;
  organization: string;
  title: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  verified: boolean;
  verified_note: string | null;
}

export function ExperienceCard({ items, pendingIds }: { items: ExperienceRow[]; pendingIds: Set<string> }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <SectionCard
      eyebrow="Section 2"
      title="Experience"
      description="One entry per role. Verified entries get a green check on your CV."
      required
      defaultOpen={items.length === 0}
      count={items.length}
    >
      <div className="space-y-3">
        {items.map((item) => (
          editingId === item.id ? (
            <ExperienceForm
              key={item.id}
              initial={item}
              onSubmit={async (v) => updateExperience(item.id, v)}
              onCancel={() => setEditingId(null)}
              onDone={() => setEditingId(null)}
              submitLabel="Save changes"
            />
          ) : (
            <ExperienceRow key={item.id} item={item} pending={pendingIds.has(item.id)} onEdit={() => setEditingId(item.id)} />
          )
        ))}
      </div>

      {items.length === 0 && !adding && (
        <p className="text-[13.5px] text-muted">No experience yet. Add your most recent role first.</p>
      )}

      {adding ? (
        <ExperienceForm
          onSubmit={addExperience}
          onCancel={() => setAdding(false)}
          onDone={() => setAdding(false)}
          submitLabel="Save experience"
          asPanel
        />
      ) : (
        <div className="mt-4">
          <Button kind="quiet" size="md" onClick={() => setAdding(true)}>+ Add experience</Button>
        </div>
      )}
    </SectionCard>
  );
}

function ExperienceRow({ item, pending: pendingVerify, onEdit }: { item: ExperienceRow; pending: boolean; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  const handleDelete = () => {
    if (!confirm("Delete this experience? This can't be undone.")) return;
    startTransition(() => { void deleteExperience(item.id); });
  };
  const dateStr = dateRange(item.start_date, item.end_date);
  return (
    <article className="rounded-[10px] border border-border bg-paper p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-[18px] tracking-tightish">{item.title}</h3>
            <RequestVerifyButton
              verified={item.verified} verifiedNote={item.verified_note}
              pending={pendingVerify}
              target={{
                type: "experience", id: item.id,
                label: `${item.title}${item.organization ? ` · ${item.organization}` : ""}`,
                sublabel: [item.location, dateStr].filter(Boolean).join(" · "),
              }}
            />
          </div>
          <div className="text-[13px] text-ink-soft mt-1">
            <span className="font-medium">{item.organization}</span>
            {item.location && <> &middot; {item.location}</>}
            {dateStr && (<> &middot; <span className="text-muted">{dateStr}</span></>)}
          </div>
          {item.description && (
            <p className="mt-2 text-[13.5px] text-ink-soft leading-relaxed">{item.description}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <Button kind="ghost" size="sm" onClick={onEdit}>Edit</Button>
          <Button kind="ghost" size="sm" onClick={handleDelete} disabled={pending} className="text-red-700 hover:bg-red-50">
            {pending ? "..." : "Delete"}
          </Button>
        </div>
      </div>
    </article>
  );
}

function ExperienceForm({
  initial, onSubmit, onCancel, onDone, submitLabel, asPanel,
}: {
  initial?: ExperienceRow;
  onSubmit: (values: ExperienceValues) => Promise<void>;
  onCancel: () => void;
  onDone: () => void;
  submitLabel: string;
  asPanel?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const isCurrentInitial = !!initial && !initial.end_date && !!initial.start_date;

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ExperienceValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      organization: initial?.organization ?? "",
      title: initial?.title ?? "",
      location: initial?.location ?? "",
      start_date: dateToMonthInput(initial?.start_date),
      end_date: dateToMonthInput(initial?.end_date),
      description: initial?.description ?? "",
      is_current: isCurrentInitial,
    },
  });
  const isCurrent = watch("is_current");

  function submit(values: ExperienceValues) {
    setServerError(null);
    startTransition(async () => {
      try { await onSubmit(values); onDone(); }
      catch (e) { setServerError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  const body = (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Field label="Job title" error={errors.title?.message}>
        <input className="field" placeholder="e.g. Senior Health Coordinator" {...register("title")} />
      </Field>
      <Field label="Organisation" error={errors.organization?.message}>
        <input className="field" placeholder="e.g. UNICEF Somalia" {...register("organization")} />
      </Field>
      <Field label="Location" error={errors.location?.message}>
        <input className="field" placeholder="e.g. Mogadishu" {...register("location")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start" error={errors.start_date?.message}>
          <input type="month" className="field" {...register("start_date")} />
        </Field>
        <Field label="End" error={errors.end_date?.message}>
          <input type="month" className="field" disabled={isCurrent} {...register("end_date")} />
        </Field>
      </div>
      <label className="sm:col-span-2 flex items-center gap-2 text-[13px] text-ink-soft">
        <input type="checkbox" className="rounded border-border" {...register("is_current")} />
        I currently work here
      </label>
      <div className="sm:col-span-2">
        <Field label="Description" error={errors.description?.message} hint="What did you actually do? Quantify where you can.">
          <textarea rows={4} className="field" placeholder="Built referral protocol used by 5 MoH facilities; trained 96 community midwives." {...register("description")} />
        </Field>
      </div>
      {serverError && (
        <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>
      )}
      <div className="sm:col-span-2 flex justify-between items-center">
        <span className="text-[12px] text-muted">You can request verification after saving.</span>
        <div className="flex gap-2">
          <Button type="button" kind="ghost" size="md" onClick={onCancel} disabled={pending}>Cancel</Button>
          <Button type="submit" kind="primary" size="md" disabled={pending}>
            {pending ? "Saving..." : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );

  return asPanel ? <NewItemPanel title="New experience">{body}</NewItemPanel> : (
    <div className="rounded-[10px] border border-sienna/40 bg-sienna-soft/40 p-4 sm:p-5">{body}</div>
  );
}
