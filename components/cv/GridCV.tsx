import "server-only";
import type { CVData } from "@/lib/pdf/data";
import { INK, VerifiedMark, toBullets, splitLang } from "./_inkShared";

// CV 4 — The Grid. White page, two columns under a heavy masthead rule,
// numbered section labels. Archivo (display) + IBM Plex Sans (body).
// Ported from the Claude Design handoff.

const DISPLAY = `"Archivo", system-ui, sans-serif`;
const BODY = `"IBM Plex Sans", system-ui, sans-serif`;

export function GridCV({ data }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, location, email, phone, languages,
          experiences, educations, certifications, skills, referees } = data;
  const contact = [location, phone, email].filter(Boolean);

  // Number only the sections that actually render, in column order.
  let n = 0;
  const num = () => String(++n).padStart(2, "0");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="page">
        <header>
          <div className="hd">
            <h1 className="name">{fullName}</h1>
            <div className="hd-right">
              {headline && <div className="hd-role">{headline}</div>}
              {contact.map((c, i) => <div key={i}>{c}</div>)}
            </div>
          </div>
          <div className="masthead-rule" />
        </header>

        <div className="cols">
          <div className="col col-l">
            {educations.length > 0 && (
              <>
                <SecHead n={num()} label="Education" />
                {educations.map((e, i) => (
                  <div key={i} className="edu">
                    <div className="edu-qual">{e.qualification}{e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}</div>
                    <div className="row">
                      <span className="edu-inst">{e.institution}{e.field ? ` · ${e.field}` : ""}</span>
                      {e.dateRange && <span className="dates">{e.dateRange}</span>}
                    </div>
                  </div>
                ))}
              </>
            )}

            {experiences.length > 0 && (
              <>
                <SecHead n={num()} label="Experience" />
                {experiences.map((e, i) => (
                  <div key={i} className="exp">
                    <div className="exp-title">{e.title}{e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}</div>
                    <div className="row">
                      <span className="exp-org">{[e.organization, e.location].filter(Boolean).join(", ")}</span>
                      {e.dateRange && <span className="dates">{e.dateRange}</span>}
                    </div>
                    <Bullets text={e.description} />
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="col col-r">
            {summary && (
              <>
                <SecHead n={num()} label="Profile" />
                <p className="summary">{summary}</p>
              </>
            )}

            {skills.length > 0 && (
              <>
                <SecHead n={num()} label="Skills" />
                <div className="skills">{skills.join("  ·  ")}</div>
              </>
            )}

            {languages.length > 0 && (
              <>
                <SecHead n={num()} label="Languages" />
                <div className="langs">
                  {languages.map((l, i) => {
                    const { name, level } = splitLang(l);
                    return <div key={i} className="lang"><span style={{ color: INK.ink }}>{name}</span>{level && <span className="faint">{level}</span>}</div>;
                  })}
                </div>
              </>
            )}

            {certifications.length > 0 && (
              <>
                <SecHead n={num()} label="Certifications" />
                <div className="certs">
                  {certifications.map((c, i) => (
                    <div key={i} className="cert-row">
                      <span style={{ color: INK.ink }}>{c.name}{c.issuer ? <span className="faint"> — {c.issuer}</span> : null}{c.verified && <>&nbsp;&nbsp;<VerifiedMark note="" /></>}</span>
                      {c.year && <span className="dates">{c.year}</span>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {referees.length > 0 && (
              <>
                <SecHead n={num()} label="Referees" />
                <div className="refs">
                  {referees.map((r, i) => (
                    <div key={i}>
                      <div className="ref-name">{r.name}</div>
                      {(r.position || r.organization) && <div className="ref-role">{[r.position, r.organization].filter(Boolean).join(", ")}</div>}
                      {(r.email || r.phone) && <div className="ref-contact">{[r.email, r.phone].filter(Boolean).join(" · ")}</div>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SecHead({ n, label }: { n: string; label: string }) {
  return (
    <div className="sechead">
      <span className="sechead-n">{n}</span>
      <span className="sechead-l">{label}</span>
    </div>
  );
}

function Bullets({ text }: { text: string }) {
  const bullets = toBullets(text);
  if (bullets.length === 0) return null;
  if (bullets.length === 1) return <p className="single">{bullets[0]}</p>;
  return (
    <ul className="bullets">
      {bullets.map((b, i) => <li key={i}><span className="sq" /><span>{b}</span></li>)}
    </ul>
  );
}

const styles = `
/* Vertical @page margins give every page real top/bottom text spacing (so
   continuation pages don't run to the sheet edge); horizontal is handled by
   the .page side padding. */
@page { size: A4; margin: 14mm 0; }
.page { min-height: 269mm; padding: 0 52px; color: ${INK.body}; font-family: ${BODY}; -webkit-font-smoothing: antialiased; display: flex; flex-direction: column; }

.hd { display: flex; justify-content: space-between; align-items: flex-end; gap: 28px; }
.name { margin: 0; font-family: ${DISPLAY}; font-weight: 800; font-size: 50px; letter-spacing: -0.025em; line-height: 0.95; color: ${INK.ink}; }
.hd-right { text-align: right; font-size: 11.5px; line-height: 1.85; color: ${INK.bodySoft}; padding-bottom: 3px; }
.hd-role { font-family: ${DISPLAY}; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; color: ${INK.ink}; margin-bottom: 6px; }
.masthead-rule { height: 2px; background: ${INK.ink}; margin-top: 26px; }

.cols { display: flex; flex: 1; margin-top: 40px; }
.col-l { flex: 1; padding-right: 34px; min-width: 0; }
.col-r { flex: 1; padding-left: 34px; border-left: 1px solid ${INK.hair}; min-width: 0; }

.sechead { display: flex; align-items: baseline; gap: 9px; border-bottom: 1px solid ${INK.ink}; padding-bottom: 6px; margin-bottom: 14px; margin-top: 26px; break-after: avoid; page-break-after: avoid; }
.refs > div { break-inside: avoid; }
.col-l > .sechead:first-child, .col-r > .sechead:first-child { margin-top: 0; }
.sechead-n { font-family: ${DISPLAY}; font-weight: 700; font-size: 11px; color: ${INK.faint2}; }
.sechead-l { font-family: ${DISPLAY}; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: ${INK.ink}; }

.exp { margin-bottom: 22px; break-inside: avoid; }
.exp-title { font-family: ${DISPLAY}; font-weight: 700; font-size: 14px; color: ${INK.ink}; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-top: 2px; }
.exp-org { font-size: 12px; color: ${INK.muted}; }
.dates { font-size: 11px; font-weight: 500; color: ${INK.faint}; letter-spacing: 0.03em; white-space: nowrap; flex: none; }
.bullets { margin: 9px 0 0; padding: 0; list-style: none; }
.bullets li { display: flex; gap: 10px; font-size: 12px; line-height: 1.75; color: ${INK.body}; margin-bottom: 6px; }
.bullets li:last-child { margin-bottom: 0; }
.sq { flex: none; width: 3px; height: 3px; background: ${INK.ink}; margin-top: 7px; }
.single { margin: 9px 0 0; font-size: 12px; line-height: 1.75; color: ${INK.body}; }

.edu { margin-bottom: 18px; break-inside: avoid; }
.edu-qual { font-family: ${DISPLAY}; font-weight: 700; font-size: 13px; color: ${INK.ink}; }
.edu-inst { font-size: 12px; color: ${INK.muted}; }

.summary { margin: 0 0 26px; font-size: 12.5px; line-height: 1.62; color: ${INK.body}; }
.skills { font-size: 12.5px; line-height: 2.2; color: ${INK.body}; margin-bottom: 26px; }
.langs { display: flex; flex-direction: column; gap: 7px; font-size: 12.5px; margin-bottom: 26px; }
.lang { display: flex; justify-content: space-between; gap: 8px; }
.faint { color: ${INK.faint}; }
.certs { display: flex; flex-direction: column; gap: 9px; margin-bottom: 26px; }
.cert-row { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; font-size: 12px; }
.refs { display: flex; flex-direction: column; gap: 18px; }
.ref-name { font-family: ${DISPLAY}; font-weight: 700; font-size: 12.5px; color: ${INK.ink}; }
.ref-role { font-size: 11.5px; color: ${INK.muted}; }
.ref-contact { font-size: 11px; color: ${INK.faint}; margin-top: 2px; }
`;
