import "server-only";
import type { CompanyData } from "@/lib/pdf/company-data";

// Company Profile — "Minimal / Architectural" register. White space,
// hairlines, massive understated type, one restrained blue accent.
// Ported from pdfs/company-profile-minimal.jsx and extended to a full
// 3-page document (Cover · Chapter 01 The firm · Chapter 02 The work).
//
// The cover sets the company's own name at maximum size — one word per
// line, auto-scaled so the longest word fills the measure, the final
// word italicised in the accent with a terminal period.

// Base palette. Curated themes (lib/pdf/themes.ts) swap the single accent;
// the architectural register keeps everything else fixed.
const BASE = {
  ink: "#0e1116",
  accent: "#0a5cad",
  muted: "#6e7480",
  rule: "#e3e6eb",
  bg: "#fbfbfa",
  verifiedBg: "#dcebe2",
  verifiedFg: "#1d6647",
};
type Palette = typeof BASE;

const SERIF = `"Source Serif 4", Georgia, serif`;
const SANS = `"Public Sans", "Source Sans 3", system-ui, sans-serif`;
const MONO = `"IBM Plex Mono", ui-monospace, monospace`;

export function MinimalCompanyProfile({ data, theme }: { data: CompanyData; theme?: Record<string, string> }) {
  const C: Palette = { ...BASE, ...theme };
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles(C) }} />
      <Cover data={data} C={C} />
      <Firm data={data} />
      <Work data={data} />
    </>
  );
}

// ── Page 1 · Cover ──────────────────────────────────────────────────
function Cover({ data, C }: { data: CompanyData; C: Palette }) {
  const lines = nameLines(data.name);
  const sizePt = fitSize(lines);
  const facts = coverFacts(data);

  return (
    <section className="page cover">
      <div className="wash" />
      <div className="corners">
        <span>{data.name}</span>
        <span>Profile · {romanize(data.year)}</span>
      </div>

      <div className="lockup">
        <span className="lockup-mono">{dottedInitials(data.name)}</span>
        <span className="lockup-dash" />
        {data.foundedYear && <span className="lockup-est">Est. {data.foundedYear}</span>}
      </div>

      <div className="statement">
        <div className="statement-name" style={{ fontSize: `${sizePt}pt` }}>
          {lines.map((l, i) => (
            <span key={i}>
              {i === lines.length - 1
                ? <em className="statement-acc">{l}.</em>
                : l}
              <br />
            </span>
          ))}
        </div>
        {(data.mission || data.about) && (
          <div className="statement-sub">{firstSentence(data.mission || data.about)}</div>
        )}
      </div>

      {facts.length > 0 && (
        <div className="grid-facts">
          {facts.map(([k, v], i) => (
            <div key={i}>
              <div className="gf-k">{k}</div>
              <div className="gf-v">{v}</div>
            </div>
          ))}
        </div>
      )}

      <div className="colophon">
        <svg width="9" height="9" viewBox="0 0 11 11" aria-hidden>
          <circle cx="5.5" cy="5.5" r="5.5" fill={C.accent} />
          <path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
        Verified · Sahan
      </div>
    </section>
  );
}

// ── Page 2 · Chapter 01 — The firm ─────────────────────────────────
function Firm({ data }: { data: CompanyData }) {
  return (
    <section className="page inner">
      <div className="run">
        <span>{data.name}</span>
        <span>02</span>
      </div>

      <div className="ch">
        <div className="ch-no">Chapter 01 — The firm</div>
        <h1 className="ch-title">We deliver work that has to <em className="acc-i">last.</em></h1>
      </div>

      {data.about && <p className="lede">{data.about}</p>}

      <div className="tick" />

      {data.mission && (
        <div className="pq">
          <div className="pq-l">Mission</div>
          <p className="pq-q">{data.mission}</p>
        </div>
      )}
      {data.vision && (
        <div className="pq">
          <div className="pq-l">Vision</div>
          <p className="pq-q">{data.vision}</p>
        </div>
      )}

      {(data.sectors.length > 0 || data.services.length > 0) && (
        <div className="lists">
          {[
            { label: "Sectors", items: data.sectors },
            { label: "Services", items: data.services },
          ].filter((c) => c.items.length).map((col, i) => (
            <div key={i}>
              <div className="list-h">{col.label}</div>
              {col.items.map((s, j) => (
                <div key={j} className={j < col.items.length - 1 ? "list-row" : "list-row list-row-last"}>{s}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      <PageFoot data={data} page="02" />
    </section>
  );
}

// ── Page 3 · Chapter 02 — The work ─────────────────────────────────
function Work({ data }: { data: CompanyData }) {
  return (
    <section className="page inner">
      <div className="run">
        <span>{data.name}</span>
        <span>03</span>
      </div>

      <div className="ch">
        <div className="ch-no">Chapter 02 — The work</div>
        <h1 className="ch-title">Selected <em className="acc-i">projects.</em></h1>
      </div>

      <div className="projects">
        {data.projects.map((p, i) => (
          <article key={i} className="pr">
            <span className="pr-num">{String(i + 1).padStart(2, "0")}</span>
            <div className="pr-body">
              <div className="pr-title-row">
                <span className="pr-title">{p.name}</span>
                {p.verified && <VerifiedPill note={p.verifiedNote} />}
              </div>
              {(p.client || p.yearRange) && (
                <div className="pr-meta">{[p.client, p.yearRange].filter(Boolean).join("  ·  ")}</div>
              )}
              {p.scope && <p className="pr-scope">{p.scope}</p>}
            </div>
            {p.value && <div className="pr-value">{p.value}</div>}
          </article>
        ))}
      </div>

      {data.clients.length > 0 && (
        <div className="cl">
          <div className="list-h">Clients &amp; donors</div>
          <p className="cl-line">{data.clients.join("  ·  ")}</p>
        </div>
      )}

      <div className="two">
        {data.team.length > 0 && (
          <div>
            <div className="list-h">Key personnel</div>
            {data.team.map((m) => (
              <div key={m.id} className="tm-row">
                <span className="tm-name">{m.name}</span>
                {m.role && <span className="tm-role"> — {m.role}</span>}
              </div>
            ))}
          </div>
        )}
        {data.certifications.length > 0 && (
          <div>
            <div className="list-h">Accreditations</div>
            {data.certifications.map((c, i) => (
              <div key={i} className="tm-row">
                <span className="tm-name">{c.name}</span>
                {(c.issuer || c.year) && <span className="tm-role"> — {[c.issuer, c.year].filter(Boolean).join(", ")}</span>}
                {c.verified && <> <VerifiedPill small note={c.verifiedNote} /></>}
              </div>
            ))}
          </div>
        )}
      </div>

      <PageFoot data={data} page="03" />
    </section>
  );
}

// ── shared pieces ───────────────────────────────────────────────────
function PageFoot({ data, page }: { data: CompanyData; page: string }) {
  return (
    <div className="foot">
      <span>{data.name}</span>
      <span className="foot-acc">Sahan · Verified</span>
      <span>{page}</span>
    </div>
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

// ── helpers ─────────────────────────────────────────────────────────
// One word per line, capped at 4 lines (overflow words join the
// second-to-last line) so "Wadani Engineering Group" stacks like the
// prototype's We/build/Somalia.
function nameLines(name: string): string[] {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 4) return words;
  const last = words[words.length - 1];
  const head = words.slice(0, 3);
  const mid = words.slice(3, -1).join(" ");
  return [...head.slice(0, 2), [head[2], mid].filter(Boolean).join(" "), last];
}
// Auto-fit: longest line should fill the ~176mm measure. Source Serif at
// weight 250 averages ~0.5em per glyph; 176mm ≈ 499pt.
function fitSize(lines: string[]): number {
  const longest = Math.max(...lines.map((l) => l.length), 1);
  const size = Math.floor(499 / (0.52 * longest + 0.6)); // +0.6 ≈ the terminal period
  return Math.max(30, Math.min(92, size));
}
function dottedInitials(name: string): string {
  const init = name.trim().split(/\s+/).slice(0, 3).map((w) => w[0]?.toUpperCase() ?? "");
  return init.join(".");
}
function firstSentence(s: string): string {
  const m = s.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : s).trim();
}
function coverFacts(d: CompanyData): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  if (d.foundedYear) out.push(["Founded", d.foundedYear]);
  if (d.registrationNumber) out.push(["Reg.", d.registrationNumber]);
  if (d.country) out.push(["HQ", d.country]);
  if (d.team.length) out.push(["Staff", String(d.team.length)]);
  if (d.sectors.length) out.push(["Sectors", String(d.sectors.length)]);
  if (d.website) out.push(["Web", d.website]);
  return out.slice(0, 6);
}
function romanize(n: number): string {
  if (!Number.isFinite(n) || n < 1 || n > 3999) return String(n);
  const t: Array<[number, string]> = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "", v = n;
  for (const [num, sym] of t) { while (v >= num) { out += sym; v -= num; } }
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
  background: ${C.bg};
  color: ${C.ink};
  font-family: ${SANS};
  font-kerning: normal;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.page:last-child { page-break-after: auto; }

/* ── Cover ─────────────────────────────────────────────────────── */
.cover { padding: 17mm 17mm 15mm; box-sizing: border-box; }
.wash {
  position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(circle at 0% 0%, rgba(10,92,173,0.05), transparent 42%);
}
.corners {
  display: flex; justify-content: space-between; align-items: flex-start;
  font-size: 8pt; letter-spacing: 0.2em; text-transform: uppercase;
  color: ${C.muted}; font-weight: 600;
}
.lockup { margin-top: 7mm; display: flex; align-items: center; gap: 4mm; }
.lockup-mono {
  font-family: ${SERIF};
  font-size: 17pt; font-weight: 400; font-style: italic;
  letter-spacing: -0.02em; color: ${C.accent};
}
.lockup-dash { width: 6mm; height: 1px; background: ${C.ink}; display: inline-block; }
.lockup-est {
  font-size: 7.5pt; letter-spacing: 0.2em; text-transform: uppercase;
  color: ${C.muted}; font-weight: 600;
}

.statement { position: absolute; left: 17mm; right: 17mm; top: 84mm; }
.statement-name {
  font-family: ${SERIF};
  font-weight: 250;
  letter-spacing: -0.05em; line-height: 0.9;
  color: ${C.ink};
}
.statement-acc { font-style: italic; color: ${C.accent}; font-weight: 280; }
.statement-sub {
  margin-top: 9mm;
  font-size: 9pt; color: ${C.muted};
  letter-spacing: 0.16em; text-transform: uppercase; font-weight: 700;
  max-width: 112mm; line-height: 1.75;
}

.grid-facts {
  position: absolute; bottom: 15mm; left: 17mm; right: 17mm;
  padding-top: 5mm; border-top: 0.6mm solid ${C.ink};
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 4mm; align-items: baseline;
}
.gf-k {
  font-size: 6.5pt; color: ${C.muted};
  letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700;
}
.gf-v {
  font-family: ${SERIF};
  font-size: 10.5pt; margin-top: 1.2mm; font-weight: 400;
  letter-spacing: -0.005em; word-break: break-word;
}
.colophon {
  position: absolute; bottom: 6mm; right: 17mm;
  display: flex; align-items: center; gap: 1.8mm;
  font-size: 6.5pt; color: ${C.muted};
  letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700;
}

/* ── Interior pages ────────────────────────────────────────────── */
.inner { padding: 16mm 20mm 16mm; box-sizing: border-box; }
.run {
  display: flex; justify-content: space-between;
  font-size: 7.5pt; color: ${C.muted};
  letter-spacing: 0.2em; text-transform: uppercase; font-weight: 600;
}
.ch { margin-top: 13mm; }
.ch-no {
  font-size: 8pt; color: ${C.accent};
  letter-spacing: 0.24em; text-transform: uppercase; font-weight: 700;
  margin-bottom: 5mm;
}
.ch-title {
  font-family: ${SERIF};
  font-size: 38pt; font-weight: 280;
  letter-spacing: -0.04em; line-height: 0.98; margin: 0; max-width: 150mm;
}
.acc-i { font-style: italic; color: ${C.accent}; }

.lede {
  margin-top: 10mm;
  font-size: 11.5pt; line-height: 1.7; color: ${C.ink};
  max-width: 135mm; font-weight: 400;
}
.tick { height: 1px; background: ${C.ink}; margin-top: 11mm; width: 16mm; }

.pq { margin-top: 8mm; display: grid; grid-template-columns: 28mm 1fr; gap: 8mm; align-items: start; }
.pq-l {
  font-size: 7.5pt; color: ${C.muted};
  letter-spacing: 0.22em; text-transform: uppercase; font-weight: 700;
  padding-top: 2mm;
}
.pq-q {
  font-family: ${SERIF};
  font-size: 16.5pt; line-height: 1.38; font-style: italic;
  margin: 0; font-weight: 400; color: ${C.ink}; letter-spacing: -0.012em;
}

.lists { margin-top: 12mm; display: grid; grid-template-columns: 1fr 1fr; gap: 16mm; }
.list-h {
  font-size: 8pt; color: ${C.accent};
  letter-spacing: 0.22em; text-transform: uppercase; font-weight: 700;
  padding-bottom: 3.5mm; border-bottom: 1px solid ${C.ink};
}
.list-row {
  font-family: ${SERIF};
  font-size: 11.5pt; font-weight: 400;
  padding: 3.2mm 0; border-bottom: 1px solid ${C.rule};
  letter-spacing: -0.005em;
}
.list-row-last { border-bottom: none; }

/* ── Projects ──────────────────────────────────────────────────── */
.projects { margin-top: 8mm; }
.pr {
  display: grid; grid-template-columns: 10mm 1fr 25mm; gap: 5mm;
  padding: 5mm 0; border-top: 1px solid ${C.rule};
  break-inside: avoid; page-break-inside: avoid;
}
.pr:first-child { border-top: 0.6mm solid ${C.ink}; }
.pr-num { font-family: ${MONO}; font-size: 8pt; color: ${C.muted}; padding-top: 1.5mm; }
.pr-title-row { display: flex; align-items: center; gap: 2.5mm; flex-wrap: wrap; }
.pr-title {
  font-family: ${SERIF};
  font-size: 13.5pt; font-weight: 400; letter-spacing: -0.015em;
}
.pr-meta {
  font-size: 7.5pt; color: ${C.muted}; margin-top: 1.2mm;
  letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600;
}
.pr-scope { font-size: 9.5pt; line-height: 1.6; color: ${C.ink}; margin: 2mm 0 0; max-width: 122mm; }
.pr-value {
  font-family: ${SERIF};
  font-size: 12.5pt; font-weight: 400; text-align: right;
  letter-spacing: -0.01em; padding-top: 1mm;
  font-feature-settings: "tnum";
}

.cl { margin-top: 8mm; }
.cl-line { margin: 3.5mm 0 0; font-family: ${SERIF}; font-size: 10.5pt; line-height: 1.8; }

.two { margin-top: 9mm; display: grid; grid-template-columns: 1fr 1fr; gap: 14mm; }
.tm-row { padding: 2.4mm 0; border-bottom: 1px solid ${C.rule}; font-size: 9.5pt; }
.tm-name { font-family: ${SERIF}; font-size: 10.5pt; }
.tm-role { color: ${C.muted}; font-size: 9pt; }

.foot {
  position: absolute; bottom: 9mm; left: 20mm; right: 20mm;
  display: flex; justify-content: space-between;
  font-size: 7pt; color: ${C.muted};
  letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700;
  padding-top: 3mm; border-top: 1px solid ${C.rule};
}
.foot-acc { color: ${C.accent}; }

.vbadge, .vbadge-sm {
  display: inline-flex; align-items: center; gap: 1.2mm;
  font-family: ${SANS};
  font-weight: 600; color: ${C.verifiedFg}; background: ${C.verifiedBg};
  padding: 0.5mm 2mm 0.5mm 1.2mm; border-radius: 99px;
  letter-spacing: 0.02em; white-space: nowrap;
}
.vbadge { font-size: 7pt; }
.vbadge-sm { font-size: 6.5pt; }
.vbadge svg, .vbadge-sm svg { display: inline-block; vertical-align: middle; }
`;
