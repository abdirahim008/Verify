import "server-only";
import type { CVData } from "@/lib/pdf/data";
import {
  INK, VerifiedMark, initials, toBullets, splitLang, EXP_BREAKS,
  TYPE_CSS, ContactIcon, ContactValue, contactItems, LevelBar,
} from "./_inkShared";

// CV 3 — The Editorial. A full-width colour header band (name, headline,
// contact, round photo) over two columns: a soft grey sidebar (profile,
// skills, languages, certifications) and a white main column (experience,
// education, referees). Spectral (display) + Public Sans (body). One
// adjustable accent (lib/pdf/themes.ts) fills the band and marks the heads.
//
// Print mechanics match The Profile: zero page margin so colour bleeds to
// the sheet edge, a position:fixed grey stripe that Chromium repeats on
// every page, and a table whose empty <thead>/<tfoot> rows repeat to give
// each page its top and bottom margin. The band sits above the table, so it
// only appears on page 1.

const DISPLAY = `"Spectral", Georgia, serif`;
const BODY = `"Public Sans", system-ui, sans-serif`;
const SB_W = 232;
const SB_BG = "#f0efec";

export function EditorialCV({ data, theme }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, photoUrl, languages,
          experiences, educations, certifications, skills, referees } = data;
  const contact = contactItems(data);
  const A = theme?.accent ?? "#2a4a39";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles(A) + TYPE_CSS + EXP_BREAKS }} />
      <div className="stripe" data-band />

      <header className="band" data-band>
        <div className="band-text">
          <h1 className="name">{fullName}</h1>
          {headline && <div className="role">{headline}</div>}
          {contact.length > 0 && (
            <div className="contact">
              {contact.map((c, i) => (
                <span key={i} className="c-item"><ContactIcon kind={c.kind} size={10} /><ContactValue {...c} /></span>
              ))}
            </div>
          )}
        </div>
        {photoUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={photoUrl} alt="" className="photo" />
          : <div className="photo mono">{initials(fullName)}</div>}
      </header>

      <table className="frame">
        <thead><tr><td><div className="sp-top" /></td></tr></thead>
        <tfoot><tr><td><div className="sp-bot" /></td></tr></tfoot>
        <tbody><tr><td>
          <div className="cols">
            <aside className="sb">
              {summary && (
                <section className="sb-sec">
                  <h2 className="h2">Profile</h2>
                  <p className="summary">{summary}</p>
                </section>
              )}

              {skills.length > 0 && (
                <section className="sb-sec">
                  <h2 className="h2">Skills</h2>
                  <ul className="sk">{skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </section>
              )}

              {languages.length > 0 && (
                <section className="sb-sec">
                  <h2 className="h2">Languages</h2>
                  <div className="langs">
                    {languages.map((l, i) => {
                      const { name, level, detail } = splitLang(l);
                      return (
                        <div key={i} className="lang">
                          <div className="lang-row">
                            <span className="lang-name">{name}</span>
                            <LevelBar lang={l} on={A} off="#d6d3cd" width={56} />
                          </div>
                          {(level || detail) && <div className="lang-sub">{[level, detail].filter(Boolean).join(" · ")}</div>}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {certifications.length > 0 && (
                <section className="sb-sec">
                  <h2 className="h2">Certifications</h2>
                  <div className="certs">
                    {certifications.map((c, i) => (
                      <div key={i}>
                        <div className="cert-name">{c.name}{c.verified && <>&nbsp;<VerifiedMark note="" size={8} /></>}</div>
                        {(c.issuer || c.year) && <div className="cert-meta">{[c.issuer, c.year].filter(Boolean).join(" · ")}</div>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>

            <main className="mn">
              {experiences.length > 0 && (
                <section className="mn-sec">
                  <h2 className="h2">Work Experience</h2>
                  {experiences.map((e, i) => (
                    <div key={i} className="exp">
                      <div className="exp-head">
                        <div className="exp-title">{e.title}</div>
                        <div className="exp-meta">
                          <span className="org">{e.organization}</span>
                          {e.location && <span className="loc">{e.organization ? ", " : ""}{e.location}</span>}
                          {e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}
                        </div>
                        {e.dateRange && <div className="dates">{e.dateRange}</div>}
                      </div>
                      <Bullets text={e.description} />
                    </div>
                  ))}
                </section>
              )}

              {educations.length > 0 && (
                <section className="mn-sec">
                  <h2 className="h2">Education</h2>
                  {educations.map((e, i) => (
                    <div key={i} className="edu">
                      <div className="edu-qual">{e.title}</div>
                      <div className="exp-meta">
                        <span className="org">{e.institution}</span>
                        {e.verified && <>&nbsp;&nbsp;<VerifiedMark note={e.verifiedNote} /></>}
                      </div>
                      {e.dateRange && <div className="dates">{e.dateRange}</div>}
                    </div>
                  ))}
                </section>
              )}

              {referees.length > 0 && (
                <section className="mn-sec">
                  <h2 className="h2">Referees</h2>
                  <div className="refs">
                    {referees.map((r, i) => (
                      <div key={i}>
                        <div className="ref-name">{r.name}</div>
                        {(r.position || r.organization) && <div className="ref-role">{[r.position, r.organization].filter(Boolean).join(", ")}</div>}
                        {r.email && <div className="ref-contact">{r.email}</div>}
                        {r.phone && <div className="ref-contact">{r.phone}</div>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </main>
          </div>
        </td></tr></tbody>
      </table>
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

const styles = (A: string) => `
@page { size: A4; margin: 0; }
[data-band] { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { color: ${INK.body}; font-family: ${BODY}; -webkit-font-smoothing: antialiased; }
.stripe { position: fixed; top: 0; bottom: 0; left: 0; width: ${SB_W}px; background: ${SB_BG}; }

/* ── Band (page 1 only) ──────────────────────────────────── */
.band { position: relative; background: ${A}; color: #fff; display: flex; align-items: center; justify-content: space-between; gap: 28px; padding: 30px 44px 28px 36px; }
.band-text { min-width: 0; }
.name { margin: 0; font-family: ${DISPLAY}; font-weight: 500; font-size: 38px; line-height: 1.08; letter-spacing: 0.005em; color: #fff; }
.role { margin-top: 6px; font-size: 13px; font-weight: 500; letter-spacing: 0.04em; color: rgba(255,255,255,0.82); line-height: 1.45; }
.contact { display: flex; flex-wrap: wrap; gap: 4px 22px; margin-top: 14px; padding-top: 11px; border-top: 1px solid rgba(255,255,255,0.28); font-size: 11.5px; color: rgba(255,255,255,0.86); }
.c-item { display: inline-flex; align-items: center; gap: 6px; }
.photo { flex: none; width: 118px; height: 118px; border-radius: 50%; object-fit: cover; border: 4px solid #fff; display: block; }
.mono { display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.12); font-family: ${DISPLAY}; font-size: 36px; color: #fff; border-color: rgba(255,255,255,0.7); }

/* ── Frame ───────────────────────────────────────────────── */
.frame { width: 100%; border-collapse: collapse; position: relative; }
.frame > thead > tr > td, .frame > tfoot > tr > td, .frame > tbody > tr > td { padding: 0; }
.sp-top { height: 10mm; }
.sp-bot { height: 11mm; }
.cols { display: grid; grid-template-columns: ${SB_W}px 1fr; }

.h2 { margin: 0 0 9px; padding-bottom: 5px; border-bottom: 1px solid ${INK.hair}; font-family: ${DISPLAY}; font-weight: 600; font-size: 18px; line-height: 1.2; color: ${INK.ink}; position: relative; break-after: avoid; page-break-after: avoid; }
/* Short accent bar under the head, sitting on the hairline. */
.h2::after { content: ""; position: absolute; left: 0; bottom: -1px; width: 34px; height: 2px; background: ${A}; }

/* ── Sidebar ─────────────────────────────────────────────── */
.sb { padding: 0 22px 0 30px; }
.sb-sec { margin-bottom: 18px; }
.summary { margin: 0; font-size: 11.5px; line-height: 1.6; color: ${INK.body}; }
.sk { margin: 0; padding: 0; list-style: none; font-size: 11.5px; line-height: 1.35; color: ${INK.body}; }
.sk li { position: relative; padding-left: 12px; margin-bottom: 5px; break-inside: avoid; }
.sk li::before { content: ""; position: absolute; left: 0; top: 5.5px; width: 5px; height: 5px; background: ${A}; }
.langs { display: flex; flex-direction: column; gap: 8px; }
.lang { break-inside: avoid; }
.lang-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.lang-name { font-size: 12px; font-weight: 600; color: ${INK.ink}; }
.lang-sub { font-size: 10px; line-height: 1.4; color: ${INK.muted}; margin-top: 2px; }
.certs { display: flex; flex-direction: column; gap: 8px; }
.certs > div { break-inside: avoid; }
.cert-name { font-size: 11.5px; font-weight: 600; color: ${INK.ink}; line-height: 1.35; }
.cert-meta { font-size: 10.5px; color: ${INK.muted}; margin-top: 1px; }

/* ── Main ────────────────────────────────────────────────── */
.mn { padding: 0 44px 0 30px; min-width: 0; }
.mn-sec { margin-bottom: 16px; }
.exp { margin-bottom: 12px; }
.exp:last-child { margin-bottom: 0; }
.exp-title, .edu-qual { font-weight: 700; font-size: 13px; color: ${INK.ink}; line-height: 1.35; }
.exp-meta { font-size: 12px; line-height: 1.4; }
.org { font-weight: 600; color: ${A}; }
.loc { color: ${INK.muted}; }
.dates { font-size: 11px; color: ${INK.muted}; margin-top: 1px; letter-spacing: 0.02em; }
.bullets { margin: 5px 0 0; padding: 0; list-style: none; }
.bullets li { display: flex; gap: 9px; font-size: 11.5px; line-height: 17px; color: ${INK.body}; margin-bottom: 2px; }
.bullets li:last-child { margin-bottom: 0; }
.mk { flex: none; width: 4px; height: 4px; border-radius: 50%; background: ${INK.faint}; margin-top: 7px; }
.single { margin: 5px 0 0; font-size: 11.5px; line-height: 17px; color: ${INK.body}; }
.edu { margin-bottom: 9px; break-inside: avoid; }
.edu:last-child { margin-bottom: 0; }

.refs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 22px; }
.refs > div { break-inside: avoid; }
.ref-name { font-weight: 700; font-size: 12px; color: ${INK.ink}; }
.ref-role { font-size: 11px; color: ${INK.muted}; line-height: 1.4; }
.ref-contact { font-size: 11px; color: ${INK.muted}; }
`;
