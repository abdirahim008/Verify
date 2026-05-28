"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field } from "../SectionCard";
import { companyAboutSchema, type CompanyAboutValues } from "@/lib/schemas";
import { saveCompanyAbout } from "@/lib/actions/company";

interface Props { initial: CompanyAboutValues }

export function CompanyAboutCard({ initial }: Props) {
  const [editing, setEditing] = useState(!initial.about);
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<CompanyAboutValues>({
    resolver: zodResolver(companyAboutSchema),
    defaultValues: {
      about: initial.about ?? "",
      mission: initial.mission ?? "",
      vision: initial.vision ?? "",
    },
  });

  function onSubmit(values: CompanyAboutValues) {
    setServerError(null);
    startTransition(async () => {
      try { await saveCompanyAbout(values); reset(values); setEditing(false); }
      catch (e) { setServerError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  return (
    <SectionCard
      eyebrow="Section 2"
      title="About, mission & vision"
      description="Two short paragraphs that lead the company profile. Mission and vision get their own cards on the PDF."
      required
      defaultOpen={!initial.about}
    >
      {!editing ? (
        <div className="space-y-4">
          {initial.about ? (
            <p className="text-[14px] text-ink-soft leading-relaxed max-w-3xl whitespace-pre-line">{initial.about}</p>
          ) : (
            <p className="text-[13.5px] text-muted">Add an about paragraph.</p>
          )}
          {(initial.mission || initial.vision) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {initial.mission && (
                <div className="rounded-md border border-border bg-paper p-4">
                  <p className="section-eyebrow text-sienna">Mission</p>
                  <p className="font-serif italic text-[15px] mt-2 text-ink leading-snug">&ldquo;{initial.mission}&rdquo;</p>
                </div>
              )}
              {initial.vision && (
                <div className="rounded-md bg-ink text-paper p-4">
                  <p className="section-eyebrow text-sienna-soft">Vision</p>
                  <p className="font-serif italic text-[15px] mt-2 leading-snug">&ldquo;{initial.vision}&rdquo;</p>
                </div>
              )}
            </div>
          )}
          <Button kind="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="About the firm" error={errors.about?.message} hint="2–4 sentences. Who you are, where you work, what you deliver.">
            <textarea rows={5} className="field" {...register("about")} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Mission" error={errors.mission?.message} hint="One sentence.">
              <textarea rows={3} className="field" {...register("mission")} />
            </Field>
            <Field label="Vision" error={errors.vision?.message} hint="One sentence.">
              <textarea rows={3} className="field" {...register("vision")} />
            </Field>
          </div>
          {serverError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" kind="ghost" size="md" onClick={() => { reset(); setEditing(false); }} disabled={pending}>Cancel</Button>
            <Button type="submit" kind="primary" size="md" disabled={pending || !isDirty}>{pending ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      )}
    </SectionCard>
  );
}
