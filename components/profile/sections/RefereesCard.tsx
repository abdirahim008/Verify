"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field, NewItemPanel } from "../SectionCard";
import { RowMenu } from "../RowMenu";
import { refereeSchema, type RefereeValues } from "@/lib/schemas";
import { addReferee, updateReferee, deleteReferee } from "@/lib/actions/profile";

interface RefereeRow {
  id: string; name: string; position: string | null; organization: string | null;
  phone: string | null; email: string | null; relationship: string | null;
  experience_id: string | null;
}
interface ExperienceOption { id: string; title: string; organization: string }

export function RefereesCard({ items, experiences }: { items: RefereeRow[]; experiences: ExperienceOption[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addButton = <Button kind="primary" size="sm" onClick={() => setAdding(true)}>+ Add referee</Button>;

  return (
    <SectionCard
      eyebrow="Section 7"
      title="Referees"
      metaNoun="referee"
      description="Private — never shown to other users or in public profiles. We only reveal contact details with your explicit consent."
      defaultOpen={false}
      count={items.length}
      headerAction={!adding ? addButton : undefined}
    >
      <div className="flex items-center gap-2 rounded-md border border-border-soft bg-cream/70 p-3 text-[12.5px] text-ink-soft">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0 text-muted" aria-hidden><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
        Referee contact details are private by default and not user-overridable.
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) =>
          editingId === item.id ? (
            <RefereeForm
              key={item.id}
              initial={item}
              experiences={experiences}
              onSubmit={(v) => updateReferee(item.id, v)}
              onCancel={() => setEditingId(null)}
              onDone={() => setEditingId(null)}
              submitLabel="Save changes"
            />
          ) : (
            <RefereeRowDisplay key={item.id} item={item} experiences={experiences} onEdit={() => setEditingId(item.id)} />
          ),
        )}
      </div>

      {items.length === 0 && !adding && (
        <p className="mt-4 text-[13.5px] text-muted">No referees yet.</p>
      )}

      {adding && (
        <RefereeForm
          experiences={experiences}
          onSubmit={addReferee}
          onCancel={() => setAdding(false)}
          onDone={() => setAdding(false)}
          submitLabel="Save referee"
          asPanel
        />
      )}
    </SectionCard>
  );
}

function RefereeRowDisplay({ item, experiences, onEdit }: { item: RefereeRow; experiences: ExperienceOption[]; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  const linkedExp = experiences.find((e) => e.id === item.experience_id);
  return (
    <article className="group rounded-[12px] border border-border bg-paper p-4 sm:p-5 transition hover:border-muted/50 hover:shadow-card">
      <div className="flex items-start gap-4">
        {/* Monogram avatar */}
        <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-sienna-soft to-cream border border-border flex items-center justify-center">
          <span className="font-serif text-[16px] text-sienna">{refInitials(item.name)}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-serif text-[17.5px] tracking-tightish leading-tight">{item.name}</h3>
              {(item.position || item.organization) && (
                <p className="text-[13px] mt-0.5">
                  {item.position && <span className="text-ink-soft font-medium">{item.position}</span>}
                  {item.position && item.organization && <span className="text-muted"> &middot; </span>}
                  {item.organization && <span className="text-sienna">{item.organization}</span>}
                </p>
              )}
            </div>
            <RowMenu onEdit={onEdit} pending={pending}
              onDelete={() => { if (confirm("Delete this referee?")) startTransition(() => { void deleteReferee(item.id); }); }} />
          </div>

          {/* Chips: relationship + vouches-for */}
          {(item.relationship || linkedExp) && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {item.relationship && (
                <span className="inline-flex items-center rounded-full bg-cream border border-border px-2.5 py-1 text-[11.5px] text-ink-soft">
                  {item.relationship}
                </span>
              )}
              {linkedExp && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sienna-soft/60 border border-sienna/20 px-2.5 py-1 text-[11.5px] text-sienna">
                  <LinkIcon />
                  Vouches for {linkedExp.title}
                </span>
              )}
            </div>
          )}

          {/* Locked-contact badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-muted">
            <LockMini />
            Contact details hidden — never shown on your public profile
          </div>
        </div>
      </div>
    </article>
  );
}

function refInitials(name: string): string {
  const t = name.replace(/^(eng\.?|dr\.?|mr\.?|mrs\.?|ms\.?|prof\.?)\s+/i, "").trim().split(/\s+/).filter(Boolean);
  if (!t.length) return "?";
  if (t.length === 1) return t[0].slice(0, 2).toUpperCase();
  return (t[0][0] + t[t.length - 1][0]).toUpperCase();
}
function LinkIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" /><path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" /></svg>;
}
function LockMini() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>;
}

function RefereeForm({
  initial, experiences, onSubmit, onCancel, onDone, submitLabel, asPanel,
}: {
  initial?: RefereeRow;
  experiences: ExperienceOption[];
  onSubmit: (values: RefereeValues) => Promise<void>;
  onCancel: () => void;
  onDone: () => void;
  submitLabel: string;
  asPanel?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<RefereeValues>({
    resolver: zodResolver(refereeSchema),
    defaultValues: {
      name: initial?.name ?? "",
      position: initial?.position ?? "",
      organization: initial?.organization ?? "",
      phone: initial?.phone ?? "",
      email: initial?.email ?? "",
      relationship: initial?.relationship ?? "",
      experience_id: initial?.experience_id ?? null,
    },
  });

  function submit(values: RefereeValues) {
    setServerError(null);
    const cleaned: RefereeValues = { ...values, experience_id: values.experience_id || null };
    startTransition(async () => {
      try { await onSubmit(cleaned); onDone(); }
      catch (e) { setServerError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  const body = (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Field label="Name" error={errors.name?.message}>
        <input className="field" {...register("name")} />
      </Field>
      <Field label="Position" error={errors.position?.message}>
        <input className="field" placeholder="e.g. Country Director" {...register("position")} />
      </Field>
      <Field label="Organisation" error={errors.organization?.message}>
        <input className="field" {...register("organization")} />
      </Field>
      <Field label="Relationship" error={errors.relationship?.message} hint="e.g. Line manager, supervisor">
        <input className="field" {...register("relationship")} />
      </Field>
      <Field label="Email (private)" error={errors.email?.message}>
        <input type="email" className="field" {...register("email")} />
      </Field>
      <Field label="Phone (private)" error={errors.phone?.message}>
        <input type="tel" className="field" {...register("phone")} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Vouches for which experience? (optional)" error={errors.experience_id?.message as string | undefined}>
          <select className="field" {...register("experience_id")}>
            <option value="">— None / general referee —</option>
            {experiences.map((e) => <option key={e.id} value={e.id}>{e.title} · {e.organization}</option>)}
          </select>
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

  return asPanel ? <NewItemPanel title="New referee">{body}</NewItemPanel> : (
    <div className="rounded-[10px] border border-sienna/40 bg-sienna-soft/40 p-4 sm:p-5">{body}</div>
  );
}
