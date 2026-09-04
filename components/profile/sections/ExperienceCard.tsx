"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field, NewItemPanel } from "../SectionCard";
import { RowMenu } from "../RowMenu";
import { CheckDot, HollowDot, OrgIcon, PinIcon, CalendarIcon } from "../icons";
import { RequestVerifyButton } from "@/components/verification/RequestVerifyButton";
import { FEATURES } from "@/lib/flags";
import { experienceSchema, type ExperienceValues } from "@/lib/schemas";
import {
  addExperience, updateExperience, deleteExperience,
} from "@/lib/actions/profile";
import { dateRange, dateToMonthInput } from "@/lib/format";
import { CollapsibleScope } from "@/components/CollapsibleScope";
import { MonthYearSelect } from "../DateSelect";
import { EXPERIENCE_YEARS } from "@/lib/dates";

// Shown in the empty description box: three short lines, to demonstrate that
// one line = one bullet without the member having to read the hint.
const PLACEHOLDER = `Built referral protocol adopted by 5 MoH facilities
Trained 96 community midwives across Banadir
Managed a $1.2m ECHO grant, reported quarterly`;

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

  const addButton = (
    <Button kind="primary" size="sm" onClick={() => setAdding(true)}>+ Add role</Button>
  );

  return (
    <SectionCard
      eyebrow="Section 2"
      title="Experience"
      metaNoun="role"
      description="One entry per role — most recent first."
      required
      defaultOpen={items.length === 0}
      count={items.length}
      headerAction={!adding ? addButton : undefined}
    >
      {items.length > 0 && (
        <div className="relative">
          {/* timeline rail */}
          <span className="absolute left-[10px] top-2 bottom-2 w-px bg-border" aria-hidden />
          <div className="space-y-5">
            {items.map((item) =>
              editingId === item.id ? (
                <div key={item.id} className="pl-9">
                  <ExperienceForm
                    initial={item}
                    onSubmit={(v) => updateExperience(item.id, v)}
                    onCancel={() => setEditingId(null)}
                    onDone={() => setEditingId(null)}
                    submitLabel="Save changes"
                  />
                </div>
              ) : (
                <ExperienceRowView key={item.id} item={item} pending={pendingIds.has(item.id)} onEdit={() => setEditingId(item.id)} />
              ),
            )}
          </div>
        </div>
      )}

      {items.length === 0 && !adding && (
        <p className="text-[13.5px] text-muted">No experience yet. Add your most recent role first.</p>
      )}

      {adding && (
        <ExperienceForm
          onSubmit={addExperience}
          onCancel={() => setAdding(false)}
          onDone={() => setAdding(false)}
          submitLabel="Save experience"
          asPanel
        />
      )}
    </SectionCard>
  );
}

function ExperienceRowView({ item, pending: pendingVerify, onEdit }: { item: ExperienceRow; pending: boolean; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  const handleDelete = () => {
    if (!confirm("Delete this experience? This can't be undone.")) return;
    startTransition(() => { void deleteExperience(item.id); });
  };
  const dateStr = dateRange(item.start_date, item.end_date);

  return (
    <article className="relative pl-9">
      <span className="absolute left-0 top-0.5">{FEATURES.verification && item.verified ? <CheckDot /> : <HollowDot />}</span>

      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
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

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px]">
            {item.organization && (
              <span className="inline-flex items-center gap-1.5 text-sienna font-medium">
                <OrgIcon size={13} className="text-sienna/70" />{item.organization}
              </span>
            )}
            {item.location && (
              <span className="inline-flex items-center gap-1.5 text-muted">
                <PinIcon size={13} />{item.location}
              </span>
            )}
            {dateStr && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream border border-border px-2.5 py-1 text-ink-soft">
                <CalendarIcon size={12} className="text-muted" />{dateStr}
              </span>
            )}
          </div>
        </div>

        <RowMenu onEdit={onEdit} onDelete={handleDelete} pending={pending} />
      </div>

      {/* Description spans the full card width — not boxed beside the actions.
          Each line the member typed becomes its own accent-dot row, matching
          how the CV templates bullet it. */}
      {item.description && (
        <CollapsibleScope
          text={item.description}
          dotColor="#0a5cad"
          className="mt-2.5 text-[13.5px] text-ink-soft leading-relaxed"
        />
      )}
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

  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<ExperienceValues>({
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
      <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
        <Field label="Start" error={errors.start_date?.message}>
          <Controller
            control={control}
            name="start_date"
            render={({ field }) => (
              <MonthYearSelect
                label="Start"
                years={EXPERIENCE_YEARS}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />
        </Field>
        <Field label="End" error={errors.end_date?.message}>
          <Controller
            control={control}
            name="end_date"
            render={({ field }) => (
              <MonthYearSelect
                label="End"
                years={EXPERIENCE_YEARS}
                disabled={isCurrent}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />
        </Field>
      </div>
      <label className="sm:col-span-2 flex items-center gap-2 text-[13px] text-ink-soft">
        <input
          type="checkbox"
          className="rounded border-border accent-sienna"
          {...register("is_current", {
            // Clear the end date so a half-picked value can't fail validation
            // on a field the checkbox has just disabled.
            onChange: (e) => { if (e.target.checked) setValue("end_date", ""); },
          })}
        />
        I currently work here
      </label>
      <div className="sm:col-span-2">
        <Field label="Description" error={errors.description?.message} hint="One achievement per line — each line becomes its own bullet. Quantify where you can.">
          <textarea
            rows={5}
            className="field"
            placeholder={PLACEHOLDER}
            {...register("description")}
          />
        </Field>
      </div>
      {serverError && (
        <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>
      )}
      <div className="sm:col-span-2 flex justify-end items-center">
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
