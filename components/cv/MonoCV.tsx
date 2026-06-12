import "server-only";
import type { CVData } from "@/lib/pdf/data";

// Mono CV — A4 portrait, minimalist/technical register.
// Space Grotesk (display) + IBM Plex Mono (dates / slugs / chips) — the
// §12 prototype pairing. Single signal-blue accent, timeline grid for
// experience, engineered whitespace.

const C = {
  bg: "#fbfaf6",
  ink: "#131311",
  sub: "#52524e",
  muted: "#8a8a84",
  rule: "#e5e1d5",
  accent: "#0a5cad",
  dotOff: "#cdc9bc",
  verifiedBg: "#e0efe7",
  verifiedFg: "#1d6647",
};

const DISPLAY = `"Space Grotesk", "IBM Plex Sans", system-ui, sans-serif`;
const BODY = `"IBM Plex Sans", system-ui, sans-serif`;
const MONO = `"IBM Plex Mono", "Source Code Pro", ui-monospace, monospace`;

export function MonoCV({ data }: { data: CVData }) {
  const { fullName, headline, summary, location, email, phone, languages,
          experiences, educations, certifications, skills, year } = data;

  const slug = makeSlug(fullName);
  const today = new Date();
  const stamp = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}`;
  const langCodes = languages.map(languageCode).filter(Boolean).join("/");
  const locCode = locationCode(location);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <section className="page">
        {/* Meta strip */}
        <div className="top">
          {/* ASCII arrows only — Plex Mono lacks ↳/→ and serverless
              chromium has no fallback fonts, so those glyphs would tofu. */}
          <div className="top-l">
            <span className="top-mark" />
            <span>cv / {slug} / {stamp} {"->"}</span>
          </div>
          <div className="top-r">
            {[locCode, langCodes].filter(Boolean).join(" · ")}
          </div>
        </div>

        {/* Name block */}
        <header className="name-block">
          <h1 className="name">
            {fullName}<span className="dot">.</span>
          </h1>
          {headline && <div className="headline">{headline}</div>}
          {(email || phone || location) && (
            <div className="contact">
              {[email, phone, location?.toLowerCase()].filter(Boolean).join("  ·  ")}
            </div>
          )}
        </header>

        <div className="hr" />

        {/* About */}
        {summary && (
          <div className="row">
            <div className="row-lbl">About</div>
            <p className="row-body">{summary}</p>
          </div>
        )}

        {/* Experience — timeline */}
        {experiences.length > 0 && (
          <>
            <SectionHead label="Experience" />
            <div className="tl">
              <div className="tl-rail" />
              {experiences.map((e, i) => (
                <div key={i} className="tl-row">
                  <div className="tl-year">
                    {yearOf(e.dateRange, "start")}
                    <span className={/now/.test(yearOf(e.dateRange, "end")) ? "tl-year-end tl-now" : "tl-year-end"}>
                      {yearOf(e.dateRange, "end")}
                    </span>
                  </div>
                  <div className="tl-dot-col">
                    <span className={e.verified ? "tl-dot tl-dot-on" : "tl-dot"} />
                  </div>
                  <div className="tl-body">
                    <div className="tl-title-row">
                      <span className="tl-title">{e.title}</span>
                      {e.organization && (
                        <span className="tl-org">@ <strong>{e.organization}</strong></span>
                      )}
                      {e.verified && <MonoVerified note={e.verifiedNote} />}
                    </div>
                    {e.location && <div className="tl-loc">{e.location.toLowerCase()}</div>}
                    {e.description && <p className="tl-desc">{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Education + Skills two-up */}
        <div className="twoUp">
          {educations.length > 0 && (
            <div>
              <SectionHead label="Education" />
              {educations.map((e, i) => (
                <div key={i} className="edu">
                  <div className="edu-h">
                    <span className="edu-qual">{e.qualification}</span>
                    {e.verified && <MonoTick />}
                  </div>
                  <div className="edu-inst">{e.institution}{e.field ? ` · ${e.field}` : ""}</div>
                  {e.dateRange && <div className="edu-date">{e.dateRange.toLowerCase()}</div>}
                </div>
              ))}
            </div>
          )}

          {skills.length > 0 && (
            <div>
              <SectionHead label="Skills" />
              <div className="skills">
                {skills.map((s, i) => <span key={i} className="skill-chip">{s}</span>)}
              </div>

              {certifications.length > 0 && (
                <>
                  <SectionHead label="Certifications" />
                  {certifications.map((c, i) => (
                    <div key={i} className="cert-row">
                      <span className="cert-name">{c.name}</span>
                      {(c.issuer || c.year) && (
                        <span className="cert-meta"> · {[c.issuer, c.year].filter(Boolean).join(", ")}</span>
                      )}
                      {c.verified && <MonoTick />}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="ft">
          <span>{">>"} {slug} / {year}</span>
          <span className="ft-stamp">verified on sahan</span>
          <span>01 / 01</span>
        </footer>
      </section>
    </>
  );
}

// ── pieces ─────────────────────────────────────────────────────────
function SectionHead({ label }: { label: string }) {
  return (
    <div className="sh">
      <span className="sh-mark" />
      <span className="sh-label">{label}</span>
    </div>
  );
}
function MonoVerified({ note }: { note: string }) {
  return (
    <span className="vbadge">
      <MonoTick small />
      {note ? `Verified · ${note}` : "Verified"}
    </span>
  );
}
function MonoTick({ small }: { small?: boolean }) {
  return (
    <svg width={small ? "8" : "9"} height={small ? "8" : "9"} viewBox="0 0 11 11" aria-hidden>
      <circle cx="5.5" cy="5.5" r="5.5" fill={C.verifiedFg} />
      <path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── helpers ─────────────────────────────────────────────────────────
// "Ifrah Abdi" → "abdi-i" (lastname, first initial).
function makeSlug(name: string): string {
  const tokens = name.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return "cv";
  if (tokens.length === 1) return tokens[0].replace(/[^a-z0-9]/g, "");
  const first = tokens[0].replace(/[^a-z0-9]/g, "")[0];
  const last = tokens[tokens.length - 1].replace(/[^a-z0-9]/g, "");
  return `${last}-${first}`;
}

// "Mogadishu, Somalia" → "MOG · SOM".
function locationCode(loc: string): string {
  if (!loc) return "";
  return loc.split(",").map((p) => p.trim().slice(0, 3).toUpperCase()).filter(Boolean).join(" · ");
}

// "Somali (native)" → "SOM".
function languageCode(lang: string): string {
  const t = lang.replace(/\(.*?\)/g, "").trim();
  return t ? t.split(/\s+/)[0].slice(0, 3).toUpperCase() : "";
}

// Year out of "May 2023 – Present" / "2023 – 2024".
function yearOf(range: string, which: "start" | "end"): string {
  if (!range) return "";
  const parts = range.split(/\s*[–—-]\s*/);
  const target = which === "start" ? parts[0] : parts[1] ?? parts[0];
  if (!target) return "";
  if (/present/i.test(target)) return "now";
  const m = target.match(/(\d{4})/);
  return m ? m[1].slice(2) : "";
}

const STYLES = `
@page { size: A4; margin: 0; }

.page {
  width: 210mm;
  min-height: 297mm;
  background: ${C.bg};
  color: ${C.ink};
  font-family: ${BODY};
  font-kerning: normal;
  padding: 17mm 18mm 15mm;
  position: relative;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

/* ── Meta strip ────────────────────────────────────────────────── */
.top { display: flex; justify-content: space-between; align-items: flex-start; }
.top-l, .top-r {
  font-family: ${MONO};
  font-size: 7.5pt; color: ${C.muted}; letter-spacing: 0.04em;
  display: flex; align-items: center; gap: 2.5mm;
}
.top-mark { width: 2.4mm; height: 2.4mm; background: ${C.accent}; display: inline-block; }

/* ── Name block ────────────────────────────────────────────────── */
.name-block { margin-top: 10mm; }
.name {
  font-family: ${DISPLAY};
  font-size: 42pt; font-weight: 500;
  letter-spacing: -0.045em; line-height: 0.96; margin: 0;
}
.dot { color: ${C.accent}; }
.headline {
  margin-top: 3.5mm;
  font-family: ${DISPLAY};
  font-size: 11.5pt; font-weight: 500;
  letter-spacing: -0.01em; color: ${C.ink};
}
.contact {
  margin-top: 1.6mm;
  font-family: ${MONO};
  font-size: 8.5pt; color: ${C.sub};
}

.hr { height: 1px; background: ${C.rule}; margin-top: 7mm; }

/* ── About row ─────────────────────────────────────────────────── */
.row { margin-top: 6.5mm; display: grid; grid-template-columns: 24mm 1fr; gap: 6mm; }
.row-lbl {
  font-family: ${DISPLAY};
  font-weight: 600; font-size: 8pt;
  letter-spacing: 0.24em; text-transform: uppercase;
  color: ${C.sub}; margin-top: 1mm;
}
.row-body { font-size: 10pt; line-height: 1.68; color: ${C.ink}; margin: 0; }

/* ── Section heads ─────────────────────────────────────────────── */
.sh { margin-top: 8.5mm; margin-bottom: 4.5mm; display: flex; align-items: center; gap: 3mm; }
.sh-mark { width: 2.4mm; height: 2.4mm; background: ${C.accent}; display: inline-block; }
.sh-label {
  font-family: ${DISPLAY};
  font-weight: 600; font-size: 9pt;
  letter-spacing: 0.26em; text-transform: uppercase; color: ${C.sub};
}

/* ── Timeline ──────────────────────────────────────────────────── */
.tl { display: grid; grid-template-columns: 21mm 4mm 1fr; gap: 4mm; position: relative; }
.tl-rail {
  position: absolute; top: 3mm; bottom: 3mm;
  left: calc(21mm + 4mm + 0.8mm);
  width: 0.4mm; background: ${C.rule};
}
.tl-row { display: contents; }
.tl-year {
  font-family: ${MONO};
  font-size: 8.5pt; color: ${C.sub};
  padding-top: 1.4mm; line-height: 1.5;
  font-feature-settings: "tnum";
}
.tl-year-end { display: block; color: ${C.muted}; }
.tl-now { color: ${C.accent}; font-weight: 500; }
.tl-dot-col { padding-top: 2.2mm; display: flex; justify-content: center; }
.tl-dot { width: 2.4mm; height: 2.4mm; border-radius: 99px; background: ${C.dotOff}; z-index: 1; }
.tl-dot-on { background: ${C.accent}; }
.tl-body { padding-bottom: 6.5mm; }
.tl-title-row { display: flex; align-items: baseline; gap: 2.2mm; flex-wrap: wrap; }
.tl-title {
  font-family: ${DISPLAY};
  font-weight: 600; font-size: 12pt; letter-spacing: -0.02em;
}
.tl-org { font-size: 9.5pt; color: ${C.sub}; }
.tl-org strong { color: ${C.ink}; font-weight: 600; }
.tl-loc { font-family: ${MONO}; font-size: 8pt; color: ${C.muted}; margin-top: 0.6mm; }
.tl-desc { font-size: 9.5pt; line-height: 1.62; color: ${C.ink}; margin: 2mm 0 0; }

/* ── Two-up ────────────────────────────────────────────────────── */
.twoUp { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; margin-top: 2mm; }
.edu { margin-bottom: 4mm; }
.edu-h { display: flex; align-items: center; gap: 2mm; }
.edu-qual { font-family: ${DISPLAY}; font-weight: 600; font-size: 10pt; letter-spacing: -0.01em; }
.edu-inst { font-size: 9pt; color: ${C.sub}; margin-top: 0.6mm; }
.edu-date { font-family: ${MONO}; font-size: 7.5pt; color: ${C.muted}; margin-top: 0.5mm; }

.skills { display: flex; flex-wrap: wrap; gap: 1.8mm 2.2mm; }
.skill-chip {
  font-family: ${MONO};
  font-size: 8pt; color: ${C.ink};
  border: 1px solid ${C.rule};
  padding: 1mm 2.4mm;
  border-radius: 0.8mm;
  background: #ffffff;
}

.cert-row {
  font-size: 9.5pt; color: ${C.ink}; margin-bottom: 1.8mm;
  display: flex; align-items: baseline; gap: 2mm; flex-wrap: wrap;
}
.cert-name { font-family: ${DISPLAY}; font-weight: 600; font-size: 9.5pt; }
.cert-meta { font-size: 8.5pt; color: ${C.muted}; }

/* ── Footer ────────────────────────────────────────────────────── */
.ft {
  position: absolute; bottom: 9mm; left: 18mm; right: 18mm;
  display: flex; justify-content: space-between;
  font-family: ${MONO};
  font-size: 7.5pt; color: ${C.muted}; letter-spacing: 0.04em;
  padding-top: 3mm; border-top: 1px solid ${C.rule};
}
.ft-stamp { color: ${C.accent}; }

/* ── Verified pill ─────────────────────────────────────────────── */
.vbadge {
  display: inline-flex; align-items: center; gap: 1.2mm;
  font-family: ${MONO};
  font-size: 7pt; font-weight: 500;
  color: ${C.verifiedFg}; background: ${C.verifiedBg};
  padding: 0.5mm 2mm; border-radius: 0.8mm;
  letter-spacing: 0.01em; white-space: nowrap;
}
.vbadge svg { display: inline-block; vertical-align: middle; }
`;
