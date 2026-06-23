import "server-only";
import type { CVData } from "@/lib/pdf/data";
import { INK, VerifiedMark, toBullets, splitLang } from "./_inkShared";

// CV 7 — The Endnote. White page, single-column experience over a two-up
// lower grid, closing with referees. Archivo (display) + Newsreader (body).
// Ported from the Claude Design handoff (colour footer band removed).

const DISPLAY = `"Archivo", system-ui, sans-serif`;
const BODY = `"Newsreader", Georgia, serif`;

export function EndnoteCV({ data }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, location, email, phone, languages,
          experiences, educations, certifications, skills, referees } = data;
  const contact = [location, phone, email].filter(Boolean);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="page">
        <header className="hd">
          <div className="hd-row">
            <div>
              <h1 className="name">{fullName}</h1>
              {headline && <div className="role">{headline}</div>}
            </div>
            {contact.length > 0 && (
              <div className="hd-contact">{contact.map((c, i) => <div key={i}>{c}</div>)}</div>
            )}
          </div>
          <div className="hd-rule" />
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
                  <div className="exp-org">{[e.organization, e.location].filter(Boolean).join(", ")}{e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}</div>
                  <Bullets text={e.description} />
                </div>
              ))}
            </section>
          )}

          <div className="grid">
            <section>
              {certifications.length > 0 && (
                <>
                  <div className="h2">Certifications</div>
                  <div className="certs">
                    {certifications.map((c, i) => (
                      <div key={i}><span style={{ color: INK.ink }}>{c.name}</span>{(c.issuer || c.year) && <span className="faint"> — {[c.issuer, c.year].filter(Boolean).join(" · ")}</span>}{c.verified && <>&nbsp;&nbsp;<VerifiedMark note="" /></>}</div>
                    ))}
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
              {languages.length > 0 && (
                <>
                  <div className="h2" style={{ marginTop: skills.length ? "20px" : "0" }}>Languages</div>
                  <div className="langs">
                    {languages.map((l, i) => {
                      const { name, level } = splitLang(l);
                      return <div key={i} className="lang"><span style={{ color: INK.ink }}>{name}</span>{level && <span className="faint">{level}</span>}</div>;
                    })}
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
      {bullets.map((b, i) => <li key={i}><span className="dot" /><span>{b}</span></li>)}
    </ul>
  );
}

const styles = `
@page { size: A4; margin: 14mm 0; }
.page { color: ${INK.body}; font-family: ${BODY}; -webkit-font-smoothing: antialiased; }

.hd { padding: 0 56px; }
.hd-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 28px; }
.name { margin: 0; font-family: ${DISPLAY}; font-weight: 800; font-size: 42px; letter-spacing: -0.025em; color: ${INK.ink}; line-height: 0.97; }
.role { margin-top: 10px; font-family: ${DISPLAY}; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.24em; color: ${INK.muted}; }
.hd-contact { text-align: right; font-size: 11.5px; line-height: 1.75; color: ${INK.bodySoft}; white-space: nowrap; }
.hd-rule { height: 2px; background: ${INK.ink}; margin-top: 18px; }

.body { padding: 20px 56px 0; }
.summary { margin: 0 0 18px; font-size: 14px; line-height: 1.6; color: ${INK.body}; }
.sec { margin-bottom: 18px; }
.h2 { font-family: ${DISPLAY}; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: ${INK.ink}; border-bottom: 1px solid ${INK.ink}; padding-bottom: 6px; margin-bottom: 13px; break-after: avoid; page-break-after: avoid; }

.exp { margin-bottom: 13px; break-inside: avoid; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; }
.exp-title { font-family: ${DISPLAY}; font-weight: 700; font-size: 14.5px; color: ${INK.ink}; }
.dates { font-family: ${DISPLAY}; font-size: 11.5px; font-weight: 500; color: ${INK.faint}; letter-spacing: 0.03em; white-space: nowrap; flex: none; }
.exp-org { font-style: italic; font-size: 13.5px; color: ${INK.muted}; margin-top: 2px; }
.bullets { margin: 8px 0 0; padding: 0; list-style: none; }
.bullets li { display: flex; gap: 11px; font-size: 13px; line-height: 1.5; color: ${INK.body}; margin-bottom: 4px; }
.bullets li:last-child { margin-bottom: 0; }
.dot { flex: none; width: 5px; height: 5px; border: 1px solid ${INK.ink}; border-radius: 50%; margin-top: 6px; }
.single { margin: 8px 0 0; font-size: 13px; line-height: 1.5; color: ${INK.body}; }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; margin-bottom: 18px; }
.edu { margin-bottom: 9px; break-inside: avoid; }
.edu-qual { font-family: ${DISPLAY}; font-weight: 700; font-size: 13px; color: ${INK.ink}; }
.edu-inst { font-style: italic; font-size: 13px; color: ${INK.muted}; }
.faint { color: ${INK.faint}; }
.certs { display: flex; flex-direction: column; gap: 7px; font-size: 12.5px; }
.sk-list { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: ${INK.body}; }
.langs { display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
.lang { display: flex; justify-content: space-between; gap: 8px; }

.refs { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 36px; }
.refs > div { break-inside: avoid; }
.ref-name { font-family: ${DISPLAY}; font-weight: 700; font-size: 13px; color: ${INK.ink}; }
.ref-role { font-style: italic; font-size: 12.5px; color: ${INK.muted}; }
.ref-contact { font-size: 11.5px; color: ${INK.faint}; margin-top: 2px; }
`;
