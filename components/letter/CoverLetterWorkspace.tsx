"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { CV_TEMPLATES } from "@/components/templates/catalog";
import { downloadFile } from "@/lib/download";
import { LETTER_LIMITS, wordCount, type LetterDraft, type LetterFields } from "@/lib/ai/cover-letter";

// The cover-letter helper: paste a job link (or the advert), get a draft
// written from the member's profile, edit it, download it as a PDF set in
// the same type as their CV. The letter is never saved on the server; the
// draft is kept in this browser only, so a refresh doesn't lose it.

type Mode = "input" | "working" | "edit";

const STORE_KEY = "sahan:cover-letter:v1";
interface Stored { fields: LetterFields; gaps: string[]; template: string }

const EMPTY: LetterFields = { organization: "", addressee: "", subject: "", body: "" };

/** Today in the member's own timezone, YYYY-MM-DD, for the date on the letter. */
function localDate(): string {
  const d = new Date();
  const two = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
}

export function CoverLetterWorkspace({ initialUrl, defaultTemplate, defaultTheme, fullName }: {
  /** A job link passed in from a job card on Home. */
  initialUrl: string;
  /** The CV template (and its colour) the member last downloaded. */
  defaultTemplate: string; defaultTheme: string;
  fullName: string;
}) {
  const [mode, setMode] = useState<Mode>("input");
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [fields, setFields] = useState<LetterFields>(EMPTY);
  const [gaps, setGaps] = useState<string[]>([]);
  const [template, setTemplate] = useState(defaultTemplate);
  const [error, setError] = useState<string | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pick up an unfinished letter, unless the member arrived with a new job.
  useEffect(() => {
    if (initialUrl) return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? "null") as Stored | null;
      if (saved?.fields?.body) {
        setFields({ ...EMPTY, ...saved.fields }); setGaps(saved.gaps ?? []);
        if (CV_TEMPLATES.some((t) => t.id === saved.template)) setTemplate(saved.template);
        setMode("edit");
      }
    } catch { /* storage blocked or unreadable: start fresh */ }
  }, [initialUrl]);

  useEffect(() => {
    if (mode !== "edit") return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ fields, gaps, template } satisfies Stored)); } catch { /* optional */ }
  }, [mode, fields, gaps, template]);

  async function write() {
    const pasted = pasteOpen ? text.trim() : "";
    if (!pasted && !url.trim()) { setError("Paste the link to the job first."); return; }
    setError(null); setNeedsProfile(false); setMode("working");
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pasted ? { text: pasted } : { url: url.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.letter) {
        if (json.code === "paste") setPasteOpen(true);
        if (json.code === "profile") setNeedsProfile(true);
        throw new Error(json.error || "Something went wrong. Please try again.");
      }
      const letter = json.letter as LetterDraft;
      setFields({ organization: letter.organization, addressee: letter.addressee, subject: letter.subject, body: letter.body });
      setGaps(letter.gaps);
      setMode("edit");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setMode("input");
    }
  }

  async function download() {
    if (fields.body.trim().length < LETTER_LIMITS.bodyMin) { setError("The letter is too short to download."); return; }
    setError(null); setDownloading(true);
    const result = await downloadFile("/api/letter", {
      fallbackName: "Cover letter.pdf",
      expect: /application\/pdf/,
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The colour only carries over when the letter uses the same template as the CV.
        body: JSON.stringify({
          ...fields, template, theme: template === defaultTemplate ? defaultTheme : "",
          date: localDate(),
        }),
      },
    });
    setDownloading(false);
    if (!result.ok) setError(result.message);
  }

  async function copy() {
    const to = fields.addressee.trim();
    const full = [
      fields.subject.trim(), `Dear ${to || "Hiring Manager"},`, fields.body.trim(),
      `${to ? "Yours sincerely," : "Yours faithfully,"}\n${fullName}`,
    ].filter(Boolean).join("\n\n");
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    } catch { setError("Couldn't copy. Select the text and copy it by hand."); }
  }

  function startOver() {
    try { localStorage.removeItem(STORE_KEY); } catch { /* optional */ }
    setFields(EMPTY); setGaps([]); setError(null); setUrl(""); setText(""); setPasteOpen(false); setMode("input");
  }

  const set = (key: keyof LetterFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value })); setError(null);
  };

  if (mode === "working") {
    return (
      <div className="card text-center py-10" role="status" aria-live="polite">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-sienna-soft border-t-sienna" aria-hidden />
        <p className="mt-3 font-medium">Reading the advert and writing your letter…</p>
        <p className="text-[12.5px] text-muted">This takes about 20 seconds.</p>
      </div>
    );
  }

  if (mode === "edit") {
    const words = wordCount(fields.body);
    return (
      <div className="space-y-4">
        {gaps.length > 0 && (
          <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
            <p className="font-semibold">The advert asks for these, and your profile doesn&rsquo;t show them</p>
            <ul className="mt-1.5 list-disc pl-5 space-y-0.5">
              {gaps.map((g, i) => <li key={i}>{g}</li>)}
            </ul>
            <p className="mt-1.5 text-[12.5px]">We left them out so the letter stays true. If you do have them, add them to the letter and to your profile.</p>
          </div>
        )}

        <section className="card space-y-4">
          <div>
            <p className="section-eyebrow text-sienna">Your draft</p>
            <p className="mt-1.5 text-[13.5px] text-ink-soft leading-relaxed">
              Read it through and make it yours. Check that every statement is true before you send it.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">Organisation</span>
              <input className="field" value={fields.organization} maxLength={LETTER_LIMITS.organization} onChange={set("organization")} />
            </label>
            <label className="block">
              <span className="label">Addressed to</span>
              <input className="field" value={fields.addressee} maxLength={LETTER_LIMITS.addressee} onChange={set("addressee")} placeholder="Hiring Manager" />
            </label>
          </div>
          <label className="block">
            <span className="label">Subject</span>
            <input className="field" value={fields.subject} maxLength={LETTER_LIMITS.subject} onChange={set("subject")} />
          </label>
          <label className="block">
            <span className="label">Letter</span>
            <textarea className="field min-h-[420px] leading-relaxed" value={fields.body} maxLength={LETTER_LIMITS.body} onChange={set("body")} />
            <span className="helper block">
              {words} words. Aim for 220 to 320. Your contact details, the date, the greeting and the sign-off are added to the PDF for you.
            </span>
          </label>

          <label className="block sm:max-w-xs">
            <span className="label">Style</span>
            <select className="field" value={template} onChange={(e) => setTemplate(e.target.value)}>
              {CV_TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <span className="helper block">Pick the same template as your CV so the two match.</span>
          </label>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-700" role="alert">{error}</p>}

          <div className="flex flex-wrap items-center gap-2">
            <Button kind="sienna" size="lg" onClick={download} disabled={downloading}>
              {downloading ? "Creating PDF…" : "Download PDF"}
            </Button>
            <Button kind="quiet" size="lg" onClick={copy}>{copied ? "Copied ✓" : "Copy text"}</Button>
            <Button kind="ghost" size="lg" onClick={startOver}>Write another</Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <section className="card">
      <label className="block">
        <span className="label">Link to the job advert</span>
        <input className="field" type="url" inputMode="url" autoComplete="off" value={url} maxLength={2000}
          placeholder="https://…" disabled={pasteOpen && text.trim().length > 0}
          onChange={(e) => { setUrl(e.target.value); setError(null); }}
          onKeyDown={(e) => { if (e.key === "Enter") void write(); }} />
      </label>

      {pasteOpen ? (
        <label className="block mt-4">
          <span className="label">Or paste the advert text</span>
          <textarea className="field min-h-[200px]" value={text} maxLength={20000}
            placeholder="Copy the whole advert from the job page (title, organisation, duties and requirements) and paste it here."
            onChange={(e) => { setText(e.target.value); setError(null); }} />
        </label>
      ) : (
        <button type="button" onClick={() => setPasteOpen(true)} className="mt-2 text-[12.5px] font-medium text-sienna hover:underline">
          No link, or the link doesn&rsquo;t work? Paste the advert text instead
        </button>
      )}

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-700" role="alert">
          {error}{" "}
          {needsProfile && <a href="/profile" className="font-semibold underline">Go to my profile</a>}
        </p>
      )}

      <div className="mt-4">
        <Button kind="sienna" size="lg" onClick={() => void write()}>Write my letter →</Button>
      </div>

      <p className="mt-4 text-[11.5px] text-muted leading-relaxed">
        We send the job advert and your work history, education and skills to our AI provider (DeepSeek) to draft the letter.
        Your name, phone, email and referees are not sent. We don&rsquo;t store the advert or the letter.
        The letter only uses what is in your profile, so a fuller profile makes a stronger letter.
      </p>
    </section>
  );
}
