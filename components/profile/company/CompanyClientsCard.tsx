"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field, NewItemPanel } from "../SectionCard";
import { ClientLogoUploader } from "./ClientLogoUploader";
import { companyClientSchema, type CompanyClientValues } from "@/lib/schemas";
import { addCompanyClient, updateCompanyClient, deleteCompanyClient } from "@/lib/actions/company";

interface ClientRow { id: string; client_name: string; category: string | null; display_public: boolean; note: string | null; logo_url: string | null }

const CLIENT_GROUPS = ["Multilateral & Donors", "Government", "Private & Non-Profit"];

export function CompanyClientsCard({ items }: { items: ClientRow[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <SectionCard
      eyebrow="Section 5"
      title="Clients"
      description="Per CLAUDE.md §5/§10, clients are private unless you tick 'show publicly' — only public-ticked clients appear on the PDF."
      defaultOpen={false}
      count={items.length}
    >
      <div className="rounded-md border border-border-soft bg-cream/70 p-3 text-[12.5px] text-ink-soft">
        🔒 Clients listed here only appear on your PDF if you tick &ldquo;Show on PDF&rdquo;.
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) =>
          editingId === item.id ? (
            <ClientForm
              key={item.id}
              initial={item}
              onSubmit={(v) => updateCompanyClient(item.id, v)}
              onCancel={() => setEditingId(null)}
              onDone={() => setEditingId(null)}
              submitLabel="Save changes"
            />
          ) : (
            <ClientRowDisplay key={item.id} item={item} onEdit={() => setEditingId(item.id)} />
          ),
        )}
      </div>

      {items.length === 0 && !adding && (
        <p className="mt-4 text-[13.5px] text-muted">No clients yet.</p>
      )}

      {adding ? (
        <ClientForm onSubmit={addCompanyClient} onCancel={() => setAdding(false)} onDone={() => setAdding(false)} submitLabel="Save client" asPanel />
      ) : (
        <div className="mt-4">
          <Button kind="quiet" size="md" onClick={() => setAdding(true)}>+ Add client</Button>
        </div>
      )}
    </SectionCard>
  );
}

function ClientRowDisplay({ item, onEdit }: { item: ClientRow; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <article className="rounded-[10px] border border-border bg-paper p-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        {item.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.logo_url} alt="" className="w-[72px] h-9 object-contain shrink-0 mt-0.5" />
        )}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-serif text-[16px] tracking-tightish">{item.client_name}</h3>
          {item.display_public ? (
            <span className="text-[10.5px] uppercase tracking-[0.14em] text-verified font-semibold">Public</span>
          ) : (
            <span className="text-[10.5px] uppercase tracking-[0.14em] text-muted">Private</span>
          )}
        </div>
        {item.category && <div className="text-[12px] text-sienna mt-0.5">{item.category}</div>}
        {item.note && <div className="text-[12.5px] text-muted mt-1">{item.note}</div>}
      </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button kind="ghost" size="sm" onClick={onEdit}>Edit</Button>
        <Button kind="ghost" size="sm" disabled={pending}
          onClick={() => { if (confirm("Delete this client?")) startTransition(() => { void deleteCompanyClient(item.id); }); }}
          className="text-red-700 hover:bg-red-50">
          {pending ? "..." : "Delete"}
        </Button>
      </div>
    </article>
  );
}

function ClientForm({
  initial, onSubmit, onCancel, onDone, submitLabel, asPanel,
}: {
  initial?: ClientRow;
  onSubmit: (values: CompanyClientValues) => Promise<void>;
  onCancel: () => void; onDone: () => void;
  submitLabel: string; asPanel?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CompanyClientValues>({
    resolver: zodResolver(companyClientSchema),
    defaultValues: {
      client_name: initial?.client_name ?? "",
      category: initial?.category ?? "",
      display_public: initial?.display_public ?? false,
      note: initial?.note ?? "",
      logo_url: initial?.logo_url ?? "",
    },
  });
  const logoUrl = watch("logo_url") ?? "";

  function submit(values: CompanyClientValues) {
    setServerError(null);
    startTransition(async () => {
      try { await onSubmit(values); onDone(); }
      catch (e) { setServerError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  const body = (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4" noValidate>
      <Field label="Client name" error={errors.client_name?.message}>
        <input className="field" {...register("client_name")} />
      </Field>
      <Field label="Logo" hint="Shown as a logo on your public profile and PDF.">
        <input type="hidden" {...register("logo_url")} />
        <ClientLogoUploader value={logoUrl} onChange={(url) => setValue("logo_url", url, { shouldDirty: true })} />
      </Field>
      <Field label="Group" error={errors.category?.message} hint="Clients are grouped under this heading on the PDF.">
        <input className="field" list="client-groups" placeholder="e.g. Multilateral & Donors" {...register("category")} />
        <datalist id="client-groups">{CLIENT_GROUPS.map((g) => <option key={g} value={g} />)}</datalist>
      </Field>
      <Field label="Note (private)" error={errors.note?.message} hint="Optional. Never shown on the PDF.">
        <input className="field" {...register("note")} />
      </Field>
      <label className="flex items-center gap-2 text-[13px] text-ink-soft">
        <input type="checkbox" className="rounded border-border accent-sienna" {...register("display_public")} />
        Show this client on the company-profile PDF
      </label>
      {serverError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>}
      <div className="flex justify-end gap-2">
        <Button type="button" kind="ghost" size="md" onClick={onCancel} disabled={pending}>Cancel</Button>
        <Button type="submit" kind="primary" size="md" disabled={pending}>{pending ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );

  return asPanel ? <NewItemPanel title="New client">{body}</NewItemPanel> : (
    <div className="rounded-[10px] border border-sienna/40 bg-sienna-soft/40 p-4 sm:p-5">{body}</div>
  );
}
