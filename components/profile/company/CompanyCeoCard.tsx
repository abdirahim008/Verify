"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field, Clamp } from "../SectionCard";
import { companyCeoSchema, type CompanyCeoValues } from "@/lib/schemas";
import { saveCompanyCeo } from "@/lib/actions/company";

interface Props { initial: CompanyCeoValues & { hasContent: boolean } }

export function CompanyCeoCard({ initial }: Props) {
  const [editing, setEditing] = useState(!initial.hasContent);
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CompanyCeoValues>({
    resolver: zodResolver(companyCeoSchema),
    defaultValues: {
      ceo_name: initial.ceo_name ?? "",
      ceo_title: initial.ceo_title ?? "",
      ceo_photo_url: initial.ceo_photo_url ?? "",
      ceo_quote: initial.ceo_quote ?? "",
      ceo_message: initial.ceo_message ?? "",
      board_name: initial.board_name ?? "",
    },
  });

  function onSubmit(values: CompanyCeoValues) {
    setServerError(null);
    startTransition(async () => {
      try { await saveCompanyCeo(values); reset(values); setEditing(false); }
      catch (e) { setServerError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  return (
    <SectionCard
      eyebrow="Section 5"
      title="CEO message & leadership"
      description="A message from your CEO (with a short pull-quote), plus the label for the top of your organogram."
      defaultOpen={!initial.hasContent}
    >
      {!editing ? (
        <Display initial={initial} onEdit={() => setEditing(true)} />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="CEO name" error={errors.ceo_name?.message}>
            <input className="field" placeholder="e.g. Daniel Okafor" {...register("ceo_name")} />
          </Field>
          <Field label="CEO title" error={errors.ceo_title?.message}>
            <input className="field" placeholder="e.g. Managing Partner & CEO" {...register("ceo_title")} />
          </Field>
          <input type="hidden" {...register("ceo_photo_url")} />
          <div className="sm:col-span-2">
            <Field label="Pull-quote" error={errors.ceo_quote?.message} hint="One stand-out sentence shown large, in the accent colour.">
              <textarea className="field min-h-[60px]" rows={2} {...register("ceo_quote")} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Message" error={errors.ceo_message?.message} hint="A few short paragraphs.">
              <textarea className="field min-h-[140px]" rows={6} {...register("ceo_message")} />
            </Field>
          </div>
          <Field label="Governance label" error={errors.board_name?.message} hint="Top of the organogram, e.g. “Board of Directors”.">
            <input className="field" placeholder="Board of Directors" {...register("board_name")} />
          </Field>

          {serverError && (
            <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>
          )}
          <div className="sm:col-span-2 flex justify-end gap-2">
            {initial.hasContent && (
              <Button type="button" kind="ghost" size="md" onClick={() => { reset(); setEditing(false); }} disabled={pending}>Cancel</Button>
            )}
            <Button type="submit" kind="primary" size="md" disabled={pending}>{pending ? "Saving..." : "Save message"}</Button>
          </div>
        </form>
      )}
    </SectionCard>
  );
}

function Display({ initial, onEdit }: { initial: Props["initial"]; onEdit: () => void }) {
  if (!initial.hasContent) {
    return (
      <div className="text-[13.5px] text-muted">
        <p>No CEO message yet.</p>
        <Button kind="primary" size="sm" className="mt-3" onClick={onEdit}>Add CEO message</Button>
      </div>
    );
  }
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        {(initial.ceo_name || initial.ceo_title) && (
          <div className="text-[13.5px]"><span className="font-medium text-ink">{initial.ceo_name}</span>{initial.ceo_title && <span className="text-muted"> · {initial.ceo_title}</span>}</div>
        )}
        {initial.ceo_quote && <p className="font-serif text-[15px] text-sienna mt-1.5 leading-snug">&ldquo;{initial.ceo_quote}&rdquo;</p>}
        {/* whitespace-pre-line keeps the message's paragraph breaks (white-space
            inherits into Clamp's inner <p>); Clamp adds the Read more toggle. */}
        {initial.ceo_message && <Clamp text={initial.ceo_message} lines={3} className="mt-2 whitespace-pre-line" />}
      </div>
      <Button kind="ghost" size="sm" onClick={onEdit}>Edit</Button>
    </div>
  );
}
