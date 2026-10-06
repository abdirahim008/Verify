"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/Button";
import { Field } from "@/components/profile/SectionCard";
import { QUALIFICATION_LABELS } from "@/lib/format";
import { saveImportedProfile } from "@/lib/actions/ai-import";
import {
  QUAL_LEVELS, type ProfileDraft, type DraftExperience, type DraftEducation,
} from "@/lib/ai/draft";

// Review screen for an AI draft. Every field is editable and every entry
// removable; nothing is written until "Save to my profile". Entries whose
// month was a placeholder (the source only gave a year) are flagged.

export function DraftReview({ draft: initial, source, onCancel, onSaved }: {
  draft: ProfileDraft; source: "text" | "cv"; onCancel: () => void; onSaved: () => void;
}) {
  const [d, setD] = useState<ProfileDraft>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = <K extends keyof ProfileDraft>(k: K, v: ProfileDraft[K]) => setD((p) => ({ ...p, [k]: v }));
  const setExp = (i: number, patch: Partial<DraftExperience>) =>
    set("experiences", d.experiences.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const setEdu = (i: number, patch: Partial<DraftEducation>) =>
    set("educations", d.educations.map((e, j) => (j === i ? { ...e, ...patch } : e)));

  function save() {
    setError(null);
    if (!d.fullName.trim()) { setError("Please add your full name."); return; }
    start(async () => {
      try { await saveImportedProfile(d); onSaved(); }
      catch (e) { setError(e instanceof Error ? e.message : "Couldn't save. Please try again."); }
    });
  }

  return (
    <section className="card border-sienna/40">
      <p className="section-eyebrow text-sienna">{source === "cv" ? "From your CV" : "Your draft"} · Hubi</p>
      <h2 className="font-serif text-[22px] tracking-tightish mt-1 leading-tight">Check your profile, then save</h2>
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

      <Group title="About you">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name"><input className="field" value={d.fullName} onChange={(e) => set("fullName", e.target.value)} /></Field>
          <Field label="Headline"><input className="field" value={d.headline} onChange={(e) => set("headline", e.target.value)} /></Field>
          <Field label="Location"><input className="field" value={d.location} onChange={(e) => set("location", e.target.value)} /></Field>
          <Field label="Phone"><input className="field" type="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="Email"><input className="field" type="email" value={d.email} onChange={(e) => set("email", e.target.value)} /></Field>
        </div>
        <div className="mt-3">
          <Field label="Summary"><textarea className="field min-h-[90px]" value={d.summary} onChange={(e) => set("summary", e.target.value)} /></Field>
        </div>
      </Group>

      {d.experiences.length > 0 && (
        <Group title={`Experience (${d.experiences.length})`}>
          {d.experiences.map((e, i) => (
            <Entry key={i} onRemove={() => set("experiences", d.experiences.filter((_, j) => j !== i))}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Job title"><input className="field" value={e.title} onChange={(ev) => setExp(i, { title: ev.target.value })} /></Field>
                <Field label="Organisation"><input className="field" value={e.organization} onChange={(ev) => setExp(i, { organization: ev.target.value })} /></Field>
                <Field label="Start" hint={e.monthGuessed ? "Only the year was given — please check the month." : undefined}>
                  <input className={`field ${e.monthGuessed ? "border-amber-400" : ""}`} type="month" value={e.start}
                    onChange={(ev) => setExp(i, { start: ev.target.value, monthGuessed: false })} />
                </Field>
                <Field label="End">
                  {e.current
                    ? <p className="field bg-cream text-muted">Present</p>
                    : <input className="field" type="month" value={e.end} onChange={(ev) => setExp(i, { end: ev.target.value, monthGuessed: false })} />}
                  <label className="mt-1 flex items-center gap-2 text-[12.5px] text-ink-soft">
                    <input type="checkbox" checked={e.current} onChange={(ev) => setExp(i, { current: ev.target.checked })} /> I work here now
                  </label>
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Achievements" hint="One per line — each becomes a bullet on your CV.">
                  <textarea className="field min-h-[100px]" value={e.description} onChange={(ev) => setExp(i, { description: ev.target.value })} />
                </Field>
              </div>
            </Entry>
          ))}
        </Group>
      )}

      {d.educations.length > 0 && (
        <Group title={`Education (${d.educations.length})`}>
          {d.educations.map((e, i) => (
            <Entry key={i} onRemove={() => set("educations", d.educations.filter((_, j) => j !== i))}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Qualification">
                  <select className="field" value={e.qualification} onChange={(ev) => setEdu(i, { qualification: ev.target.value as DraftEducation["qualification"] })}>
                    {QUAL_LEVELS.map((q) => <option key={q} value={q}>{QUALIFICATION_LABELS[q]}</option>)}
                  </select>
                </Field>
                <Field label="Field of study"><input className="field" value={e.field} onChange={(ev) => setEdu(i, { field: ev.target.value })} /></Field>
                <Field label="Institution"><input className="field" value={e.institution} onChange={(ev) => setEdu(i, { institution: ev.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="From"><input className="field" inputMode="numeric" maxLength={4} value={e.startYear} onChange={(ev) => setEdu(i, { startYear: ev.target.value })} /></Field>
                  <Field label="To"><input className="field" inputMode="numeric" maxLength={4} value={e.endYear} onChange={(ev) => setEdu(i, { endYear: ev.target.value })} /></Field>
                </div>
              </div>
            </Entry>
          ))}
        </Group>
      )}

      {(d.skills.length > 0 || d.languages.length > 0) && (
        <Group title="Skills & languages">
          <Chips label="Skills" items={d.skills} onRemove={(i) => set("skills", d.skills.filter((_, j) => j !== i))} />
          <Chips label="Languages" items={d.languages} onRemove={(i) => set("languages", d.languages.filter((_, j) => j !== i))} />
        </Group>
      )}

      {(d.certifications.length > 0 || d.referees.length > 0) && (
        <Group title="Certifications & referees">
          <Chips label="Certifications" items={d.certifications.map((c) => [c.name, c.issuer, c.year].filter(Boolean).join(" · "))}
            onRemove={(i) => set("certifications", d.certifications.filter((_, j) => j !== i))} />
          <Chips label="Referees (private — never shown publicly)" items={d.referees.map((r) => [r.name, r.position, r.organization].filter(Boolean).join(", "))}
            onRemove={(i) => set("referees", d.referees.filter((_, j) => j !== i))} />
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

export function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="section-eyebrow text-ink-soft mb-2">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function Entry({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <div className="relative rounded-lg border border-border bg-cream/30 p-4">
      <button type="button" onClick={onRemove} className="absolute right-3 top-3 text-[12.5px] font-medium text-muted hover:text-red-700">Remove</button>
      <div className="pr-14 sm:pr-0">{children}</div>
    </div>
  );
}

export function Chips({ label, items, onRemove }: { label: string; items: string[]; onRemove: (i: number) => void }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="label">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-full border border-border bg-paper px-3 py-1 text-[13px]">
            {s}
            <button type="button" aria-label={`Remove ${s}`} onClick={() => onRemove(i)} className="ml-1 text-muted hover:text-red-700">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}
