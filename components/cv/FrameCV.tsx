import "server-only";
import type { CVData } from "@/lib/pdf/data";
import { INK, VerifiedMark, toBullets, splitLang, bandColors } from "./_inkShared";

// CV 8 — The Frame. White body framed by an adjustable colour band at the
// top (masthead) and a slim one at the foot. Cormorant Garamond (display)
// + Public Sans (body). Ported from the Claude Design handoff.

const DISPLAY = `"Cormorant Garamond", Georgia, serif`;
const BODY = `"Public Sans", system-ui, sans-serif`;

export function FrameCV({ data, theme }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, location, email, phone, languages,
          experiences, educations, certifications, skills, referees } = data;
  const contact = [location, phone, email].filter(Boolean);
  const C = bandColors(theme?.accent ?? "#20304d");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles(C) }} />
      <div className="page">
        <header className="band" data-band>
          <div className="band-row">
            <div>
              <h1 className="name">{fullName}</h1>
              {headline && <div className="role">{headline}</div>}
            </div>
            {contact.length > 0 && (
              <div className="band-contact">{contact.map((c, i) => <div key={i}>{c}</div>)}</div>
            )}
          </div>
        </header>

        <div className="body">
          {summary && <p className="summary">{summary}</p>}

          {educations.length > 0 && (
            <section className="sec">
              <div className="h2">Education</div>
              {educations.map((e, i) => (
                <div key={i} className="edu">
                  <div className="edu-qual">{e.qualification}{e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}</div>
                  <div className="edu-inst">{[e.institution, e.field, e.dateRange].filter(Boolean).join(" · ")}</div>
                </div>
              ))}
            </section>
          )}

          {experiences.length > 0 && (
            <section className="sec">
              <div className="h2">Experience</div>
              {experiences.map((e, i) => (
                <div key={i} className="exp">
                  <div className="row">
                    <div className="exp-title">{e.title}</div>
                    {e.dateRange && <div className="dates">{e.dateRange}</div>}
                  </div>
                  <div className="exp-org">{[e.organization, e.location].filter(Boolean).join(" · ")}{e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}</div>
                  <Bullets text={e.description} />
                </div>
              ))}
            </section>
          )}

          <div className="grid">
            <section>
              {languages.length > 0 && (
                <>
                  <div className="h2">Languages</div>
                  <div className="langs">
                    {languages.map((l, i) => {
                      const { name, level } = splitLang(l);
                      return <div key={i} className="lang"><span style={{ color: INK.ink }}>{name}</span>{level && <span className="faint">{level}</span>}</div>;
                    })}
                  </div>
                </>
              )}
            </section>
            <section>
              {skills.length > 0 && (
                <>
                  <div className="h2">Skills</div>
                  <div className="sk-list">{skills.map((s, i) => <span key={i}>{s}</span>)}</div>
                </>
              )}
              {certifications.length > 0 && (
                <>
                  <div className="h2" style={{ marginTop: skills.length ? "20px" : "0" }}>Certifications</div>
                  <div className="certs">
                    {certifications.map((c, i) => (
                      <div key={i}><span style={{ color: INK.ink, fontWeight: 600 }}>{c.name}</span>{(c.issuer || c.year) && <span className="faint"> · {[c.issuer, c.year].filter(Boolean).join(" · ")}</span>}{c.verified && <>&nbsp;&nbsp;<VerifiedMark note="" /></>}</div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>

          {referees.length > 0 && (
            <section className="sec">
              <div className="h2">Referees</div>
              <div className="refs">
                {referees.map((r, i) => (
                  <div key={i}>
                    <div className="ref-name">{r.name}</div>
                    {(r.position || r.organization) && <div className="ref-role">{[r.position, r.organization].filter(Boolean).join(", ")}</div>}
                    {(r.email || r.phone) && <div className="ref-contact">{[r.email, r.phone].filter(Boolean).join(" · ")}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

function Bullets({ text }: { text: string }) {
  const bullets = toBullets(text);
  if (bullets.length === 0) return null;
  if (bullets.length === 1) return <p className="single">{bullets[0]}</p>;
  return (
    <ul className="bullets">
      {bullets.map((b, i) => <li key={i}><span className="tick" /><span>{b}</span></li>)}
    </ul>
  );
}

const styles = (C: ReturnType<typeof bandColors>) => `
/* The colour header band bleeds to the top + sides on page 1 (@page:first
   zeroes page 1's top/side margins); every page keeps 14mm top/bottom text
   margins, horizontal handled by the band/body padding. */
@page { size: A4; margin: 14mm 0; }
@page :first { margin: 0 0 14mm; }
[data-band] { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { color: ${INK.body}; font-family: ${BODY}; -webkit-font-smoothing: antialiased; }

.band { background: ${C.accent}; padding: 32px 56px 28px; }
.band-row { display: flex; justify-content: space-between; align-items: center; gap: 28px; }
.name { margin: 0; font-family: ${DISPLAY}; font-weight: 600; font-size: 46px; letter-spacing: 0.01em; color: ${C.onBand}; line-height: 1.0; }
.role { margin-top: 8px; font-size: 11.5px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3em; color: ${C.onBandMuted}; }
.band-contact { text-align: right; font-size: 11.5px; line-height: 1.75; color: ${C.onBandMuted}; white-space: nowrap; }

.body { padding: 26px 56px 28px; }
.summary { margin: 0 0 22px; font-size: 13px; line-height: 1.6; color: ${INK.body}; }
.sec { margin-bottom: 20px; }
.h2 { font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: ${INK.ink}; border-bottom: 1px solid ${INK.ink}; padding-bottom: 6px; margin-bottom: 13px; break-after: avoid; page-break-after: avoid; }

.exp { margin-bottom: 13px; break-inside: avoid; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; }
.exp-title { font-weight: 700; font-size: 14.5px; color: ${INK.ink}; }
.dates { font-size: 11.5px; font-weight: 500; color: ${INK.faint}; letter-spacing: 0.03em; white-space: nowrap; flex: none; }
.exp-org { font-size: 12.5px; color: ${INK.muted}; margin-top: 2px; }
.bullets { margin: 8px 0 0; padding: 0; list-style: none; }
.bullets li { display: flex; gap: 10px; font-size: 13px; line-height: 1.5; color: ${INK.body}; margin-bottom: 4px; }
.bullets li:last-child { margin-bottom: 0; }
.tick { flex: none; width: 8px; height: 1.5px; background: ${INK.ink}; margin-top: 9px; }
.single { margin: 8px 0 0; font-size: 13px; line-height: 1.5; color: ${INK.body}; }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; margin-bottom: 20px; }
.edu { margin-bottom: 9px; break-inside: avoid; }
.edu-qual { font-weight: 700; font-size: 13px; color: ${INK.ink}; }
.edu-inst { font-size: 12.5px; color: ${INK.muted}; }
.langs { display: flex; flex-direction: column; gap: 7px; font-size: 12.5px; }
.lang { display: flex; justify-content: space-between; gap: 8px; }
.faint { color: ${INK.faint}; }
.sk-list { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: ${INK.body}; }
.certs { display: flex; flex-direction: column; gap: 8px; font-size: 12px; }

.refs { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 36px; }
.refs > div { break-inside: avoid; }
.ref-name { font-weight: 700; font-size: 13px; color: ${INK.ink}; }
.ref-role { font-size: 12px; color: ${INK.muted}; }
.ref-contact { font-size: 11.5px; color: ${INK.faint}; margin-top: 2px; }
`;
