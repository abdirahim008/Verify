import "server-only";
import type { CVData } from "@/lib/pdf/data";
import { INK, VerifiedMark, toBullets, splitLang, contactParts } from "./_inkShared";

// CV 1 — The Classic. White page, single column, centred masthead.
// Cormorant Garamond (display) + EB Garamond (body). Monochrome ink,
// hairline rules. Ported from the Claude Design handoff.

const DISPLAY = `"Cormorant Garamond", Georgia, serif`;
const BODY = `"EB Garamond", Georgia, serif`;

export function ClassicCV({ data }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, location, email, phone, languages,
          experiences, educations, certifications, skills, referees } = data;
  const contact = contactParts({ location, phone, email });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="cv">
        <header style={{ textAlign: "center" }}>
          <h1 className="name">{fullName}</h1>
          {headline && <div className="role">{headline}</div>}
        </header>

        <div className="rule" />
        {contact.length > 0 && (
          <div className="contact">{contact.join("  ·  ")}</div>
        )}

        {summary && <p className="summary">{summary}</p>}

        {educations.length > 0 && (
          <section className="sec">
            <h2 className="h2">Education</h2>
            {educations.map((e, i) => (
              <div key={i} className="edu-row">
                <div>
                  <div className="edu-qual">{e.qualification}</div>
                  <div className="edu-inst">
                    {e.institution}{e.field ? ` · ${e.field}` : ""}
                    {e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}
                  </div>
                </div>
                {e.dateRange && <div className="dates">{e.dateRange}</div>}
              </div>
            ))}
          </section>
        )}

        {experiences.length > 0 && (
          <section className="sec">
            <h2 className="h2">Experience</h2>
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
          </section>
        )}

        {(skills.length > 0 || languages.length > 0) && (
          <div className="twocol">
            {skills.length > 0 && (
              <section>
                <h2 className="h2">Skills</h2>
                <div className="skills">{skills.join("  ·  ")}</div>
              </section>
            )}
            {languages.length > 0 && (
              <section>
                <h2 className="h2">Languages</h2>
                <div className="langs">
                  {languages.map((l, i) => {
                    const { name, level } = splitLang(l);
                    return <div key={i}>{name}{level && <span className="faint"> ({level})</span>}</div>;
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {certifications.length > 0 && (
          <section className="sec">
            <h2 className="h2">Certifications</h2>
            {certifications.map((c, i) => (
              <div key={i} className="cert-row">
                <span>
                  <span style={{ color: INK.ink }}>{c.name}</span>
                  {(c.issuer || c.year) && <span className="faint"> — {[c.issuer].filter(Boolean).join("")}</span>}
                  {c.verified && <>&nbsp;&nbsp;<VerifiedMark note={c.verifiedNote} /></>}
                </span>
                {c.year && <span className="dates">{c.year}</span>}
              </div>
            ))}
          </section>
        )}

        {referees.length > 0 && (
          <section className="sec">
            <h2 className="h2">Referees</h2>
            <div className="refs">
              {referees.map((r, i) => (
                <div key={i}>
                  <div className="ref-name">{r.name}</div>
                  {(r.position || r.organization) && (
                    <div className="ref-role">{[r.position, r.organization].filter(Boolean).join(", ")}</div>
                  )}
                  {(r.email || r.phone) && (
                    <div className="ref-contact">{[r.email, r.phone].filter(Boolean).join("  ·  ")}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function Bullets({ text }: { text: string }) {
  const bullets = toBullets(text);
  if (bullets.length === 0) return null;
  if (bullets.length === 1) {
    return <p className="single">{bullets[0]}</p>;
  }
  return (
    <ul className="bullets">
      {bullets.map((b, i) => (
        <li key={i}><span className="dash">—</span><span>{b}</span></li>
      ))}
    </ul>
  );
}

const styles = `
@page { size: A4; margin: 14mm 19mm; }
.cv { color: ${INK.body}; font-family: ${BODY}; font-size: 13.5px; -webkit-font-smoothing: antialiased; }
.name { margin: 0; font-family: ${DISPLAY}; font-weight: 600; font-size: 50px; letter-spacing: 0.015em; color: ${INK.ink}; line-height: 1.02; }
.role { margin-top: 8px; font-style: italic; font-size: 16px; color: ${INK.muted2}; letter-spacing: 0.04em; }
.rule { height: 1.5px; background: ${INK.ink}; margin: 16px 0 8px; }
.contact { text-align: center; font-size: 12px; letter-spacing: 0.04em; color: ${INK.muted}; }
.summary { margin: 16px auto 20px; max-width: 560px; font-size: 14.5px; line-height: 1.55; text-align: center; color: ${INK.body}; font-style: italic; }

.sec { margin-bottom: 15px; }
.h2 { margin: 0 0 12px; font-family: ${BODY}; font-weight: 600; font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.24em; color: ${INK.ink}; border-bottom: 1px solid ${INK.ink}; padding-bottom: 6px; break-after: avoid; page-break-after: avoid; }
.refs > div { break-inside: avoid; }

.exp { margin-bottom: 13px; break-inside: avoid; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
.exp-title { font-weight: 600; font-size: 15.5px; color: ${INK.ink}; }
.dates { font-size: 12px; color: ${INK.faint}; letter-spacing: 0.05em; white-space: nowrap; flex: none; }
.exp-org { font-style: italic; font-size: 13.5px; color: ${INK.muted}; margin-top: 1px; }
.bullets { margin: 7px 0 0; padding: 0; list-style: none; }
.bullets li { display: flex; gap: 10px; font-size: 13.5px; line-height: 1.5; color: ${INK.body}; margin-bottom: 4px; }
.bullets li:last-child { margin-bottom: 0; }
.dash { color: ${INK.faint2}; flex: none; }
.single { margin: 6px 0 0; font-size: 13.5px; line-height: 1.5; color: ${INK.body}; }

.edu-row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-bottom: 8px; break-inside: avoid; }
.edu-row:last-child { margin-bottom: 0; }
.edu-qual { font-weight: 600; font-size: 14.5px; color: ${INK.ink}; }
.edu-inst { font-style: italic; font-size: 13.5px; color: ${INK.muted}; margin-top: 1px; }

.twocol { display: grid; grid-template-columns: 1fr 1fr; gap: 34px; margin-bottom: 15px; }
.skills { font-size: 13.5px; line-height: 1.85; color: ${INK.body}; }
.langs { font-size: 13.5px; line-height: 1.85; color: ${INK.ink}; }
.faint { color: ${INK.faint}; }

.cert-row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; font-size: 13.5px; margin-bottom: 5px; break-inside: avoid; }

.refs { display: grid; grid-template-columns: 1fr 1fr; gap: 22px 34px; }
.ref-name { font-weight: 600; font-size: 14px; color: ${INK.ink}; }
.ref-role { font-style: italic; font-size: 13px; color: ${INK.muted}; }
.ref-contact { font-size: 12.5px; color: ${INK.muted}; margin-top: 2px; }
`;
