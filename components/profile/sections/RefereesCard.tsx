"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field, NewItemPanel, IconButton } from "../SectionCard";
import { PencilIcon, TrashIcon } from "../icons";
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
      description="Private — never shown to other users or in public profiles. We only reveal contact details to an admin during verification, with your consent."
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
    <article className="rounded-[10px] border border-border bg-paper p-4 sm:p-5 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="font-serif text-[17px] tracking-tightish">{item.name}</h3>
        <div className="text-[13px] text-ink-soft mt-1">{[item.position, item.organization].filter(Boolean).join(" · ")}</div>
        {item.relationship && <div className="text-[12.5px] text-muted mt-0.5">{item.relationship}</div>}
        {linkedExp && (
          <div className="text-[12px] text-muted mt-2">
            Vouches for: <span className="text-ink-soft">{linkedExp.title} · {linkedExp.organization}</span>
          </div>
        )}
        <div className="text-[12px] text-muted mt-2">Contact details hidden — visible only to admins during verification.</div>
      </div>
      <div className="flex gap-0.5 shrink-0">
        <IconButton label="Edit" onClick={onEdit}><PencilIcon size={15} /></IconButton>
        <IconButton label="Delete" danger disabled={pending}
          onClick={() => { if (confirm("Delete this referee?")) startTransition(() => { void deleteReferee(item.id); }); }}>
          <TrashIcon size={15} />
        </IconButton>
      </div>
    </article>
  );
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
