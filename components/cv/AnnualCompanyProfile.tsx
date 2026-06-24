import "server-only";
import type { CompanyData } from "@/lib/pdf/company-data";

// Company Profile — "Annual Report" register. White & navy, architectural
// grid lines, big serif title in the banner, stat tiles, §-numbered
// sections. Ported from pdfs/company-profile-annual.jsx and extended to a
// full 3-page document (Cover · About · Delivery record).
//
// The prototype's site-photograph strip becomes a data-driven identity
// panel: the uploaded logo when present, otherwise a serif monogram on
// the same blueprint-stripe texture.

// Base palette. Curated themes (lib/pdf/themes.ts) swap the navy family;
// paper + verified greens stay constant.
const BASE = {
  navy: "#0d3b66",
  navyDeep: "#072044",
  cream: "#fafaf7",
  ink: "#101418",
  muted: "#5e6166",
  rule: "#d8dde3",
  banner: "#cfd6e0",
  bannerDim: "#b6c4d6",
  verifiedBg: "#dcebe2",
  verifiedFg: "#1d6647",
};
type Palette = typeof BASE;

const SERIF = `"Source Serif 4", Georgia, serif`;
const SANS = `"Public Sans", "Source Sans 3", system-ui, sans-serif`;
const MONO = `"IBM Plex Mono", ui-monospace, monospace`;

export function AnnualCompanyProfile({ data, theme }: { data: CompanyData; theme?: Record<string, string> }) {
  const C: Palette = { ...BASE, ...theme };
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles(C) }} />
      <Cover data={data} C={C} />
      <About data={data} />
      <Projects data={data} />
    </>
  );
}

// ── Page 1 · Cover ──────────────────────────────────────────────────
function Cover({ data, C }: { data: CompanyData; C: Palette }) {
  const stats = computeStats(data);
  return (
    <section className="page cover">
      <div className="band">
        <svg className="band-grid" width="794" height="265" aria-hidden>
          <g stroke="#fff" strokeWidth="0.6" fill="none">
            <line x1="120" y1="0" x2="120" y2="265" />
            <line x1="320" y1="0" x2="320" y2="265" />
            <line x1="520" y1="0" x2="520" y2="265" />
            <line x1="720" y1="0" x2="720" y2="265" />
            <line x1="0" y1="88" x2="794" y2="88" />
            <line x1="0" y1="176" x2="794" y2="176" />
          </g>
        </svg>
        <div className="band-head">
          <span className="band-head-l"><span className="band-tick" />Company Profile</span>
          <span>Edition · {romanize(data.year)}</span>
        </div>
        <h1 className="band-title">{renderName(data.name)}</h1>
      </div>

      {/* Identity panel, overlapping the band */}
      <div className="panel-wrap">
        <div className="panel">
          {data.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logoUrl} alt="" className="panel-logo" />
          ) : (
            <div className="panel-mono">{monogram(data.name)}<span className="panel-mono-dot">.</span></div>
          )}
        </div>
      </div>

      <div className="intro">
        {(data.foundedYear || data.country) && (
          <div className="intro-est">
            Established {[data.country, data.foundedYear].filter(Boolean).join(", ")}
          </div>
        )}
        {(data.mission || data.about) && (
          <h2 className="intro-tag">{firstSentence(data.mission || data.about)}</h2>
        )}
      </div>

      {stats.length > 0 && (
        <div className="facts">
          {stats.map(([n, l, s], i) => (
            <div key={i} className={i > 0 ? "fact fact-bordered" : "fact"}>
              <div className="fact-n">{n}</div>
              <div className="fact-l">{l}</div>
              <div className="fact-s">{s}</div>
            </div>
          ))}
        </div>
      )}

      <div className="seal">
        <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden>
          <circle cx="5.5" cy="5.5" r="5.5" fill={C.navy} />
          <path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
        Verified on Sahan
      </div>
      {/* C threads in from the parent so the seal follows the theme. */}
    </section>
  );
}

// ── Page 2 · About ──────────────────────────────────────────────────
function About({ data }: { data: CompanyData }) {
  const years = yearsOperating(data);
  return (
    <section className="page inner">
      <RunningHead name={data.name} page="02" />

      <div className="sec">
        <div className="sec-no">§ 01 · About the firm</div>
        <h1 className="sec-title">
          {years ? <>{years} years of <em className="acc-i">delivery.</em></> : <>The firm, <em className="acc-i">on the record.</em></>}
        </h1>
      </div>

      {data.about && <p className="lead">{data.about}</p>}

      {(data.mission || data.vision) && (
        <div className="mv">
          {data.mission && (
            <div className="mv-card mv-light">
              <div className="mv-l">Mission</div>
              <p className="mv-q">&ldquo;{data.mission}&rdquo;</p>
            </div>
          )}
          {data.vision && (
            <div className="mv-card mv-navy">
              <div className="mv-l mv-l-dim">Vision</div>
              <p className="mv-q">&ldquo;{data.vision}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {(data.sectors.length > 0 || data.services.length > 0) && (
        <div className="cols">
          {[
            { no: "02", label: "Sectors", items: data.sectors },
            { no: "03", label: "Services", items: data.services },
          ].filter((c) => c.items.length).map((col) => (
            <div key={col.no}>
              <div className="col-h">§ {col.no} · {col.label}</div>
              {col.items.map((s, j) => (
                <div key={j} className={j < col.items.length - 1 ? "col-row" : "col-row col-row-last"}>
                  <span className="col-num">{String(j + 1).padStart(2, "0")}.</span>
                  <span className="col-item">{s}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {data.clients.length > 0 && (
        <div className="clients">
          <div className="col-h">§ 04 · Selected clients &amp; donors</div>
          <p className="clients-line">{data.clients.join("  ·  ")}</p>
        </div>
      )}

      <PageFoot data={data} page="02" />
    </section>
  );
}

// ── Page 3 · Delivery record ────────────────────────────────────────
function Projects({ data }: { data: CompanyData }) {
  return (
    <section className="page inner">
      <RunningHead name={data.name} page="03" />

      <div className="sec">
        <div className="sec-no">§ 05 · Selected projects</div>
        <h1 className="sec-title">Delivery <em className="acc-i">record.</em></h1>
        <p className="sec-blurb">
          Verified entries are independently confirmed by the named client or donor. Unverified entries are listed but not vouched for.
        </p>
      </div>

      <div className="ledger">
        {data.projects.map((p, i) => (
          <article key={i} className="lg-row">
            <span className="lg-num">{String(i + 1).padStart(2, "0")}.</span>
            <div className="lg-body">
              <div className="lg-title-row">
                <span className="lg-title">{p.name}</span>
                {p.verified && <VerifiedPill note={p.verifiedNote} />}
              </div>
              {(p.client || p.yearRange || p.sector) && (
                <div className="lg-meta">{[p.client, p.sector, p.yearRange].filter(Boolean).join(" · ")}</div>
              )}
              {p.scope && <p className="lg-scope">{p.scope}</p>}
            </div>
            {p.value && <div className="lg-value">{p.value}</div>}
          </article>
        ))}
      </div>

      {data.team.length > 0 && (
        <div className="team">
          <div className="col-h">§ 06 · Key personnel</div>
          <div className="team-grid">
            {data.team.map((m) => (
              <div key={m.id} className="team-row">
                <div className="team-name">{m.name}</div>
                {m.role && <div className="team-role">{m.role}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.certifications.length > 0 && (
        <div className="certs">
          <div className="col-h">§ 07 · Accreditations</div>
          {data.certifications.map((c, i) => (
            <div key={i} className="cert-row">
              <span className="cert-name">{c.name}</span>
              {(c.issuer || c.year) && <span className="cert-meta"> · {[c.issuer, c.year].filter(Boolean).join(", ")}</span>}
              {c.verified && <VerifiedPill small note={c.verifiedNote} />}
            </div>
          ))}
        </div>
      )}

      <PageFoot data={data} page="03" />
    </section>
  );
}

// ── shared pieces ───────────────────────────────────────────────────
function RunningHead({ name, page }: { name: string; page: string }) {
  return (
    <div className="run">
      <span>{name}</span>
      <span>Company Profile · {page}</span>
    </div>
  );
}
function PageFoot({ data, page }: { data: CompanyData; page: string }) {
  return (
    <div className="foot">
      <span>{data.website || data.name}</span>
      <span className="foot-acc">Verified on Sahan</span>
      <span>Page {page}</span>
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
function renderName(name: string) {
  const tokens = name.trim().split(/\s+/);
  if (!tokens.length) return null;
  const last = tokens.pop()!;
  return (
    <>
      {tokens.length > 0 && <>{tokens.join(" ")}<br /></>}
      <em className="band-title-i">{last}.</em>
    </>
  );
}
function monogram(name: string): string {
  return name.trim().split(/\s+/).slice(0, 3).map((w) => w[0]?.toUpperCase() ?? "").join("");
}
function firstSentence(s: string): string {
  const m = s.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : s).trim();
}
function yearsOperating(d: CompanyData): number | null {
  const f = Number(d.foundedYear);
  if (!Number.isFinite(f) || f < 1800) return null;
  const y = d.year - f;
  return y > 0 ? y : null;
}
// Stat tiles — only render what the data actually supports.
function computeStats(d: CompanyData): Array<[string, string, string]> {
  const out: Array<[string, string, string]> = [];
  const years = yearsOperating(d);
  if (years) out.push([String(years), "Years", "Operating"]);
  const total = d.projects.reduce((s, p) => s + (p.valueAmount ?? 0), 0);
  if (total >= 1_000_000) out.push([`$${(total / 1_000_000).toFixed(total >= 10_000_000 ? 0 : 1)}M+`, "Delivered", "Project value"]);
  else if (total >= 1_000) out.push([`$${Math.round(total / 1_000)}K+`, "Delivered", "Project value"]);
  if (d.projects.length) out.push([String(d.projects.length), "Projects", "On the record"]);
  const partners = new Set(d.projects.map((p) => p.client).filter(Boolean)).size;
  if (partners) out.push([String(partners), "Partners", "Clients & donors"]);
  if (out.length < 4 && d.team.length) out.push([String(d.team.length), "Staff", "Key personnel"]);
  return out.slice(0, 4);
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
  background: ${C.cream};
  color: ${C.ink};
  font-family: ${SANS};
  font-kerning: normal;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.page:last-child { page-break-after: auto; }

/* ── Cover ─────────────────────────────────────────────────────── */
.band {
  height: 70mm;
  background: linear-gradient(180deg, ${C.navy} 0%, ${C.navyDeep} 100%);
  position: relative; overflow: hidden;
}
.band-grid { position: absolute; inset: 0; opacity: 0.16; }
.band-head {
  position: absolute; top: 13mm; left: 17mm; right: 17mm;
  display: flex; justify-content: space-between; align-items: center;
  color: ${C.banner};
  font-size: 8pt; font-weight: 600;
  letter-spacing: 0.2em; text-transform: uppercase;
}
.band-head-l { display: inline-flex; align-items: center; gap: 2.5mm; }
.band-tick { width: 8mm; height: 1px; background: ${C.banner}; display: inline-block; }
.band-title {
  position: absolute; bottom: 9mm; left: 17mm; right: 17mm;
  font-family: ${SERIF};
  font-size: 38pt; font-weight: 350;
  letter-spacing: -0.025em; line-height: 1.0;
  margin: 0; color: #ffffff;
}
.band-title-i { font-style: italic; font-weight: 300; color: ${C.bannerDim}; }

.panel-wrap { margin: 0 17mm; margin-top: -11mm; position: relative; z-index: 2; }
.panel {
  height: 52mm;
  background-color: #e3e8ef;
  background-image: repeating-linear-gradient(45deg, #d3dae3 0px, #d3dae3 1px, #e3e8ef 1px, #e3e8ef 12px);
  border: 1px solid ${C.rule}; border-radius: 1.5mm;
  display: flex; align-items: center; justify-content: center;
}
.panel-logo { max-height: 34mm; max-width: 90mm; object-fit: contain; }
.panel-mono {
  font-family: ${SERIF};
  font-size: 42pt; font-weight: 350; letter-spacing: -0.02em;
  color: ${C.navyDeep};
}
.panel-mono-dot { color: ${C.navy}; font-style: italic; }

.intro { padding: 11mm 17mm 0; }
.intro-est {
  font-size: 8pt; color: ${C.navy};
  letter-spacing: 0.22em; text-transform: uppercase; font-weight: 700;
}
.intro-tag {
  font-family: ${SERIF};
  font-size: 19pt; font-weight: 400; font-style: italic;
  letter-spacing: -0.015em; line-height: 1.3;
  margin: 5mm 0 0; max-width: 152mm;
  color: ${C.navyDeep};
}

.facts {
  position: absolute; bottom: 16mm; left: 17mm; right: 17mm;
  padding-top: 6mm; border-top: 1px solid ${C.rule};
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 4mm;
}
.fact-bordered { border-left: 1px solid ${C.rule}; padding-left: 5mm; }
.fact-n {
  font-family: ${SERIF};
  font-size: 27pt; font-weight: 400; color: ${C.navyDeep};
  letter-spacing: -0.02em; line-height: 1;
  font-feature-settings: "tnum";
}
.fact-l {
  font-size: 7.5pt; color: ${C.navy}; margin-top: 2.5mm;
  letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700;
}
.fact-s { font-size: 8.5pt; color: ${C.muted}; margin-top: 0.6mm; }

.seal {
  position: absolute; bottom: 5mm; right: 6mm;
  display: flex; align-items: center; gap: 1.8mm;
  font-size: 7pt; color: ${C.muted};
  letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600;
}

/* ── Interior pages ────────────────────────────────────────────── */
.inner { padding: 14mm 17mm 16mm; }
.run {
  display: flex; justify-content: space-between;
  font-size: 7.5pt; color: ${C.muted};
  letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600;
  padding-bottom: 3mm; border-bottom: 1px solid ${C.rule};
}
.sec { margin-top: 9mm; }
.sec-no {
  font-size: 8pt; color: ${C.navy};
  letter-spacing: 0.22em; text-transform: uppercase; font-weight: 700;
  margin-bottom: 4mm;
}
.sec-title {
  font-family: ${SERIF};
  font-size: 32pt; font-weight: 350;
  letter-spacing: -0.025em; line-height: 1.02; margin: 0; max-width: 150mm;
}
.acc-i { font-style: italic; color: ${C.navy}; }
.sec-blurb { font-size: 9.5pt; color: ${C.muted}; max-width: 130mm; margin: 4mm 0 0; line-height: 1.55; }

.lead {
  margin-top: 8mm;
  font-size: 11pt; line-height: 1.7; color: ${C.ink};
  column-count: 2; column-gap: 10mm;
  text-align: justify; hyphens: auto;
}

.mv { margin-top: 9mm; display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
.mv-card { padding: 7mm 8mm; border-radius: 1.5mm; }
.mv-light { background: #ffffff; border: 1px solid ${C.rule}; }
.mv-navy { background: ${C.navy}; color: #ffffff; }
.mv-l {
  font-size: 7.5pt; color: ${C.navy};
  letter-spacing: 0.22em; text-transform: uppercase; font-weight: 700;
}
.mv-l-dim { color: ${C.bannerDim}; }
.mv-q {
  font-family: ${SERIF};
  font-size: 13pt; line-height: 1.4; font-style: italic;
  margin: 3.5mm 0 0; font-weight: 400; letter-spacing: -0.005em;
}

.cols { margin-top: 10mm; display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; }
.col-h {
  font-size: 8pt; color: ${C.navy};
  letter-spacing: 0.22em; text-transform: uppercase; font-weight: 700;
  padding-bottom: 2.5mm; border-bottom: 1px solid ${C.navyDeep};
}
.col-row {
  display: flex; align-items: baseline; gap: 4mm;
  padding: 3mm 0; border-bottom: 1px solid ${C.rule};
}
.col-row-last { border-bottom: none; }
.col-num { font-family: ${MONO}; font-size: 8pt; color: ${C.muted}; width: 7mm; }
.col-item { font-size: 10.5pt; font-weight: 500; }

.clients { margin-top: 8mm; }
.clients-line {
  margin: 3.5mm 0 0;
  font-family: ${SERIF};
  font-size: 11pt; line-height: 1.8; color: ${C.ink};
}

/* ── Projects ledger ───────────────────────────────────────────── */
.ledger { margin-top: 7mm; border-top: 2px solid ${C.navyDeep}; }
.lg-row {
  display: grid; grid-template-columns: 9mm 1fr 26mm; gap: 4mm;
  padding: 4.5mm 0; border-bottom: 1px solid ${C.rule};
  break-inside: avoid; page-break-inside: avoid;
}
.lg-num { font-family: ${MONO}; font-size: 8.5pt; color: ${C.muted}; padding-top: 1mm; }
.lg-title-row { display: flex; align-items: center; gap: 2.5mm; flex-wrap: wrap; }
.lg-title {
  font-family: ${SERIF};
  font-size: 13pt; font-weight: 500; letter-spacing: -0.012em;
}
.lg-meta {
  font-family: ${SERIF};
  font-size: 9.5pt; font-style: italic; color: ${C.navy}; margin-top: 1mm;
}
.lg-scope { font-size: 9.5pt; line-height: 1.55; color: ${C.ink}; margin: 2mm 0 0; max-width: 125mm; }
.lg-value {
  font-family: ${SERIF};
  font-size: 14pt; font-weight: 400; color: ${C.navyDeep};
  text-align: right; letter-spacing: -0.01em; padding-top: 0.5mm;
  font-feature-settings: "tnum";
}

.team { margin-top: 9mm; }
.team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5mm 8mm; margin-top: 1mm; }
.team-row { padding: 2.2mm 0; border-bottom: 1px solid ${C.rule}; }
.team-name { font-family: ${SERIF}; font-size: 10.5pt; font-weight: 500; }
.team-role { font-size: 8.5pt; color: ${C.muted}; margin-top: 0.5mm; }

.certs { margin-top: 8mm; }
.cert-row {
  font-size: 10pt; color: ${C.ink}; margin-top: 2.5mm;
  display: flex; align-items: baseline; gap: 2mm; flex-wrap: wrap;
}
.cert-name { font-family: ${SERIF}; font-weight: 500; }
.cert-meta { font-size: 8.5pt; color: ${C.muted}; }

.foot {
  position: absolute; bottom: 9mm; left: 17mm; right: 17mm;
  display: flex; justify-content: space-between;
  font-size: 7pt; color: ${C.muted};
  letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600;
  padding-top: 3mm; border-top: 1px solid ${C.rule};
}
.foot-acc { color: ${C.navy}; }

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
