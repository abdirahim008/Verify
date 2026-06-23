"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field, NewItemPanel } from "../SectionCard";
import { companyServiceSchema, type CompanyServiceValues } from "@/lib/schemas";
import { addCompanyService, updateCompanyService, deleteCompanyService } from "@/lib/actions/company";

interface ServiceRow { id: string; name: string; description: string | null }

export function CompanyServicesCard({ items }: { items: ServiceRow[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <SectionCard
      eyebrow="Section 6"
      title="Services"
      description="What you actually do — each service with a one-line description. These render as the “What We Do” grid."
      defaultOpen={false}
      count={items.length}
    >
      <div className="mt-1 space-y-3">
        {items.map((item) =>
          editingId === item.id ? (
            <ServiceForm key={item.id} initial={item} onSubmit={(v) => updateCompanyService(item.id, v)}
              onCancel={() => setEditingId(null)} onDone={() => setEditingId(null)} submitLabel="Save changes" />
          ) : (
            <ServiceRowDisplay key={item.id} item={item} onEdit={() => setEditingId(item.id)} />
          ),
        )}
      </div>

      {items.length === 0 && !adding && <p className="mt-2 text-[13.5px] text-muted">No services yet.</p>}

      {adding ? (
        <ServiceForm onSubmit={addCompanyService} onCancel={() => setAdding(false)} onDone={() => setAdding(false)} submitLabel="Save service" asPanel />
      ) : (
        <div className="mt-4"><Button kind="quiet" size="md" onClick={() => setAdding(true)}>+ Add service</Button></div>
      )}
    </SectionCard>
  );
}

function ServiceRowDisplay({ item, onEdit }: { item: ServiceRow; onEdit: () => void }) {
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
          onClick={() => { if (confirm("Delete this service?")) startTransition(() => { void deleteCompanyService(item.id); }); }}
          className="text-red-700 hover:bg-red-50">{pending ? "..." : "Delete"}</Button>
      </div>
    </article>
  );
}

function ServiceForm({
  initial, onSubmit, onCancel, onDone, submitLabel, asPanel,
}: {
  initial?: ServiceRow;
  onSubmit: (values: CompanyServiceValues) => Promise<void>;
  onCancel: () => void; onDone: () => void; submitLabel: string; asPanel?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyServiceValues>({
    resolver: zodResolver(companyServiceSchema),
    defaultValues: { name: initial?.name ?? "", description: initial?.description ?? "" },
  });

  function submit(values: CompanyServiceValues) {
    setServerError(null);
    startTransition(async () => {
      try { await onSubmit(values); onDone(); }
      catch (e) { setServerError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  const body = (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4" noValidate>
      <Field label="Service" error={errors.name?.message}>
        <input className="field" placeholder="e.g. Engineering Design" {...register("name")} />
      </Field>
      <Field label="Description" error={errors.description?.message}>
        <textarea className="field min-h-[60px]" rows={2} placeholder="e.g. Detailed design of roads, water, drainage, and structures to international codes." {...register("description")} />
      </Field>
      {serverError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>}
      <div className="flex justify-end gap-2">
        <Button type="button" kind="ghost" size="md" onClick={onCancel} disabled={pending}>Cancel</Button>
        <Button type="submit" kind="primary" size="md" disabled={pending}>{pending ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );

  return asPanel ? <NewItemPanel title="New service">{body}</NewItemPanel> : (
    <div className="rounded-[10px] border border-sienna/40 bg-sienna-soft/40 p-4 sm:p-5">{body}</div>
  );
}
