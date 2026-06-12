import "server-only";
import type { CVData } from "@/lib/pdf/data";

// Editorial CV — A4 portrait, magazine register.
// Fraunces (display, optical sizing) + Newsreader (body) + IBM Plex Sans
// (caps labels) — the pairing the §12 prototypes specified.
//
// Design devices:
//  · double rule (thick over thin) under the masthead — classic editorial
//  · Fraunces italic drop cap on the summary
//  · letterspaced small-caps structural labels
//  · hanging right-aligned dates with tabular figures
//  · oldstyle numerals in running text ("onum")

// Base palette. A curated theme (lib/pdf/themes.ts) may override a safe
// subset of these (accent + paper + rule); verified greens stay constant.
const BASE = {
  cream: "#f7f3eb",
  ink: "#191915",
  inkSoft: "#3b3b38",
  sienna: "#0d3b66",       // deep editorial navy
  muted: "#75716a",
  rule: "#d9d2c2",
  ruleDark: "#191915",
  verifiedBg: "#dcebe2",
  verifiedFg: "#1d6647",
};
type Palette = typeof BASE;

const SANS = `"IBM Plex Sans", system-ui, sans-serif`;
const DISPLAY = `"Fraunces", "Source Serif 4", Georgia, serif`;
const BODY = `"Newsreader", "Source Serif 4", Georgia, serif`;

export function EditorialCV({ data, theme }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, location, email, phone, languages,
          experiences, educations, certifications, skills, year } = data;
  const C: Palette = { ...BASE, ...theme };

  // "First Middle / Last." — surname italicised in the accent with a
  // terminal period, the prototype's signature.
  const nameParts = fullName.trim().split(/\s+/);
  const last = nameParts.length > 1 ? nameParts.pop()! : null;
  const head = last ? nameParts.join(" ") : fullName;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles(C) }} />
      <div className="cv">
        {/* Folio */}
        <div className="folio">
          <span className="folio-l"><span className="folio-tick" />Curriculum Vitae</span>
          <span>{[location, year].filter(Boolean).join("  ·  ")}</span>
        </div>

        {/* Masthead */}
        <header className="hd">
          <h1 className="name">
            {head}
            {last && <><br /><span className="lastname">{last}.</span></>}
          </h1>
          {headline && <div className="headline">{headline}</div>}
          {(location || email || phone) && (
            <div className="contact">
              {[location, email, phone].filter(Boolean).map((s, i, arr) => (
                <span key={i}>{s}{i < arr.length - 1 && <span className="contact-sep"> · </span>}</span>
              ))}
            </div>
          )}
        </header>

        {/* Double rule — the editorial signature */}
        <div className="dbl"><span className="dbl-thick" /><span className="dbl-thin" /></div>

        {/* Summary with drop cap */}
        {summary && (
          <>
            <div className="summary">
              <span className="dropcap">{summary.charAt(0)}</span>
              {summary.slice(1)}
            </div>
            <div style={{ clear: "both" }} />
          </>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <>
            <SectionHead label="Experience" />
            {experiences.map((e, i) => (
              <article key={i} className="exp">
                <div className="exp-head">
                  <div className="exp-title-row">
                    <span className="exp-title">{e.title}</span>
                    {e.organization && <span className="exp-org">&thinsp;·&thinsp;{e.organization}</span>}
                    {e.verified && <VerifiedPill note={e.verifiedNote} />}
                  </div>
                  {e.dateRange && <div className="exp-dates">{e.dateRange.toUpperCase()}</div>}
                </div>
                {e.location && <div className="exp-loc">{e.location}</div>}
                {e.description && <p className="exp-desc">{e.description}</p>}
              </article>
            ))}
          </>
        )}

        {/* Education + Skills two-up */}
        <div className="twoUp">
          <div>
            {educations.length > 0 && (
              <>
                <SectionHead label="Education" />
                {educations.map((e, i) => (
                  <div key={i} className="edu">
                    <div className="edu-head">
                      <span className="edu-qual">{e.qualification}</span>
                      {e.dateRange && <span className="edu-dates">{e.dateRange}</span>}
                    </div>
                    <div className="edu-inst">
                      <span className="edu-inst-name">{e.institution}</span>
                      {e.verified && <VerifiedPill small note={e.verifiedNote} />}
                    </div>
                    {e.field && <div className="edu-field">{e.field}</div>}
                  </div>
                ))}
              </>
            )}

            {certifications.length > 0 && (
              <>
                <SectionHead label="Certifications" />
                {certifications.map((c, i) => (
                  <div key={i} className="cert">
                    <span className="cert-name">{c.name}</span>
                    {(c.issuer || c.year) && (
                      <span className="cert-meta">&thinsp;·&thinsp;{[c.issuer, c.year].filter(Boolean).join(", ")}</span>
                    )}
                    {c.verified && <VerifiedPill small note={c.verifiedNote} />}
                  </div>
                ))}
              </>
            )}
          </div>

          <div>
            {skills.length > 0 && (
              <>
                <SectionHead label="Skills" />
                <div className="skills">
                  {skills.map((s, i) => (
                    <span key={i} className="skill">
                      {s}
                      {i < skills.length - 1 && <span className="skill-sep"> · </span>}
                    </span>
                  ))}
                </div>
              </>
            )}

            {languages.length > 0 && (
              <>
                <SectionHead label="Languages" />
                <div className="languages">
                  {languages.map((l, i) => <div key={i} className="lang">{l}</div>)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="ft">
          <span>{fullName}</span>
          <span className="ft-stamp">Verified on Sahan</span>
          <span>{year}</span>
        </footer>
      </div>
    </>
  );
}

function SectionHead({ label }: { label: string }) {
  return (
    <div className="sh">
      <span className="sh-label">{label}</span>
      <span className="sh-rule" />
    </div>
  );
}

function VerifiedPill({ note, small }: { note: string; small?: boolean }) {
  return (
    <span className={small ? "vbadge vbadge-sm" : "vbadge"}>
      <svg width={small ? "8" : "9"} height={small ? "8" : "9"} viewBox="0 0 11 11" aria-hidden>
        <circle cx="5.5" cy="5.5" r="5.5" fill={BASE.verifiedFg} />
        <path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
      {note ? `Verified · ${note}` : "Verified"}
    </span>
  );
}

const styles = (C: Palette) => `
@page { size: A4; margin: 0; }

.cv {
  width: 210mm;
  min-height: 297mm;
  padding: 16mm 19mm 16mm;
  background: ${C.cream};
  color: ${C.ink};
  font-family: ${BODY};
  font-kerning: normal;
  font-variant-ligatures: common-ligatures;
  -webkit-font-smoothing: antialiased;
}

/* ── Folio ─────────────────────────────────────────────────────── */
.folio {
  display: flex; justify-content: space-between; align-items: baseline;
  font-family: ${SANS};
  font-size: 7.5pt; font-weight: 600;
  color: ${C.muted};
  letter-spacing: 0.24em; text-transform: uppercase;
}
.folio-l { display: inline-flex; align-items: center; gap: 2.5mm; }
.folio-tick { width: 7mm; height: 1px; background: ${C.muted}; display: inline-block; }

/* ── Masthead ──────────────────────────────────────────────────── */
.hd { margin-top: 9mm; }
.name {
  font-family: ${DISPLAY};
  font-optical-sizing: auto;
  font-size: 54pt; font-weight: 340;
  letter-spacing: -0.045em; line-height: 0.94;
  margin: 0;
}
.lastname { font-style: italic; color: ${C.sienna}; font-weight: 310; }
.headline {
  margin-top: 5.5mm;
  font-family: ${BODY};
  font-size: 13.5pt; font-style: italic;
  color: ${C.inkSoft};
  letter-spacing: 0.005em;
}
.contact {
  margin-top: 2.5mm;
  font-family: ${SANS};
  font-size: 8pt; font-weight: 500;
  color: ${C.muted};
  letter-spacing: 0.13em; text-transform: uppercase;
}
.contact-sep { color: ${C.sienna}; letter-spacing: 0; }

/* ── Double rule ───────────────────────────────────────────────── */
.dbl { margin: 7mm 0 6mm; }
.dbl-thick { display: block; height: 0.8mm; background: ${C.ruleDark}; }
.dbl-thin  { display: block; height: 1px; background: ${C.ruleDark}; margin-top: 0.8mm; }

/* ── Summary ───────────────────────────────────────────────────── */
.summary {
  font-size: 11pt; line-height: 1.66;
  color: ${C.inkSoft};
  text-align: justify; hyphens: auto;
  font-feature-settings: "onum", "liga";
}
.dropcap {
  float: left;
  font-family: ${DISPLAY};
  font-optical-sizing: auto;
  font-size: 50pt; font-weight: 350; font-style: italic;
  line-height: 0.78;
  margin: 1.6mm 2.2mm 0 0;
  color: ${C.sienna};
}

/* ── Section heads ─────────────────────────────────────────────── */
.sh { margin: 7.5mm 0 4mm; display: flex; align-items: center; gap: 4mm; }
.sh-label {
  font-family: ${SANS};
  font-size: 8pt; font-weight: 700;
  letter-spacing: 0.26em; text-transform: uppercase;
  color: ${C.sienna};
}
.sh-rule { flex: 1; height: 1px; background: ${C.rule}; }

/* ── Experience ────────────────────────────────────────────────── */
.exp { margin-bottom: 5.5mm; break-inside: avoid; page-break-inside: avoid; }
.exp-head { display: flex; justify-content: space-between; align-items: baseline; gap: 5mm; }
.exp-title-row { display: flex; gap: 1mm; align-items: baseline; flex-wrap: wrap; min-width: 0; }
.exp-title {
  font-family: ${DISPLAY};
  font-optical-sizing: auto;
  font-size: 13pt; font-weight: 540;
  letter-spacing: -0.015em;
}
.exp-org {
  font-family: ${BODY};
  font-size: 12.5pt; font-style: italic;
  color: ${C.sienna};
}
.exp-dates {
  font-family: ${SANS};
  font-size: 7.5pt; font-weight: 500;
  color: ${C.muted};
  letter-spacing: 0.14em; white-space: nowrap;
  font-feature-settings: "tnum";
  padding-top: 1mm;
}
.exp-loc {
  font-family: ${BODY};
  font-size: 9pt; font-style: italic;
  color: ${C.muted}; margin-top: 0.6mm;
}
.exp-desc {
  font-size: 10pt; line-height: 1.62;
  color: ${C.inkSoft};
  margin: 2mm 0 0;
  text-align: justify; hyphens: auto;
  font-feature-settings: "onum", "liga";
}

/* ── Two-up lower ──────────────────────────────────────────────── */
.twoUp { display: grid; grid-template-columns: 1.25fr 1fr; gap: 11mm; margin-top: 1mm; }

.edu { margin-bottom: 4.2mm; break-inside: avoid; }
.edu-head { display: flex; justify-content: space-between; align-items: baseline; gap: 3mm; }
.edu-qual {
  font-family: ${DISPLAY};
  font-size: 11pt; font-weight: 540; letter-spacing: -0.012em;
}
.edu-dates {
  font-family: ${SANS};
  font-size: 7pt; font-weight: 500; color: ${C.muted};
  letter-spacing: 0.12em; white-space: nowrap;
  font-feature-settings: "tnum";
}
.edu-inst {
  margin-top: 0.6mm;
  display: flex; align-items: center; gap: 2mm; flex-wrap: wrap;
}
.edu-inst-name {
  font-family: ${BODY};
  font-size: 9.5pt; font-style: italic; color: ${C.inkSoft};
}
.edu-field { font-family: ${SANS}; font-size: 7.5pt; color: ${C.muted}; margin-top: 0.6mm; letter-spacing: 0.04em; }

.cert { font-size: 10pt; color: ${C.inkSoft}; margin-bottom: 2.4mm; display: flex; align-items: baseline; gap: 1.5mm; flex-wrap: wrap; }
.cert-name { font-family: ${DISPLAY}; font-weight: 540; font-size: 10pt; letter-spacing: -0.01em; color: ${C.ink}; }
.cert-meta { font-family: ${BODY}; font-size: 8.5pt; color: ${C.muted}; font-style: italic; }

.skills {
  font-family: ${BODY};
  font-size: 10.5pt; color: ${C.inkSoft};
  line-height: 1.9;
  font-feature-settings: "onum";
}
.skill-sep { color: ${C.sienna}; }

.languages { font-size: 10pt; color: ${C.inkSoft}; line-height: 1.8; }
.lang { font-feature-settings: "onum"; }

/* ── Footer ────────────────────────────────────────────────────── */
.ft {
  margin-top: 12mm;
  padding-top: 3.5mm;
  border-top: 1px solid ${C.rule};
  display: flex; justify-content: space-between; align-items: baseline;
  font-family: ${SANS};
  font-size: 7pt; font-weight: 600;
  color: ${C.muted};
  letter-spacing: 0.2em; text-transform: uppercase;
}
.ft-stamp {
  font-family: ${BODY};
  font-style: italic; text-transform: none;
  letter-spacing: 0.01em; font-size: 9.5pt; font-weight: 400;
  color: ${C.sienna};
}

/* ── Verified pill ─────────────────────────────────────────────── */
.vbadge, .vbadge-sm {
  display: inline-flex; align-items: center; gap: 1.2mm;
  font-family: ${SANS};
  font-weight: 600; font-style: normal;
  color: ${C.verifiedFg};
  background: ${C.verifiedBg};
  padding: 0.5mm 2mm 0.5mm 1.2mm;
  border-radius: 99px;
  letter-spacing: 0.02em; white-space: nowrap;
  position: relative; top: -0.4mm;
}
.vbadge { font-size: 7pt; }
.vbadge-sm { font-size: 6.5pt; }
.vbadge svg, .vbadge-sm svg { display: inline-block; vertical-align: middle; }
`;
