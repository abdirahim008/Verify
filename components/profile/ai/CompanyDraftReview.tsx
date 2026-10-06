"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { Field } from "@/components/profile/SectionCard";
import { saveImportedCompany } from "@/lib/actions/ai-company-import";
import type { CompanyDraft, DraftProject, DraftNamed } from "@/lib/ai/company-draft";
import { Group, Entry, Chips } from "./DraftReview";

// Review screen for an AI company draft — the company twin of DraftReview.
// Every field is editable and every entry removable; nothing is written
// until "Save to my profile".

export function CompanyDraftReview({ draft: initial, source, onCancel, onSaved }: {
  draft: CompanyDraft; source: "text" | "cv"; onCancel: () => void; onSaved: () => void;
}) {
  const [d, setD] = useState<CompanyDraft>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = <K extends keyof CompanyDraft>(k: K, v: CompanyDraft[K]) => setD((p) => ({ ...p, [k]: v }));
  const setProject = (i: number, patch: Partial<DraftProject>) =>
    set("projects", d.projects.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const setService = (i: number, patch: Partial<DraftNamed>) =>
    set("services", d.services.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const input = (k: "companyName" | "tagline" | "country" | "foundedYear" | "registrationNumber" | "staffCount" | "website" | "email" | "phone",
    extra: Record<string, unknown> = {}) =>
    <input className="field" value={d[k]} onChange={(e) => set(k, e.target.value)} {...extra} />;

  function save() {
    setError(null);
    if (!d.companyName.trim()) { setError("Please add your company name."); return; }
    start(async () => {
      try { await saveImportedCompany(d); onSaved(); }
      catch (e) { setError(e instanceof Error ? e.message : "Couldn't save. Please try again."); }
    });
  }

  return (
    <section className="card border-sienna/40">
      <p className="section-eyebrow text-sienna">{source === "cv" ? "From your company profile" : "Your draft"} · Hubi</p>
      <h2 className="font-serif text-[22px] tracking-tightish mt-1 leading-tight">Check your company profile, then save</h2>
      <p className="mt-1.5 text-[13.5px] text-ink-soft leading-relaxed">
        Edit anything that&rsquo;s wrong and remove what you don&rsquo;t want. You can change it all later too.
        <span className="block text-[12.5px] text-muted">Sax wixii khaldan, ka saar wixii aadan rabin, kadibna kaydi.</span>
      </p>

      {d.missing.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          <p className="font-semibold">Worth adding · Ku dar haddii aad haysato</p>
          <ul className="mt-1 list-disc pl-5">{d.missing.map((m, i) => <li key={i}>{m}</li>)}</ul>
        </div>
      )}

      <Group title="Company">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Company name">{input("companyName")}</Field>
          <Field label="Tagline">{input("tagline")}</Field>
          <Field label="Country">{input("country")}</Field>
          <Field label="Founded (year)">{input("foundedYear", { inputMode: "numeric", maxLength: 4 })}</Field>
          <Field label="Registration number">{input("registrationNumber")}</Field>
          <Field label="Staff">{input("staffCount", { inputMode: "numeric" })}</Field>
          <Field label="Website">{input("website")}</Field>
          <Field label="Email">{input("email", { type: "email" })}</Field>
          <Field label="Phone">{input("phone", { type: "tel" })}</Field>
        </div>
        <Chips label="Offices / locations" items={d.locations} onRemove={(i) => set("locations", d.locations.filter((_, j) => j !== i))} />
      </Group>

      <Group title="About, mission & vision">
        <Field label="About"><textarea className="field min-h-[110px]" value={d.about} onChange={(e) => set("about", e.target.value)} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Mission"><textarea className="field min-h-[80px]" value={d.mission} onChange={(e) => set("mission", e.target.value)} /></Field>
          <Field label="Vision"><textarea className="field min-h-[80px]" value={d.vision} onChange={(e) => set("vision", e.target.value)} /></Field>
        </div>
      </Group>

      {(d.sectors.length > 0 || d.values.length > 0) && (
        <Group title="Sectors & values">
          <Chips label="Sectors" items={d.sectors} onRemove={(i) => set("sectors", d.sectors.filter((_, j) => j !== i))} />
          <Chips label="Values" items={d.values.map((v) => v.name)} onRemove={(i) => set("values", d.values.filter((_, j) => j !== i))} />
        </Group>
      )}

      {d.services.length > 0 && (
        <Group title={`Services (${d.services.length})`}>
          {d.services.map((s, i) => (
            <Entry key={i} onRemove={() => set("services", d.services.filter((_, j) => j !== i))}>
              <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
                <Field label="Service"><input className="field" value={s.name} onChange={(e) => setService(i, { name: e.target.value })} /></Field>
                <Field label="Description"><input className="field" value={s.description} onChange={(e) => setService(i, { description: e.target.value })} /></Field>
              </div>
            </Entry>
          ))}
        </Group>
      )}

      {d.projects.length > 0 && (
        <Group title={`Projects (${d.projects.length})`}>
          {d.projects.map((p, i) => (
            <Entry key={i} onRemove={() => set("projects", d.projects.filter((_, j) => j !== i))}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Project name"><input className="field" value={p.name} onChange={(e) => setProject(i, { name: e.target.value })} /></Field>
                <Field label="Client / funder"><input className="field" value={p.client} onChange={(e) => setProject(i, { client: e.target.value })} /></Field>
                <Field label="Sector"><input className="field" value={p.sector} onChange={(e) => setProject(i, { sector: e.target.value })} /></Field>
                <div className="grid grid-cols-[1fr_84px] gap-3">
                  <Field label="Value"><input className="field" inputMode="numeric" value={p.value} onChange={(e) => setProject(i, { value: e.target.value })} /></Field>
                  <Field label="Currency"><input className="field" maxLength={3} placeholder="USD" value={p.currency} onChange={(e) => setProject(i, { currency: e.target.value.toUpperCase() })} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="From"><input className="field" inputMode="numeric" maxLength={4} value={p.yearStart} onChange={(e) => setProject(i, { yearStart: e.target.value })} /></Field>
                  <Field label="To"><input className="field" inputMode="numeric" maxLength={4} value={p.yearEnd} onChange={(e) => setProject(i, { yearEnd: e.target.value })} /></Field>
                </div>
              </div>
              <div className="mt-3">
                <Field label="Scope" hint="One item per line — each becomes a bullet.">
                  <textarea className="field min-h-[80px]" value={p.scope} onChange={(e) => setProject(i, { scope: e.target.value })} />
                </Field>
              </div>
            </Entry>
          ))}
        </Group>
      )}

      {(d.clients.length > 0 || d.team.length > 0 || d.certifications.length > 0) && (
        <Group title="Clients, team & certifications">
          <Chips label="Clients (hidden from your public page until you choose to show them)" items={d.clients}
            onRemove={(i) => set("clients", d.clients.filter((_, j) => j !== i))} />
          <Chips label="Key people" items={d.team.map((t) => [t.name, t.role].filter(Boolean).join(" — "))}
            onRemove={(i) => set("team", d.team.filter((_, j) => j !== i))} />
          <Chips label="Certifications" items={d.certifications.map((c) => [c.name, c.issuer, c.year].filter(Boolean).join(" · "))}
            onRemove={(i) => set("certifications", d.certifications.filter((_, j) => j !== i))} />
        </Group>
      )}

      {(d.ceoName || d.ceoMessage) && (
        <Group title="Message from the CEO">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name"><input className="field" value={d.ceoName} onChange={(e) => set("ceoName", e.target.value)} /></Field>
            <Field label="Title"><input className="field" value={d.ceoTitle} onChange={(e) => set("ceoTitle", e.target.value)} /></Field>
          </div>
          {d.ceoMessage && (
            <Field label="Message"><textarea className="field min-h-[100px]" value={d.ceoMessage} onChange={(e) => set("ceoMessage", e.target.value)} /></Field>
          )}
        </Group>
      )}

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-700" role="alert">{error}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border-soft pt-4">
        <Button kind="sienna" size="lg" onClick={save} disabled={pending}>{pending ? "Saving…" : "Save to my profile · Kaydi"}</Button>
        <Button kind="ghost" size="lg" onClick={onCancel} disabled={pending}>Start again</Button>
      </div>
    </section>
  );
}
