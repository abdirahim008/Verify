import "server-only";
import type { CVData } from "@/lib/pdf/data";

// Mono CV — A4 portrait, minimalist/technical register.
// IBM Plex Sans display + IBM Plex Mono for dates / slugs / footers.
// Sienna-blue accent (the prototype called it "orange" but the colour
// value is blue; kept on brand). Timeline grid for experience.
//
// Ported from verify/pdfs/cv-mono.jsx — converted to print units (mm)
// against @page A4 so the layout pages correctly.

const COLORS = {
  bg: "#fafaf7",
  ink: "#111111",
  sub: "#555555",
  muted: "#888888",
  rule: "#e3e0d8",
  accent: "#0a5cad",       // sienna blue — single signal colour
  verifiedBg: "#e2efe7",
  verifiedFg: "#1f6b4d",
};

export function MonoCV({ data }: { data: CVData }) {
  const { fullName, headline, summary, location, email, phone, languages,
          experiences, educations, certifications, skills, year } = data;

  // Slug for the meta strip: "cv / abdi-i / 2026.05 →"
  const slug = makeSlug(fullName);
  const today = new Date();
  const stamp = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}`;

  // Language line for the top-right meta (short codes).
  const langCodes = languages.map(languageCode).filter(Boolean).join("/");
  const locCode = locationCode(location);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <section className="page">
        {/* Top meta */}
        <div className="top">
          <div className="top-l">
            <span className="top-mark" />
            <span>cv / {slug} / {stamp} →</span>
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
              {[email, phone, location?.toLowerCase()].filter(Boolean).join(" · ")}
            </div>
          )}
        </header>

        <div className="hr" />

        {/* Profile */}
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
              {/* vertical rail behind the dots */}
              <div className="tl-rail" />
              {experiences.map((e, i) => (
                <div key={i} className="tl-row">
                  <div className="tl-year">
                    {yearOf(e.dateRange, "start")}
                    <span className="tl-year-end">{yearOf(e.dateRange, "end")}</span>
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
          <span>↳ {slug} / {year}</span>
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
      <circle cx="5.5" cy="5.5" r="5.5" fill={COLORS.verifiedFg} />
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

// "Mogadishu, Somalia" → "MOG · SOM" via 3-letter caps. Light heuristic —
// if the user formatted weirdly we just fall back to the raw uppercased.
function locationCode(loc: string): string {
  if (!loc) return "";
  return loc.split(",").map((p) => p.trim().slice(0, 3).toUpperCase()).filter(Boolean).join(" · ");
}

// "Somali (native)" → "SOM". "English (fluent)" → "ENG". 3-letter cap of
// the first word.
function languageCode(lang: string): string {
  const t = lang.replace(/\(.*?\)/g, "").trim();
  return t ? t.split(/\s+/)[0].slice(0, 3).toUpperCase() : "";
}

// Pull a year out of a "May 2023 – Present" / "2023 – 2024" / "Mar 2024" range.
function yearOf(range: string, which: "start" | "end"): string {
  if (!range) return "";
  // Try to split on en-dash / em-dash / hyphen.
  const parts = range.split(/\s*[–—-]\s*/);
  const target = which === "start" ? parts[0] : parts[1] ?? parts[0];
  if (!target) return "";
  if (/present/i.test(target)) return "now";
  // Grab any 2-or-4 digit year-ish token.
  const m = target.match(/(\d{4})/);
  return m ? m[1].slice(2) : "";
}

const STYLES = `
@page { size: A4; margin: 0; }

.page {
  width: 210mm;
  min-height: 297mm;
  background: ${COLORS.bg};
  color: ${COLORS.ink};
  font-family: "IBM Plex Sans", "Source Sans 3", system-ui, sans-serif;
  padding: 18mm 18mm 16mm;
  position: relative;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  box-sizing: border-box;
}

.top {
  display: flex; justify-content: space-between; align-items: flex-start;
}
.top-l, .top-r {
  font-family: "IBM Plex Mono", "Source Code Pro", ui-monospace, monospace;
  font-size: 8pt; color: ${COLORS.muted}; letter-spacing: 0.04em;
  display: flex; align-items: center; gap: 2.5mm;
}
.top-mark { width: 2.2mm; height: 2.2mm; background: ${COLORS.accent}; display: inline-block; }

.name-block { margin-top: 9mm; }
.name {
  font-family: "IBM Plex Sans", "Source Sans 3", system-ui, sans-serif;
  font-size: 44pt; font-weight: 500;
  letter-spacing: -0.04em; line-height: 0.95; margin: 0;
}
.dot { color: ${COLORS.accent}; }
.headline {
  margin-top: 3mm; font-size: 11pt; color: ${COLORS.ink}; font-weight: 500;
}
.contact {
  margin-top: 1.2mm; font-size: 9.5pt; color: ${COLORS.sub};
  font-family: "IBM Plex Mono", "Source Code Pro", ui-monospace, monospace;
}

.hr { height: 1px; background: ${COLORS.rule}; margin-top: 7mm; }

.row {
  margin-top: 6mm;
  display: grid; grid-template-columns: 24mm 1fr; gap: 6mm;
}
.row-lbl {
  font-weight: 500; font-size: 8.5pt;
  letter-spacing: 0.2em; text-transform: uppercase;
  color: ${COLORS.sub}; margin-top: 1mm;
}
.row-body {
  font-size: 10pt; line-height: 1.65; color: ${COLORS.ink}; margin: 0;
}

.sh {
  margin-top: 8mm; margin-bottom: 4mm;
  display: flex; align-items: center; gap: 3mm;
}
.sh-mark { width: 2.2mm; height: 2.2mm; background: ${COLORS.accent}; display: inline-block; }
.sh-label {
  font-weight: 600; font-size: 9.5pt;
  letter-spacing: 0.22em; text-transform: uppercase; color: ${COLORS.sub};
}

/* ── Experience timeline ───────────────────────────────────────── */
.tl {
  display: grid;
  grid-template-columns: 22mm 4mm 1fr;
  gap: 4mm;
  position: relative;
}
.tl-rail {
  position: absolute;
  top: 3mm; bottom: 3mm;
  left: calc(22mm + 4mm + 0.75mm);
  width: 0.5mm;
  background: ${COLORS.rule};
}
.tl-row {
  display: contents;
}
.tl-year {
  font-family: "IBM Plex Mono", "Source Code Pro", ui-monospace, monospace;
  font-size: 9pt; color: ${COLORS.sub};
  padding-top: 1.5mm; line-height: 1.45;
}
.tl-year-end {
  display: block; color: ${COLORS.muted}; font-size: 9pt;
}
.tl-dot-col {
  padding-top: 2.2mm;
  display: flex; justify-content: center;
}
.tl-dot {
  width: 2.2mm; height: 2.2mm; border-radius: 99px;
  background: #c8c4b8;
  z-index: 1;
}
.tl-dot-on { background: ${COLORS.accent}; }
.tl-body { padding-bottom: 6mm; }
.tl-title-row {
  display: flex; align-items: baseline; gap: 2mm; flex-wrap: wrap;
}
.tl-title {
  font-weight: 600; font-size: 12pt; letter-spacing: -0.015em;
}
.tl-org { font-size: 10pt; color: ${COLORS.sub}; }
.tl-org strong { color: ${COLORS.ink}; font-weight: 500; }
.tl-loc {
  font-family: "IBM Plex Mono", "Source Code Pro", ui-monospace, monospace;
  font-size: 8.5pt; color: ${COLORS.muted}; margin-top: 0.5mm;
}
.tl-desc {
  font-size: 10pt; line-height: 1.6; color: ${COLORS.ink};
  margin: 2mm 0 0;
}

/* ── Education + Skills + Certifications two-up ────────────────── */
.twoUp {
  display: grid; grid-template-columns: 1fr 1fr; gap: 9mm;
  margin-top: 3mm;
}
.edu { margin-bottom: 3.5mm; }
.edu-h { display: flex; align-items: center; gap: 2mm; }
.edu-qual { font-weight: 600; font-size: 10pt; }
.edu-inst { font-size: 9.5pt; color: ${COLORS.sub}; margin-top: 0.5mm; }
.edu-date {
  font-family: "IBM Plex Mono", "Source Code Pro", ui-monospace, monospace;
  font-size: 8pt; color: ${COLORS.muted}; margin-top: 0.5mm;
}

.skills { display: flex; flex-wrap: wrap; gap: 1.7mm 2.2mm; }
.skill-chip {
  font-family: "IBM Plex Mono", "Source Code Pro", ui-monospace, monospace;
  font-size: 8.5pt; color: ${COLORS.ink};
  border: 1px solid ${COLORS.rule};
  padding: 1mm 2.3mm;
  border-radius: 1mm;
  background: #fff;
}

.cert-row {
  font-size: 9.5pt; color: ${COLORS.ink}; margin-bottom: 1.5mm;
  display: flex; align-items: baseline; gap: 2mm; flex-wrap: wrap;
}
.cert-name { font-weight: 500; }
.cert-meta { font-size: 8.5pt; color: ${COLORS.muted}; }

/* ── Footer ────────────────────────────────────────────────────── */
.ft {
  position: absolute; bottom: 9mm; left: 18mm; right: 18mm;
  display: flex; justify-content: space-between;
  font-family: "IBM Plex Mono", "Source Code Pro", ui-monospace, monospace;
  font-size: 8pt; color: ${COLORS.muted}; letter-spacing: 0.04em;
  padding-top: 3mm; border-top: 1px solid ${COLORS.rule};
}
.ft-stamp { color: ${COLORS.accent}; }

.vbadge {
  display: inline-flex; align-items: center; gap: 1mm;
  font-family: "IBM Plex Mono", "Source Code Pro", ui-monospace, monospace;
  font-size: 7.5pt; font-weight: 500;
  color: ${COLORS.verifiedFg}; background: ${COLORS.verifiedBg};
  padding: 0.4mm 1.8mm; border-radius: 1mm;
  letter-spacing: 0.01em; white-space: nowrap;
}
.vbadge svg { display: inline-block; vertical-align: middle; }
`;
