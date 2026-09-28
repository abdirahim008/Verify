import "server-only";
import type { CVData } from "@/lib/pdf/data";
import {
  INK, VerifiedMark, toBullets, splitLang, pageFooterCss, EXP_BREAKS, LANG_CSS,
  TYPE_CSS, ContactIcon, ContactValue, contactItems,
} from "./_inkShared";

// CV 1 — The Classic. White page, single column, centred masthead.
// Cormorant Garamond (display) + EB Garamond (body). Ink on white with one
// optional accent (lib/pdf/themes.ts) carried by the section heads, the
// masthead rule and the contact glyphs — the body text always stays ink.

const DISPLAY = `"Cormorant Garamond", Georgia, serif`;
const BODY = `"EB Garamond", Georgia, serif`;

export function ClassicCV({ data, theme }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, languages,
          experiences, educations, certifications, skills, referees } = data;
  const contact = contactItems(data);
  const A = theme?.accent ?? INK.ink;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles(A) + TYPE_CSS + EXP_BREAKS + LANG_CSS + pageFooterCss(fullName, BODY) }} />
      <div className="cv">
        <header className="mast">
          <h1 className="name">{fullName}</h1>
          {headline && <div className="role">{headline}</div>}
          <div className="rule"><span /></div>
          {contact.length > 0 && (
            <div className="contact">
              {contact.map((c, i) => (
                <span key={i} className="c-item"><ContactIcon kind={c.kind} size={10} color={A} /><ContactValue {...c} /></span>
              ))}
            </div>
          )}
        </header>

        {summary && <p className="summary">{summary}</p>}

        {experiences.length > 0 && (
          <section className="sec">
            <h2 className="h2">Professional Experience</h2>
            {experiences.map((e, i) => (
              <div key={i} className="exp">
                <div className="exp-head">
                  <div className="row">
                    <div className="exp-title">{e.title}</div>
                    {e.dateRange && <div className="dates">{e.dateRange}</div>}
                  </div>
                  <div className="exp-org">
                    <span className="org">{e.organization}</span>
                    {e.location && <span className="loc">{e.organization ? ", " : ""}{e.location}</span>}
                    {e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}
                  </div>
                </div>
                <Bullets text={e.description} />
              </div>
            ))}
          </section>
        )}

        {educations.length > 0 && (
          <section className="sec">
            <h2 className="h2">Education</h2>
            {educations.map((e, i) => (
              <div key={i} className="edu-row">
                <div>
                  <div className="edu-qual">{e.title}</div>
                  <div className="edu-inst">
                    {e.institution}
                    {e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}
                  </div>
                </div>
                {e.dateRange && <div className="dates">{e.dateRange}</div>}
              </div>
            ))}
          </section>
        )}

        {certifications.length > 0 && (
          <section className="sec">
            <h2 className="h2">Certifications</h2>
            {certifications.map((c, i) => (
              <div key={i} className="cert-row">
                <span>
                  <span className="cert-name">{c.name}</span>
                  {c.issuer && <span className="muted">, {c.issuer}</span>}
                  {c.verified && <>&nbsp;&nbsp;<VerifiedMark note={c.verifiedNote} /></>}
                </span>
                {c.year && <span className="dates">{c.year}</span>}
              </div>
            ))}
          </section>
        )}

        {skills.length > 0 && (
          <section className="sec">
            <h2 className="h2">Skills</h2>
            <ul className="skills">
              {skills.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </section>
        )}

        {languages.length > 0 && (
          <section className="sec">
            <h2 className="h2">Languages</h2>
            <div className="langs">
              {languages.map((l, i) => {
                const { name, level, detail } = splitLang(l);
                return (
                  <div key={i} className="lang">
                    <span className="lang-name">{name}</span>
                    {level && <span className="muted"> — {level}</span>}
                    {detail && <div className="lang-sub">{detail}</div>}
                  </div>
                );
              })}
            </div>
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
                    <div className="ref-contact">{[r.email, r.phone].filter(Boolean).join("  ·  ")}</div>
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
        <li key={i}><span className="dash">–</span><span>{b}</span></li>
      ))}
    </ul>
  );
}

const styles = (A: string) => `
@page { size: A4; margin: 13mm 19mm 13mm; }
.cv { color: ${INK.body}; font-family: ${BODY}; font-size: 13.5px; -webkit-font-smoothing: antialiased; }

.mast { text-align: center; }
.name { margin: 0; font-family: ${DISPLAY}; font-weight: 600; font-size: 42px; letter-spacing: 0.02em; color: ${INK.ink}; line-height: 1.04; }
.role { margin-top: 6px; font-style: italic; font-size: 16px; color: ${INK.muted2}; letter-spacing: 0.03em; }
/* Double rule: a strong line over a hairline — the classic letterpress
   masthead finish. */
.rule { margin: 12px 0 8px; border-top: 1.5px solid ${A}; }
.rule span { display: block; margin-top: 2px; border-top: 0.5px solid ${A}; }
.contact { display: flex; justify-content: center; flex-wrap: wrap; gap: 3px 22px; font-size: 12.5px; letter-spacing: 0.03em; color: ${INK.muted}; }
.c-item { display: inline-flex; align-items: center; gap: 6px; }

.summary { margin: 14px 0 12px; font-size: 14px; line-height: 1.45; color: ${INK.body}; }

.sec { margin-bottom: 11px; }
.h2 { margin: 0 0 8px; font-family: ${DISPLAY}; font-weight: 700; font-size: 14.5px; text-transform: uppercase; letter-spacing: 0.2em; color: ${A}; border-bottom: 0.75px solid ${A}; padding-bottom: 4px; break-after: avoid; page-break-after: avoid; }
.refs > div, .lang, .cert-row { break-inside: avoid; }

.exp { margin-bottom: 8px; }
.exp:last-child { margin-bottom: 0; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
.exp-title { font-weight: 600; font-size: 15px; color: ${INK.ink}; }
.dates { font-size: 12.5px; color: ${INK.muted}; letter-spacing: 0.03em; white-space: nowrap; flex: none; }
.exp-org { font-size: 14px; margin-top: 0; }
.org { font-style: italic; color: ${INK.ink}; }
.loc { font-style: italic; color: ${INK.muted}; }
.bullets { margin: 4px 0 0; padding: 0; list-style: none; }
.bullets li { display: flex; gap: 9px; font-size: 13.5px; line-height: 19px; color: ${INK.body}; margin-bottom: 1px; }
.bullets li:last-child { margin-bottom: 0; }
.dash { color: ${INK.faint}; flex: none; }
.single { margin: 4px 0 0; font-size: 13.5px; line-height: 19px; color: ${INK.body}; }

.edu-row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-bottom: 7px; break-inside: avoid; }
.edu-row:last-child { margin-bottom: 0; }
.edu-qual { font-weight: 600; font-size: 14.5px; color: ${INK.ink}; }
.edu-inst { font-style: italic; font-size: 13.5px; color: ${INK.muted}; }

.cert-row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; font-size: 13.5px; margin-bottom: 3px; }
.cert-name { color: ${INK.ink}; }
.muted { color: ${INK.muted}; }

/* Three even columns read as a tidy inventory rather than a run-on line. */
.skills { margin: 0; padding: 0; list-style: none; columns: 3; column-gap: 24px; font-size: 13.5px; line-height: 19px; }
.skills li { break-inside: avoid; padding-left: 12px; position: relative; }
.skills li::before { content: ""; position: absolute; left: 0; top: 8px; width: 4px; height: 4px; border-radius: 50%; background: ${INK.faint2}; }
.langs { display: grid; grid-template-columns: repeat(auto-fill, minmax(135px, 1fr)); gap: 4px 18px; font-size: 13.5px; line-height: 1.45; }
.lang-name { color: ${INK.ink}; font-weight: 500; }

.refs { display: grid; grid-template-columns: repeat(${"auto-fit"}, minmax(180px, 1fr)); gap: 12px 28px; }
.ref-name { font-weight: 600; font-size: 14px; color: ${INK.ink}; }
.ref-role { font-style: italic; font-size: 13px; color: ${INK.muted}; }
.ref-contact { font-size: 12.5px; color: ${INK.muted}; margin-top: 1px; }
`;
