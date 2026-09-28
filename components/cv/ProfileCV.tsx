import "server-only";
import type { CVData } from "@/lib/pdf/data";
import {
  INK, VerifiedMark, initials, toBullets, splitLang, EXP_BREAKS,
  TYPE_CSS, ContactIcon, ContactValue, contactItems, LevelBar,
} from "./_inkShared";

// CV 2 — The Profile. A full-height colour sidebar (photo, contact, skills,
// languages with level bars, certifications) beside a white main column.
// Space Grotesk (display) + Hanken Grotesk (body). One adjustable accent
// (lib/pdf/themes.ts) fills the sidebar and colours the main section heads.
//
// Print mechanics: the page has no margin so the sidebar colour can bleed to
// every sheet edge. The colour itself is a position:fixed stripe, which
// Chromium repeats on every printed page, so continuation pages keep the
// column. The content sits in a table whose empty <thead>/<tfoot> rows
// repeat on every page too — that's what gives each page its top and bottom
// margin while the stripe still runs edge to edge.

const DISPLAY = `"Space Grotesk", system-ui, sans-serif`;
const BODY = `"Hanken Grotesk", system-ui, sans-serif`;
const SB_W = 248;

export function ProfileCV({ data, theme }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, photoUrl, languages,
          experiences, educations, certifications, skills, referees } = data;
  const contact = contactItems(data);
  const A = theme?.accent ?? "#2e3b4a";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles(A) + TYPE_CSS + EXP_BREAKS }} />
      <div className="stripe" data-band />
      <table className="frame">
        <thead><tr><td><div className="sp-top" /></td></tr></thead>
        <tfoot><tr><td><div className="sp-bot" /></td></tr></tfoot>
        <tbody><tr><td>
          <div className="cols">
            <aside className="sb">
              {photoUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={photoUrl} alt="" className="sb-photo" />
                : <div className="sb-mono">{initials(fullName)}</div>}

              {contact.length > 0 && (
                <div className="sb-sec">
                  <div className="sb-h">Contact</div>
                  <div className="sb-contact">
                    {contact.map((c, i) => (
                      <div key={i} className="sb-c">
                        <span className="sb-ic"><ContactIcon kind={c.kind} size={9} color="#fff" /></span>
                        <ContactValue {...c} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {skills.length > 0 && (
                <div className="sb-sec">
                  <div className="sb-h">Skills</div>
                  <ul className="sb-list">{skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
              )}

              {languages.length > 0 && (
                <div className="sb-sec">
                  <div className="sb-h">Languages</div>
                  <div className="sb-langs">
                    {languages.map((l, i) => {
                      const { name, level, detail } = splitLang(l);
                      return (
                        <div key={i} className="sb-lang">
                          <div className="sb-lang-row">
                            <span className="sb-lang-name">{name}</span>
                            <LevelBar lang={l} on="rgba(255,255,255,0.92)" off="rgba(255,255,255,0.22)" width={58} />
                          </div>
                          {(level || detail) && <div className="sb-lang-sub">{[level, detail].filter(Boolean).join(" · ")}</div>}
                        </div>
                      );
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
                        <div className="sb-cert-name">{c.name}</div>
                        {(c.issuer || c.year) && <div className="sb-cert-meta">{[c.issuer, c.year].filter(Boolean).join(" · ")}</div>}
                        {c.verified && <div className="sb-verified"><VerifiedMark note="" size={8} /></div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            <main className="mn">
              <header className="mast">
                <h1 className="name">{fullName}</h1>
                {headline && <div className="role">{headline}</div>}
              </header>

              {summary && (
                <section className="mn-sec">
                  <h2 className="mn-h"><span>Profile</span></h2>
                  <p className="summary">{summary}</p>
                </section>
              )}

              {experiences.length > 0 && (
                <section className="mn-sec">
                  <h2 className="mn-h"><span>Experience</span></h2>
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
                <section className="mn-sec">
                  <h2 className="mn-h"><span>Education</span></h2>
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

              {referees.length > 0 && (
                <section className="mn-sec">
                  <h2 className="mn-h"><span>Referees</span></h2>
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
      {bullets.map((b, i) => <li key={i}><span className="dot" /><span>{b}</span></li>)}
    </ul>
  );
}

const styles = (A: string) => `
@page { size: A4; margin: 0; }
[data-band] { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { color: ${INK.body}; font-family: ${BODY}; -webkit-font-smoothing: antialiased; }
.stripe { position: fixed; top: 0; bottom: 0; left: 0; width: ${SB_W}px; background: ${A}; }

.frame { width: 100%; border-collapse: collapse; position: relative; }
.frame > thead > tr > td, .frame > tfoot > tr > td, .frame > tbody > tr > td { padding: 0; }
.sp-top { height: 13mm; }
.sp-bot { height: 12mm; }
.cols { display: grid; grid-template-columns: ${SB_W}px 1fr; }

/* ── Sidebar ─────────────────────────────────────────────── */
.sb { padding: 0 26px 0 28px; color: rgba(255,255,255,0.86); }
.sb-photo, .sb-mono { width: 132px; height: 132px; border-radius: 50%; display: block; margin: 0 auto 22px; box-shadow: 0 0 0 4px rgba(255,255,255,0.14); }
.sb-photo { object-fit: cover; }
.sb-mono { display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); font-family: ${DISPLAY}; font-weight: 600; font-size: 40px; letter-spacing: 0.04em; color: #fff; }
.sb-sec { margin-bottom: 20px; break-inside: avoid; }
.sb-h { font-family: ${DISPLAY}; font-weight: 700; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #fff; padding-bottom: 7px; margin-bottom: 11px; border-bottom: 1px solid rgba(255,255,255,0.24); }
.sb-contact { display: flex; flex-direction: column; gap: 8px; font-size: 11.5px; line-height: 1.35; }
.sb-c { display: flex; align-items: flex-start; gap: 9px; }
.sb-ic { flex: none; width: 19px; height: 19px; border-radius: 50%; background: rgba(255,255,255,0.14); display: inline-flex; align-items: center; justify-content: center; margin-top: -2px; }
.sb-list { margin: 0; padding: 0; list-style: none; font-size: 11.5px; line-height: 1.35; }
.sb-list li { position: relative; padding-left: 12px; margin-bottom: 5px; }
.sb-list li::before { content: ""; position: absolute; left: 0; top: 6px; width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.6); }
.sb-langs { display: flex; flex-direction: column; gap: 8px; }
.sb-lang-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.sb-lang-name { font-size: 12px; font-weight: 600; color: #fff; }
.sb-lang-sub { font-size: 10px; line-height: 1.4; color: rgba(255,255,255,0.62); margin-top: 2px; }
.sb-certs { display: flex; flex-direction: column; gap: 8px; }
.sb-cert-name { font-size: 11.5px; font-weight: 600; color: #fff; line-height: 1.35; }
.sb-cert-meta { font-size: 10.5px; color: rgba(255,255,255,0.62); margin-top: 1px; }
.sb-verified { margin-top: 3px; display: inline-block; background: #fff; border-radius: 3px; padding: 1px 5px; }

/* ── Main ────────────────────────────────────────────────── */
.mn { padding: 0 40px 0 34px; min-width: 0; }
.mast { padding: 18px 0 16px; margin-bottom: 16px; border-bottom: 3px solid ${A}; }
.name { margin: 0; font-family: ${DISPLAY}; font-weight: 700; font-size: 36px; line-height: 1.05; letter-spacing: -0.01em; color: ${INK.ink}; }
.role { margin-top: 8px; font-size: 12px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: ${A}; line-height: 1.5; }

.mn-sec { margin-bottom: 15px; }
/* Section head: tracked caps followed by a hairline running to the edge. */
.mn-h { display: flex; align-items: center; gap: 12px; margin: 0 0 10px; font-family: ${DISPLAY}; font-weight: 700; font-size: 13px; letter-spacing: 0.16em; text-transform: uppercase; color: ${A}; break-after: avoid; page-break-after: avoid; }
.mn-h::after { content: ""; flex: 1; height: 1px; background: ${INK.hair}; }
.summary { margin: 0; font-size: 12.5px; line-height: 1.6; color: ${INK.body}; }

.exp { margin-bottom: 12px; }
.exp:last-child { margin-bottom: 0; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.exp-title { font-weight: 700; font-size: 13.5px; color: ${INK.ink}; }
.dates { font-size: 11px; font-weight: 600; color: ${INK.muted}; white-space: nowrap; flex: none; }
.exp-org { font-size: 12px; margin-top: 1px; }
.org { font-weight: 600; color: ${A}; }
.loc { color: ${INK.muted}; }
.bullets { margin: 5px 0 0; padding: 0; list-style: none; }
.bullets li { display: flex; gap: 9px; font-size: 12px; line-height: 18px; color: ${INK.body}; margin-bottom: 2px; }
.bullets li:last-child { margin-bottom: 0; }
.dot { flex: none; width: 4px; height: 4px; border-radius: 50%; background: ${A}; margin-top: 7px; }
.single { margin: 5px 0 0; font-size: 12px; line-height: 18px; color: ${INK.body}; }

.edu-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 8px; break-inside: avoid; }
.edu-row:last-child { margin-bottom: 0; }
.edu-qual { font-weight: 700; font-size: 13px; color: ${INK.ink}; }
.edu-inst { font-size: 12px; color: ${INK.muted}; }

.refs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }
.refs > div { break-inside: avoid; }
.ref-name { font-weight: 700; font-size: 12.5px; color: ${INK.ink}; }
.ref-role { font-size: 11.5px; color: ${INK.muted}; line-height: 1.4; }
.ref-contact { font-size: 11px; color: ${INK.muted}; }
`;
