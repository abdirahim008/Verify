"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { cn } from "@/lib/cn";
import type { ProfileDraft } from "@/lib/ai/draft";
import type { CompanyDraft } from "@/lib/ai/company-draft";
import { pdfTextInBrowser } from "@/lib/pdf-text-browser";
import { DraftReview } from "./DraftReview";
import { CompanyDraftReview } from "./CompanyDraftReview";

// Shown at the top of the builder until the download is unlocked: three
// ways to start — tell the AI about yourself (or your company), upload an
// existing CV / company profile, or fill in the form by hand. The AI
// options produce a draft the member reviews and edits (DraftReview /
// CompanyDraftReview); nothing is saved until they confirm. `fallback` (the
// starter checklist) shows once they pick the manual route.

type Mode = "choose" | "text" | "upload" | "working" | "review" | "manual";
type Kind = "individual" | "company";

// Files up to this size go to the server; bigger PDFs are read here in the
// browser (Vercel caps request bodies at 4.5 MB) and only the text is sent.
// What the AI costs depends on the text, not the file: `pages` and `chars`
// match the route's limits (app/api/ai/profile-draft), and 20 MB covers a
// designed company profile while keeping phones from choking on huge files.
const SERVER_MAX = 4 * 1024 * 1024;
const BROWSER_MAX = 20 * 1024 * 1024;

const COPY = {
  individual: {
    textTitle: "Tell us about yourself", textSo: "Nooga sheeg naftaada",
    textHint: "Write in Somali or English — AI turns it into a CV.",
    fileTitle: "Upload your CV", fileSo: "Soo geli CV-gaaga",
    fileHint: "PDF or Word. AI fills in your profile from it.",
    label: "Your jobs, studies, skills and languages · Shaqooyinkaaga, waxbarashadaada, xirfadahaaga",
    helper: "Include job titles, organisations and years.",
    tooShort: "Tell us a little more — your jobs, studies and skills.",
    choose: "Choose your CV file · Dooro faylka CV-ga",
    reading: "Reading your CV…", writing: "Writing your profile…", pages: 8, chars: 15000,
    shortOnTime: "Let our AI fill your profile from your CV or a few sentences.",
    shortOnTimeSo: "Waqti yar? AI-gu ha ka buuxiyo CV-gaaga ama dhowr weedh.",
    example:
      "Magacaygu waa Amina Warsame. I work as a WASH officer at Juba Health Network in Kismayo since 2019. " +
      "Before that I was assistant engineer at Horn Build 2016–2018. I studied civil engineering at Somali National University (2012–2016). " +
      "I speak Somali, English and some Arabic. Skills: KoboToolbox, hygiene promotion, report writing.",
  },
  company: {
    textTitle: "Describe your company", textSo: "Noo sheeg shirkaddaada",
    textHint: "Write in Somali or English — AI turns it into a company profile.",
    fileTitle: "Upload your company profile", fileSo: "Soo geli profile-ka shirkadda",
    fileHint: "PDF or Word. AI fills in your company page from it.",
    label: "What you do, your projects, clients and team · Waxaad qabataan, mashaariicda, macaamiisha iyo shaqaalaha",
    helper: "Include project names, clients, years and values where you can.",
    tooShort: "Tell us a little more — what your company does, your projects and clients.",
    choose: "Choose your company profile · Dooro faylka profile-ka",
    reading: "Reading your company profile…", writing: "Writing your company profile…", pages: 20, chars: 20000,
    shortOnTime: "Let our AI fill your company page from your existing profile or a few sentences.",
    shortOnTimeSo: "Waqti yar? AI-gu ha ka buuxiyo profile-kaaga ama dhowr weedh.",
    example:
      "Shirkaddayadu waa Horn Build & Water Services, founded 2011 in Mogadishu, registered with the Ministry of Commerce. " +
      "We do borehole drilling, water supply and road works. Projects: rehabilitation of 12 boreholes for UNICEF in Lower Shabelle, 2021–2022, USD 1.2M; " +
      "Kismayo market road for the Jubaland Ministry of Public Works, 2023. Clients: UNICEF, NRC, Banadir Regional Administration. " +
      "Managing Director: Eng. Abdi Warsame. 85 staff.",
  },
} as const;

export function QuickStart({ heading, compact, fallback, kind = "individual" }: {
  heading: string; compact?: boolean; fallback?: ReactNode; kind?: Kind;
}) {
  const copy = COPY[kind];
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(compact ? "manual" : "choose");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | CompanyDraft | null>(null);
  const [source, setSource] = useState<"text" | "cv">("text");
  const fileRef = useRef<HTMLInputElement>(null);

  async function send(body: FormData, src: "text" | "cv") {
    setError(null); setSource(src); setMode("working");
    try {
      const res = await fetch("/api/ai/profile-draft", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.draft) throw new Error(json.error || "Something went wrong. Please try again.");
      setDraft(json.draft as ProfileDraft | CompanyDraft); setMode("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setMode(src === "cv" ? "upload" : "text");
    }
  }

  function submitText() {
    if (text.trim().length < 40) { setError(copy.tooShort); return; }
    const f = new FormData(); f.set("text", text.trim()); void send(f, "text");
  }
  async function submitFile(file: File | undefined) {
    if (fileRef.current) fileRef.current.value = ""; // allow picking the same file again
    if (!file) return;
    const f = new FormData();
    if (file.size <= SERVER_MAX) {
      f.set("file", file); void send(f, "cv"); return;
    }
    const isPdf = /\.pdf$/i.test(file.name) || file.type === "application/pdf";
    if (!isPdf) { setError("That Word file is too big. Save it as a PDF and upload that instead."); return; }
    if (file.size > BROWSER_MAX) { setError("That file is over 20 MB. Please upload a smaller PDF — for example, save it again with compressed images."); return; }
    setError(null); setSource("cv"); setMode("working");
    try {
      f.set("text", (await pdfTextInBrowser(file, copy.pages)).slice(0, copy.chars)); f.set("from", "file");
    } catch {
      setError("We couldn't read that file. Try another PDF, or type your details instead."); setMode("upload"); return;
    }
    void send(f, "cv");
  }

  if (mode === "manual") {
    return (
      <>
        {fallback}
        <button type="button" onClick={() => setMode("choose")}
          className="w-full rounded-[12px] border border-dashed border-sienna/40 bg-sienna-soft/30 px-4 py-3 text-left text-[13.5px] text-ink-soft hover:border-sienna">
          <span className="font-semibold text-sienna">✨ Short on time?</span> {copy.shortOnTime}
          <span className="block text-[12px] text-muted">{copy.shortOnTimeSo}</span>
        </button>
      </>
    );
  }

  if (mode === "review" && draft) {
    const onCancel = () => { setDraft(null); setMode("choose"); };
    const onSaved = () => { setDraft(null); setMode("manual"); router.refresh(); };
    return kind === "company"
      ? <CompanyDraftReview draft={draft as CompanyDraft} source={source} onCancel={onCancel} onSaved={onSaved} />
      : <DraftReview draft={draft as ProfileDraft} source={source} onCancel={onCancel} onSaved={onSaved} />;
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
          <p className="mt-3 font-medium">{source === "cv" ? copy.reading : copy.writing}</p>
          <p className="text-[12.5px] text-muted">This takes about 20 seconds. · Waxay qaadanaysaa ilaa 20 ilbiriqsi.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Choice active={mode === "text"} onClick={() => { setError(null); setMode("text"); }}
            icon="💬" title={copy.textTitle} so={copy.textSo} hint={copy.textHint} />
          <Choice active={mode === "upload"} onClick={() => { setError(null); setMode("upload"); }}
            icon="📄" title={copy.fileTitle} so={copy.fileSo} hint={copy.fileHint} />
          <Choice active={false} onClick={() => setMode("manual")}
            icon="✍️" title="Fill in manually" so="Gacanta ku buuxi"
            hint="Use the step-by-step form." />
        </div>
      )}

      {mode === "text" && (
        <div className="mt-4">
          <label className="block">
            <span className="label">{copy.label}</span>
            <textarea className="field min-h-[180px]" value={text} maxLength={8000}
              onChange={(e) => { setText(e.target.value); setError(null); }}
              placeholder={copy.example} />
          </label>
          <p className="helper">{copy.helper} The AI only uses what you write — it won&rsquo;t make things up.</p>
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
            onChange={(e) => void submitFile(e.target.files?.[0])} />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-full rounded-lg border-2 border-dashed border-sienna/40 bg-paper px-4 py-8 text-center hover:border-sienna">
            <span className="block text-[15px] font-semibold text-sienna">{copy.choose}</span>
            <span className="block text-[12.5px] text-muted mt-1">PDF (up to 20 MB) or Word (.docx, up to 4 MB). Photos and scans can&rsquo;t be read yet — type your details instead.</span>
          </button>
        </div>
      )}

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-700" role="alert">{error}</p>}

      <p className="mt-4 text-[11.5px] text-muted leading-relaxed">
        The AI options send your text, or the text of your file, to our AI provider (DeepSeek) to draft your profile. We don&rsquo;t store the text or file you send.
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
