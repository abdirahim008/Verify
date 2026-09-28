import "server-only";
import type { CVData } from "@/lib/pdf/data";
import { INK, VerifiedMark, initials, toBullets, splitLang, pageFooterCss, EXP_BREAKS, LANG_CSS, TYPE_CSS, ContactIcon, ContactValue, contactItems } from "./_inkShared";

// CV 5 — The Statement. White page, bordered masthead with photo, then
// label/content rows. Bodoni Moda (display) + Karla (body). Ported from
// the Claude Design handoff.

const DISPLAY = `"Bodoni Moda", Georgia, serif`;
const BODY = `"Karla", system-ui, sans-serif`;

export function StatementCV({ data, theme }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, location, email, phone, photoUrl, languages,
          experiences, educations, certifications, skills, referees } = data;
  const contact = contactItems({ location: "", phone, email });
  const A = theme?.accent ?? INK.ink;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles(A) + TYPE_CSS + EXP_BREAKS + LANG_CSS + pageFooterCss(fullName, BODY) }} />
      <div className="page">
        <header className="masthead">
          <div className="meta">
            <span>Curriculum Vitæ</span><span>{location}</span>
          </div>
          <div className="m-row">
            <div>
              <h1 className="name">{fullName}</h1>
              {headline && <div className="role">{headline}</div>}
            </div>
            <div className="m-right">
              {photoUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={photoUrl} alt="" className="m-photo" />
                : <div className="m-mono">{initials(fullName)}</div>}
              {contact.length > 0 && <div className="m-contact">{contact.map((c, i) => <div key={i} className="c-item"><ContactValue {...c} /><ContactIcon kind={c.kind} size={10} color={A} /></div>)}</div>}
            </div>
          </div>
        </header>

        <div className="body">
          {summary && (
            <Row label="Profile" last={false}>
              <p className="summary">{summary}</p>
            </Row>
          )}

          {experiences.length > 0 && (
            <Row label="Experience" last={false}>
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
            </Row>
          )}

          {educations.length > 0 && (
            <Row label="Education" last={false}>
              {educations.map((e, i) => (
                <div key={i} className="edu-row">
                  <div>
                    <div className="edu-qual">{e.title}</div>
                    <div className="edu-inst">{e.institution}{e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}</div>
                  </div>
                  {e.dateRange && <div className="dates">{e.dateRange}</div>}
                </div>
              ))}
            </Row>
          )}

          {skills.length > 0 && (
            <Row label="Skills" last={false}>
              <ul className="skills">{skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </Row>
          )}

          {languages.length > 0 && (
            <Row label="Languages" last={false}>
              <div className="langs">
                {languages.map((l, i) => {
                  const { name, level, detail } = splitLang(l);
                  return <div key={i}>{name}{level && <span className="faint"> · {level}</span>}{detail && <div className="lang-sub">{detail}</div>}</div>;
                })}
              </div>
            </Row>
          )}

          {certifications.length > 0 && (
            <Row label="Certifications" last={false}>
              <div className="certs">
                {certifications.map((c, i) => (
                  <div key={i} className="cert-row">
                    <span><span style={{ color: INK.ink }}>{c.name}</span>{c.issuer && <span className="faint"> — {c.issuer}</span>}{c.verified && <>&nbsp;&nbsp;<VerifiedMark note="" /></>}</span>
                    {c.year && <span className="faint">{c.year}</span>}
                  </div>
                ))}
              </div>
            </Row>
          )}

          {referees.length > 0 && (
            <Row label="Referees" last>
              <div className="refs">
                {referees.map((r, i) => (
                  <div key={i}>
                    <div className="ref-name">{r.name}</div>
                    {(r.position || r.organization) && <div className="ref-role">{[r.position, r.organization].filter(Boolean).join(", ")}</div>}
                    {(r.email || r.phone) && <div className="ref-contact">{[r.email, r.phone].filter(Boolean).join(" · ")}</div>}
                  </div>
                ))}
              </div>
            </Row>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, children, last }: { label: string; children: React.ReactNode; last: boolean }) {
  return (
    <section className={last ? "srow srow-last" : "srow"}>
      <div className="srow-label">{label}</div>
      <div className="srow-content">{children}</div>
    </section>
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
.page { min-height: 269mm; color: ${INK.body}; font-family: ${BODY}; -webkit-font-smoothing: antialiased; }

.masthead { padding: 0 56px 20px; border-bottom: 2px solid ${A}; }
.meta { display: flex; justify-content: space-between; font-size: 10.5px; letter-spacing: 0.3em; text-transform: uppercase; color: ${INK.faint}; padding-bottom: 14px; border-bottom: 1px solid ${INK.hair}; }
.m-row { display: flex; justify-content: space-between; align-items: center; gap: 30px; margin-top: 18px; }
.name { margin: 0; font-family: ${DISPLAY}; font-weight: 600; font-size: 46px; line-height: 1; letter-spacing: 0.005em; color: ${INK.ink}; }
.role { margin-top: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3em; font-size: 11.5px; color: ${INK.muted}; }
.m-right { display: flex; flex-direction: column; align-items: flex-end; gap: 14px; flex: none; }
.m-photo { width: 92px; height: 92px; border-radius: 50%; object-fit: cover; border: 1px solid #c4bfb6; display: block; }
.m-mono { width: 92px; height: 92px; border-radius: 50%; border: 1px solid #c4bfb6; display: flex; align-items: center; justify-content: center; font-family: ${DISPLAY}; font-weight: 500; font-size: 32px; letter-spacing: 0.04em; color: ${INK.ink}; }
.m-contact { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-size: 11px; line-height: 1.5; color: ${INK.bodySoft}; }
.c-item { display: inline-flex; align-items: center; gap: 7px; }

.body { padding: 4px 56px 0; }
/* Label floated beside plain block content, not a flex row: Chromium can
   refuse to split a flex row across pages and push a whole long section
   (Experience) overleaf, leaving page 1 nearly empty. Block flow always
   fragments cleanly. */
.srow { display: flow-root; padding: 11px 0; border-bottom: 1px solid ${INK.hair2}; }
.srow-last { border-bottom: none; }
.srow-label { float: left; width: 132px; font-family: ${DISPLAY}; font-style: italic; font-size: 18px; line-height: 1.3; color: ${A}; }
.srow-content { margin-left: 162px; min-width: 0; }
.summary { margin: 0; font-size: 12.5px; line-height: 1.55; color: ${INK.body}; }

.exp { margin-bottom: 11px; }
.exp:last-child { margin-bottom: 0; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; }
.exp-title { font-weight: 700; font-size: 14px; color: ${INK.ink}; }
.dates { font-size: 11px; font-weight: 500; color: ${INK.faint}; letter-spacing: 0.04em; white-space: nowrap; flex: none; }
.exp-org { font-size: 12px; color: ${INK.muted}; margin-top: 1px; }
.bullets { margin: 5px 0 0; padding: 0; list-style: none; }
/* Whole-pixel line-height so every marker sits on the same sub-pixel. */
.bullets li { display: flex; gap: 11px; font-size: 12px; line-height: 18px; color: ${INK.body}; margin-bottom: 2px; }
.bullets li:last-child { margin-bottom: 0; }
.dot { flex: none; width: 4px; height: 4px; border: 1px solid ${A}; border-radius: 50%; margin-top: 6px; }
.single { margin: 8px 0 0; font-size: 12px; line-height: 1.55; color: ${INK.body}; }

.edu-row { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; margin-bottom: 10px; break-inside: avoid; }
.edu-row:last-child { margin-bottom: 0; }
.edu-qual { font-weight: 700; font-size: 13px; color: ${INK.ink}; }
.edu-inst { font-size: 12px; color: ${INK.muted}; }

.skills { margin: 0; padding: 0; list-style: none; columns: 3; column-gap: 20px; font-size: 12px; line-height: 1.55; color: ${INK.body}; }
.skills li { break-inside: avoid; }
.langs { display: flex; flex-wrap: wrap; gap: 6px 28px; font-size: 12.5px; color: ${INK.ink}; }
.faint { color: ${INK.faint}; }
.certs { display: flex; flex-direction: column; gap: 7px; }
.cert-row { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; font-size: 12px; }

.refs { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 24px; }
.refs > div { break-inside: avoid; }
.ref-name { font-weight: 700; font-size: 12.5px; color: ${INK.ink}; }
.ref-role { font-size: 11.5px; color: ${INK.muted}; }
.ref-contact { font-size: 11px; color: ${INK.faint}; margin-top: 2px; }
`;
