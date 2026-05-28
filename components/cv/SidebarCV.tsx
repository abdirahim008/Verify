import "server-only";
import type { CVData } from "@/lib/pdf/data";

// Sidebar CV — A4 portrait, two-column dark-teal executive register.
// Public Sans for display, IBM Plex Sans for body. Verified pill is
// outlined (transparent fill) so it reads as a quiet stamp on the dark
// teal main column.
//
// Ported from verify/pdfs/cv-sidebar.jsx — converted to print units (mm)
// so it pages out cleanly to A4 instead of overflowing the 1123-px box.

const COLORS = {
  teal: "#0e2a4a",         // main column
  tealDark: "#091e36",     // left sidebar
  cream: "#e6ecf3",        // primary text on dark
  dim: "#9aa6b3",          // labels / muted on dark
  sand: "#bfcad6",         // accent / org names
  rule: "#1d3b5e",         // section underline
  verified: "#6fcf9c",     // verified outline + text
  verifiedInk: "#0a2a2a",  // verified tick stroke
};

export function SidebarCV({ data }: { data: CVData }) {
  const { fullName, headline, summary, location, email, phone, languages,
          experiences, educations, certifications, skills, year } = data;

  // Right-column skills cap. The Mono variant shows everything; Sidebar's
  // narrow sidebar can't fit more than ~8 without breaking the rhythm.
  const sidebarSkills = skills.slice(0, 8);
  // Two-line headline parsing — "Senior Health Coordinator — Maternal & Child Health".
  const [hLeft, hRight] = splitHeadline(headline);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <section className="page">
        <aside className="sb">
          <div className="sb-monogram">{initials(fullName)}</div>
          <h1 className="sb-name">{toLines(fullName).map((l, i) => <span key={i}>{l.toUpperCase()}<br /></span>)}</h1>
          {(hLeft || hRight) && (
            <p className="sb-headline">
              {hLeft}{hRight && (<><br />{hRight}</>)}
            </p>
          )}

          <SbHead>Contact</SbHead>
          {location && <SbField l="Location" v={location} />}
          {email && <SbField l="Email" v={email} />}
          {phone && <SbField l="Phone" v={phone} />}

          {languages.length > 0 && (
            <>
              <SbHead>Languages</SbHead>
              {languages.map((l, i) => <div key={i} className="sb-lang">{l}</div>)}
            </>
          )}

          {sidebarSkills.length > 0 && (
            <>
              <SbHead>Skills</SbHead>
              <div className="sb-skills">
                {sidebarSkills.map((s, i) => (
                  <div key={i} className="sb-skill">
                    <span className="sb-skill-dot" />
                    {s}
                  </div>
                ))}
              </div>
            </>
          )}

          {certifications.length > 0 && (
            <>
              <SbHead>Certifications</SbHead>
              {certifications.map((c, i) => (
                <div key={i} className="sb-cert">
                  <div className="sb-cert-name">
                    {c.name}
                    {c.verified && <SbTick />}
                  </div>
                  {(c.issuer || c.year) && (
                    <div className="sb-cert-meta">{[c.issuer, c.year].filter(Boolean).join(" · ")}</div>
                  )}
                </div>
              ))}
            </>
          )}

          <div className="sb-foot">Verified on Sahan &middot; {year}</div>
        </aside>

        <main className="mn">
          {summary && (
            <>
              <SbMainHead>Profile</SbMainHead>
              <p className="mn-summary">{summary}</p>
            </>
          )}

          {experiences.length > 0 && (
            <>
              <SbMainHead>Experience</SbMainHead>
              {experiences.map((e, i) => (
                <article key={i} className="mn-exp">
                  <span className="mn-exp-dot" />
                  <div className="mn-exp-head">
                    <div className="mn-exp-title-row">
                      <span className="mn-exp-title">{e.title}</span>
                      {e.verified && <SbVerifiedPill note={e.verifiedNote} />}
                    </div>
                    {e.dateRange && <div className="mn-exp-dates">{e.dateRange.toUpperCase()}</div>}
                  </div>
                  {(e.organization || e.location) && (
                    <div className="mn-exp-meta">{[e.organization, e.location].filter(Boolean).join(" · ")}</div>
                  )}
                  {e.description && <p className="mn-exp-desc">{e.description}</p>}
                </article>
              ))}
            </>
          )}

          {educations.length > 0 && (
            <>
              <SbMainHead>Education</SbMainHead>
              {educations.map((e, i) => (
                <div key={i} className="mn-edu">
                  <div className="mn-edu-head">
                    <span className="mn-edu-qual">
                      {e.qualification}
                      {e.verified && <SbTick />}
                    </span>
                    {e.dateRange && <span className="mn-edu-dates">{e.dateRange}</span>}
                  </div>
                  <div className="mn-edu-inst">{e.institution}{e.field ? ` · ${e.field}` : ""}</div>
                </div>
              ))}
            </>
          )}
        </main>
      </section>
    </>
  );
}

// ── inline pieces ───────────────────────────────────────────────────
function SbHead({ children }: { children: React.ReactNode }) {
  return <div className="sb-head">{children}</div>;
}
function SbMainHead({ children }: { children: React.ReactNode }) {
  return <div className="mn-head">{children}</div>;
}
function SbField({ l, v }: { l: string; v: string }) {
  return (
    <div className="sb-field">
      <div className="sb-field-l">{l}</div>
      <div className="sb-field-v">{v}</div>
    </div>
  );
}
function SbTick() {
  return (
    <svg width="9" height="9" viewBox="0 0 11 11" aria-hidden>
      <circle cx="5.5" cy="5.5" r="5.5" fill={COLORS.verified} />
      <path d="M3 5.5 L4.7 7.2 L8 4" stroke={COLORS.verifiedInk} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function SbVerifiedPill({ note }: { note: string }) {
  return (
    <span className="vbadge">
      <SbTick />
      {note ? `Verified · ${note}` : "Verified"}
    </span>
  );
}

// ── helpers ─────────────────────────────────────────────────────────
function initials(name: string): string {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return "·";
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return (tokens[0][0] + tokens[tokens.length - 1][0]).toUpperCase();
}

// "Ifrah Hassan Abdi" → ["Ifrah", "Hassan", "Abdi"]. Up to 3 lines on the
// monogram block so long Somali compound names lay out cleanly instead of
// shrinking. Falls back to a single token for short names.
function toLines(name: string): string[] {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  return tokens.slice(0, 3);
}

// "Senior Health Coordinator — Maternal & Child Health"
//   → ["Senior Health Coordinator", "Maternal & Child Health"]
// A dash/colon/pipe means "second line". Otherwise the whole thing
// occupies the first line.
function splitHeadline(h: string): [string, string] {
  const m = h.match(/^(.+?)\s*[—–\-|:·]\s*(.+)$/);
  return m ? [m[1], m[2]] : [h, ""];
}

const STYLES = `
@page { size: A4; margin: 0; }

.page {
  width: 210mm;
  min-height: 297mm;
  display: grid;
  grid-template-columns: 78mm 1fr;
  color: ${COLORS.cream};
  font-family: "IBM Plex Sans", "Public Sans", "Source Sans 3", system-ui, sans-serif;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Sidebar (left, dark teal) ─────────────────────────────────── */
.sb {
  background: ${COLORS.tealDark};
  padding: 16mm 9mm 18mm;
  color: ${COLORS.cream};
  position: relative;
}
.sb-monogram {
  width: 17mm; height: 17mm; border-radius: 50%;
  background: ${COLORS.sand}; color: ${COLORS.tealDark};
  display: flex; align-items: center; justify-content: center;
  font-family: "Public Sans", "Source Sans 3", system-ui, sans-serif;
  font-weight: 700; font-size: 17pt; letter-spacing: -0.02em;
  margin-bottom: 6mm;
}
.sb-name {
  font-family: "Public Sans", "Source Sans 3", system-ui, sans-serif;
  font-weight: 700; font-size: 21pt;
  line-height: 1; letter-spacing: -0.015em;
  color: ${COLORS.cream}; margin: 0;
}
.sb-headline {
  margin-top: 3mm; font-size: 9.5pt; color: ${COLORS.dim};
  letter-spacing: 0.04em; line-height: 1.55;
}
.sb-head {
  font-family: "Public Sans", "Source Sans 3", system-ui, sans-serif;
  font-weight: 700; font-size: 8pt; letter-spacing: 0.18em;
  color: ${COLORS.sand}; text-transform: uppercase;
  margin-top: 7mm; margin-bottom: 2.5mm;
}
.sb-field { margin-bottom: 2.5mm; }
.sb-field-l { font-size: 7pt; color: ${COLORS.dim}; letter-spacing: 0.08em; text-transform: uppercase; }
.sb-field-v { font-size: 9.5pt; color: ${COLORS.cream}; margin-top: 0.5mm; line-height: 1.4; word-break: break-word; }
.sb-lang { font-size: 9.5pt; color: ${COLORS.cream}; margin-bottom: 1.2mm; }
.sb-skills { display: flex; flex-direction: column; gap: 1.8mm; }
.sb-skill {
  font-size: 9.5pt; color: ${COLORS.cream};
  display: flex; align-items: center; gap: 2.5mm;
}
.sb-skill-dot {
  width: 1.2mm; height: 1.2mm; border-radius: 99px;
  background: ${COLORS.sand}; flex-shrink: 0;
}
.sb-cert { margin-bottom: 2.5mm; }
.sb-cert-name {
  font-size: 9pt; color: ${COLORS.cream}; font-weight: 500;
  display: flex; gap: 1.5mm; align-items: center; flex-wrap: wrap;
}
.sb-cert-meta { font-size: 8pt; color: ${COLORS.dim}; margin-top: 0.5mm; }
.sb-foot {
  position: absolute; bottom: 9mm; left: 9mm; right: 9mm;
  font-size: 7pt; color: ${COLORS.dim};
  letter-spacing: 0.12em; text-transform: uppercase;
}

/* ── Main column (right, teal) ─────────────────────────────────── */
.mn {
  background: ${COLORS.teal};
  background-image: radial-gradient(circle at 90% 0%, rgba(10, 92, 173, 0.16), transparent 50%);
  padding: 16mm 13mm 18mm;
}
.mn-head {
  font-family: "Public Sans", "Source Sans 3", system-ui, sans-serif;
  font-weight: 700; font-size: 9.5pt;
  letter-spacing: 0.2em; color: ${COLORS.sand};
  text-transform: uppercase;
  margin-top: 5mm; margin-bottom: 4mm;
  padding-bottom: 2mm; border-bottom: 1px solid ${COLORS.rule};
}
.mn-head:first-child { margin-top: 0; }
.mn-summary {
  font-size: 10pt; line-height: 1.65;
  color: ${COLORS.cream}; margin: 0 0 4mm;
}
.mn-exp { margin-bottom: 6mm; position: relative; break-inside: avoid; page-break-inside: avoid; }
.mn-exp-dot {
  position: absolute; left: -5.5mm; top: 2.5mm;
  width: 2mm; height: 2mm; border-radius: 50%;
  background: ${COLORS.sand};
}
.mn-exp-head {
  display: flex; justify-content: space-between; align-items: baseline; gap: 4mm;
}
.mn-exp-title-row { display: flex; align-items: center; gap: 2mm; flex-wrap: wrap; }
.mn-exp-title {
  font-family: "Public Sans", "Source Sans 3", system-ui, sans-serif;
  font-weight: 600; font-size: 11.5pt;
  color: ${COLORS.cream}; letter-spacing: -0.005em;
}
.mn-exp-dates {
  font-size: 8pt; color: ${COLORS.dim};
  letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap;
}
.mn-exp-meta {
  font-size: 9.5pt; color: ${COLORS.sand};
  font-weight: 500; margin-top: 0.5mm; letter-spacing: 0.01em;
}
.mn-exp-desc {
  font-size: 9.5pt; line-height: 1.6;
  color: ${COLORS.cream}; margin: 1.8mm 0 0;
}

.mn-edu { margin-bottom: 3.5mm; }
.mn-edu-head { display: flex; justify-content: space-between; align-items: baseline; gap: 3mm; }
.mn-edu-qual {
  font-family: "Public Sans", "Source Sans 3", system-ui, sans-serif;
  font-weight: 600; font-size: 10pt; color: ${COLORS.cream};
  display: flex; align-items: center; gap: 2mm;
}
.mn-edu-dates {
  font-size: 8pt; color: ${COLORS.dim};
  letter-spacing: 0.04em; white-space: nowrap;
}
.mn-edu-inst { font-size: 9pt; color: ${COLORS.sand}; margin-top: 0.5mm; }

.vbadge {
  display: inline-flex; align-items: center; gap: 1mm;
  font-size: 7pt; font-weight: 500; color: ${COLORS.verified};
  border: 1px solid ${COLORS.verified}55;
  padding: 0.4mm 2mm 0.4mm 1.5mm;
  border-radius: 99px; letter-spacing: 0.01em; white-space: nowrap;
}
.vbadge svg { display: inline-block; vertical-align: middle; }
`;
