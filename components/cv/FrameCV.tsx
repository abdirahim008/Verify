import "server-only";
import type { CVData } from "@/lib/pdf/data";
import { INK, VerifiedMark, toBullets, splitLang, bandColors, pageFooterCss, EXP_BREAKS, LANG_CSS } from "./_inkShared";

// CV 8 — The Frame. A white masthead framed by the accent colour — a heavy
// bar above the name and a fine rule below — with accent section headings
// and markers. Cormorant Garamond (display) + Public Sans (body).
//
// Crest is the solid-colour-band design; Frame is its deliberately lighter,
// low-ink counterpart (the two used to be near-identical band layouts). The
// accent is only ever used for rules, markers and text on white, so the
// theme list offers dark accents only (lib/pdf/themes.ts CV_THEMES.frame).

const DISPLAY = `"Cormorant Garamond", Georgia, serif`;
const BODY = `"Public Sans", system-ui, sans-serif`;

export function FrameCV({ data, theme }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, location, email, phone, languages,
          experiences, educations, certifications, skills, referees } = data;
  const contact = [location, phone, email].filter(Boolean);
  const C = bandColors(theme?.accent ?? "#20304d");
  // Accent as text on white only when it's dark enough to read.
  const A = C.onBand === "#ffffff" ? C.accent : INK.ink;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles(C.accent, A) + EXP_BREAKS + LANG_CSS + pageFooterCss(fullName, BODY) }} />
      <div className="page">
        <header className="mast">
          <div className="mast-bar" data-band />
          <div className="mast-row">
            <div>
              <h1 className="name">{fullName}</h1>
              {headline && <div className="role">{headline}</div>}
            </div>
            {contact.length > 0 && (
              <div className="mast-contact">{contact.map((c, i) => <div key={i}>{c}</div>)}</div>
            )}
          </div>
          <div className="mast-rule" data-band />
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
                    <div className="exp-org">{[e.organization, e.location].filter(Boolean).join(" · ")}{e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}</div>
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
                  <div className="row">
                    <div className="edu-qual">{e.title}{e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}</div>
                    {e.dateRange && <div className="dates">{e.dateRange}</div>}
                  </div>
                  <div className="edu-inst">{e.institution}</div>
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
              {certifications.length > 0 && (
                <>
                  <div className="h2" style={{ marginTop: languages.length ? "20px" : "0" }}>Certifications</div>
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

// accent: the raw accent (bars, rules, markers); A: accent-or-ink for text.
const styles = (accent: string, A: string) => `
@page { size: A4; margin: 14mm 0; }
[data-band] { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { color: ${INK.body}; font-family: ${BODY}; -webkit-font-smoothing: antialiased; }

.mast { padding: 0 56px; }
.mast-bar { height: 6px; background: ${accent}; }
.mast-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 28px; padding: 22px 0 18px; }
.name { margin: 0; font-family: ${DISPLAY}; font-weight: 600; font-size: 48px; letter-spacing: 0.01em; color: ${A}; line-height: 1.0; }
.role { margin-top: 10px; font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.26em; color: ${INK.muted}; }
.mast-contact { text-align: right; font-size: 11.5px; line-height: 1.75; color: ${INK.bodySoft}; white-space: nowrap; }
.mast-rule { height: 1px; background: ${accent}; }

.body { padding: 24px 56px 8px; }
.summary { margin: 0 0 22px; font-size: 13px; line-height: 1.6; color: ${INK.body}; }
.sec { margin-bottom: 20px; }
.h2 { font-family: ${DISPLAY}; font-weight: 600; font-size: 19px; color: ${A}; border-bottom: 1px solid ${accent}; padding-bottom: 4px; margin-bottom: 13px; break-after: avoid; page-break-after: avoid; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

.exp { margin-bottom: 13px; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; }
.exp-title { font-weight: 700; font-size: 14.5px; color: ${INK.ink}; }
.dates { font-size: 11.5px; font-weight: 500; color: ${INK.faint}; letter-spacing: 0.03em; white-space: nowrap; flex: none; }
.exp-org { font-size: 12.5px; color: ${INK.muted}; margin-top: 2px; }
.bullets { margin: 8px 0 0; padding: 0; list-style: none; }
/* Whole-pixel line-height and marker so every dash renders at one weight. */
.bullets li { display: flex; gap: 10px; font-size: 13px; line-height: 20px; color: ${INK.body}; margin-bottom: 4px; }
.bullets li:last-child { margin-bottom: 0; }
.tick { flex: none; width: 8px; height: 2px; background: ${accent}; margin-top: 9px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.single { margin: 8px 0 0; font-size: 13px; line-height: 1.5; color: ${INK.body}; }

.edu { margin-bottom: 10px; break-inside: avoid; }
.edu:last-child { margin-bottom: 0; }
.edu-qual { font-weight: 700; font-size: 13.5px; color: ${INK.ink}; }
.edu-inst { font-size: 12.5px; color: ${INK.muted}; margin-top: 1px; }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; margin-bottom: 20px; break-inside: avoid; }
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
