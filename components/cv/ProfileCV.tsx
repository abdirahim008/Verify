import "server-only";
import type { CVData } from "@/lib/pdf/data";
import { INK, VerifiedMark, initials, toBullets, splitLang } from "./_inkShared";

// CV 2 — The Profile. White page, left sidebar with photo/monogram.
// Space Grotesk (display) + Hanken Grotesk (body). Ported from the
// Claude Design handoff.

const DISPLAY = `"Space Grotesk", system-ui, sans-serif`;
const BODY = `"Hanken Grotesk", system-ui, sans-serif`;

export function ProfileCV({ data }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, location, email, phone, photoUrl, languages,
          experiences, educations, certifications, skills, referees } = data;
  const contact = [location, phone, email].filter(Boolean);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="page">
        <aside className="sb">
          {photoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={photoUrl} alt="" className="sb-photo" />
            : <div className="sb-mono">{initials(fullName)}</div>}

          {contact.length > 0 && (
            <div className="sb-sec">
              <div className="sb-h">Contact</div>
              <div className="sb-contact">
                {contact.map((c, i) => <div key={i}>{c}</div>)}
              </div>
            </div>
          )}

          {skills.length > 0 && (
            <div className="sb-sec">
              <div className="sb-h">Skills</div>
              <div className="sb-list">{skills.map((s, i) => <span key={i}>{s}</span>)}</div>
            </div>
          )}

          {languages.length > 0 && (
            <div className="sb-sec">
              <div className="sb-h">Languages</div>
              <div className="sb-langs">
                {languages.map((l, i) => {
                  const { name, level } = splitLang(l);
                  return <div key={i} className="sb-lang"><span style={{ color: INK.ink }}>{name}</span>{level && <span className="faint">{level}</span>}</div>;
                })}
              </div>
            </div>
          )}

          {certifications.length > 0 && (
            <div className="sb-sec">
              <div className="sb-h">Certifications</div>
              <div className="sb-certs">
                {certifications.map((c, i) => (
                  <div key={i}>
                    <div className="sb-cert-name">{c.name}{c.verified && <>&nbsp;<VerifiedMark note="" size={8} /></>}</div>
                    {(c.issuer || c.year) && <div className="faint sb-cert-meta">{[c.issuer, c.year].filter(Boolean).join(" · ")}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="mn">
          <header>
            <h1 className="name">{fullName}</h1>
            {headline && <div className="role">{headline}</div>}
          </header>

          {summary && (
            <div className="mn-sec">
              <div className="mn-h">Profile</div>
              <p className="summary">{summary}</p>
            </div>
          )}

          {educations.length > 0 && (
            <div className="mn-sec">
              <div className="mn-h">Education</div>
              {educations.map((e, i) => (
                <div key={i} className="edu-row">
                  <div>
                    <div className="edu-qual">{e.qualification}</div>
                    <div className="edu-inst">{e.institution}{e.field ? ` · ${e.field}` : ""}{e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}</div>
                  </div>
                  {e.dateRange && <div className="dates">{e.dateRange}</div>}
                </div>
              ))}
            </div>
          )}

          {experiences.length > 0 && (
            <div className="mn-sec">
              <div className="mn-h">Experience</div>
              {experiences.map((e, i) => (
                <div key={i} className="exp">
                  <div className="row">
                    <div className="exp-title">{e.title}</div>
                    {e.dateRange && <div className="dates">{e.dateRange}</div>}
                  </div>
                  <div className="exp-org">
                    {[e.organization, e.location].filter(Boolean).join(" · ")}
                    {e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}
                  </div>
                  <Bullets text={e.description} />
                </div>
              ))}
            </div>
          )}

          {referees.length > 0 && (
            <div className="mn-sec">
              <div className="mn-h">Referees</div>
              <div className="refs">
                {referees.map((r, i) => (
                  <div key={i}>
                    <div className="ref-name">{r.name}</div>
                    {(r.position || r.organization) && <div className="ref-role">{[r.position, r.organization].filter(Boolean).join(", ")}</div>}
                    {(r.email || r.phone) && <div className="ref-contact">{[r.email, r.phone].filter(Boolean).join(" · ")}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
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

const styles = `
/* Vertical @page margins give every page real top/bottom text spacing (so
   continuation pages don't run to the sheet edge); horizontal is handled by
   the column padding. */
@page { size: A4; margin: 14mm 0; }
.page { min-height: 269mm; display: flex; color: ${INK.body}; font-family: ${BODY}; -webkit-font-smoothing: antialiased; }

.sb { width: 240px; flex: none; border-right: 1px solid ${INK.hair}; padding: 0 28px; }
.sb-photo { width: 116px; height: 116px; border-radius: 50%; object-fit: cover; display: block; margin: 0 auto 6px; border: 1px solid #c4bfb6; }
.sb-mono { width: 116px; height: 116px; border-radius: 50%; border: 1px solid #c4bfb6; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; font-family: ${DISPLAY}; font-weight: 500; font-size: 34px; letter-spacing: 0.06em; color: ${INK.ink}; }
.sb-sec { margin-top: 26px; }
.sb-h { font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: ${INK.ink}; padding-bottom: 7px; border-bottom: 1px solid ${INK.ink}; }
.sb-contact { display: flex; flex-direction: column; gap: 7px; font-size: 12px; color: ${INK.bodySoft}; margin-top: 12px; line-height: 1.35; word-break: break-word; }
.sb-list { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: ${INK.bodySoft}; margin-top: 12px; }
.sb-langs { display: flex; flex-direction: column; gap: 8px; font-size: 12.5px; margin-top: 12px; }
.sb-lang { display: flex; justify-content: space-between; gap: 8px; }
.sb-certs { display: flex; flex-direction: column; gap: 11px; font-size: 12px; margin-top: 12px; }
.sb-cert-name { color: ${INK.ink}; font-weight: 600; }
.sb-cert-meta { line-height: 1.3; margin-top: 1px; }
.faint { color: ${INK.faint}; }

.mn { flex: 1; padding: 0 40px; min-width: 0; }
.name { margin: 0; font-family: ${DISPLAY}; font-weight: 600; font-size: 39px; letter-spacing: -0.01em; color: ${INK.ink}; line-height: 1.04; }
.role { margin-top: 9px; font-weight: 500; font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.24em; color: ${INK.muted}; }
.mn-sec { margin-top: 22px; }
.mn-h { font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: ${INK.ink}; padding-bottom: 7px; border-bottom: 1px solid ${INK.ink}; break-after: avoid; page-break-after: avoid; }
.refs > div { break-inside: avoid; }
.summary { margin: 12px 0 0; font-size: 13px; line-height: 1.58; color: ${INK.body}; }

.exp { margin-top: 13px; break-inside: avoid; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; }
.exp-title { font-weight: 700; font-size: 14.5px; color: ${INK.ink}; }
.dates { font-size: 11.5px; font-weight: 500; color: ${INK.faint}; letter-spacing: 0.04em; white-space: nowrap; flex: none; }
.exp-org { font-size: 12.5px; color: ${INK.muted}; margin-top: 2px; font-weight: 500; }
.bullets { margin: 8px 0 0; padding: 0; list-style: none; }
.bullets li { display: flex; gap: 10px; font-size: 13px; line-height: 1.5; color: ${INK.body}; margin-bottom: 4px; }
.bullets li:last-child { margin-bottom: 0; }
.tick { flex: none; width: 8px; height: 1.5px; background: ${INK.ink}; margin-top: 9px; }
.single { margin: 8px 0 0; font-size: 13px; line-height: 1.5; color: ${INK.body}; }

.edu-row { margin-top: 12px; display: flex; justify-content: space-between; align-items: baseline; gap: 14px; break-inside: avoid; }
.edu-qual { font-weight: 700; font-size: 13.5px; color: ${INK.ink}; }
.edu-inst { font-size: 12.5px; color: ${INK.muted}; margin-top: 1px; }

.refs { margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 22px 24px; }
.ref-name { font-weight: 700; font-size: 13px; color: ${INK.ink}; }
.ref-role { font-size: 12px; color: ${INK.muted}; }
.ref-contact { font-size: 11.5px; color: ${INK.faint}; margin-top: 3px; }
`;
