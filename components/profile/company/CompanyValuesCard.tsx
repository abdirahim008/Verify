"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field, NewItemPanel } from "../SectionCard";
import { companyValueSchema, type CompanyValueValues } from "@/lib/schemas";
import { addCompanyValue, updateCompanyValue, deleteCompanyValue } from "@/lib/actions/company";

interface ValueRow { id: string; name: string; description: string | null }

export function CompanyValuesCard({ items }: { items: ValueRow[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <SectionCard
      eyebrow="Section 4"
      title="Values"
      description="The principles your company runs on — each a short name and a one-line description."
      defaultOpen={false}
      count={items.length}
    >
      <div className="mt-1 space-y-3">
        {items.map((item) =>
          editingId === item.id ? (
            <ValueForm key={item.id} initial={item} onSubmit={(v) => updateCompanyValue(item.id, v)}
              onCancel={() => setEditingId(null)} onDone={() => setEditingId(null)} submitLabel="Save changes" />
          ) : (
            <ValueRowDisplay key={item.id} item={item} onEdit={() => setEditingId(item.id)} />
          ),
        )}
      </div>

      {items.length === 0 && !adding && <p className="mt-2 text-[13.5px] text-muted">No values yet.</p>}

      {adding ? (
        <ValueForm onSubmit={addCompanyValue} onCancel={() => setAdding(false)} onDone={() => setAdding(false)} submitLabel="Save value" asPanel />
      ) : (
        <div className="mt-4"><Button kind="quiet" size="md" onClick={() => setAdding(true)}>+ Add value</Button></div>
      )}
    </SectionCard>
  );
}

function ValueRowDisplay({ item, onEdit }: { item: ValueRow; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <article className="rounded-[10px] border border-border bg-paper p-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="font-serif text-[16px] tracking-tightish">{item.name}</h3>
        {item.description && <div className="text-[12.5px] text-ink-soft mt-1">{item.description}</div>}
      </div>
      <div className="flex gap-1 shrink-0">
        <Button kind="ghost" size="sm" onClick={onEdit}>Edit</Button>
        <Button kind="ghost" size="sm" disabled={pending}
          onClick={() => { if (confirm("Delete this value?")) startTransition(() => { void deleteCompanyValue(item.id); }); }}
          className="text-red-700 hover:bg-red-50">{pending ? "..." : "Delete"}</Button>
      </div>
    </article>
  );
}

function ValueForm({
  initial, onSubmit, onCancel, onDone, submitLabel, asPanel,
}: {
  initial?: ValueRow;
  onSubmit: (values: CompanyValueValues) => Promise<void>;
  onCancel: () => void; onDone: () => void; submitLabel: string; asPanel?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyValueValues>({
    resolver: zodResolver(companyValueSchema),
    defaultValues: { name: initial?.name ?? "", description: initial?.description ?? "" },
  });

  function submit(values: CompanyValueValues) {
    setServerError(null);
    startTransition(async () => {
      try { await onSubmit(values); onDone(); }
      catch (e) { setServerError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  const body = (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4" noValidate>
      <Field label="Value" error={errors.name?.message}>
        <input className="field" placeholder="e.g. Integrity" {...register("name")} />
      </Field>
      <Field label="Description" error={errors.description?.message}>
        <input className="field" placeholder="e.g. We do what we say, and we report it plainly." {...register("description")} />
      </Field>
      {serverError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>}
      <div className="flex justify-end gap-2">
        <Button type="button" kind="ghost" size="md" onClick={onCancel} disabled={pending}>Cancel</Button>
        <Button type="submit" kind="primary" size="md" disabled={pending}>{pending ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );

  return asPanel ? <NewItemPanel title="New value">{body}</NewItemPanel> : (
    <div className="rounded-[10px] border border-sienna/40 bg-sienna-soft/40 p-4 sm:p-5">{body}</div>
  );
}
