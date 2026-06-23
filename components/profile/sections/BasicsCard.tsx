"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { Field, Clamp } from "../SectionCard";
import { MediaUploader } from "../MediaUploader";
import { PinIcon, MailIcon, PhoneIcon } from "../icons";
import { basicsSchema, type BasicsValues } from "@/lib/schemas";
import { saveBasics, setAvatarUrl } from "@/lib/actions/profile";

interface Props {
  initial: BasicsValues & { hasRow: boolean };
}

// The "hero" section — bespoke (not the generic SectionCard). Navy
// gradient header, an avatar overlapping the gradient/paper boundary,
// name + headline + contact chips, then the summary.
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
    <section className="card p-0 overflow-hidden">
      {/* Gradient cover banner */}
      <div className="relative h-28 bg-gradient-to-br from-sienna to-ochre">
        <div className="absolute inset-0 flex items-start justify-between px-5 sm:px-7 pt-4">
          <p className="text-[10.5px] uppercase tracking-[0.18em] text-white/80 font-semibold">Section 01 — Basics</p>
          {!editing && initial.full_name && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-[12.5px] font-medium px-3.5 min-h-[36px] transition backdrop-blur-sm"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 20h4l10-10a2 2 0 00-3-3L5 17v3z" /><path d="M13.5 6.5l3 3" /></svg>
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="px-5 sm:px-7 pb-6">
        {/* Avatar sits ON the cover — lifted up so ~two-thirds overlaps the
            gradient, with z-10 so it paints cleanly over it. */}
        <div className="-mt-16 mb-3 relative z-10">
          <Avatar url={initial.photo_url || null} name={initial.full_name} />
        </div>

        {!editing ? (
          <Display initial={initial} onEdit={() => setEditing(true)} />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
            <div className="sm:col-span-2">
              <p className="label">Profile photo</p>
              <MediaUploader kind="avatar" currentUrl={initial.photo_url || null} onSave={setAvatarUrl} />
            </div>
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
            <input type="hidden" {...register("photo_url")} />
            <div className="sm:col-span-2">
              <Field label="Short summary" error={errors.summary?.message} hint="2–4 sentences. Quantify if you can.">
                <textarea rows={4} className="field" {...register("summary")} />
              </Field>
            </div>

            {serverError && (
              <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>
            )}
            <div className="sm:col-span-2 flex flex-wrap items-center justify-end gap-2">
              {initial.hasRow && (
                <Button type="button" kind="ghost" size="md" onClick={() => { reset(); setEditing(false); }} disabled={pending}>Cancel</Button>
              )}
              <Button type="submit" kind="primary" size="md" disabled={pending || !isDirty}>
                {pending ? "Saving..." : "Save basics"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function Avatar({ url, name }: { url: string | null; name?: string }) {
  return (
    <div className="w-[88px] h-[88px] rounded-full ring-4 ring-paper bg-cream border border-border overflow-hidden flex items-center justify-center">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="font-serif text-[26px] text-muted">{initials(name)}</span>
      )}
    </div>
  );
}

function Display({ initial, onEdit }: { initial: Props["initial"]; onEdit: () => void }) {
  if (!initial.full_name) {
    return (
      <div className="text-[13.5px] text-muted">
        <p>Add your name and a one-line headline to get started — this is the top of every CV.</p>
        <Button kind="primary" size="sm" className="mt-3" onClick={onEdit}>Add basics</Button>
      </div>
    );
  }
  const chips = [
    initial.location && { icon: <PinIcon size={13} />, text: initial.location },
    initial.email && { icon: <MailIcon size={13} />, text: initial.email },
    initial.phone && { icon: <PhoneIcon size={13} />, text: initial.phone },
  ].filter(Boolean) as Array<{ icon: React.ReactNode; text: string }>;

  return (
    <div>
      <h3 className="font-serif text-[26px] sm:text-[30px] tracking-[-0.015em]">{initial.full_name}</h3>
      {initial.headline && <p className="text-[15px] text-sienna font-medium mt-1">{initial.headline}</p>}

      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-cream border border-border px-3 py-1.5 text-[12.5px] text-ink-soft">
              <span className="text-muted">{c.icon}</span>{c.text}
            </span>
          ))}
        </div>
      )}

      {initial.summary && (
        <div className="mt-5">
          <p className="section-eyebrow">Professional summary</p>
          <Clamp text={initial.summary} lines={3} className="mt-1.5" />
        </div>
      )}
    </div>
  );
}

function initials(name?: string): string {
  if (!name) return "+";
  const t = name.trim().split(/\s+/).filter(Boolean);
  if (!t.length) return "+";
  if (t.length === 1) return t[0].slice(0, 2).toUpperCase();
  return (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
