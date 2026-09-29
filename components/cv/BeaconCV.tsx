import "server-only";
import type { ReactNode } from "react";
import type { CVData } from "@/lib/pdf/data";
import {
  INK, VerifiedMark, initials, toBullets, splitLang, EXP_BREAKS,
  TYPE_CSS, ContactIcon, ContactValue, contactItems, LevelBar,
} from "./_inkShared";

// CV 9 — The Beacon. Charcoal full-height sidebar with one bright accent
// (amber by default): corner triangles, icon section heads, a round photo
// ringed in the accent. The main column runs on a vertical rail: each
// section's icon sits on the rail and every role is a dot on it, so the
// career reads as a timeline. Montserrat (display) + Source Sans 3 (body).
//
// Sidebar: contact, education, languages (level bars), certifications.
// Main: profile, experience, skills, referees.
//
// Print mechanics match The Profile: zero page margin so the sidebar bleeds
// to the sheet edge; the charcoal is a position:fixed stripe that Chromium
// repeats on every page; an empty repeating <thead>/<tfoot> gives each page
// its top and bottom margin. The bottom-right triangle is fixed too (every
// page); the top-left one is absolute, so page 1 only.

const DISPLAY = `"Montserrat", system-ui, sans-serif`;
const BODY = `"Source Sans 3", system-ui, sans-serif`;
const SB_W = 244;
const CHARCOAL = "#2a2c30";

type IconKind = "profile" | "work" | "education" | "award" | "language" | "skills" | "contact" | "people";

export function BeaconCV({ data, theme }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, photoUrl, languages,
          experiences, educations, certifications, skills, referees } = data;
  const contact = contactItems(data);
  const A = theme?.accent ?? "#f5b301";
  // The accent as text on white (the surname, org names) is a deeper shade
  // of it: bright amber on white is too pale to read at body sizes.
  const AT = shade(A, 0.3);
  const words = fullName.trim().split(/\s+/);
  const last = words.length > 1 ? words.pop()! : "";
  const first = words.join(" ");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles(A, AT) + TYPE_CSS + EXP_BREAKS }} />
      <div className="stripe" data-band />
      <div className="tri-tl" data-band />
      <div className="tri-br" data-band />

      <table className="frame">
        <thead><tr><td><div className="sp-top" /></td></tr></thead>
        <tfoot><tr><td><div className="sp-bot" /></td></tr></tfoot>
        <tbody><tr><td>
          <div className="cols">
            <aside className="sb">
              {photoUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={photoUrl} alt="" className="photo" />
                : <div className="photo mono">{initials(fullName)}</div>}

              {contact.length > 0 && (
                <SbSection icon="contact" title="Contact">
                  <div className="sb-contact">
                    {contact.map((c, i) => (
                      <div key={i} className="sb-c">
                        <span className="sb-ic"><ContactIcon kind={c.kind} size={9} color={CHARCOAL} /></span>
                        <ContactValue {...c} />
                      </div>
                    ))}
                  </div>
                </SbSection>
              )}

              {educations.length > 0 && (
                <SbSection icon="education" title="Education">
                  {educations.map((e, i) => (
                    <div key={i} className="sb-item">
                      <div className="sb-strong">{e.institution}</div>
                      <div className="sb-sub">{e.title}</div>
                      {e.dateRange && <div className="sb-date">{e.dateRange}</div>}
                      {e.verified && <div className="sb-verified"><VerifiedMark note={e.verifiedNote} size={8} /></div>}
                    </div>
                  ))}
                </SbSection>
              )}

              {languages.length > 0 && (
                <SbSection icon="language" title="Languages">
                  {languages.map((l, i) => {
                    const { name, level, detail } = splitLang(l);
                    return (
                      <div key={i} className="sb-item">
                        <div className="sb-lang-row">
                          <span className="sb-strong">{name}</span>
                          <LevelBar lang={l} on={A} off="rgba(255,255,255,0.18)" width={60} />
                        </div>
                        {(level || detail) && <div className="sb-sub">{[level, detail].filter(Boolean).join(" · ")}</div>}
                      </div>
                    );
                  })}
                </SbSection>
              )}

              {certifications.length > 0 && (
                <SbSection icon="award" title="Certifications">
                  {certifications.map((c, i) => (
                    <div key={i} className="sb-item">
                      <div className="sb-strong">{c.name}</div>
                      {(c.issuer || c.year) && <div className="sb-sub">{[c.issuer, c.year].filter(Boolean).join(" · ")}</div>}
                      {c.verified && <div className="sb-verified"><VerifiedMark note={c.verifiedNote} size={8} /></div>}
                    </div>
                  ))}
                </SbSection>
              )}
            </aside>

            <main className="mn">
              <header className="mast">
                <h1 className="name">{first}{last && <> <span className="last">{last}</span></>}</h1>
                {headline && <div className="role">{headline}</div>}
              </header>

              <div className="rail">
                {summary && (
                  <MnSection icon="profile" title="Profile">
                    <p className="summary">{summary}</p>
                  </MnSection>
                )}

                {experiences.length > 0 && (
                  <MnSection icon="work" title="Experience">
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
                  </MnSection>
                )}

                {skills.length > 0 && (
                  <MnSection icon="skills" title="Skills">
                    <ul className="skills">{skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </MnSection>
                )}

                {referees.length > 0 && (
                  <MnSection icon="people" title="Referees">
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
                  </MnSection>
                )}
              </div>
            </main>
          </div>
        </td></tr></tbody>
      </table>
    </>
  );
}

function SbSection({ icon, title, children }: { icon: IconKind; title: string; children: ReactNode }) {
  return (
    <section className="sb-sec">
      <h2 className="sb-h"><span className="h-ic"><SectionIcon kind={icon} /></span>{title}</h2>
      {children}
    </section>
  );
}

function MnSection({ icon, title, children }: { icon: IconKind; title: string; children: ReactNode }) {
  return (
    <section className="mn-sec">
      <h2 className="mn-h"><span className="h-ic rail-ic"><SectionIcon kind={icon} /></span>{title}</h2>
      {children}
    </section>
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

/** 12px line glyphs for the section heads, drawn in charcoal on the accent. */
function SectionIcon({ kind }: { kind: IconKind }) {
  const p = { fill: "none", stroke: CHARCOAL, strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
      {kind === "profile" && <><circle cx="6" cy="4" r="2.2" {...p} /><path d="M2 10.5c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" {...p} /></>}
      {kind === "work" && <><rect x="1.5" y="4" width="9" height="6" rx="1" {...p} /><path d="M4.5 4V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1M1.5 6.8h9" {...p} /></>}
      {kind === "education" && <><path d="M1 5l5-2.5L11 5 6 7.5z" {...p} /><path d="M3 6.2v2.3c0 .8 1.4 1.5 3 1.5s3-.7 3-1.5V6.2" {...p} /></>}
      {kind === "award" && <><circle cx="6" cy="4.5" r="2.8" {...p} /><path d="M4.3 6.8l-.8 3.7L6 9.3l2.5 1.2-.8-3.7" {...p} /></>}
      {kind === "language" && <path d="M2 2.5h8a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5.2L2.8 10.5V8.5H2a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z" {...p} />}
      {kind === "skills" && <path d="M1.8 3.4l1 1 1.8-1.8M6.4 3.6h3.8M1.8 7.4l1 1 1.8-1.8M6.4 7.6h3.8" {...p} />}
      {kind === "contact" && <><rect x="1.2" y="2.5" width="9.6" height="7" rx="1" {...p} /><circle cx="4.2" cy="5.4" r="1.1" {...p} /><path d="M2.8 8c.3-.7.8-1 1.4-1s1.1.3 1.4 1M7 5h2.2M7 6.8h2.2" {...p} /></>}
      {kind === "people" && <><circle cx="4.3" cy="4.2" r="1.6" {...p} /><circle cx="8.4" cy="4.6" r="1.3" {...p} /><path d="M1.5 10c0-1.7 1.2-2.8 2.8-2.8S7.1 8.3 7.1 10M7.9 7.4c1.4 0 2.6.9 2.6 2.6" {...p} /></>}
    </svg>
  );
}

/** Mix a hex colour toward black by `amt` (0–1). */
function shade(hex: string, amt: number): string {
  const h = hex.replace("#", "");
  const c = [0, 2, 4].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * (1 - amt)));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

const RAIL = 24;   // gap between the rail line and the main text
const IC = 20;     // section-head icon diameter

const styles = (A: string, AT: string) => `
@page { size: A4; margin: 0; }
[data-band] { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { color: ${INK.body}; font-family: ${BODY}; -webkit-font-smoothing: antialiased; }
.stripe { position: fixed; top: 0; bottom: 0; left: 0; width: ${SB_W}px; background: ${CHARCOAL}; }
/* Corner accents: top-left over the sidebar (page 1), bottom-right on
   every page, kept inside the repeating bottom spacer so text never meets it. */
.tri-tl { position: absolute; top: 0; left: 0; width: 0; height: 0; border-style: solid; border-width: 64px 64px 0 0; border-color: ${A} transparent transparent transparent; }
.tri-br { position: fixed; bottom: 0; right: 0; width: 0; height: 0; border-style: solid; border-width: 0 0 40px 40px; border-color: transparent transparent ${A} transparent; }

.frame { width: 100%; border-collapse: collapse; position: relative; }
.frame > thead > tr > td, .frame > tfoot > tr > td, .frame > tbody > tr > td { padding: 0; }
.sp-top { height: 13mm; }
.sp-bot { height: 13mm; }
.cols { display: grid; grid-template-columns: ${SB_W}px 1fr; }

.h-ic { flex: none; width: ${IC}px; height: ${IC}px; border-radius: 50%; background: ${A}; display: inline-flex; align-items: center; justify-content: center; }

/* ── Sidebar ─────────────────────────────────────────────── */
.sb { padding: 0 24px 0 28px; color: rgba(255,255,255,0.82); font-size: 11.5px; line-height: 1.4; }
.photo { width: 128px; height: 128px; border-radius: 50%; object-fit: cover; display: block; margin: 6px auto 26px; box-shadow: 0 0 0 4px ${CHARCOAL}, 0 0 0 7px ${A}; }
.mono { display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); font-family: ${DISPLAY}; font-weight: 700; font-size: 38px; letter-spacing: 0.04em; color: #fff; }
.sb-sec { margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px dashed rgba(255,255,255,0.22); }
.sb-sec:last-child { border-bottom: none; }
.sb-h { display: flex; align-items: center; gap: 10px; margin: 0 0 11px; font-family: ${DISPLAY}; font-weight: 700; font-size: 11.5px; letter-spacing: 0.14em; text-transform: uppercase; color: #fff; break-after: avoid; page-break-after: avoid; }
.sb-contact { display: flex; flex-direction: column; gap: 8px; }
.sb-c { display: flex; align-items: flex-start; gap: 9px; }
.sb-ic { flex: none; width: 18px; height: 18px; border-radius: 50%; background: ${A}; display: inline-flex; align-items: center; justify-content: center; margin-top: -1px; }
.sb-item { margin-bottom: 9px; break-inside: avoid; }
.sb-item:last-child { margin-bottom: 0; }
.sb-strong { font-weight: 700; color: #fff; font-size: 12px; }
.sb-sub { font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 1px; }
.sb-date { font-size: 10.5px; font-weight: 600; color: ${A}; margin-top: 2px; font-variant-numeric: tabular-nums; }
.sb-lang-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.sb-verified { margin-top: 3px; display: inline-block; background: #fff; border-radius: 3px; padding: 1px 5px; }

/* ── Main ────────────────────────────────────────────────── */
.mn { padding: 0 40px 0 30px; min-width: 0; }
.mast { padding: 4px 0 18px ${RAIL}px; }
.name { margin: 0; font-family: ${DISPLAY}; font-weight: 800; font-size: 33px; line-height: 1.08; letter-spacing: 0.01em; text-transform: uppercase; color: ${INK.ink}; }
.last { color: ${AT}; }
.role { margin-top: 8px; font-family: ${DISPLAY}; font-size: 11.5px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: ${INK.muted}; line-height: 1.5; }
.role::after { content: ""; display: block; width: 44px; height: 3px; background: ${A}; margin-top: 12px; }

/* The rail: a hairline down the main column. Section icons sit centred on
   it and every role is a dot on it. */
.rail { border-left: 1.5px solid #e1e0dc; padding-left: ${RAIL}px; }
.mn-sec { margin-bottom: 17px; }
.mn-sec:last-child { margin-bottom: 0; }
.mn-h { position: relative; display: flex; align-items: center; min-height: ${IC}px; margin: 0 0 10px; font-family: ${DISPLAY}; font-weight: 800; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; color: ${INK.ink}; break-after: avoid; page-break-after: avoid; }
.rail-ic { position: absolute; left: ${-(RAIL + IC / 2 + 0.75)}px; top: 50%; margin-top: ${-IC / 2}px; box-shadow: 0 0 0 3px #fff; }
.summary { margin: 0; font-size: 12.5px; line-height: 1.6; color: ${INK.body}; }

.exp { position: relative; margin-bottom: 12px; }
.exp:last-child { margin-bottom: 0; }
.exp::before { content: ""; position: absolute; left: ${-(RAIL + 4.5 + 0.75)}px; top: 4px; width: 9px; height: 9px; border-radius: 50%; background: #fff; border: 2px solid ${A}; box-sizing: border-box; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.exp-title { font-weight: 700; font-size: 13.5px; color: ${INK.ink}; line-height: 1.35; }
.dates { font-family: ${DISPLAY}; font-size: 10.5px; font-weight: 600; color: ${INK.muted}; white-space: nowrap; flex: none; }
.exp-org { font-size: 12px; margin-top: 1px; line-height: 1.4; }
.org { font-weight: 600; color: ${AT}; }
.loc { color: ${INK.muted}; }
.bullets { margin: 5px 0 0; padding: 0; list-style: none; }
.bullets li { display: flex; gap: 9px; font-size: 12px; line-height: 17px; color: ${INK.body}; margin-bottom: 2px; }
.bullets li:last-child { margin-bottom: 0; }
.mk { flex: none; width: 5px; height: 5px; background: ${A}; margin-top: 6px; }
.single { margin: 5px 0 0; font-size: 12px; line-height: 17px; color: ${INK.body}; }

.skills { margin: 0; padding: 0; list-style: none; columns: 2; column-gap: 24px; font-size: 12px; line-height: 1.4; }
.skills li { break-inside: avoid; position: relative; padding-left: 13px; margin-bottom: 4px; }
.skills li::before { content: ""; position: absolute; left: 0; top: 5px; width: 5px; height: 5px; background: ${A}; }

.refs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 22px; }
.refs > div { break-inside: avoid; }
.ref-name { font-weight: 700; font-size: 12.5px; color: ${INK.ink}; }
.ref-role { font-size: 11.5px; color: ${INK.muted}; line-height: 1.4; }
.ref-contact { font-size: 11px; color: ${INK.muted}; }
`;
