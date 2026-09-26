import "server-only";
import type { CVData } from "@/lib/pdf/data";
import { INK, VerifiedMark, toBullets, splitLang, pageFooterCss, EXP_BREAKS, LANG_CSS } from "./_inkShared";

// CV 4 — The Grid. White page under a heavy masthead rule, numbered section
// labels. Archivo (display) + IBM Plex Sans (body). Ported from the Claude
// Design handoff.
//
// Layout: short sections sit in two-up rows (Profile | Skills & Languages,
// Education | Certifications); Experience runs full width, each role on its
// own two-column grid (dates + location | title, organisation, bullets).
// Experience used to sit in the left half-column, which ran long CVs to
// three narrow pages with the right half of pages 2–3 empty.

const DISPLAY = `"Archivo", system-ui, sans-serif`;
const BODY = `"IBM Plex Sans", system-ui, sans-serif`;

export function GridCV({ data }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, location, email, phone, languages,
          experiences, educations, certifications, skills, referees } = data;
  const contact = [location, phone, email].filter(Boolean);

  // Number only the sections that actually render, in reading order.
  let n = 0;
  const num = () => String(++n).padStart(2, "0");

  const topLeft = summary ? (
    <div>
      <SecHead n={num()} label="Profile" />
      <p className="summary">{summary}</p>
    </div>
  ) : null;
  const topRight = skills.length > 0 || languages.length > 0 ? (
    <div>
      {skills.length > 0 && (
        <>
          <SecHead n={num()} label="Skills" />
          <div className="skills">{skills.join("  ·  ")}</div>
        </>
      )}
      {languages.length > 0 && (
        <>
          <SecHead n={num()} label="Languages" spaced={skills.length > 0} />
          <div className="langs">
            {languages.map((l, i) => {
              const { name, level, detail } = splitLang(l);
              return <div key={i}><div className="lang"><span style={{ color: INK.ink }}>{name}</span>{level && <span className="faint">{level}</span>}</div>{detail && <div className="lang-sub">{detail}</div>}</div>;
            })}
          </div>
        </>
      )}
    </div>
  ) : null;

  const experience = experiences.length > 0 ? (
    <section className="block">
      <SecHead n={num()} label="Experience" />
      {experiences.map((e, i) => (
        <div key={i} className="exp">
          <div className="exp-meta">
            {e.dateRange && <div className="exp-dates">{e.dateRange}</div>}
            {e.location && <div className="exp-loc">{e.location}</div>}
          </div>
          <div className="exp-main">
            <div className="exp-head">
              <div className="exp-title">{e.title}{e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}</div>
              {e.organization && <div className="exp-org">{e.organization}</div>}
            </div>
            <Bullets text={e.description} />
          </div>
        </div>
      ))}
    </section>
  ) : null;

  const bottomLeft = educations.length > 0 ? (
    <div>
      <SecHead n={num()} label="Education" />
      {educations.map((e, i) => (
        <div key={i} className="edu">
          <div className="edu-qual">{e.title}{e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}</div>
          <div className="row">
            <span className="edu-inst">{e.institution}</span>
            {e.dateRange && <span className="dates">{e.dateRange}</span>}
          </div>
        </div>
      ))}
    </div>
  ) : null;
  const bottomRight = certifications.length > 0 ? (
    <div>
      <SecHead n={num()} label="Certifications" />
      <div className="certs">
        {certifications.map((c, i) => (
          <div key={i} className="cert-row">
            <span style={{ color: INK.ink }}>{c.name}{c.issuer ? <span className="faint"> — {c.issuer}</span> : null}{c.verified && <>&nbsp;&nbsp;<VerifiedMark note="" /></>}</span>
            {c.year && <span className="dates">{c.year}</span>}
          </div>
        ))}
      </div>
    </div>
  ) : null;

  const refs = referees.length > 0 ? (
    <section className="block">
      <SecHead n={num()} label="Referees" />
      <div className={referees.length > 2 ? "refs refs-3" : "refs"}>
        {referees.map((r, i) => (
          <div key={i}>
            <div className="ref-name">{r.name}</div>
            {(r.position || r.organization) && <div className="ref-role">{[r.position, r.organization].filter(Boolean).join(", ")}</div>}
            {(r.email || r.phone) && <div className="ref-contact">{[r.email, r.phone].filter(Boolean).join(" · ")}</div>}
          </div>
        ))}
      </div>
    </section>
  ) : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles + EXP_BREAKS + LANG_CSS + pageFooterCss(fullName, BODY) }} />
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

        <Duo left={topLeft} right={topRight} />
        {experience}
        <Duo left={bottomLeft} right={bottomRight} />
        {refs}
      </div>
    </>
  );
}

// Two-up row; collapses to a single full-width column when one side is
// empty so a lone section never sits in half the page.
function Duo({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  if (!left && !right) return null;
  if (!left || !right) return <section className="block">{left ?? right}</section>;
  return (
    <section className="block duo">
      <div className="duo-l">{left}</div>
      <div className="duo-r">{right}</div>
    </section>
  );
}

function SecHead({ n, label, spaced }: { n: string; label: string; spaced?: boolean }) {
  return (
    <div className={spaced ? "sechead sechead-gap" : "sechead"}>
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
.page { padding: 0 52px; color: ${INK.body}; font-family: ${BODY}; -webkit-font-smoothing: antialiased; }

.hd { display: flex; justify-content: space-between; align-items: flex-end; gap: 28px; }
.name { margin: 0; font-family: ${DISPLAY}; font-weight: 800; font-size: 50px; letter-spacing: -0.025em; line-height: 0.95; color: ${INK.ink}; }
.hd-right { text-align: right; font-size: 11.5px; line-height: 1.85; color: ${INK.bodySoft}; padding-bottom: 3px; max-width: 300px; }
.hd-role { font-family: ${DISPLAY}; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; line-height: 1.5; color: ${INK.ink}; margin-bottom: 6px; }
.masthead-rule { height: 2px; background: ${INK.ink}; margin-top: 26px; }

.block { margin-top: 30px; }
.duo { display: grid; grid-template-columns: 1fr 1fr; break-inside: avoid; }
.duo-l { padding-right: 34px; min-width: 0; }
.duo-r { padding-left: 34px; border-left: 1px solid ${INK.hair}; min-width: 0; }

.sechead { display: flex; align-items: baseline; gap: 9px; border-bottom: 1px solid ${INK.ink}; padding-bottom: 6px; margin-bottom: 14px; break-after: avoid; page-break-after: avoid; }
.sechead-gap { margin-top: 24px; }
.sechead-n { font-family: ${DISPLAY}; font-weight: 700; font-size: 11px; color: ${INK.faint2}; }
.sechead-l { font-family: ${DISPLAY}; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: ${INK.ink}; }

.exp { display: grid; grid-template-columns: 124px 1fr; column-gap: 26px; margin-bottom: 20px; }
.exp:last-child { margin-bottom: 0; }
.exp-meta { padding-top: 2px; }
.exp-dates { font-family: ${DISPLAY}; font-weight: 600; font-size: 11.5px; color: ${INK.ink}; letter-spacing: 0.02em; }
.exp-loc { font-size: 11.5px; color: ${INK.faint}; margin-top: 3px; }
.exp-main { min-width: 0; }
.exp-title { font-family: ${DISPLAY}; font-weight: 700; font-size: 14px; color: ${INK.ink}; }
.exp-org { font-size: 12.5px; color: ${INK.muted}; margin-top: 2px; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-top: 2px; }
.dates { font-size: 11px; font-weight: 500; color: ${INK.faint}; letter-spacing: 0.03em; white-space: nowrap; flex: none; }
.bullets { margin: 9px 0 0; padding: 0; list-style: none; }
.bullets li { display: flex; gap: 10px; font-size: 12px; line-height: 20px; color: ${INK.body}; margin-bottom: 4px; }
.bullets li:last-child { margin-bottom: 0; }
.sq { flex: none; width: 3px; height: 3px; background: ${INK.ink}; margin-top: 9px; }
.single { margin: 9px 0 0; font-size: 12px; line-height: 1.7; color: ${INK.body}; }

.edu { margin-bottom: 14px; break-inside: avoid; }
.edu:last-child { margin-bottom: 0; }
.edu-qual { font-family: ${DISPLAY}; font-weight: 700; font-size: 13px; color: ${INK.ink}; }
.edu-inst { font-size: 12px; color: ${INK.muted}; }

.summary { margin: 0; font-size: 12.5px; line-height: 1.62; color: ${INK.body}; }
.skills { font-size: 12.5px; line-height: 1.75; color: ${INK.body}; }
.langs { display: flex; flex-direction: column; gap: 7px; font-size: 12.5px; }
.lang { display: flex; justify-content: space-between; gap: 8px; }
.faint { color: ${INK.faint}; }
.certs { display: flex; flex-direction: column; gap: 9px; }
.cert-row { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; font-size: 12px; break-inside: avoid; }

.refs { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 28px; }
.refs-3 { grid-template-columns: 1fr 1fr 1fr; }
.refs > div { break-inside: avoid; }
.ref-name { font-family: ${DISPLAY}; font-weight: 700; font-size: 12.5px; color: ${INK.ink}; }
.ref-role { font-size: 11.5px; color: ${INK.muted}; }
.ref-contact { font-size: 11px; color: ${INK.faint}; margin-top: 2px; word-break: break-word; }
`;
