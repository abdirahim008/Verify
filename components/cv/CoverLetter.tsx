import "server-only";
import type { CVData } from "@/lib/pdf/data";
import { letterParagraphs, type LetterFields } from "@/lib/ai/cover-letter";
import { INK, TYPE_CSS, ContactIcon, ContactValue, contactItems } from "./_inkShared";

// The cover letter. One layout, set in the type of whichever CV template the
// member picked (fonts load from that template's entry in
// lib/pdf/templates.ts), so the letter and the CV read as a pair when they
// land in the same application.
//
// The accent only colours the rule under the name: several CV accents are
// pale (Sand, Amber, Gold) and would be unreadable as text on white.

interface LetterType {
  display: string; body: string;
  nameWeight: number; nameSize: number;
  bodySize: number;
  /** Heaviest body weight the template's font request actually loads. */
  strong: number;
}

const SERIF = "Georgia, serif";
const SANS = "system-ui, sans-serif";
const LETTER_TYPE: Record<string, LetterType> = {
  classic:   { display: `"Cormorant Garamond", ${SERIF}`, body: `"EB Garamond", ${SERIF}`, nameWeight: 600, nameSize: 30, bodySize: 12.2, strong: 600 },
  profile:   { display: `"Space Grotesk", ${SANS}`, body: `"Hanken Grotesk", ${SANS}`, nameWeight: 600, nameSize: 24, bodySize: 10.6, strong: 600 },
  grid:      { display: `"Archivo", ${SANS}`, body: `"IBM Plex Sans", ${SANS}`, nameWeight: 700, nameSize: 24, bodySize: 10.4, strong: 600 },
  crest:     { display: `"Marcellus", ${SERIF}`, body: `"Hanken Grotesk", ${SANS}`, nameWeight: 400, nameSize: 27, bodySize: 10.6, strong: 600 },
  editorial: { display: `"Spectral", ${SERIF}`, body: `"Public Sans", ${SANS}`, nameWeight: 500, nameSize: 27, bodySize: 10.4, strong: 600 },
  statement: { display: `"Bodoni Moda", ${SERIF}`, body: `"Karla", ${SANS}`, nameWeight: 500, nameSize: 28, bodySize: 10.9, strong: 600 },
  endnote:   { display: `"Archivo", ${SANS}`, body: `"Newsreader", ${SERIF}`, nameWeight: 700, nameSize: 24, bodySize: 11.6, strong: 500 },
  beacon:    { display: `"Montserrat", ${SANS}`, body: `"Source Sans 3", ${SANS}`, nameWeight: 700, nameSize: 23, bodySize: 11.2, strong: 600 },
  frame:     { display: `"Cormorant Garamond", ${SERIF}`, body: `"Public Sans", ${SANS}`, nameWeight: 600, nameSize: 30, bodySize: 10.4, strong: 600 },
};

export const LETTER_TEMPLATE_IDS = Object.keys(LETTER_TYPE);

export function CoverLetter({ data, letter, template, theme, date }: {
  data: CVData; letter: LetterFields; template: string; theme?: Record<string, string>;
  /** Printed as given, e.g. "22 November 2026". */
  date: string;
}) {
  const type = LETTER_TYPE[template] ?? LETTER_TYPE.classic;
  const accent = theme?.accent ?? INK.ink;
  const contact = contactItems(data);
  const addressee = letter.addressee.trim();
  const organization = letter.organization.trim();
  const subject = letter.subject.trim();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles(type, accent) + TYPE_CSS }} />
      <div className="letter">
        <header className="head">
          <h1 className="name">{data.fullName}</h1>
          {data.headline && <div className="role">{data.headline}</div>}
          <div className="bar" />
          {contact.length > 0 && (
            <div className="contact">
              {contact.map((c, i) => (
                <span key={i} className="c-item"><ContactIcon kind={c.kind} size={9.5} color={INK.muted} /><ContactValue {...c} /></span>
              ))}
            </div>
          )}
        </header>

        <div className="date">{date}</div>

        <div className="to">
          <div>{addressee || "The Hiring Manager"}</div>
          {organization && <div>{organization}</div>}
        </div>

        {subject && <div className="subject">{subject}</div>}

        <p className="greet">Dear {addressee || "Hiring Manager"},</p>
        {letterParagraphs(letter.body).map((p, i) => <p key={i}>{p}</p>)}

        {/* British convention: "sincerely" to a named person, "faithfully" otherwise. */}
        <div className="close">
          <p>{addressee ? "Yours sincerely," : "Yours faithfully,"}</p>
          <p className="sig">{data.fullName}</p>
        </div>
      </div>
    </>
  );
}

function styles(t: LetterType, accent: string): string {
  return `
@page { size: A4; margin: 21mm 24mm 19mm; }
.letter { color: ${INK.body}; font-family: ${t.body}; font-size: ${t.bodySize}pt; line-height: 1.56; -webkit-font-smoothing: antialiased; }

.name { margin: 0; font-family: ${t.display}; font-weight: ${t.nameWeight}; font-size: ${t.nameSize}pt; line-height: 1.08; color: ${INK.ink}; letter-spacing: 0.005em; }
.role { margin-top: 4pt; font-size: ${t.bodySize - 0.6}pt; letter-spacing: 0.08em; text-transform: uppercase; color: ${INK.muted}; }
.bar { margin-top: 11pt; height: 2.2pt; width: 44pt; background: ${accent}; }
.contact { margin-top: 10pt; padding-bottom: 11pt; border-bottom: 0.6pt solid ${INK.hair}; display: flex; flex-wrap: wrap; gap: 3pt 16pt; font-size: ${t.bodySize - 1.2}pt; color: ${INK.muted}; }
.c-item { display: inline-flex; align-items: center; gap: 5pt; white-space: nowrap; }
.c-item a { color: inherit; text-decoration: none; }

.date { margin-top: 22pt; color: ${INK.muted}; }
.to { margin-top: 14pt; color: ${INK.ink}; }
.subject { margin-top: 16pt; font-weight: ${t.strong}; color: ${INK.ink}; }

p { margin: 0 0 0.82em; orphans: 3; widows: 3; }
.greet { margin-top: 15pt; }
.close { margin-top: 1.5em; break-inside: avoid; }
.close p { margin: 0; }
.sig { margin-top: 2.1em !important; font-weight: ${t.strong}; color: ${INK.ink}; }
`;
}
