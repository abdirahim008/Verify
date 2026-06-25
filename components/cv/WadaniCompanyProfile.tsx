import "server-only";
import type { CompanyData } from "@/lib/pdf/company-data";
import { CompanyOrgChart, orgVisible } from "./companyProfileParts";
import { deriveAccent } from "./companyShared";

const WADANI_SERIF = '"Source Serif 4", "Source Serif Pro", Georgia, serif';
const WADANI_SANS = '"Public Sans", "Source Sans 3", system-ui, sans-serif';

// Company Profile — 3 pages (Cover, About, Projects). Ported from
// verify/pdfs/company-profile.jsx. Each `.page` is its own A4 sheet so the
// PDF lays out as three sequential pages rather than overflowing.

// Base palette. Curated themes (lib/pdf/themes.ts) swap the cover hues +
// interior accent; the cream interior and verified greens stay constant.
const BASE = {
  teal: "#0e2a4a",
  tealDark: "#0a1a2e",
  cream: "#f6f2ea",
  ink: "#1a1a17",
  inkSoft: "#3a3a3d",
  sienna: "#0d3b66",
  muted: "#6e7480",
  rule: "#dcd6c8",
  paperOnTeal: "#e8edf3",
  sand: "#bfcad6",
  sand2: "#c8d2dc",
  verifiedBg: "#d8e5dd",
  verifiedFg: "#1f6b4d",
};
type Palette = typeof BASE;

export function WadaniCompanyProfile({ data, theme }: { data: CompanyData; theme?: Record<string, string> }) {
  const C: Palette = { ...BASE, ...theme };
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles(C) }} />
      <Cover data={data} C={C} />
      <About data={data} />
      <Projects data={data} C={C} />
    </>
  );
}

// ── Page 1: Cover ──────────────────────────────────────────────────
function Cover({ data, C }: { data: CompanyData; C: Palette }) {
  // "WE" monogram — first letter of each of the first two name words.
  const tokens = data.name.split(/\s+/).filter(Boolean);
  const mono = (tokens[0]?.[0] ?? "") + (tokens[1]?.[0] ?? "");

  return (
    <section className="page cover">
      <div className="cover-wash" />
      <svg className="cover-topo" width="794" height="1123" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i} d={`M -50 ${200 + i * 60} Q 200 ${140 + i * 60}, 400 ${220 + i * 60} T 850 ${190 + i * 60}`}
            stroke={C.cream} strokeWidth="0.7" fill="none" />
        ))}
      </svg>

      <div className="cover-head">
        <span className="cover-head-l"><span className="cover-rule" />Company Profile</span>
        <span>Edition {data.year} &middot; I</span>
      </div>

      {/* Logo wins if uploaded; otherwise fall back to the existing
          monogram circle so old/empty profiles still look intentional. */}
      {data.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.logoUrl} alt="" className="cover-logo" />
      ) : (
        <div className="cover-mono">{mono || "·"}<span style={{ fontStyle: "italic" }}>.</span></div>
      )}

      <div className="cover-seal">
        <svg width="16" height="16" viewBox="0 0 11 11" aria-hidden>
          <circle cx="5.5" cy="5.5" r="5.5" fill={C.sand2} />
          <path d="M3 5.5 L4.7 7.2 L8 4" stroke={C.teal} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
        <div className="cover-seal-l">SAHAN</div>
        <div className="cover-seal-s">VERIFIED</div>
      </div>

      <div className="cover-title">
        {data.foundedYear && (
          <div className="cover-est">Established {data.country || "Mogadishu"}, {romanize(data.foundedYear)}</div>
        )}
        <h1 className="cover-h1">
          {renderNameForCover(data.name)}
        </h1>
        {data.tagline && (
          <div className="cover-tagline">
            <span className="cover-tagline-rule" />
            <span>{data.tagline}</span>
          </div>
        )}
      </div>

      <div className="cover-foot">
        {[
          ["Founded", data.foundedYear],
          ["Registration", data.registrationNumber],
          ["Headquarters", data.country],
          ["Website", data.website],
        ].filter(([, v]) => v).map(([k, v], i) => (
          <div key={i}>
            <div className="cover-foot-k">{k}</div>
            <div className="cover-foot-v">{v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Page 2: About / Mission / Vision / Sectors / Services ─────────
function About({ data }: { data: CompanyData }) {
  return (
    <section className="page about">
      <div className="run-head">
        <span>{data.name} &middot; Company Profile</span>
        <span>02</span>
      </div>

      <div className="about-intro">
        <p className="eyebrow">About the firm</p>
        <h2 className="display">{data.about ? "The firm." : "About."}</h2>
        {data.about && <p className="about-body">{data.about}</p>}
      </div>

      {(data.mission || data.vision) && (
        <div className="mv-grid">
          {data.mission && (
            <div className="mv-card mv-light">
              <p className="eyebrow">Mission</p>
              <p className="mv-quote">&ldquo;{data.mission}&rdquo;</p>
            </div>
          )}
          {data.vision && (
            <div className="mv-card mv-dark">
              <p className="eyebrow eyebrow-onDark">Vision</p>
              <p className="mv-quote">&ldquo;{data.vision}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {(data.sectors.length > 0 || data.services.length > 0) && (
        <div className="lists-grid">
          {data.sectors.length > 0 && (
            <div>
              <p className="eyebrow eyebrow-mb">Sectors</p>
              {data.sectors.map((s, i) => (
                <div key={i} className={`list-row ${i === data.sectors.length - 1 ? "list-row-last" : ""}`}>
                  <span className="list-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="list-item">{s}</span>
                </div>
              ))}
            </div>
          )}
          {data.services.length > 0 && (
            <div>
              <p className="eyebrow eyebrow-mb">Core services</p>
              {data.services.map((s, i) => (
                <div key={i} className={`list-row ${i === data.services.length - 1 ? "list-row-last" : ""}`}>
                  <span className="list-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="list-item">{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {data.clientsFull.length > 0 && (
        <div className="clients">
          <p className="eyebrow eyebrow-mb">Selected clients &amp; donors</p>
          <div className="clients-list" style={{ alignItems: "center" }}>
            {data.clientsFull.map((c, i) => (
              c.logoUrl ? (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 64, padding: "9px 16px", borderRadius: 6, background: "#fff", border: "1px solid #e2ded7" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.logoUrl} alt={c.name} style={{ maxHeight: 46, maxWidth: 150, objectFit: "contain", display: "block" }} />
                </span>
              ) : (
                <span key={i} className="client-chip">{c.name}</span>
              )
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Page 3: Selected Projects ─────────────────────────────────────
function Projects({ data, C }: { data: CompanyData; C: Palette }) {
  return (
    <section className="page projects">
      <div className="run-head">
        <span>{data.name} &middot; Company Profile</span>
        <span>03</span>
      </div>

      <div className="proj-intro">
        <p className="eyebrow">Selected projects</p>
        <h2 className="display">The work, <em className="italic-sienna">on the record.</em></h2>
        <p className="proj-blurb">
          Verified entries are independently confirmed by the named client or donor. Unverified entries are listed but not vouched for.
        </p>
      </div>

      <div className="proj-list">
        {data.projects.map((p, i) => (
          <article key={i} className="proj-card">
            <div className="proj-tag">
              <div className="proj-tag-n">{String(i + 1).padStart(2, "0")}</div>
              {p.sector && <div className="proj-tag-s">{p.sector}</div>}
            </div>
            <div className="proj-body">
              <div className="proj-title-row">
                <span className="proj-title">{p.name}</span>
                {p.verified && <VerifiedPill note={p.verifiedNote} small />}
              </div>
              {(p.client || p.yearRange) && (
                <div className="proj-meta">{[p.client, p.yearRange].filter(Boolean).join(" · ")}</div>
              )}
              {p.scope && <p className="proj-scope">{p.scope}</p>}
            </div>
            {p.value && (
              <div className="proj-value">
                <div className="eyebrow eyebrow-tiny">Value</div>
                <div className="proj-value-n">{p.value}</div>
              </div>
            )}
          </article>
        ))}
      </div>

      {orgVisible(data) && (
        <div className="team">
          <p className="eyebrow eyebrow-mb">Key personnel</p>
          <CompanyOrgChart data={data} A={deriveAccent(C.sienna)} nameFont={WADANI_SERIF} unitFont={WADANI_SANS} />
        </div>
      )}

      {data.certifications.length > 0 && (
        <div className="certs">
          <p className="eyebrow eyebrow-mb">Accreditations</p>
          {data.certifications.map((c, i) => (
            <div key={i} className="cert-row">
              <span className="cert-name">{c.name}</span>
              {(c.issuer || c.year) && <span className="cert-meta"> · {[c.issuer, c.year].filter(Boolean).join(", ")}</span>}
              {c.verified && <VerifiedPill note={c.verifiedNote} small />}
            </div>
          ))}
        </div>
      )}

      <div className="proj-foot">
        <span>{data.website || data.name}</span>
        <span className="proj-foot-stamp">Verified on Sahan</span>
        <span>Page 03</span>
      </div>
    </section>
  );
}

function VerifiedPill({ small }: { note?: string; small?: boolean }) {
  return (
    <span className={small ? "vbadge vbadge-sm" : "vbadge"}>
      <svg width={small ? "8" : "9"} height={small ? "8" : "9"} viewBox="0 0 11 11" aria-hidden>
        <circle cx="5.5" cy="5.5" r="5.5" fill={BASE.verifiedFg} />
        <path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
      Verified
    </span>
  );
}

// "Wadani Engineering Group" → "Wadani / Engineering / Group." with the
// final token italicised & in sienna. Falls back gracefully for short names.
function renderNameForCover(name: string) {
  const tokens = name.trim().split(/\s+/);
  if (tokens.length === 0) return null;
  const last = tokens.pop()!;
  return (
    <>
      {tokens.map((t, i) => <span key={i}>{t}<br /></span>)}
      <span className="cover-h1-italic">{last}.</span>
    </>
  );
}

// 1995 → MCMXCV etc. Keep it light — we only need it for the cover's "Est. MMXII"
// flourish; falls back to the raw year if conversion exceeds the table.
function romanize(yearStr: string): string {
  const n = Number(yearStr);
  if (!Number.isFinite(n) || n < 1 || n > 3999) return yearStr;
  const table: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "", v = n;
  for (const [num, sym] of table) { while (v >= num) { out += sym; v -= num; } }
  return out;
}

const styles = (C: Palette) => `
@page { size: A4; margin: 0; }

.page {
  width: 210mm;
  height: 297mm;
  page-break-after: always;
  position: relative;
  overflow: hidden;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.page:last-child { page-break-after: auto; }

/* ── Cover ─────────────────────────────────────────────────────── */
.cover {
  background: linear-gradient(165deg, ${C.tealDark} 0%, ${C.teal} 55%, ${C.tealDark} 100%);
  color: ${C.paperOnTeal};
  font-family: "Public Sans", "Source Sans 3", "IBM Plex Sans", system-ui, sans-serif;
}
.cover-wash {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 78% 22%, rgba(180,200,224,0.32), transparent 55%);
}
.cover-topo { position: absolute; inset: 0; opacity: 0.06; pointer-events: none; }
.cover-head {
  position: absolute; top: 16mm; left: 18mm; right: 18mm;
  display: flex; justify-content: space-between; align-items: center;
  font-size: 9pt; letter-spacing: 0.22em; text-transform: uppercase;
  color: ${C.sand2}; font-weight: 600;
}
.cover-head-l { display: flex; align-items: center; gap: 3mm; }
.cover-rule { width: 8mm; height: 1px; background: ${C.sand2}; display: inline-block; }
.cover-mono {
  position: absolute; top: 36mm; left: 18mm;
  width: 20mm; height: 20mm; border-radius: 50%;
  border: 1px solid ${C.sand};
  display: flex; align-items: center; justify-content: center;
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-size: 22pt; font-weight: 350; color: ${C.sand2};
  letter-spacing: -0.02em;
}
.cover-logo {
  position: absolute; top: 36mm; left: 18mm;
  width: 32mm; height: 32mm;
  object-fit: contain;
  background: rgba(255,255,255,0.92);
  border-radius: 4mm;
  padding: 2mm;
}
.cover-seal {
  position: absolute; top: 36mm; right: 18mm;
  width: 19mm; height: 19mm; border-radius: 50%;
  border: 1.5px solid ${C.sand}; color: ${C.sand2};
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; line-height: 1.2;
}
.cover-seal-l { font-size: 6pt; letter-spacing: 0.18em; font-weight: 700; margin-top: 1mm; }
.cover-seal-s { font-size: 5.5pt; letter-spacing: 0.12em; color: #9aa6b3; }
.cover-title { position: absolute; left: 18mm; right: 18mm; bottom: 76mm; }
.cover-est {
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-size: 11pt; font-style: italic; color: ${C.sand2};
  letter-spacing: 0.02em; margin-bottom: 6mm;
}
.cover-h1 {
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-size: 72pt; font-weight: 300; letter-spacing: -0.04em;
  line-height: 0.92; margin: 0; color: ${C.paperOnTeal};
}
.cover-h1-italic { font-style: italic; color: ${C.sand2}; font-weight: 250; }
.cover-tagline {
  margin-top: 8mm; display: flex; align-items: center; gap: 5mm;
  font-weight: 500; font-size: 11pt;
  letter-spacing: 0.04em; color: ${C.paperOnTeal}; text-transform: uppercase;
}
.cover-tagline-rule { width: 15mm; height: 2px; background: ${C.sand}; display: inline-block; }
.cover-foot {
  position: absolute; bottom: 16mm; left: 18mm; right: 18mm;
  padding-top: 5mm; border-top: 1px solid ${C.paperOnTeal}33;
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 5mm;
}
.cover-foot-k {
  font-size: 7pt; color: ${C.sand2}; letter-spacing: 0.18em;
  text-transform: uppercase; font-weight: 600;
}
.cover-foot-v {
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-size: 11pt; font-weight: 400; color: ${C.paperOnTeal};
  margin-top: 1.5mm; letter-spacing: -0.005em;
}

/* ── Interior pages (about + projects) ─────────────────────────── */
.about, .projects {
  background: ${C.cream};
  color: ${C.ink};
  font-family: "Public Sans", "Source Sans 3", "IBM Plex Sans", system-ui, sans-serif;
  padding: 18mm 18mm 16mm;
}
.run-head {
  display: flex; justify-content: space-between;
  font-size: 8pt; color: ${C.muted};
  letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600;
}
.eyebrow {
  font-size: 8.5pt; color: ${C.sienna};
  letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600;
}
.eyebrow-mb { margin-bottom: 4mm; }
.eyebrow-tiny { font-size: 7pt; letter-spacing: 0.1em; color: ${C.muted}; }
.eyebrow-onDark { color: ${C.sand}; }
.display {
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-size: 36pt; font-weight: 350; letter-spacing: -0.03em;
  line-height: 0.95; margin: 4mm 0 0; max-width: 140mm;
}
.italic-sienna { font-style: italic; color: ${C.sienna}; }
.about-intro { margin-top: 8mm; }
.about-body {
  font-size: 11pt; line-height: 1.7; color: ${C.inkSoft};
  margin-top: 6mm; max-width: 160mm; text-align: justify; hyphens: auto;
}
.mv-grid { margin-top: 8mm; display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
.mv-card { border-radius: 8px; padding: 6mm 7mm; }
.mv-light { background: #fff; border: 1px solid ${C.rule}; }
.mv-dark { background: ${C.teal}; color: #e6ecf3; }
.mv-quote {
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-size: 13pt; line-height: 1.35; font-style: italic;
  margin: 3mm 0 0; font-weight: 400; letter-spacing: -0.005em;
}
.lists-grid { margin-top: 7mm; display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; }
.list-row {
  display: flex; align-items: baseline; gap: 4mm;
  padding: 2mm 0; border-bottom: 1px solid ${C.rule};
}
.list-row-last { border-bottom: none; }
.list-num {
  font-family: "IBM Plex Mono", "Source Code Pro", monospace;
  font-size: 7.5pt; color: ${C.muted}; width: 7mm;
}
.list-item {
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-size: 12pt; font-weight: 450; letter-spacing: -0.005em;
}
.clients { margin-top: 8mm; }
.clients-list { display: flex; flex-wrap: wrap; gap: 2mm 4mm; }
.client-chip {
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-size: 11pt; font-weight: 450; color: ${C.ink};
}
.client-chip:not(:last-child)::after { content: " ·"; color: ${C.muted}; }

/* ── Projects page ─────────────────────────────────────────────── */
.proj-intro { margin-top: 10mm; }
.proj-blurb {
  font-size: 10.5pt; color: ${C.muted}; max-width: 140mm;
  margin-top: 4mm; line-height: 1.55;
}
.proj-list { margin-top: 8mm; display: flex; flex-direction: column; gap: 4mm; }
.proj-card {
  background: #fff; border: 1px solid ${C.rule}; border-radius: 8px;
  padding: 5mm 6mm;
  display: grid; grid-template-columns: 16mm 1fr 28mm; gap: 5mm; align-items: flex-start;
  break-inside: avoid; page-break-inside: avoid;
}
.proj-tag {
  width: 16mm; height: 16mm; border-radius: 4px; background: ${C.cream};
  border: 1px solid ${C.rule};
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.proj-tag-n {
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-size: 17pt; font-weight: 400; color: ${C.ink};
  line-height: 1; letter-spacing: -0.02em;
}
.proj-tag-s {
  font-size: 6pt; color: ${C.muted}; letter-spacing: 0.1em;
  text-transform: uppercase; margin-top: 1mm; text-align: center;
}
.proj-title-row { display: flex; flex-wrap: wrap; align-items: center; gap: 2mm; }
.proj-title {
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-size: 14pt; font-weight: 500; letter-spacing: -0.01em;
}
.proj-meta {
  font-size: 9.5pt; color: ${C.sienna}; margin-top: 1mm; font-style: italic;
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
}
.proj-scope { font-size: 9.5pt; line-height: 1.55; color: ${C.inkSoft}; margin: 2mm 0 0; }
.proj-value { text-align: right; }
.proj-value-n {
  font-family: "Source Serif 4", "Source Serif Pro", Georgia, serif;
  font-size: 18pt; font-weight: 400; letter-spacing: -0.01em; margin-top: 1mm;
}

.team { margin-top: 10mm; }
.team-list { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm 8mm; }
.team-row { padding: 2mm 0; border-bottom: 1px solid ${C.rule}; }
.team-name { font-family: "Source Serif 4", Georgia, serif; font-size: 11pt; font-weight: 500; }
.team-role { font-size: 9pt; color: ${C.muted}; margin-top: 0.5mm; }

.certs { margin-top: 8mm; }
.cert-row { font-size: 10pt; color: ${C.inkSoft}; margin-bottom: 2mm; display: flex; align-items: baseline; gap: 2mm; flex-wrap: wrap; }
.cert-name { font-weight: 500; }
.cert-meta { font-size: 8.5pt; color: ${C.muted}; font-style: italic; }

.proj-foot {
  position: absolute; bottom: 10mm; left: 18mm; right: 18mm;
  display: flex; justify-content: space-between;
  font-size: 8pt; color: ${C.muted}; letter-spacing: 0.12em;
  text-transform: uppercase; padding-top: 3mm; border-top: 1px solid ${C.rule};
}
.proj-foot-stamp { color: ${C.sienna}; }

.vbadge, .vbadge-sm {
  display: inline-flex; align-items: center; gap: 1mm;
  font-weight: 500; color: ${C.verifiedFg};
  background: ${C.verifiedBg};
  padding: 0.4mm 1.8mm 0.4mm 1mm; border-radius: 99px;
  letter-spacing: 0.01em; white-space: nowrap; font-style: normal;
}
.vbadge { font-size: 7.5pt; }
.vbadge-sm { font-size: 7pt; }
.vbadge svg, .vbadge-sm svg { display: inline-block; vertical-align: middle; }
`;
