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
      headerAction={!adding && <Button kind="quiet" size="sm" onClick={() => { setAdding(true); setEditingId(null); }}>+ Add client</Button>}
    >
      <div className="rounded-md border border-border-soft bg-cream/70 p-3 text-[12.5px] text-ink-soft">
        🔒 Clients listed here only appear on your PDF if you tick &ldquo;Show on PDF&rdquo;.
      </div>

      {items.length > 0 && (
        <div className="mt-4 grid sm:grid-cols-2 gap-x-10 gap-y-1">
          {items.map((item) =>
            editingId === item.id ? (
              <div key={item.id} className="sm:col-span-2 my-2">
                <ClientForm
                  initial={item}
                  onSubmit={(v) => updateCompanyClient(item.id, v)}
                  onCancel={() => setEditingId(null)}
                  onDone={() => setEditingId(null)}
                  submitLabel="Save changes"
                />
              </div>
            ) : (
              <ClientItem key={item.id} item={item} onEdit={() => { setEditingId(item.id); setAdding(false); }} />
            ),
          )}
        </div>
      )}

      {items.length === 0 && !adding && (
        <p className="mt-4 text-[13.5px] text-muted">No clients yet.</p>
      )}

      {adding && (
        <div className="mt-4">
          <ClientForm onSubmit={addCompanyClient} onCancel={() => setAdding(false)} onDone={() => setAdding(false)} submitLabel="Save client" asPanel />
        </div>
      )}
    </SectionCard>
  );
}

function ClientItem({ item, onEdit }: { item: ClientRow; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  function del() {
    if (!confirm("Delete this client?")) return;
    startTransition(() => { void deleteCompanyClient(item.id); });
  }
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border-soft">
      {item.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.logo_url} alt="" className="w-12 h-9 object-contain shrink-0 mt-0.5" />
      ) : (
        <span className="mt-[7px] w-[7px] h-[7px] rounded-full bg-sienna shrink-0" aria-hidden />
      )}
      <div className="flex-1 min-w-0">
        <p className="flex items-center gap-2 flex-wrap leading-snug">
          <span className="font-serif font-semibold text-[15px] text-ink tracking-tightish">{item.client_name}</span>
          {item.display_public ? (
            <span className="text-[10px] uppercase tracking-[0.14em] text-verified font-semibold">Public</span>
          ) : (
            <span className="text-[10px] uppercase tracking-[0.14em] text-muted">Private</span>
          )}
        </p>
        {item.note && <div className="text-[12px] text-muted mt-0.5">{item.note}</div>}
      </div>
      <Kebab onEdit={onEdit} onDelete={del} pending={pending} />
    </div>
  );
}

function Kebab({ onEdit, onDelete, pending }: { onEdit: () => void; onDelete: () => void; pending: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <button type="button" aria-label="Client actions" onClick={() => setOpen((o) => !o)}
        className="w-7 h-7 rounded-md text-muted hover:bg-cream/70 flex items-center justify-center text-[17px] leading-none">⋯</button>
      {open && (
        <>
          <button aria-hidden tabIndex={-1} onClick={() => setOpen(false)} className="fixed inset-0 z-10 cursor-default" />
          <div className="absolute right-0 top-8 z-20 w-28 rounded-lg border border-border bg-paper shadow-md py-1">
            <button type="button" onClick={() => { setOpen(false); onEdit(); }} className="block w-full text-left px-3 py-1.5 text-[13px] hover:bg-cream/70">Edit</button>
            <button type="button" disabled={pending} onClick={() => { setOpen(false); onDelete(); }} className="block w-full text-left px-3 py-1.5 text-[13px] text-red-700 hover:bg-red-50">{pending ? "Deleting…" : "Delete"}</button>
          </div>
        </>
      )}
    </div>
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
