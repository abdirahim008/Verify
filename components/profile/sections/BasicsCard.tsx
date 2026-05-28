"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field } from "../SectionCard";
import { basicsSchema, type BasicsValues } from "@/lib/schemas";
import { saveBasics } from "@/lib/actions/profile";

interface Props {
  initial: BasicsValues & { hasRow: boolean };
}

export function BasicsCard({ initial }: Props) {
  const [editing, setEditing] = useState(!initial.hasRow);
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<BasicsValues>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      full_name: initial.full_name ?? "",
      headline: initial.headline ?? "",
      summary: initial.summary ?? "",
      location: initial.location ?? "",
      phone: initial.phone ?? "",
      email: initial.email ?? "",
      photo_url: initial.photo_url ?? "",
    },
  });

  function onSubmit(values: BasicsValues) {
    setServerError(null);
    startTransition(async () => {
      try { await saveBasics(values); reset(values); setEditing(false); }
      catch (e) { setServerError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  return (
    <SectionCard
      eyebrow="Section 1"
      title="Basics"
      description="Your name, headline, and a short summary — the top of every CV."
      required
      defaultOpen={!initial.hasRow || !initial.full_name}
    >
      {!editing ? (
        <Display initial={initial} onEdit={() => setEditing(true)} />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Full name" error={errors.full_name?.message}>
            <input className="field" autoComplete="name" {...register("full_name")} />
          </Field>
          <Field label="Headline" error={errors.headline?.message} hint="e.g. Senior Health Coordinator">
            <input className="field" {...register("headline")} />
          </Field>
          <Field label="Location" error={errors.location?.message} hint="City, country">
            <input className="field" autoComplete="address-level2" {...register("location")} />
          </Field>
          <Field label="Email (for CV)" error={errors.email?.message} hint="Visible only to people you share your CV with">
            <input type="email" className="field" autoComplete="email" {...register("email")} />
          </Field>
          <Field label="Phone (for CV)" error={errors.phone?.message}>
            <input type="tel" className="field" autoComplete="tel" {...register("phone")} />
          </Field>
          <Field label="Photo URL (optional)" error={errors.photo_url?.message} hint="Paste a public link for now — uploads come later">
            <input className="field" {...register("photo_url")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Short summary" error={errors.summary?.message} hint="2–4 sentences. Quantify if you can.">
              <textarea rows={4} className="field" {...register("summary")} />
            </Field>
          </div>

          {serverError && (
            <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {serverError}
            </div>
          )}
          <div className="sm:col-span-2 flex flex-wrap items-center justify-end gap-2">
            {initial.hasRow && (
              <Button type="button" kind="ghost" size="md" onClick={() => { reset(); setEditing(false); }} disabled={pending}>
                Cancel
              </Button>
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
  if (!initial.full_name) {
    return (
      <div className="text-[13.5px] text-muted">
        <p>Nothing here yet. Add your name and a one-line headline to get started.</p>
        <Button kind="primary" size="sm" className="mt-3" onClick={onEdit}>Add basics</Button>
      </div>
    );
  }
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="font-serif text-[22px] tracking-tightish">{initial.full_name}</div>
        {initial.headline && <div className="text-[14px] text-ink-soft mt-1">{initial.headline}</div>}
        {(initial.location || initial.email || initial.phone) && (
          <div className="text-[13px] text-muted mt-2">
            {[initial.location, initial.email, initial.phone].filter(Boolean).join(" · ")}
          </div>
        )}
        {initial.summary && (
          <p className="mt-3 text-[14px] text-ink-soft leading-relaxed max-w-2xl">{initial.summary}</p>
        )}
      </div>
      <Button kind="ghost" size="sm" onClick={onEdit}>Edit</Button>
    </div>
  );
}
