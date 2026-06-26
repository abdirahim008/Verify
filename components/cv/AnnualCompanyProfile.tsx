import "server-only";
import type { CompanyData } from "@/lib/pdf/company-data";
import { deriveAccent, monogram, type AccentSet } from "./companyShared";
import {
  INK, BODY, MUTE, FAINT, RULE, band, paragraphs, ceoVisible, orgVisible,
  CeoAvatar, ContactBlock, CompanyOrgChart, CompanyClientGroups, CompanyProjects,
  projectsVisible, galleryVisible, CompanyGallery, SHELL_CSS,
} from "./companyProfileParts";

// Company Profile — "Annual". The report register: a light, left-aligned
// masthead with heavy rules, §-numbered sections, and a data-driven stat
// band on the cover. Source Serif 4 display + Public Sans body + IBM Plex
// Mono section numbers. Default accent: Navy. Built on the shared
// new-system parts so it carries the full section set (CEO, values,
// services, gallery, org chart, grouped client logos).

const SERIF = "'Source Serif 4', Georgia, serif";
const SANS = "'Public Sans', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

export function AnnualCompanyProfile({ data, theme }: { data: CompanyData; theme?: Record<string, string> }) {
  const A = deriveAccent(theme?.accent ?? "#20304d");
  const blurb = data.coverStatement || data.mission || data.about;
  const stats = computeStats(data);
  const locations = data.locations.join(" · ");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHELL_CSS }} />

      {/* ── COVER ── */}
      <div className="cpage" style={{ fontFamily: SANS, padding: "56px 60px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderTop: `3px solid ${A.accent}`, paddingTop: 16, ...band }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: A.accent }}>Company Profile / {data.year}</span>
          {data.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logoUrl} alt="" style={{ height: 48, maxWidth: 200, objectFit: "contain" }} />
          ) : (
            <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 26, color: A.accent }}>{monogram(data.name)}</span>
          )}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: 60, letterSpacing: "-0.015em", lineHeight: 1.02, color: INK }}>{data.name}</h1>
          {data.tagline && <div style={{ marginTop: 14, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.26em", color: A.accent }}>{data.tagline}</div>}
          {blurb && <p style={{ margin: "22px 0 0", maxWidth: 460, fontFamily: SERIF, fontSize: 19, lineHeight: 1.5, color: BODY }}>{firstSentence(blurb)}</p>}
        </div>

        {stats.length > 0 ? (
          <div style={{ display: "flex", borderTop: `1px solid ${RULE}`, paddingTop: 18 }}>
            {stats.map(([n, l, s], i) => (
              <div key={i} style={{ flex: 1, paddingLeft: i > 0 ? 18 : 0, borderLeft: i > 0 ? `1px solid ${RULE}` : "none" }}>
                <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 30, color: A.accent, lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: A.accent, marginTop: 8 }}>{l}</div>
                <div style={{ fontSize: 10.5, color: MUTE, marginTop: 2 }}>{s}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ borderTop: `1px solid ${RULE}`, paddingTop: 16, fontSize: 12, color: MUTE }}>{[locations, data.email, data.website].filter(Boolean).join("   ·   ")}</div>
        )}
      </div>

      {/* ── PAGE 1: Overview ── */}
      <div className="cpage" style={{ fontFamily: SANS, padding: "54px 60px", display: "flex", flexDirection: "column" }}>
        <RunHead name={data.name} page="02" A={A} />
        {data.about && (
          <section style={{ marginTop: 26 }}>
            <Head A={A} no="01">About the Firm</Head>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.66, color: BODY, columnCount: 2, columnGap: 30, textAlign: "justify" }}>{data.about}</p>
          </section>
        )}
        {(data.mission || data.vision) && (
          <div style={{ display: "grid", gridTemplateColumns: data.mission && data.vision ? "1fr 1fr" : "1fr", gap: 16, marginTop: 24 }}>
            {data.mission && <MvBox A={A} label="Mission" text={data.mission} />}
            {data.vision && <MvBox A={A} label="Vision" text={data.vision} dark />}
          </div>
        )}
        {data.values.length > 0 && (
          <section style={{ marginTop: 26 }}>
            <Head A={A} no="02">Our Values</Head>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px 30px" }}>
              {data.values.map((v, i) => (
                <div key={i} style={{ display: "flex", gap: 10, paddingBottom: 8, borderBottom: `1px solid ${RULE}` }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: A.accent, marginTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15, color: INK }}>{v.name}</div>
                    {v.description && <div style={{ fontSize: 12, color: MUTE, lineHeight: 1.45 }}>{v.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── PAGE 2: CEO + Services ── */}
      <div className="cpage" style={{ fontFamily: SANS, padding: "54px 60px", display: "flex", flexDirection: "column" }}>
        <RunHead name={data.name} page="03" A={A} />
        {ceoVisible(data) && (
          <section style={{ marginTop: 26 }}>
            <Head A={A} no="03">Leadership</Head>
            <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
              <div style={{ flex: "none", textAlign: "center", width: 92 }}>
                <CeoAvatar data={data} A={A} font={SERIF} size={92} />
                {data.ceo.name && <div style={{ fontWeight: 700, fontSize: 13, color: INK, marginTop: 12 }}>{data.ceo.name}</div>}
                {data.ceo.title && <div style={{ fontSize: 11.5, color: MUTE }}>{data.ceo.title}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {data.ceo.quote && <p style={{ margin: "0 0 13px", fontFamily: SERIF, fontStyle: "italic", fontSize: 20, lineHeight: 1.42, color: A.accent }}>&ldquo;{data.ceo.quote}&rdquo;</p>}
                {paragraphs(data.ceo.message).map((para, i) => (
                  <p key={i} style={{ margin: "0 0 11px", fontSize: 13.5, lineHeight: 1.62, color: BODY }}>{para}</p>
                ))}
                {data.ceo.name && <div style={{ marginTop: 14, fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: INK }}>{data.ceo.name}</div>}
              </div>
            </div>
          </section>
        )}
        {data.servicesFull.length > 0 && (
          <section style={{ marginTop: 30 }}>
            <Head A={A} no="04">Services</Head>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 36px" }}>
              {data.servicesFull.map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 16, color: INK }}>{s.name}</div>
                  {s.description && <div style={{ fontSize: 12.5, color: MUTE, lineHeight: 1.55, marginTop: 3 }}>{s.description}</div>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── PAGE: Selected Projects ── */}
      {projectsVisible(data) && (
        <div className="cpage" style={{ fontFamily: SANS, padding: "54px 60px", display: "flex", flexDirection: "column" }}>
          <RunHead name={data.name} page="04" A={A} />
          <section style={{ marginTop: 26 }}>
            <Head A={A} no="05">Delivery Record</Head>
            <CompanyProjects data={data} A={A} headFont={SERIF} />
          </section>
        </div>
      )}

      {/* ── PAGE: Project gallery ── */}
      {galleryVisible(data) && (
        <div className="cpage" style={{ fontFamily: SANS, padding: "54px 60px", display: "flex", flexDirection: "column" }}>
          <RunHead name={data.name} page="05" A={A} />
          <section style={{ marginTop: 26 }}>
            <Head A={A} no="06">Project Gallery</Head>
            <CompanyGallery data={data} headFont={SERIF} />
          </section>
        </div>
      )}

      {/* ── PAGE: Org + Clients + CTA ── */}
      <div className="cpage" style={{ fontFamily: SANS, padding: "54px 60px", display: "flex", flexDirection: "column" }}>
        <RunHead name={data.name} page="06" A={A} />
        {orgVisible(data) && (
          <section style={{ marginTop: 26 }}>
            <Head A={A} no="07">Organisation</Head>
            <CompanyOrgChart data={data} A={A} nameFont={SERIF} unitFont={SANS} />
          </section>
        )}
        {data.clientGroups.length > 0 && (
          <section style={{ marginTop: 30 }}>
            <Head A={A} no="08">Clients &amp; Donors</Head>
            <CompanyClientGroups data={data} A={A} variant="bordered" chipFont={SERIF} />
          </section>
        )}
        <div style={{ marginTop: 28, background: A.accent, borderRadius: 8, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, color: A.onAccent, ...band }}>
          <div>
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 20 }}>Let&rsquo;s work together.</div>
            {locations && <div style={{ fontSize: 12.5, color: A.onAccentMuted, marginTop: 3 }}>{locations}</div>}
          </div>
          <ContactBlock data={data} color={A.onAccentMuted} />
        </div>
      </div>
    </>
  );
}

function Head({ A, no, children }: { A: AccentSet; no: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, paddingBottom: 8, marginBottom: 16, borderBottom: `2px solid ${A.accent}`, ...band }}>
      <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: A.accent }}>§{no}</span>
      <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 20, color: INK }}>{children}</span>
    </div>
  );
}
function MvBox({ A, label, text, dark }: { A: AccentSet; label: string; text: string; dark?: boolean }) {
  return (
    <div style={{ background: dark ? A.accent : A.tint, border: dark ? "none" : `1px solid ${A.tintBorder}`, borderRadius: 6, padding: 20, color: dark ? A.onAccent : undefined, ...band }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em", color: dark ? A.onAccentMuted : A.accent, marginBottom: 7 }}>{label}</div>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 17, lineHeight: 1.42, color: dark ? A.onAccent : "#2a2722" }}>{text}</p>
    </div>
  );
}
function RunHead({ name, page, A }: { name: string; page: string; A: AccentSet }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 12, borderBottom: `1px solid ${RULE}` }}>
      <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15, color: INK }}>{name}</span>
      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: FAINT }}>Company Profile · {page}</span>
    </div>
  );
}

// First sentence of a blurb, for the cover tag-line.
function firstSentence(s: string): string {
  const m = s.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : s).trim();
}
// Years since founding, when a sane founded-year is present.
function yearsOperating(d: CompanyData): number | null {
  const f = Number(d.foundedYear);
  if (!Number.isFinite(f) || f < 1800) return null;
  const y = d.year - f;
  return y > 0 ? y : null;
}
// Cover stat tiles — render only what the data supports, prefer entered
// counts, fall back to derived figures.
function computeStats(d: CompanyData): Array<[string, string, string]> {
  const out: Array<[string, string, string]> = [];
  const years = yearsOperating(d);
  if (years) out.push([String(years), "Years", "Operating"]);
  const total = d.projects.reduce((s, p) => s + (p.valueAmount ?? 0), 0);
  if (total >= 1_000_000) out.push([`$${(total / 1_000_000).toFixed(total >= 10_000_000 ? 0 : 1)}M+`, "Delivered", "Project value"]);
  else if (total >= 1_000) out.push([`$${Math.round(total / 1_000)}K+`, "Delivered", "Project value"]);
  const projectCount = d.projectsCount || (d.projects.length ? String(d.projects.length) : "");
  if (projectCount) out.push([projectCount, "Projects", "On the record"]);
  if (d.countriesCount) out.push([d.countriesCount, "Countries", "Footprint"]);
  else if (d.staffCount) out.push([d.staffCount, "Specialists", "On staff"]);
  return out.slice(0, 4);
}
