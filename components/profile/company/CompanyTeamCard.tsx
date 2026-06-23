"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { SectionCard, Field, NewItemPanel } from "../SectionCard";
import { companyTeamSchema, type CompanyTeamValues } from "@/lib/schemas";
import { addCompanyTeamMember, updateCompanyTeamMember, deleteCompanyTeamMember } from "@/lib/actions/company";

interface TeamRow { id: string; person_name: string; role: string | null; units: string[] | null; reports_to: string | null }

export function CompanyTeamCard({ items }: { items: TeamRow[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Build a manager lookup so we can show "Reports to: X" inline.
  const byId = new Map(items.map((m) => [m.id, m]));

  return (
    <SectionCard
      eyebrow="Section 6"
      title="Key personnel"
      description="A simple list of senior staff and reporting lines. The PDF renders a tidy organogram from this."
      defaultOpen={false}
      count={items.length}
    >
      <div className="space-y-3">
        {items.map((item) =>
          editingId === item.id ? (
            <TeamForm
              key={item.id}
              initial={item}
              others={items.filter((x) => x.id !== item.id)}
              onSubmit={(v) => updateCompanyTeamMember(item.id, v)}
              onCancel={() => setEditingId(null)}
              onDone={() => setEditingId(null)}
              submitLabel="Save changes"
            />
          ) : (
            <TeamRowDisplay
              key={item.id}
              item={item}
              manager={item.reports_to ? byId.get(item.reports_to) ?? null : null}
              onEdit={() => setEditingId(item.id)}
            />
          ),
        )}
      </div>

      {items.length === 0 && !adding && (
        <p className="text-[13.5px] text-muted">No team members yet.</p>
      )}

      {adding ? (
        <TeamForm others={items} onSubmit={addCompanyTeamMember} onCancel={() => setAdding(false)} onDone={() => setAdding(false)} submitLabel="Save person" asPanel />
      ) : (
        <div className="mt-4">
          <Button kind="quiet" size="md" onClick={() => setAdding(true)}>+ Add team member</Button>
        </div>
      )}
    </SectionCard>
  );
}

function TeamRowDisplay({ item, manager, onEdit }: { item: TeamRow; manager: TeamRow | null; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <article className="rounded-[10px] border border-border bg-paper p-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="font-serif text-[16px] tracking-tightish">{item.person_name}</h3>
        {item.role && <div className="text-[13px] text-ink-soft mt-0.5">{item.role}</div>}
        {(item.units?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {item.units!.map((u) => <span key={u} className="rounded-full bg-cream border border-border px-2 py-0.5 text-[11.5px] text-ink-soft">{u}</span>)}
          </div>
        )}
        {manager && <div className="text-[12px] text-muted mt-1">Reports to: {manager.person_name}</div>}
      </div>
      <div className="flex gap-1 shrink-0">
        <Button kind="ghost" size="sm" onClick={onEdit}>Edit</Button>
        <Button kind="ghost" size="sm" disabled={pending}
          onClick={() => { if (confirm("Delete this person?")) startTransition(() => { void deleteCompanyTeamMember(item.id); }); }}
          className="text-red-700 hover:bg-red-50">
          {pending ? "..." : "Delete"}
        </Button>
      </div>
    </article>
  );
}

function TeamForm({
  initial, others, onSubmit, onCancel, onDone, submitLabel, asPanel,
}: {
  initial?: TeamRow;
  others: TeamRow[];
  onSubmit: (values: CompanyTeamValues) => Promise<void>;
  onCancel: () => void; onDone: () => void;
  submitLabel: string; asPanel?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [units, setUnits] = useState<string[]>(initial?.units ?? []);
  const [unitInput, setUnitInput] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyTeamValues>({
    resolver: zodResolver(companyTeamSchema),
    defaultValues: {
      person_name: initial?.person_name ?? "",
      role: initial?.role ?? "",
      units: initial?.units ?? [],
      reports_to: initial?.reports_to ?? null,
    },
  });

  function submit(values: CompanyTeamValues) {
    setServerError(null);
    const cleaned = { ...values, units, reports_to: values.reports_to || null };
    startTransition(async () => {
      try { await onSubmit(cleaned); onDone(); }
      catch (e) { setServerError(e instanceof Error ? e.message : "Couldn't save"); }
    });
  }

  function addUnit() {
    const v = unitInput.trim();
    if (!v || units.some((u) => u.toLowerCase() === v.toLowerCase())) { setUnitInput(""); return; }
    setUnits([...units, v]); setUnitInput("");
  }

  const body = (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Field label="Full name" error={errors.person_name?.message}>
        <input className="field" {...register("person_name")} />
      </Field>
      <Field label="Role / title" error={errors.role?.message}>
        <input className="field" placeholder="e.g. Director of Operations" {...register("role")} />
      </Field>
      <div className="sm:col-span-2">
        <p className="label">Units / departments</p>
        <ul className="flex flex-wrap gap-2">
          {units.map((u) => (
            <li key={u} className="inline-flex items-center gap-1 rounded-full bg-cream border border-border px-3 py-1 text-[13px] text-ink-soft">
              {u}
              <button type="button" aria-label={`Remove ${u}`} onClick={() => setUnits(units.filter((x) => x !== u))} className="ml-1 text-muted hover:text-red-700">×</button>
            </li>
          ))}
          {units.length === 0 && <li className="text-[13px] text-muted">None yet.</li>}
        </ul>
        <div className="mt-2 flex gap-2">
          <input className="field flex-1" placeholder="e.g. Structural" maxLength={60} value={unitInput}
            onChange={(e) => setUnitInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUnit(); } }} />
          <Button type="button" kind="secondary" size="md" disabled={!unitInput.trim()} onClick={addUnit}>Add</Button>
        </div>
      </div>
      <div className="sm:col-span-2">
        <Field label="Reports to" error={errors.reports_to?.message as string | undefined} hint="Leave blank for the top of the chart.">
          <select className="field" {...register("reports_to")}>
            <option value="">— Top of chart —</option>
            {others.map((p) => <option key={p.id} value={p.id}>{p.person_name}{p.role ? ` · ${p.role}` : ""}</option>)}
          </select>
        </Field>
      </div>
      {serverError && <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{serverError}</div>}
      <div className="sm:col-span-2 flex justify-end gap-2">
        <Button type="button" kind="ghost" size="md" onClick={onCancel} disabled={pending}>Cancel</Button>
        <Button type="submit" kind="primary" size="md" disabled={pending}>{pending ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );

  return asPanel ? <NewItemPanel title="New team member">{body}</NewItemPanel> : (
    <div className="rounded-[10px] border border-sienna/40 bg-sienna-soft/40 p-4 sm:p-5">{body}</div>
  );
}
