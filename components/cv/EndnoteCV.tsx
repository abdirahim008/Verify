import "server-only";
import type { CVData } from "@/lib/pdf/data";
import { INK, VerifiedMark, toBullets, splitLang, pageFooterCss, EXP_BREAKS, LANG_CSS, TYPE_CSS, ContactIcon, ContactValue, contactItems } from "./_inkShared";

// CV 7 — The Endnote. White page, single-column experience over a two-up
// lower grid, closing with referees. Archivo (display) + Newsreader (body).
// Ported from the Claude Design handoff (colour footer band removed).

const DISPLAY = `"Archivo", system-ui, sans-serif`;
const BODY = `"Newsreader", Georgia, serif`;

export function EndnoteCV({ data, theme }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, location, email, phone, languages,
          experiences, educations, certifications, skills, referees } = data;
  const contact = contactItems({ location, phone, email });
  const A = theme?.accent ?? "#2a4a39";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles(A) + TYPE_CSS + EXP_BREAKS + LANG_CSS + pageFooterCss(fullName, BODY) }} />
      <div className="page">
        <header className="hd">
          <div className="hd-row">
            <div>
              <h1 className="name">{fullName}</h1>
              {headline && <div className="role">{headline}</div>}
            </div>
            {contact.length > 0 && (
              <div className="hd-contact">{contact.map((c, i) => <div key={i} className="c-item"><ContactValue {...c} /><ContactIcon kind={c.kind} size={10} color={A} /></div>)}</div>
            )}
          </div>
          <div className="hd-rule" />
        </header>

        <div className="body">
          {summary && <p className="summary">{summary}</p>}

          {experiences.length > 0 && (
            <section className="sec">
              <div className="h2">Experience</div>
              {experiences.map((e, i) => (
                <div key={i} className="exp">
                  <div className="exp-head">
                    <div className="row">
                      <div className="exp-title">{e.title}</div>
                      {e.dateRange && <div className="dates">{e.dateRange}</div>}
                    </div>
                    <div className="exp-org">{[e.organization, e.location].filter(Boolean).join(", ")}{e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}</div>
                  </div>
                  <Bullets text={e.description} />
                </div>
              ))}
            </section>
          )}

          {educations.length > 0 && (
            <section className="sec">
              <div className="h2">Education</div>
              {educations.map((e, i) => (
                <div key={i} className="edu">
                  <div className="edu-qual">{e.title}{e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}</div>
                  <div className="edu-inst">{[e.institution, e.dateRange].filter(Boolean).join(" · ")}</div>
                </div>
              ))}
            </section>
          )}

          <div className="grid">
            <section>
              {skills.length > 0 && (
                <>
                  <div className="h2">Skills</div>
                  <div className="sk-list">{skills.map((s, i) => <span key={i}>{s}</span>)}</div>
                </>
              )}
              {certifications.length > 0 && (
                <>
                  <div className="h2" style={{ marginTop: skills.length ? "18px" : "0" }}>Certifications</div>
                  <div className="certs">
                    {certifications.map((c, i) => (
                      <div key={i}><span style={{ color: INK.ink }}>{c.name}</span>{(c.issuer || c.year) && <span className="faint"> — {[c.issuer, c.year].filter(Boolean).join(" · ")}</span>}{c.verified && <>&nbsp;&nbsp;<VerifiedMark note="" /></>}</div>
                    ))}
                  </div>
                </>
              )}
            </section>
            <section>
              {languages.length > 0 && (
                <>
                  <div className="h2">Languages</div>
                  <div className="langs">
                    {languages.map((l, i) => {
                      const { name, level, detail } = splitLang(l);
                      return <div key={i}><div className="lang"><span style={{ color: INK.ink }}>{name}</span>{level && <span className="faint">{level}</span>}</div>{detail && <div className="lang-sub">{detail}</div>}</div>;
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

const styles = (A: string) => `
@page { size: A4; margin: 14mm 0; }
.page { color: ${INK.body}; font-family: ${BODY}; -webkit-font-smoothing: antialiased; }

.hd { padding: 0 56px; }
.hd-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 28px; }
.name { margin: 0; font-family: ${DISPLAY}; font-weight: 800; font-size: 42px; letter-spacing: -0.025em; color: ${INK.ink}; line-height: 0.97; }
.role { margin-top: 10px; font-family: ${DISPLAY}; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.24em; color: ${INK.muted}; }
.hd-contact { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11.5px; line-height: 1.5; color: ${INK.bodySoft}; white-space: nowrap; flex: none; }
.c-item { display: inline-flex; align-items: center; gap: 7px; }
.hd-rule { height: 4px; background: ${A}; margin-top: 18px; }

.body { padding: 20px 56px 0; }
.summary { margin: 0 0 16px; font-size: 13.5px; line-height: 1.55; color: ${INK.body}; }
.sec { margin-bottom: 16px; }
.h2 { font-family: ${DISPLAY}; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; color: ${A}; border-bottom: 1px solid ${INK.hair}; padding-bottom: 6px; margin-bottom: 11px; break-after: avoid; page-break-after: avoid; }

.exp { margin-bottom: 11px; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; }
.exp-title { font-family: ${DISPLAY}; font-weight: 700; font-size: 14.5px; color: ${INK.ink}; }
.dates { font-family: ${DISPLAY}; font-size: 11.5px; font-weight: 500; color: ${INK.faint}; letter-spacing: 0.03em; white-space: nowrap; flex: none; }
.exp-org { font-style: italic; font-size: 13.5px; color: ${INK.muted}; margin-top: 1px; }
.bullets { margin: 8px 0 0; padding: 0; list-style: none; }
/* Whole-pixel line-height so every marker sits on the same sub-pixel. */
.bullets li { display: flex; gap: 11px; font-size: 13px; line-height: 19px; color: ${INK.body}; margin-bottom: 2px; }
.bullets li:last-child { margin-bottom: 0; }
.dot { flex: none; width: 5px; height: 5px; background: ${A}; border: 1px solid ${A}; border-radius: 50%; margin-top: 7px; }
.single { margin: 8px 0 0; font-size: 13px; line-height: 1.5; color: ${INK.body}; }

/* Short two-up block. It may split across a page (headings still never
   strand: .h2 is break-after: avoid) rather than jump overleaf whole. */
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 36px; margin-bottom: 16px; }
.edu { margin-bottom: 9px; break-inside: avoid; }
.edu-qual { font-family: ${DISPLAY}; font-weight: 700; font-size: 13px; color: ${INK.ink}; }
.edu-inst { font-style: italic; font-size: 13px; color: ${INK.muted}; }
.faint { color: ${INK.faint}; }
.certs { display: flex; flex-direction: column; gap: 7px; font-size: 12.5px; }
.sk-list { columns: 2; column-gap: 20px; font-size: 12.5px; line-height: 1.5; color: ${INK.body}; }
.sk-list > span { display: block; break-inside: avoid; padding-left: 11px; position: relative; margin-bottom: 2px; }
.sk-list > span::before { content: ""; position: absolute; left: 0; top: 8px; width: 4px; height: 4px; border-radius: 50%; background: ${A}; }
.langs { display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
.lang { display: flex; justify-content: space-between; gap: 8px; }

.refs { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 36px; }
.refs > div { break-inside: avoid; }
.ref-name { font-family: ${DISPLAY}; font-weight: 700; font-size: 13px; color: ${INK.ink}; }
.ref-role { font-style: italic; font-size: 12.5px; color: ${INK.muted}; }
.ref-contact { font-size: 11.5px; color: ${INK.faint}; margin-top: 2px; }
`;
