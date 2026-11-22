// The cover letter the AI drafts and the member edits. Pure and client-safe
// so the editor, the draft route and the PDF route share one shape and one
// set of limits.
//
// normalizeLetter() is the gate between the model and everything else: its
// JSON is untrusted, so every field is coerced, trimmed and length-capped.

import { str, arr, obj } from "@/lib/ai/draft";

export const LETTER_LIMITS = {
  organization: 160,
  addressee: 120,
  subject: 200,
  /** About two A4 pages; a good letter is a third of this. */
  body: 6000,
  bodyMin: 80,
} as const;

/** What the member edits and what the PDF route prints. */
export interface LetterFields {
  organization: string;
  /** Person or team the letter is addressed to; "" prints "Hiring Manager". */
  addressee: string;
  subject: string;
  /** Paragraphs separated by a blank line. No greeting or sign-off. */
  body: string;
}

export interface LetterDraft extends LetterFields {
  jobTitle: string;
  /** Requirements in the advert that the member's profile doesn't show. */
  gaps: string[];
}

// Whole-paragraph greetings and sign-offs only: both are short, so a real
// paragraph that happens to open with one of these words is kept.
const GREETING = /^(dear|to whom|hello|hi|greetings)\b[^.]{0,80}[,:]?$/i;
const SIGN_OFF = /^(yours|sincerely|kind regards|best regards|regards|respectfully|warm regards)\b.{0,60}$/i;

export function normalizeLetter(raw: unknown): LetterDraft | null {
  const o = obj(raw);
  if (o.is_job === false) return null;

  // The page adds the greeting and sign-off, so drop any the model wrote.
  const paragraphs = arr(o.paragraphs)
    .map((p) => str(p, 1500))
    .filter((p) => p && !GREETING.test(p) && !SIGN_OFF.test(p))
    .slice(0, 6);
  const body = paragraphs.join("\n\n").slice(0, LETTER_LIMITS.body);
  if (body.length < LETTER_LIMITS.bodyMin) return null;

  const jobTitle = str(o.job_title, 140);
  const reference = str(o.reference, 60);
  const subject = jobTitle
    ? `Application for the position of ${jobTitle}${reference ? ` (Ref: ${reference})` : ""}`
    : "Job application";

  return {
    jobTitle,
    organization: str(o.organization, LETTER_LIMITS.organization),
    addressee: str(o.addressee, LETTER_LIMITS.addressee),
    subject: subject.slice(0, LETTER_LIMITS.subject),
    body,
    gaps: arr(o.gaps).map((g) => str(g, 160)).filter(Boolean).slice(0, 3),
  };
}

/** Split an edited body into paragraphs for printing. */
export function letterParagraphs(body: string): string[] {
  return body.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);
}

export function wordCount(s: string): number {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}
