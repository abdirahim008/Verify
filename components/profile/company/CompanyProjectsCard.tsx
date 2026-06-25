"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field, NewItemPanel } from "../SectionCard";
import { RequestVerifyButton } from "@/components/verification/RequestVerifyButton";
import { companyProjectSchema, type CompanyProjectValues } from "@/lib/schemas";
import { addCompanyProject, updateCompanyProject, deleteCompanyProject } from "@/lib/actions/company";
import { yearRange } from "@/lib/format";
import { CollapsibleScope } from "@/components/CollapsibleScope";
import { ProjectPhotos } from "./ProjectPhotos";
import { PROJECT_SECTORS } from "@/lib/companySectors";

// Year picker options — current year +5 down to 1980, newest first.
const NOW = new Date().getFullYear();
const YEARS = Array.from({ length: NOW + 5 - 1980 + 1 }, (_, i) => NOW + 5 - i);

interface ProjectMedia { id: string; url: string; caption: string | null }
interface ProjectRow {
  id: string; project_name: string; client_name: string | null; sector: string | null;
  value_amount: number | null; currency: string | null;
  year_start: number | null; year_end: number | null; scope: string | null;
  verified: boolean; verified_note: string | null;
  media?: ProjectMedia[];
}

export function CompanyProjectsCard({ items, pendingIds }: { items: ProjectRow[]; pendingIds: Set<string> }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <SectionCard
      eyebrow="Section 4"
      title="Selected projects"
      description="The projects you'd put on a tender. Verified projects get a green check on the PDF — this is what verification is for."
      required
      defaultOpen={items.length === 0}
      count={items.length}
    >
      <div className="space-y-3">
        {items.map((item) =>
          editingId === item.id ? (
            <ProjectForm
              key={item.id}
              initial={item}
              onSubmit={(v) => updateCompanyProject(item.id, v)}
              onCancel={() => setEditingId(null)}
              onDone={() => setEditingId(null)}
              submitLabel="Save changes"
            />
          ) : (
            <ProjectRowDisplay key={item.id} item={item} pending={pendingIds.has(item.id)} onEdit={() => setEditingId(item.id)} />
          ),
        )}
      </div>

      {items.length === 0 && !adding && (
        <p className="text-[13.5px] text-muted">No projects yet. Add your strongest engagement first.</p>
      )}

      {adding ? (
        <ProjectForm onSubmit={addCompanyProject} onCancel={() => setAdding(false)} onDone={() => setAdding(false)} submitLabel="Save project" asPanel />
      ) : (
        <div className="mt-4">
          <Button kind="quiet" size="md" onClick={() => setAdding(true)}>+ Add project</Button>
        </div>
      )}
    </SectionCard>
  );
}

function formatValue(amount: number | null, currency: string | null): string {
  if (amount == null) return "";
  const c = currency || "USD";
  if (amount >= 1_000_000) return `${c} ${(amount / 1_000_000).toFixed(amount >= 10_000_000 ? 0 : 1)}M`;
  if (amount >= 1_000) return `${c} ${(amount / 1_000).toFixed(0)}K`;
  return `${c} ${amount}`;
}

function ProjectRowDisplay({ item, pending: pendingVerify, onEdit }: { item: ProjectRow; pending: boolean; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <article className="rounded-[10px] border border-border bg-paper p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-[18px] tracking-tightish">{item.project_name}</h3>
            <RequestVerifyButton
              verified={item.verified} verifiedNote={item.verified_note}
              pending={pendingVerify}
              target={{
                type: "project", id: item.id,
                label: item.project_name,
                sublabel: [item.client_name, yearRange(item.year_start, item.year_end)].filter(Boolean).join(" · "),
              }}
            />
          </div>
          <div className="text-[13px] text-ink-soft mt-1 italic">
            {[item.client_name, item.sector, yearRange(item.year_start, item.year_end)].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {item.value_amount != null && (
            <span className="font-serif text-[18px]">{formatValue(item.value_amount, item.currency)}</span>
          )}
          <div className="flex gap-1">
            <Button kind="ghost" size="sm" onClick={onEdit}>Edit</Button>
            <Button kind="ghost" size="sm" disabled={pending}
              onClick={() => { if (confirm("Delete this project?")) startTransition(() => { void deleteCompanyProject(item.id); }); }}
              className="text-red-700 hover:bg-red-50">
              {pending ? "..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
      {/* Scope spans the full card width — not boxed beside the value/actions. */}
      {item.scope && (
        <CollapsibleScope text={item.scope} dotColor="#0a5cad" className="mt-3 text-[13.5px] text-ink-soft leading-relaxed" />
      )}
      {(item.media?.length ?? 0) > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.media!.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.id} src={m.url} alt="" className="w-16 h-16 rounded-md object-cover border border-border" />
          ))}
        </div>
      )}
    </article>
  );
}

function ProjectForm({
  initial, onSubmit, onCancel, onDone, submitLabel, asPanel,
}: {
  initial?: ProjectRow;
  onSubmit: (values: CompanyProjectValues) => Promise<void>;
  onCancel: () => void; onDone: () => void;
  submitLabel: string; asPanel?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyProjectValues>({
    resolver: zodResolver(companyProjectSchema),
    defaultValues: {
      project_name: initial?.project_name ?? "",
      client_name: initial?.client_name ?? "",
      sector: initial?.sector ?? "",
      value_amount: initial?.value_amount != null ? String(initial.value_amount) : "",
      currency: initial?.currency ?? "USD",
      year_start: initial?.year_start != null ? String(initial.year_start) : "",
      year_end: initial?.year_end != null ? String(initial.year_end) : "",
      scope: initial?.scope ?? "",
    },
  });

  function submit(values: CompanyProjectValues) {
    setServerError(null);
    startTransition(async () => {
      try { await onSubmit(values); onDone(); }
      catch (e) { setServerError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  // Keep any pre-existing sector value that isn't in the curated list so it
  // isn't silently dropped when editing an older project.
  const sectorOptions = initial?.sector && !PROJECT_SECTORS.includes(initial.sector)
    ? [initial.sector, ...PROJECT_SECTORS]
    : PROJECT_SECTORS;

  const body = (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2">
        <Field label="Project name" error={errors.project_name?.message}>
          <input className="field" placeholder="e.g. Banadir Rural Road Programme — Phase II" {...register("project_name")} />
        </Field>
      </div>
      <Field label="Client / donor" error={errors.client_name?.message}>
        <input className="field" placeholder="e.g. World Bank / FGS" {...register("client_name")} />
      </Field>
      <Field label="Sector" error={errors.sector?.message}>
        <select className="field" {...register("sector")}>
          <option value="">— Select —</option>
          {sectorOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Value (number)" error={errors.value_amount?.message} hint="Numbers only. Currency separate.">
        <input className="field" inputMode="decimal" {...register("value_amount")} />
      </Field>
      <Field label="Currency" error={errors.currency?.message}>
        <input className="field" placeholder="USD" {...register("currency")} />
      </Field>
      <Field label="Year start" error={errors.year_start?.message}>
        <select className="field" {...register("year_start")}>
          <option value="">— Year —</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </Field>
      <Field label="Year end" error={errors.year_end?.message} hint="Leave blank if ongoing.">
        <select className="field" {...register("year_end")}>
          <option value="">— Year / ongoing —</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Scope" error={errors.scope?.message} hint="What you actually delivered. Quantify if you can.">
          <textarea rows={4} className="field" {...register("scope")} />
        </Field>
      </div>

      {serverError && <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>}
      <div className="sm:col-span-2 flex justify-between items-center">
        <span className="text-[12px] text-muted">Verification is requested separately, per project.</span>
        <div className="flex gap-2">
          <Button type="button" kind="ghost" size="md" onClick={onCancel} disabled={pending}>Cancel</Button>
          <Button type="submit" kind="primary" size="md" disabled={pending}>{pending ? "Saving..." : submitLabel}</Button>
        </div>
      </div>
    </form>
  );

  if (asPanel) {
    return (
      <NewItemPanel title="New project">
        {body}
        <p className="helper mt-3">Save the project, then edit it to add up to 4 photos.</p>
      </NewItemPanel>
    );
  }
  return (
    <div className="rounded-[10px] border border-sienna/40 bg-sienna-soft/40 p-4 sm:p-5">
      {body}
      {initial?.id && (
        <div className="mt-4 pt-4 border-t border-border">
          <ProjectPhotos projectId={initial.id} initial={initial.media ?? []} />
        </div>
      )}
    </div>
  );
}
