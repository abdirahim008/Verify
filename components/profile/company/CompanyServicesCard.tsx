"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field, NewItemPanel } from "../SectionCard";
import { RowMenu } from "../RowMenu";
import { companyServiceSchema, type CompanyServiceValues } from "@/lib/schemas";
import { addCompanyService, updateCompanyService, deleteCompanyService } from "@/lib/actions/company";

interface ServiceRow { id: string; name: string; description: string | null }

export function CompanyServicesCard({ items }: { items: ServiceRow[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <SectionCard
      eyebrow="Section 6"
      title="What we do"
      description="Each service with a one-line description — renders as the “What we do” grid on your profile."
      defaultOpen={false}
      count={items.length}
      headerAction={!adding && <Button kind="quiet" size="sm" onClick={() => { setAdding(true); setEditingId(null); }}>+ Add service</Button>}
    >
      {items.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-1">
          {items.map((item) =>
            editingId === item.id ? (
              <div key={item.id} className="sm:col-span-2 my-2">
                <ServiceForm initial={item} onSubmit={(v) => updateCompanyService(item.id, v)}
                  onCancel={() => setEditingId(null)} onDone={() => setEditingId(null)} submitLabel="Save changes" />
              </div>
            ) : (
              <ServiceItem key={item.id} item={item} onEdit={() => { setEditingId(item.id); setAdding(false); }} />
            ),
          )}
        </div>
      )}

      {items.length === 0 && !adding && <p className="text-[13.5px] text-muted">No services yet. Add what your firm actually does.</p>}

      {adding && (
        <div className="mt-4">
          <ServiceForm onSubmit={addCompanyService} onCancel={() => setAdding(false)} onDone={() => setAdding(false)} submitLabel="Save service" asPanel />
        </div>
      )}
    </SectionCard>
  );
}

function ServiceItem({ item, onEdit }: { item: ServiceRow; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  function del() {
    if (!confirm("Delete this service?")) return;
    startTransition(() => { void deleteCompanyService(item.id); });
  }
  return (
    <div className="group flex items-start gap-2.5 py-2.5 border-b border-border-soft">
      <span className="mt-[7px] w-[7px] h-[7px] rounded-full bg-sienna shrink-0" aria-hidden />
      <p className="flex-1 min-w-0 text-[13.5px] leading-snug">
        <span className="font-serif font-semibold text-[15px] text-ink tracking-tightish">{item.name}</span>
        {item.description && <span className="text-muted"> — {item.description}</span>}
      </p>
      <RowMenu onEdit={onEdit} onDelete={del} pending={pending} />
    </div>
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
