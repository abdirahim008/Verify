import "server-only";
import type { CVData } from "@/lib/pdf/data";
import { INK, VerifiedMark, initials, toBullets, splitLang } from "./_inkShared";

// CV 3 — The Editorial. White page, right sidebar with a tall photo panel.
// Spectral (display) + Public Sans (body). Ported from the Claude Design
// handoff.

const DISPLAY = `"Spectral", Georgia, serif`;
const BODY = `"Public Sans", system-ui, sans-serif`;

export function EditorialCV({ data }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, location, email, phone, photoUrl, languages,
          experiences, educations, certifications, skills, referees } = data;
  const contact = [location, phone, email].filter(Boolean);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="page">
        <main className="mn">
          <header className="mn-head">
            <h1 className="name">{fullName}</h1>
            {headline && <div className="role">{headline}</div>}
          </header>

          {summary && <p className="summary">{summary}</p>}

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

          {educations.length > 0 && (
            <section className="sec">
              <div className="h2">Education</div>
              {educations.map((e, i) => (
                <div key={i} className="edu-row">
                  <div>
                    <div className="edu-qual">{e.qualification}</div>
                    <div className="edu-inst">{e.institution}{e.field ? ` · ${e.field}` : ""}{e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}</div>
                  </div>
                  {e.dateRange && <div className="dates">{e.dateRange}</div>}
                </div>
              ))}
            </section>
          )}

          {referees.length > 0 && (
            <section className="sec">
              <div className="h2">Referees</div>
              <div className="refs">
                {referees.map((r, i) => (
                  <div key={i}>
                    <div className="ref-name">{r.name}</div>
                    {(r.position || r.organization) && <div className="ref-role">{[r.position, r.organization].filter(Boolean).join(", ")}</div>}
                    {(r.email || r.phone) && <div className="ref-contact">{r.email}{r.email && r.phone && <br />}{r.phone}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="sb">
          {photoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={photoUrl} alt="" className="sb-photo" />
            : <div className="sb-mono">{initials(fullName)}</div>}

          {contact.length > 0 && (
            <>
              <div className="sb-h">Contact</div>
              <div className="sb-contact">{contact.map((c, i) => <div key={i}>{c}</div>)}</div>
            </>
          )}

          {skills.length > 0 && (
            <>
              <div className="sb-h sb-h-gap">Skills</div>
              <div className="sb-list">{skills.map((s, i) => <span key={i}>{s}</span>)}</div>
            </>
          )}

          {languages.length > 0 && (
            <>
              <div className="sb-h sb-h-gap">Languages</div>
              <div className="sb-langs">
                {languages.map((l, i) => {
                  const { name, level } = splitLang(l);
                  return <div key={i} className="sb-lang"><span style={{ color: INK.ink }}>{name}</span>{level && <span className="faint">{level}</span>}</div>;
                })}
              </div>
            </>
          )}

          {certifications.length > 0 && (
            <>
              <div className="sb-h sb-h-gap">Certifications</div>
              <div className="sb-certs">
                {certifications.map((c, i) => (
                  <div key={i}>
                    <div className="sb-cert-name">{c.name}{c.verified && <>&nbsp;<VerifiedMark note="" size={8} /></>}</div>
                    {(c.issuer || c.year) && <div className="faint sb-cert-meta">{[c.issuer, c.year].filter(Boolean).join(" · ")}</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>
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
      {bullets.map((b, i) => <li key={i}><span className="bar" /><span>{b}</span></li>)}
    </ul>
  );
}

const styles = `
@page { size: A4; margin: 14mm 0; }
.page { min-height: 269mm; display: flex; color: ${INK.body}; font-family: ${BODY}; -webkit-font-smoothing: antialiased; }

.mn { flex: 1; padding: 0 40px; min-width: 0; }
.mn-head { margin-bottom: 6px; }
.name { margin: 0; font-family: ${DISPLAY}; font-weight: 500; font-size: 45px; letter-spacing: 0.005em; color: ${INK.ink}; line-height: 1.02; }
.role { margin-top: 6px; font-family: ${DISPLAY}; font-style: italic; font-size: 18px; color: ${INK.muted}; }
.summary { margin: 18px 0 0; font-size: 13px; line-height: 1.62; color: ${INK.body}; }

.sec { margin-top: 26px; }
.h2 { font-family: ${DISPLAY}; font-weight: 600; font-size: 17px; color: ${INK.ink}; border-bottom: 1px solid ${INK.ink}; padding-bottom: 5px; margin-bottom: 14px; break-after: avoid; page-break-after: avoid; }

.exp { margin-bottom: 16px; break-inside: avoid; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; }
.exp-title { font-weight: 700; font-size: 14px; color: ${INK.ink}; }
.dates { font-size: 11.5px; font-weight: 500; color: ${INK.faint}; letter-spacing: 0.03em; white-space: nowrap; flex: none; }
.exp-org { font-family: ${DISPLAY}; font-style: italic; font-size: 13.5px; color: ${INK.muted}; margin-top: 2px; }
.bullets { margin: 9px 0 0; padding: 0; list-style: none; }
.bullets li { display: flex; gap: 11px; font-size: 12.5px; line-height: 1.55; color: ${INK.body}; margin-bottom: 5px; }
.bullets li:last-child { margin-bottom: 0; }
.bar { flex: none; width: 1.5px; height: 13px; background: ${INK.ink}; margin-top: 3px; }
.single { margin: 9px 0 0; font-size: 12.5px; line-height: 1.55; color: ${INK.body}; }

.edu-row { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; margin-bottom: 11px; break-inside: avoid; }
.edu-row:last-child { margin-bottom: 0; }
.edu-qual { font-weight: 700; font-size: 13.5px; color: ${INK.ink}; }
.edu-inst { font-family: ${DISPLAY}; font-style: italic; font-size: 13px; color: ${INK.muted}; }

.refs { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
.refs > div { break-inside: avoid; }
.ref-name { font-weight: 700; font-size: 13px; color: ${INK.ink}; }
.ref-role { font-family: ${DISPLAY}; font-style: italic; font-size: 12.5px; color: ${INK.muted}; }
.ref-contact { font-size: 11.5px; color: ${INK.faint}; margin-top: 3px; }

.sb { width: 230px; flex: none; border-left: 1px solid ${INK.hair}; padding: 0 30px; }
.sb-photo { width: 100%; height: 200px; object-fit: cover; border: 1px solid #c4bfb6; margin-bottom: 26px; display: block; }
.sb-mono { width: 100%; height: 190px; border: 1px solid #c4bfb6; display: flex; align-items: center; justify-content: center; margin-bottom: 26px; font-family: ${DISPLAY}; font-weight: 500; font-size: 44px; letter-spacing: 0.04em; color: ${INK.ink}; }
.sb-h { font-family: ${DISPLAY}; font-weight: 600; font-size: 14.5px; color: ${INK.ink}; border-bottom: 1px solid ${INK.ink}; padding-bottom: 5px; margin-bottom: 11px; break-after: avoid; }
.sb-h-gap { margin-top: 24px; }
.sb-contact { display: flex; flex-direction: column; gap: 7px; font-size: 11.5px; color: ${INK.bodySoft}; line-height: 1.35; word-break: break-word; }
.sb-list { display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: ${INK.bodySoft}; }
.sb-langs { display: flex; flex-direction: column; gap: 7px; font-size: 12px; }
.sb-lang { display: flex; justify-content: space-between; gap: 8px; }
.faint { color: ${INK.faint}; }
.sb-certs { display: flex; flex-direction: column; gap: 10px; font-size: 11.5px; }
.sb-cert-name { color: ${INK.ink}; font-weight: 600; }
.sb-cert-meta { line-height: 1.3; margin-top: 1px; }
`;
