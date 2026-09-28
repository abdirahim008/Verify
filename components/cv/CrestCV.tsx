import "server-only";
import type { CVData } from "@/lib/pdf/data";
import {
  INK, VerifiedMark, initials, toBullets, splitLang, pageFooterCss, EXP_BREAKS, LANG_CSS,
  TYPE_CSS, ContactIcon, ContactValue, contactItems,
} from "./_inkShared";

// CV 6 — The Crest. White body under an adjustable colour header band.
// Marcellus (display) + Hanken Grotesk (body). The band's on-colour text
// is derived from the accent's luminance (light text on dark bands, dark
// on light). Ported from the Claude Design handoff.

const DISPLAY = `"Marcellus", Georgia, serif`;
const BODY = `"Hanken Grotesk", system-ui, sans-serif`;

// The band's curated accent options live in lib/pdf/themes.ts (CV_THEMES.crest).
function bandColors(accent: string) {
  const hex = (accent || "#20304d").replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const dark = lum < 0.6;
  return {
    accent: accent || "#20304d",
    onBand: dark ? "#ffffff" : "#1a1a1a",
    onBandMuted: dark ? "rgba(255,255,255,0.70)" : "#5a544c",
    bandLine: dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.18)",
  };
}

export function CrestCV({ data, theme }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, photoUrl, languages,
          experiences, educations, certifications, skills, referees } = data;
  const contact = contactItems(data);
  const C = bandColors(theme?.accent ?? "#20304d");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles(C) + TYPE_CSS + EXP_BREAKS + LANG_CSS + pageFooterCss(fullName, BODY) }} />
      <div className="page">
        <header className="band" data-band>
          <div className="band-top">
            <div>
              <h1 className="name">{fullName}</h1>
              {headline && <div className="role">{headline}</div>}
            </div>
            {photoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={photoUrl} alt="" className="band-photo" />
              : <div className="band-mono">{initials(fullName)}</div>}
          </div>
          <div className="band-rule" />
          {contact.length > 0 && (
            <div className="band-contact">
              {contact.map((c, i) => (
                <span key={i} className="c-item"><ContactIcon kind={c.kind} size={10} /><ContactValue {...c} /></span>
              ))}
            </div>
          )}
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
                    <div className="exp-org">
                      <span className="org">{e.organization}</span>
                      {e.location && <span className="loc">{e.organization ? "  ·  " : ""}{e.location}</span>}
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
              <div className="h2">Education</div>
              {educations.map((e, i) => (
                <div key={i} className="edu-row">
                  <div>
                    <div className="edu-qual">{e.title}</div>
                    <div className="edu-inst">{e.institution}{e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}</div>
                  </div>
                  {e.dateRange && <div className="dates">{e.dateRange}</div>}
                </div>
              ))}
            </section>
          )}

          {(skills.length > 0 || languages.length > 0 || certifications.length > 0) && (
            <div className="grid">
              <section>
                {skills.length > 0 && (
                  <>
                    <div className="h2">Skills</div>
                    <div className="chips">{skills.map((s, i) => <span key={i} className="chip">{s}</span>)}</div>
                  </>
                )}
                {certifications.length > 0 && (
                  <>
                    <div className="h2" style={{ marginTop: skills.length ? "16px" : "0" }}>Certifications</div>
                    <div className="certs">
                      {certifications.map((c, i) => (
                        <div key={i}>
                          <span style={{ color: INK.ink, fontWeight: 600 }}>{c.name}</span>
                          {(c.issuer || c.year) && <span className="faint"> · {[c.issuer, c.year].filter(Boolean).join(" · ")}</span>}
                          {c.verified && <>&nbsp;&nbsp;<VerifiedMark note="" /></>}
                        </div>
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
          )}

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

const styles = (C: ReturnType<typeof bandColors>) => {
  // On white, a light accent (Sand) would vanish; section marks fall back to ink.
  const mark = C.onBand === "#ffffff" ? C.accent : INK.ink;
  return `
/* The colour band must bleed to the very top + sides on page 1, but every
   page still needs a bottom (and, on continuation pages, top) text margin so
   nothing runs to the sheet edge. @page:first zeroes only page 1's top/side
   margins (band full-bleed) while keeping its foot; later pages get top +
   bottom. Horizontal stays 0 — the body's own padding insets the text, and
   the band reaches the side edges. */
@page { size: A4; margin: 15mm 0 14mm; }
@page :first { margin: 0 0 14mm; }
[data-band] { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { color: ${INK.body}; font-family: ${BODY}; -webkit-font-smoothing: antialiased; display: flex; flex-direction: column; }

.band { background: ${C.accent}; padding: 26px 54px 14px; }
.band-top { display: flex; justify-content: space-between; align-items: center; gap: 30px; }
.name { margin: 0; font-family: ${DISPLAY}; font-weight: 400; font-size: 40px; letter-spacing: 0.02em; color: ${C.onBand}; line-height: 1.08; }
.role { margin-top: 9px; font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.24em; color: ${C.onBandMuted}; line-height: 1.5; }
.band-mono { width: 84px; height: 84px; flex: none; border-radius: 50%; border: 1px solid ${C.bandLine}; display: flex; align-items: center; justify-content: center; font-family: ${DISPLAY}; font-size: 27px; letter-spacing: 0.06em; color: ${C.onBand}; }
.band-photo { width: 84px; height: 84px; flex: none; border-radius: 50%; object-fit: cover; border: 2px solid ${C.bandLine}; display: block; }
.band-rule { height: 1px; background: ${C.bandLine}; margin: 12px 0 9px; }
.band-contact { display: flex; flex-wrap: wrap; gap: 4px 26px; font-size: 11.5px; color: ${C.onBandMuted}; letter-spacing: 0.02em; }
.c-item { display: inline-flex; align-items: center; gap: 6px; }

.body { padding: 16px 54px 0; flex: 1; }
.summary { margin: 0 0 13px; font-size: 13px; line-height: 1.55; color: ${INK.body}; }
.sec { margin-bottom: 12px; }
/* Section head: small accent square + tracked caps over a hairline. */
.h2 { display: flex; align-items: center; gap: 9px; font-weight: 700; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.2em; color: ${INK.ink}; border-bottom: 1px solid ${INK.hair}; padding-bottom: 6px; margin-bottom: 9px; break-after: avoid; page-break-after: avoid; }
.h2::before { content: ""; width: 7px; height: 7px; background: ${mark}; flex: none; }
.refs > div, .lang, .certs > div { break-inside: avoid; }

.exp { margin-bottom: 10px; }
.exp:last-child { margin-bottom: 0; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; }
.exp-title { font-weight: 700; font-size: 14px; color: ${INK.ink}; }
.dates { font-size: 11.5px; font-weight: 500; color: ${INK.muted}; letter-spacing: 0.02em; white-space: nowrap; flex: none; }
.exp-org { font-size: 12.5px; margin-top: 1px; }
.org { font-weight: 600; color: ${mark}; }
.loc { color: ${INK.muted}; }
.bullets { margin: 6px 0 0; padding: 0; list-style: none; }
/* Whole-pixel line-height and marker so every dash renders at one weight
   (1.5 × 13px lines put each dash on a different sub-pixel). */
.bullets li { display: flex; gap: 10px; font-size: 12.5px; line-height: 18px; color: ${INK.body}; margin-bottom: 2px; }
.bullets li:last-child { margin-bottom: 0; }
.tick { flex: none; width: 6px; height: 2px; background: ${INK.faint}; margin-top: 8px; }
.single { margin: 6px 0 0; font-size: 12.5px; line-height: 18px; color: ${INK.body}; }

.edu-row { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; margin-bottom: 6px; break-inside: avoid; }
.edu-row:last-child { margin-bottom: 0; }
.edu-qual { font-weight: 700; font-size: 13px; color: ${INK.ink}; }
.edu-inst { font-size: 12.5px; color: ${INK.muted}; }

/* Short sections sit two-up but may split across a page (no break-avoid on
   the grid), so they never shove a whole block overleaf. */
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 36px; margin-bottom: 12px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { font-size: 11.5px; line-height: 1; padding: 4px 8px; border: 1px solid ${INK.hair}; border-radius: 3px; color: ${INK.bodySoft}; background: #faf9f7; }
.langs { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; }
.lang { display: flex; justify-content: space-between; gap: 8px; }
.faint { color: ${INK.muted}; }
.certs { display: flex; flex-direction: column; gap: 6px; font-size: 12px; line-height: 1.45; }

.refs { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px 30px; }
.ref-name { font-weight: 700; font-size: 12.5px; color: ${INK.ink}; }
.ref-role { font-size: 12px; color: ${INK.muted}; }
.ref-contact { font-size: 11.5px; color: ${INK.muted}; margin-top: 1px; }
`;
};
