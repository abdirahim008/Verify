"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { cn } from "@/lib/cn";
import type { ProfileDraft } from "@/lib/ai/draft";
import { DraftReview } from "./DraftReview";

// Shown at the top of the builder until the CV is unlocked: three ways to
// start — tell the AI about yourself, upload an existing CV, or fill in the
// form by hand. The AI options produce a draft the member reviews and edits
// (DraftReview); nothing is saved until they confirm. `fallback` (the
// starter checklist) shows once they pick the manual route.

type Mode = "choose" | "text" | "upload" | "working" | "review" | "manual";

const EXAMPLE =
  "Magacaygu waa Amina Warsame. I work as a WASH officer at Juba Health Network in Kismayo since 2019. " +
  "Before that I was assistant engineer at Horn Build 2016–2018. I studied civil engineering at Somali National University (2012–2016). " +
  "I speak Somali, English and some Arabic. Skills: KoboToolbox, hygiene promotion, report writing.";

export function QuickStart({ heading, compact, fallback }: { heading: string; compact?: boolean; fallback?: ReactNode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(compact ? "manual" : "choose");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [source, setSource] = useState<"text" | "cv">("text");
  const fileRef = useRef<HTMLInputElement>(null);

  async function send(body: FormData, src: "text" | "cv") {
    setError(null); setSource(src); setMode("working");
    try {
      const res = await fetch("/api/ai/profile-draft", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.draft) throw new Error(json.error || "Something went wrong. Please try again.");
      setDraft(json.draft as ProfileDraft); setMode("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setMode(src === "cv" ? "upload" : "text");
    }
  }

  function submitText() {
    if (text.trim().length < 40) { setError("Tell us a little more — your jobs, studies and skills."); return; }
    const f = new FormData(); f.set("text", text.trim()); void send(f, "text");
  }
  function submitFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("That file is over 5 MB."); return; }
    const f = new FormData(); f.set("file", file); void send(f, "cv");
  }

  if (mode === "manual") {
    return (
      <>
        {fallback}
        <button type="button" onClick={() => setMode("choose")}
          className="w-full rounded-[12px] border border-dashed border-sienna/40 bg-sienna-soft/30 px-4 py-3 text-left text-[13.5px] text-ink-soft hover:border-sienna">
          <span className="font-semibold text-sienna">✨ Short on time?</span> Let our AI fill your profile from your CV or a few sentences.
          <span className="block text-[12px] text-muted">Waqti yar? AI-gu ha ka buuxiyo CV-gaaga ama dhowr weedh.</span>
        </button>
      </>
    );
  }

  if (mode === "review" && draft) {
    return (
      <DraftReview
        draft={draft} source={source}
        onCancel={() => { setDraft(null); setMode("choose"); }}
        onSaved={() => { setDraft(null); setMode("manual"); router.refresh(); }}
      />
    );
  }

  return (
    <section className="card border-sienna/30 bg-cream/40">
      <p className="section-eyebrow text-sienna">Get started · Bilow</p>
      <h2 className="font-serif text-[22px] tracking-tightish mt-1 leading-tight">{heading}</h2>
      <p className="mt-1.5 text-[13.5px] text-ink-soft leading-relaxed">
        Choose the easiest way for you. You can check and edit everything before it&rsquo;s saved.
        <span className="block text-[12.5px] text-muted">Dooro habka kuugu fudud. Wax walba waad hubin kartaa kahor inta aan la kaydin.</span>
      </p>

      {mode === "working" ? (
        <div className="mt-5 rounded-lg border border-border bg-paper p-6 text-center" role="status" aria-live="polite">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-sienna-soft border-t-sienna" aria-hidden />
          <p className="mt-3 font-medium">{source === "cv" ? "Reading your CV…" : "Writing your profile…"}</p>
          <p className="text-[12.5px] text-muted">This takes about 20 seconds. · Waxay qaadanaysaa ilaa 20 ilbiriqsi.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Choice active={mode === "text"} onClick={() => { setError(null); setMode("text"); }}
            icon="💬" title="Tell us about yourself" so="Nooga sheeg naftaada"
            hint="Write in Somali or English — AI turns it into a CV." />
          <Choice active={mode === "upload"} onClick={() => { setError(null); setMode("upload"); }}
            icon="📄" title="Upload your CV" so="Soo geli CV-gaaga"
            hint="PDF or Word. AI fills in your profile from it." />
          <Choice active={false} onClick={() => setMode("manual")}
            icon="✍️" title="Fill in manually" so="Gacanta ku buuxi"
            hint="Use the step-by-step form." />
        </div>
      )}

      {mode === "text" && (
        <div className="mt-4">
          <label className="block">
            <span className="label">Your jobs, studies, skills and languages · Shaqooyinkaaga, waxbarashadaada, xirfadahaaga</span>
            <textarea className="field min-h-[180px]" value={text} maxLength={8000}
              onChange={(e) => { setText(e.target.value); setError(null); }}
              placeholder={EXAMPLE} />
          </label>
          <p className="helper">Include job titles, organisations and years. The AI only uses what you write — it won&rsquo;t make things up.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button kind="sienna" size="md" onClick={submitText}>Create my profile →</Button>
            <span className="text-[12px] text-muted">{text.trim().length}/8000</span>
          </div>
        </div>
      )}

      {mode === "upload" && (
        <div className="mt-4">
          <input ref={fileRef} type="file" className="sr-only"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => submitFile(e.target.files?.[0])} />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-full rounded-lg border-2 border-dashed border-sienna/40 bg-paper px-4 py-8 text-center hover:border-sienna">
            <span className="block text-[15px] font-semibold text-sienna">Choose your CV file · Dooro faylka CV-ga</span>
            <span className="block text-[12.5px] text-muted mt-1">PDF or Word (.docx), up to 5 MB. Photos and scans can&rsquo;t be read yet — type your details instead.</span>
          </button>
        </div>
      )}

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-700" role="alert">{error}</p>}

      <p className="mt-4 text-[11.5px] text-muted leading-relaxed">
        The AI options send your text or CV to our AI provider (DeepSeek) to draft your profile. We don&rsquo;t store the text or file you send.
      </p>
    </section>
  );
}

function Choice({ active, onClick, icon, title, so, hint }: {
  active: boolean; onClick: () => void; icon: string; title: string; so: string; hint: string;
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={cn(
        "rounded-lg border bg-paper p-4 text-left transition min-h-[44px]",
        active ? "border-sienna ring-2 ring-sienna/20" : "border-border hover:border-muted",
      )}>
      <span className="text-[22px]" aria-hidden>{icon}</span>
      <span className="mt-1 block font-semibold text-[14.5px] text-ink">{title}</span>
      <span className="block text-[12.5px] text-sienna">{so}</span>
      <span className="mt-1 block text-[12px] text-muted leading-snug">{hint}</span>
    </button>
  );
}
