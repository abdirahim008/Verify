import "server-only";
import type { CVData } from "@/lib/pdf/data";
import {
  INK, VerifiedMark, initials, toBullets, splitLang, pageFooterCss, EXP_BREAKS,
  TYPE_CSS, ContactIcon, ContactValue, contactItems, bandColors, LevelBar,
} from "./_inkShared";

// CV 4 — The Grid. A bold, modern layout: an accent strip at the top-left
// carrying the contact lines over a photo block, a heavy Archivo name beside
// a tinted summary panel, and section heads sitting on thick accent bars.
// Archivo (display) + IBM Plex Sans (body). One adjustable accent
// (lib/pdf/themes.ts); strip text flips light/dark with its luminance.
//
// Body layout: the left column (skills, education, certifications,
// languages) is a float, so once it ends Experience runs full width — a
// long CV doesn't leave an empty left column down pages 2 and 3. Each main
// block is its own formatting context (display: flow-root) so it sits beside
// the float cleanly and widens once it clears it.

const DISPLAY = `"Archivo", system-ui, sans-serif`;
const BODY = `"IBM Plex Sans", system-ui, sans-serif`;
const LEFT_W = 214;

export function GridCV({ data, theme }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, photoUrl, languages,
          experiences, educations, certifications, skills, referees } = data;
  const contact = contactItems(data);
  const C = bandColors(theme?.accent ?? "#f2c230");
  // A light accent (the default amber) reads as a highlight, not as text:
  // on white its heads and markers use ink instead.
  const light = C.onBand !== "#ffffff";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles(C.accent, C.onBand, light) + TYPE_CSS + EXP_BREAKS + pageFooterCss(fullName, BODY) }} />
      <div className="page">
        <header className="hd">
          <div className="hd-left">
            <div className="strip" data-band>
              {contact.map((c, i) => (
                <div key={i} className="c-item"><ContactIcon kind={c.kind} size={11} color={C.onBand} /><ContactValue {...c} /></div>
              ))}
            </div>
            {photoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={photoUrl} alt="" className="photo" />
              : <div className="photo mono">{initials(fullName)}</div>}
          </div>
          <div className="hd-right">
            <h1 className="name">{fullName}</h1>
            {headline && <div className="role">{headline}</div>}
            {summary && (
              <div className="panel" data-band>
                <h2 className="h2">Summary</h2>
                <p className="summary">{summary}</p>
              </div>
            )}
          </div>
        </header>

        <div className="body">
          {(skills.length > 0 || educations.length > 0 || certifications.length > 0 || languages.length > 0) && (
            <aside className="left">
              {skills.length > 0 && (
                <section className="l-sec">
                  <h2 className="h2">Skills</h2>
                  <ul className="sk">{skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </section>
              )}
              {educations.length > 0 && (
                <section className="l-sec">
                  <h2 className="h2">Education</h2>
                  {educations.map((e, i) => (
                    <div key={i} className="edu">
                      <div className="edu-qual">{e.title}</div>
                      <div className="edu-inst">{e.institution}{e.dateRange ? ` · ${e.dateRange}` : ""}</div>
                      {e.verified && <div><VerifiedMark note={e.verifiedNote} /></div>}
                    </div>
                  ))}
                </section>
              )}
              {certifications.length > 0 && (
                <section className="l-sec">
                  <h2 className="h2">Certifications</h2>
                  {certifications.map((c, i) => (
                    <div key={i} className="edu">
                      <div className="edu-qual">{c.name}</div>
                      {(c.issuer || c.year) && <div className="edu-inst">{[c.issuer, c.year].filter(Boolean).join(" · ")}</div>}
                      {c.verified && <div><VerifiedMark note={c.verifiedNote} /></div>}
                    </div>
                  ))}
                </section>
              )}
              {languages.length > 0 && (
                <section className="l-sec">
                  <h2 className="h2">Languages</h2>
                  {languages.map((l, i) => {
                    const { name, level, detail } = splitLang(l);
                    return (
                      <div key={i} className="lang">
                        <div className="lang-row">
                          <span className="lang-name">{name}</span>
                          <LevelBar lang={l} on={C.accent} off="#e3e1dc" width={54} />
                        </div>
                        {(level || detail) && <div className="lang-sub">{[level, detail].filter(Boolean).join(" · ")}</div>}
                      </div>
                    );
                  })}
                </section>
              )}
            </aside>
          )}

          {experiences.length > 0 && (
            <section className="m-sec">
              <h2 className="h2">Work History</h2>
              {experiences.map((e, i) => (
                <div key={i} className="exp">
                  <div className="exp-head">
                    <div className="exp-title">
                      {e.title}
                      {e.dateRange && <span className="dates"> — {e.dateRange}</span>}
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

          {referees.length > 0 && (
            <section className="m-sec">
              <h2 className="h2">Referees</h2>
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
      {bullets.map((b, i) => <li key={i}><span className="mk" /><span>{b}</span></li>)}
    </ul>
  );
}

const styles = (A: string, onA: string, light: boolean) => {
  const mark = light ? INK.ink : A;
  return `
/* Page 1's strip bleeds to the top edge; later pages get a top margin. */
@page { size: A4; margin: 14mm 0 14mm; }
@page :first { margin: 0 0 14mm; }
[data-band] { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { color: ${INK.body}; font-family: ${BODY}; -webkit-font-smoothing: antialiased; padding: 0 40px; }

/* ── Header ──────────────────────────────────────────────── */
.hd { display: grid; grid-template-columns: ${LEFT_W}px 1fr; gap: 0 30px; margin-bottom: 20px; }
.strip { background: ${A}; color: ${onA}; padding: 30px 18px 16px; display: flex; flex-direction: column; gap: 7px; font-size: 11px; line-height: 1.35; }
.c-item { display: flex; align-items: flex-start; gap: 9px; }
.c-item .ci { margin-top: 1px; }
.photo { display: block; width: ${LEFT_W}px; height: 190px; object-fit: cover; }
.mono { display: flex; align-items: center; justify-content: center; background: #efeeea; font-family: ${DISPLAY}; font-weight: 800; font-size: 54px; letter-spacing: 0.02em; color: ${INK.faint}; }
.hd-right { padding-top: 32px; min-width: 0; display: flex; flex-direction: column; }
.name { margin: 0; font-family: ${DISPLAY}; font-weight: 800; font-size: 38px; line-height: 1.02; letter-spacing: -0.02em; color: ${INK.ink}; }
.role { margin-top: 8px; font-size: 13px; font-weight: 500; color: ${INK.muted2}; letter-spacing: 0.02em; }
.panel { margin-top: 16px; background: #f1f0ed; padding: 14px 18px 16px; }
.summary { margin: 0; font-size: 12px; line-height: 1.6; color: ${INK.body}; }

/* Section head: heavy Archivo over a thick accent bar. */
.h2 { margin: 0 0 10px; padding-bottom: 5px; font-family: ${DISPLAY}; font-weight: 800; font-size: 17px; line-height: 1.2; color: ${INK.ink}; border-bottom: 4px solid ${A}; break-after: avoid; page-break-after: avoid; }

/* ── Body ────────────────────────────────────────────────── */
.left { float: left; width: ${LEFT_W}px; margin-right: 30px; }
.m-sec { display: flow-root; margin-bottom: 16px; }
.l-sec { margin-bottom: 16px; }
.sk { margin: 0; padding: 0; list-style: none; font-size: 11.5px; line-height: 1.35; }
.sk li { position: relative; padding-left: 13px; margin-bottom: 5px; break-inside: avoid; }
.sk li::before { content: ""; position: absolute; left: 1px; top: 5px; width: 5px; height: 5px; border-radius: 50%; background: ${mark}; }
.edu { margin-bottom: 9px; break-inside: avoid; }
.edu:last-child { margin-bottom: 0; }
.edu-qual { font-weight: 600; font-size: 12px; line-height: 1.35; color: ${INK.ink}; }
.edu-inst { font-size: 11px; line-height: 1.4; color: ${INK.muted}; margin-top: 1px; }
.lang { margin-bottom: 7px; break-inside: avoid; }
.lang-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.lang-name { font-size: 12px; font-weight: 600; color: ${INK.ink}; }
.lang-sub { font-size: 10px; line-height: 1.4; color: ${INK.muted}; margin-top: 2px; }

.exp { margin-bottom: 13px; }
.exp:last-child { margin-bottom: 0; }
.exp-title { font-weight: 600; font-size: 13px; line-height: 1.4; color: ${INK.ink}; }
.dates { font-weight: 400; color: ${INK.muted}; font-size: 12px; }
.exp-org { font-size: 12px; line-height: 1.4; }
.org { font-weight: 700; color: ${INK.ink}; }
.loc { color: ${INK.muted}; }
.bullets { margin: 5px 0 0; padding: 0; list-style: none; }
.bullets li { display: flex; gap: 10px; font-size: 11.5px; line-height: 17px; color: ${INK.body}; margin-bottom: 2px; }
.bullets li:last-child { margin-bottom: 0; }
.mk { flex: none; width: 5px; height: 5px; border-radius: 50%; background: ${mark}; margin-top: 6px; }
.single { margin: 5px 0 0; font-size: 11.5px; line-height: 17px; color: ${INK.body}; }

.refs { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px 24px; }
.refs > div { break-inside: avoid; }
.ref-name { font-weight: 600; font-size: 12px; color: ${INK.ink}; }
.ref-role { font-size: 11px; color: ${INK.muted}; line-height: 1.4; }
.ref-contact { font-size: 11px; color: ${INK.muted}; }
`;
};
