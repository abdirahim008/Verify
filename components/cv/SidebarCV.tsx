import "server-only";
import type { CVData } from "@/lib/pdf/data";

// Sidebar CV — A4 portrait, two-column executive register.
// Archivo (display) + IBM Plex Sans (body) — the §12 prototype pairing.
// Deep navy sidebar, teal main column, sand accents, outlined verified
// pill that reads as a quiet stamp on the dark ground.

// Base palette. Curated themes (lib/pdf/themes.ts) swap the column hues
// and sand accent; the verified mint stays constant — it reads on all of
// the curated dark grounds.
const BASE = {
  teal: "#0e2a4a",         // main column
  tealDark: "#091e36",     // left sidebar
  cream: "#eaf0f6",        // primary text on dark
  dim: "#92a0af",          // labels / muted on dark
  sand: "#c3cedb",         // accent / org names
  rule: "#21436b",         // section underline on main
  ruleSb: "#1b3354",       // hairlines in sidebar
  verified: "#74d3a0",     // verified outline + text
  verifiedInk: "#0a2a2a",  // verified tick stroke
};
type Palette = typeof BASE;

const DISPLAY = `"Archivo", "Public Sans", system-ui, sans-serif`;
const BODY = `"IBM Plex Sans", system-ui, sans-serif`;

export function SidebarCV({ data, theme }: { data: CVData; theme?: Record<string, string> }) {
  const { fullName, headline, summary, location, email, phone, languages,
          experiences, educations, certifications, skills, year, photoUrl } = data;
  const C: Palette = { ...BASE, ...theme };

  // Sidebar fits ~9 skills before the rhythm breaks; the rest are implied
  // by the experience entries.
  const sidebarSkills = skills.slice(0, 9);
  const [hLeft, hRight] = splitHeadline(headline);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles(C) }} />
      <section className="page">
        <aside className="sb">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="sb-photo" />
          ) : (
            <div className="sb-monogram">{initials(fullName)}</div>
          )}

          <h1 className="sb-name">{toLines(fullName).map((l, i) => <span key={i}>{l.toUpperCase()}<br /></span>)}</h1>
          <span className="sb-name-rule" />
          {(hLeft || hRight) && (
            <p className="sb-headline">
              {hLeft}{hRight && (<><br />{hRight}</>)}
            </p>
          )}

          <SbHead>Contact</SbHead>
          {location && <SbField l="Location" v={location} />}
          {email && <SbField l="Email" v={email} />}
          {phone && <SbField l="Phone" v={phone} />}

          {languages.length > 0 && (
            <>
              <SbHead>Languages</SbHead>
              {languages.map((l, i) => <div key={i} className="sb-lang">{l}</div>)}
            </>
          )}

          {sidebarSkills.length > 0 && (
            <>
              <SbHead>Skills</SbHead>
              <div className="sb-skills">
                {sidebarSkills.map((s, i) => (
                  <div key={i} className="sb-skill">
                    <span className="sb-skill-dot" />
                    {s}
                  </div>
                ))}
              </div>
            </>
          )}

          {certifications.length > 0 && (
            <>
              <SbHead>Certifications</SbHead>
              {certifications.map((c, i) => (
                <div key={i} className="sb-cert">
                  <div className="sb-cert-name">
                    {c.name}
                    {c.verified && <SbTick />}
                  </div>
                  {(c.issuer || c.year) && (
                    <div className="sb-cert-meta">{[c.issuer, c.year].filter(Boolean).join(" · ")}</div>
                  )}
                </div>
              ))}
            </>
          )}

          <div className="sb-foot">Verified on Sahan &middot; {year}</div>
        </aside>

        <main className="mn">
          {summary && (
            <>
              <MnHead>Profile</MnHead>
              <p className="mn-summary">{summary}</p>
            </>
          )}

          {experiences.length > 0 && (
            <>
              <MnHead>Experience</MnHead>
              {experiences.map((e, i) => (
                <article key={i} className="mn-exp">
                  <span className="mn-exp-dot" />
                  <div className="mn-exp-head">
                    <div className="mn-exp-title-row">
                      <span className="mn-exp-title">{e.title}</span>
                      {e.verified && <MnVerified note={e.verifiedNote} />}
                    </div>
                    {e.dateRange && <div className="mn-exp-dates">{e.dateRange.toUpperCase()}</div>}
                  </div>
                  {(e.organization || e.location) && (
                    <div className="mn-exp-meta">{[e.organization, e.location].filter(Boolean).join(" · ")}</div>
                  )}
                  {e.description && <p className="mn-exp-desc">{e.description}</p>}
                </article>
              ))}
            </>
          )}

          {educations.length > 0 && (
            <>
              <MnHead>Education</MnHead>
              {educations.map((e, i) => (
                <div key={i} className="mn-edu">
                  <div className="mn-edu-head">
                    <span className="mn-edu-qual">
                      {e.qualification}
                      {e.verified && <SbTick />}
                    </span>
                    {e.dateRange && <span className="mn-edu-dates">{e.dateRange}</span>}
                  </div>
                  <div className="mn-edu-inst">{e.institution}{e.field ? ` · ${e.field}` : ""}</div>
                </div>
              ))}
            </>
          )}
        </main>
      </section>
    </>
  );
}

// ── pieces ──────────────────────────────────────────────────────────
function SbHead({ children }: { children: React.ReactNode }) {
  return <div className="sb-head"><span className="sb-head-tick" />{children}</div>;
}
function MnHead({ children }: { children: React.ReactNode }) {
  return <div className="mn-head">{children}</div>;
}
function SbField({ l, v }: { l: string; v: string }) {
  return (
    <div className="sb-field">
      <div className="sb-field-l">{l}</div>
      <div className="sb-field-v">{v}</div>
    </div>
  );
}
function SbTick() {
  return (
    <svg width="9" height="9" viewBox="0 0 11 11" aria-hidden>
      <circle cx="5.5" cy="5.5" r="5.5" fill={BASE.verified} />
      <path d="M3 5.5 L4.7 7.2 L8 4" stroke={BASE.verifiedInk} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function MnVerified({ note }: { note: string }) {
  return (
    <span className="vbadge">
      <SbTick />
      {note ? `Verified · ${note}` : "Verified"}
    </span>
  );
}

// ── helpers ─────────────────────────────────────────────────────────
function initials(name: string): string {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return "·";
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return (tokens[0][0] + tokens[tokens.length - 1][0]).toUpperCase();
}

// Up to 3 name lines so long Somali compound names stack cleanly.
function toLines(name: string): string[] {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 3);
}

// Em-dash / colon / pipe splits the headline onto two sidebar lines.
function splitHeadline(h: string): [string, string] {
  const m = h.match(/^(.+?)\s*[—–\-|:·]\s*(.+)$/);
  return m ? [m[1], m[2]] : [h, ""];
}

const styles = (C: Palette) => `
@page { size: A4; margin: 0; }

/* Full-bleed two-tone paper. The two-column .page fills the sheet on the
   first page, but if a profile overflows onto a second page the column
   backgrounds stop where the grid ends. A position:fixed layer with
   inset:0 does NOT reliably fill the sheet in Chromium's print path (it
   leaves a white band at the foot of the page). Instead we put the two-tone
   gradient on the ROOT element: Chromium propagates the root background to
   the page canvas and paints it across the WHOLE sheet on EVERY page. The
   gradient splits at 76mm to match the sidebar/main boundary so the navy
   band and teal field line up under the columns on every page. */
html {
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
  background: linear-gradient(to right, ${C.tealDark} 0 76mm, ${C.teal} 76mm 100%);
}

.page {
  width: 210mm;
  min-height: 297mm;
  display: grid;
  grid-template-columns: 76mm 1fr;
  color: ${C.cream};
  font-family: ${BODY};
  font-kerning: normal;
  -webkit-font-smoothing: antialiased;
}

/* ── Sidebar ───────────────────────────────────────────────────── */
.sb {
  background: ${C.tealDark};
  padding: 15mm 9mm 18mm;
  position: relative;
}
.sb-monogram {
  width: 19mm; height: 19mm; border-radius: 50%;
  background: ${C.sand}; color: ${C.tealDark};
  display: flex; align-items: center; justify-content: center;
  font-family: ${DISPLAY};
  font-weight: 800; font-size: 16pt; letter-spacing: 0;
  margin-bottom: 6mm;
}
.sb-photo {
  width: 19mm; height: 19mm; border-radius: 50%;
  object-fit: cover;
  border: 0.6mm solid ${C.sand}55;
  margin-bottom: 6mm;
  display: block;
}
.sb-name {
  font-family: ${DISPLAY};
  font-weight: 800; font-size: 19pt;
  line-height: 1.04; letter-spacing: 0.005em;
  color: #ffffff; margin: 0;
}
.sb-name-rule {
  display: block; width: 10mm; height: 0.7mm;
  background: ${C.sand}; margin-top: 3.5mm;
}
.sb-headline {
  margin-top: 3mm; font-size: 9pt; color: ${C.dim};
  letter-spacing: 0.03em; line-height: 1.6;
}
.sb-head {
  font-family: ${DISPLAY};
  font-weight: 700; font-size: 7.5pt; letter-spacing: 0.24em;
  color: ${C.sand}; text-transform: uppercase;
  margin-top: 8mm; margin-bottom: 3mm;
  display: flex; align-items: center; gap: 2mm;
}
.sb-head-tick { width: 3.5mm; height: 1px; background: ${C.sand}88; display: inline-block; }
.sb-field { margin-bottom: 2.8mm; }
.sb-field-l {
  font-family: ${DISPLAY};
  font-size: 6.5pt; font-weight: 600; color: ${C.dim};
  letter-spacing: 0.14em; text-transform: uppercase;
}
.sb-field-v { font-size: 9.5pt; color: ${C.cream}; margin-top: 0.6mm; line-height: 1.45; word-break: break-word; }
.sb-lang { font-size: 9.5pt; color: ${C.cream}; margin-bottom: 1.4mm; }
.sb-skills { display: flex; flex-direction: column; gap: 1.9mm; }
.sb-skill {
  font-size: 9pt; color: ${C.cream};
  display: flex; align-items: center; gap: 2.5mm;
  line-height: 1.35;
}
.sb-skill-dot {
  width: 1.3mm; height: 1.3mm;
  background: ${C.sand}; flex-shrink: 0;
}
.sb-cert { margin-bottom: 2.8mm; }
.sb-cert-name {
  font-size: 9pt; color: ${C.cream}; font-weight: 600;
  display: flex; gap: 1.6mm; align-items: center; flex-wrap: wrap;
  line-height: 1.4;
}
.sb-cert-meta { font-size: 7.5pt; color: ${C.dim}; margin-top: 0.5mm; }
.sb-foot {
  position: absolute; bottom: 9mm; left: 9mm; right: 9mm;
  padding-top: 2.5mm; border-top: 1px solid ${C.ruleSb};
  font-family: ${DISPLAY};
  font-size: 6.5pt; font-weight: 600; color: ${C.dim};
  letter-spacing: 0.18em; text-transform: uppercase;
}

/* ── Main ──────────────────────────────────────────────────────── */
.mn {
  background: ${C.teal};
  background-image: radial-gradient(circle at 92% 0%, rgba(10, 92, 173, 0.20), transparent 52%);
  padding: 15mm 13mm 18mm;
}
.mn-head {
  font-family: ${DISPLAY};
  font-weight: 700; font-size: 9pt;
  letter-spacing: 0.24em; color: ${C.sand};
  text-transform: uppercase;
  margin-top: 6.5mm; margin-bottom: 4.5mm;
  padding-bottom: 2mm; border-bottom: 1px solid ${C.rule};
}
.mn-head:first-child { margin-top: 0; }
.mn-summary {
  font-size: 10pt; line-height: 1.68;
  color: ${C.cream}; margin: 0 0 3mm;
}
.mn-exp { margin-bottom: 6.5mm; position: relative; break-inside: avoid; page-break-inside: avoid; }
.mn-exp-dot {
  position: absolute; left: -5.8mm; top: 2.4mm;
  width: 2mm; height: 2mm; border-radius: 50%;
  background: ${C.sand};
}
.mn-exp-head { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; }
.mn-exp-title-row { display: flex; align-items: center; gap: 2.2mm; flex-wrap: wrap; }
.mn-exp-title {
  font-family: ${DISPLAY};
  font-weight: 700; font-size: 11.5pt;
  color: #ffffff; letter-spacing: -0.005em;
}
.mn-exp-dates {
  font-family: ${DISPLAY};
  font-size: 7pt; font-weight: 600; color: ${C.dim};
  letter-spacing: 0.12em; white-space: nowrap;
  font-feature-settings: "tnum";
}
.mn-exp-meta {
  font-size: 9.5pt; color: ${C.sand};
  font-weight: 600; margin-top: 0.8mm; letter-spacing: 0.015em;
}
.mn-exp-desc {
  font-size: 9.5pt; line-height: 1.62;
  color: ${C.cream}; margin: 2mm 0 0;
}

.mn-edu { margin-bottom: 4mm; }
.mn-edu-head { display: flex; justify-content: space-between; align-items: baseline; gap: 3mm; }
.mn-edu-qual {
  font-family: ${DISPLAY};
  font-weight: 700; font-size: 10pt; color: #ffffff;
  display: flex; align-items: center; gap: 2mm;
}
.mn-edu-dates {
  font-family: ${DISPLAY};
  font-size: 7pt; font-weight: 600; color: ${C.dim};
  letter-spacing: 0.1em; white-space: nowrap;
  font-feature-settings: "tnum";
}
.mn-edu-inst { font-size: 9pt; color: ${C.sand}; margin-top: 0.6mm; }

.vbadge {
  display: inline-flex; align-items: center; gap: 1.2mm;
  font-family: ${BODY};
  font-size: 6.8pt; font-weight: 600; color: ${C.verified};
  border: 1px solid ${C.verified}55;
  padding: 0.5mm 2mm 0.5mm 1.4mm;
  border-radius: 99px; letter-spacing: 0.02em; white-space: nowrap;
}
.vbadge svg { display: inline-block; vertical-align: middle; }
`;
