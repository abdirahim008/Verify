import "server-only";
import type { CVData } from "@/lib/pdf/data";

// Editorial CV — A4 portrait. Source Serif body, IBM Plex Sans for caps
// labels. Drop cap on the summary; warm cream paper.
// Ported from verify/pdfs/cv-editorial.jsx; tuned for print (@page A4, no
// fixed pixel height — content can flow across pages naturally).

const COLORS = {
  cream: "#f6f2ea",
  ink: "#1a1a17",
  inkSoft: "#3a3a3d",
  sienna: "#0d3b66",   // deep navy
  muted: "#6e7480",
  rule: "#dcd6c8",
  verifiedBg: "#d8e5dd",
  verifiedFg: "#1f6b4d",
};

export function EditorialCV({ data }: { data: CVData }) {
  const { fullName, headline, summary, location, email, phone, languages,
          experiences, educations, certifications, skills, year } = data;

  // Split the name — "First Middle. Last." with the last name italic in
  // sienna. If there's only one token we just italicise it.
  const nameParts = fullName.trim().split(/\s+/);
  const last = nameParts.length > 1 ? nameParts.pop()! : null;
  const head = last ? nameParts.join(" ") : fullName;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="cv">
        {/* Folio header */}
        <div className="folio">
          <span>Curriculum vitae</span>
          <span>{[location, year].filter(Boolean).join(" · ")}</span>
        </div>

        {/* Name + headline + contact */}
        <header className="hd">
          <h1 className="name">
            {head}
            {last && <><br /><span className="lastname">{last}.</span></>}
          </h1>
          {headline && <div className="headline">{headline}</div>}
          <div className="contact">
            {[location, email, phone].filter(Boolean).join(" · ")}
          </div>
        </header>

        <div className="hr" />

        {/* Summary with drop cap */}
        {summary && (
          <div className="summary">
            <span className="dropcap">{summary.charAt(0)}</span>
            {summary.slice(1)}
          </div>
        )}
        <div style={{ clear: "both" }} />

        {/* Experience */}
        {experiences.length > 0 && (
          <>
            <SectionHead label="Experience" />
            {experiences.map((e, i) => (
              <article key={i} className="exp">
                <div className="exp-head">
                  <div className="exp-title-row">
                    <span className="exp-title">{e.title}</span>
                    {e.organization && <span className="exp-org"> · {e.organization}</span>}
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
                      {e.institution}
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
                      <span className="cert-meta"> · {[c.issuer, c.year].filter(Boolean).join(", ")}</span>
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
                    <span key={i}>
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
                  {languages.map((l, i) => <div key={i}>{l}</div>)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer prints at the bottom of every page via @page running elements
            would be the cleanest path, but those aren't supported in headless
            chromium pdf output. Using an inline footer instead — adequate for
            CVs that fit on one page; for multi-page CVs we'll revisit. */}
        <footer className="ft">
          <span>{fullName} · Curriculum Vitae</span>
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
        <circle cx="5.5" cy="5.5" r="5.5" fill={COLORS.verifiedFg} />
        <path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
      {note ? `Verified · ${note}` : "Verified"}
    </span>
  );
}

const STYLES = `
@page { size: A4; margin: 0; }

.cv {
  width: 210mm;
  min-height: 297mm;
  padding: 18mm 20mm 18mm;
  background: ${COLORS.cream};
  color: ${COLORS.ink};
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-feature-settings: "ss01", "onum";
  -webkit-font-smoothing: antialiased;
}

.folio {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 9pt;
  color: ${COLORS.muted};
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-family: "IBM Plex Sans", system-ui, sans-serif;
}

.hd { margin-top: 7mm; }
.name {
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-size: 56pt;
  font-weight: 350;
  letter-spacing: -0.035em;
  line-height: 0.95;
  margin: 0;
}
.lastname { font-style: italic; color: ${COLORS.sienna}; font-weight: 300; }
.headline {
  margin-top: 5mm;
  font-size: 14pt;
  font-style: italic;
  color: ${COLORS.inkSoft};
  letter-spacing: 0.005em;
}
.contact {
  margin-top: 2mm;
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-size: 9pt;
  color: ${COLORS.muted};
  letter-spacing: 0.04em;
}

.hr { height: 1px; background: ${COLORS.rule}; margin: 8mm 0 6mm; }

.summary {
  font-size: 11pt;
  line-height: 1.65;
  color: ${COLORS.inkSoft};
  text-align: justify;
  hyphens: auto;
}
.dropcap {
  float: left;
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-size: 54pt;
  font-weight: 300;
  font-style: italic;
  line-height: 0.85;
  margin: 1mm 2mm 0 0;
  color: ${COLORS.sienna};
}

.sh { margin: 7mm 0 4mm; display: flex; align-items: center; gap: 4mm; }
.sh-label {
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-size: 8.5pt;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${COLORS.sienna};
  font-weight: 600;
}
.sh-rule { flex: 1; height: 1px; background: ${COLORS.rule}; }

.exp { margin-bottom: 5mm; break-inside: avoid; page-break-inside: avoid; }
.exp-head { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; }
.exp-title-row { display: flex; gap: 2mm; align-items: baseline; flex-wrap: wrap; }
.exp-title { font-size: 13pt; font-weight: 500; letter-spacing: -0.01em; }
.exp-org { font-size: 13pt; font-style: italic; color: ${COLORS.sienna}; font-weight: 400; }
.exp-dates {
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-size: 8.5pt;
  color: ${COLORS.muted};
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.exp-loc { font-size: 9pt; color: ${COLORS.muted}; font-style: italic; margin-top: 0.5mm; }
.exp-desc {
  font-size: 10pt;
  line-height: 1.6;
  color: ${COLORS.inkSoft};
  margin: 2mm 0 0;
  text-align: justify;
  hyphens: auto;
}

.twoUp {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 10mm;
  margin-top: 1mm;
}

.edu { margin-bottom: 4mm; break-inside: avoid; }
.edu-head { display: flex; justify-content: space-between; align-items: baseline; gap: 3mm; }
.edu-qual { font-size: 11pt; font-weight: 500; letter-spacing: -0.01em; }
.edu-dates {
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-size: 8pt;
  color: ${COLORS.muted};
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.edu-inst { font-size: 9.5pt; color: ${COLORS.inkSoft}; font-style: italic; margin-top: 0.5mm; display: flex; align-items: center; gap: 2mm; flex-wrap: wrap; }
.edu-field { font-size: 8.5pt; color: ${COLORS.muted}; margin-top: 0.5mm; }

.cert { font-size: 10pt; color: ${COLORS.inkSoft}; margin-bottom: 2mm; display: flex; align-items: baseline; gap: 2mm; flex-wrap: wrap; }
.cert-name { font-weight: 500; }
.cert-meta { font-size: 8.5pt; color: ${COLORS.muted}; font-style: italic; }

.skills {
  font-size: 10pt;
  color: ${COLORS.inkSoft};
  line-height: 1.85;
}
.skill-sep { color: ${COLORS.sienna}; }

.languages { font-size: 10pt; color: ${COLORS.inkSoft}; line-height: 1.75; }

.ft {
  margin-top: 12mm;
  padding-top: 4mm;
  border-top: 1px solid ${COLORS.rule};
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-size: 7.5pt;
  color: ${COLORS.muted};
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.ft-stamp {
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-style: italic;
  text-transform: none;
  letter-spacing: 0;
  font-size: 9pt;
  color: ${COLORS.sienna};
}

.vbadge, .vbadge-sm {
  display: inline-flex;
  align-items: center;
  gap: 1mm;
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-weight: 500;
  color: ${COLORS.verifiedFg};
  background: ${COLORS.verifiedBg};
  padding: 0.4mm 1.8mm 0.4mm 1mm;
  border-radius: 99px;
  letter-spacing: 0.01em;
  white-space: nowrap;
  font-style: normal;
}
.vbadge { font-size: 7.5pt; }
.vbadge-sm { font-size: 7pt; }
.vbadge svg, .vbadge-sm svg { display: inline-block; vertical-align: middle; }
`;
