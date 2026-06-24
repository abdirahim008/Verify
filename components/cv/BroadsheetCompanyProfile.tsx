import "server-only";
import type { CompanyData } from "@/lib/pdf/company-data";
import { deriveAccent, monogram, profileLine } from "./companyShared";
import {
  INK, MUTE, FAINT, RULE, band, paragraphs, ceoVisible, orgVisible,
  CeoAvatar, ContactBlock, CompanyOrgChart, CompanyClientGroups, CompanyProjects,
  projectsVisible, SHELL_CSS,
} from "./companyProfileParts";

// Company Profile — "The Broadsheet" (Company-4-Two-Column). Editorial
// two-column overview with pill sectors. Archivo headings + Newsreader body.
// Default accent: Forest.

const DISP = "'Archivo', system-ui, sans-serif";
const BODYF = "'Newsreader', Georgia, serif";

export function BroadsheetCompanyProfile({ data, theme }: { data: CompanyData; theme?: Record<string, string> }) {
  const A = deriveAccent(theme?.accent ?? "#243d31");
  void monogram; // name-led design; no monogram mark
  const blurb = data.coverStatement || data.mission;
  const locations = data.locations.join(" · ");
  const contactRight = [data.email, data.website].filter(Boolean).join(" · ");
  const stats = [
    ["Founded", data.foundedYear],
    ["Specialists", data.staffCount],
    ["Countries", data.countriesCount],
    ["Projects", data.projectsCount],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHELL_CSS }} />

      {/* ── COVER ── */}
      <div className="cpage" style={{ fontFamily: BODYF, display: "flex", flexDirection: "column", padding: "64px 56px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", color: INK }}>{data.name}</span>
          <span style={{ fontFamily: DISP, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.26em", color: A.accent }}>{profileLine(data.year)}</span>
        </div>
        <div style={{ height: 2.5, background: A.accent, marginTop: 16, ...band }} />
        <div style={{ flex: 1 }} />
        <h1 style={{ margin: 0, fontFamily: DISP, fontWeight: 800, fontSize: 84, letterSpacing: "-0.03em", color: INK, lineHeight: 0.9 }}>{data.name}</h1>
        {data.tagline && <div style={{ marginTop: 22, fontFamily: DISP, fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.24em", color: A.accent }}>{data.tagline}</div>}
        {blurb && <p style={{ margin: "26px 0 0", maxWidth: 520, fontSize: 17, lineHeight: 1.55, color: "#52524c" }}>{blurb}</p>}
        <div style={{ flex: 1 }} />
        <div style={{ height: 2.5, background: A.accent, ...band }} />
        <div style={{ marginTop: 14, fontFamily: DISP, fontSize: 12, color: MUTE, display: "flex", justifyContent: "space-between" }}>
          <span>{locations}</span><span>{contactRight}</span>
        </div>
      </div>

      {/* ── PAGE 1: Overview ── */}
      <div className="cpage" style={{ fontFamily: BODYF, padding: "56px 56px", display: "flex", flexDirection: "column" }}>
        <header>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
            <div>
              <h1 style={{ margin: 0, fontFamily: DISP, fontWeight: 800, fontSize: 42, letterSpacing: "-0.025em", color: INK, lineHeight: 0.96 }}>{data.name}</h1>
              {data.tagline && <div style={{ marginTop: 9, fontFamily: DISP, fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.26em", color: A.accent }}>{data.tagline}</div>}
            </div>
            <div style={{ textAlign: "right", fontFamily: DISP, fontSize: 11, lineHeight: 1.7, color: MUTE, whiteSpace: "nowrap" }}>{profileLine(data.year)}{locations && <><br />{locations}</>}</div>
          </div>
          <div style={{ height: 2.5, background: A.accent, marginTop: 16, ...band }} />
        </header>

        {data.about && <p style={{ margin: "22px 0 0", fontSize: 16, lineHeight: 1.6, color: "#3a352f" }}>{data.about}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 38, marginTop: 28 }}>
          <div>
            {data.values.length > 0 && <>
              <Label A={A} ruled>What Drives Us</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {data.values.map((v, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 13.5, color: INK }}>{v.name}</div>
                    {v.description && <div style={{ fontSize: 12.5, color: MUTE, lineHeight: 1.45 }}>{v.description}</div>}
                  </div>
                ))}
              </div>
            </>}
            {data.sectors.length > 0 && <>
              <Label A={A} ruled mt>Sectors</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {data.sectors.map((s, i) => (
                  <span key={i} style={{ background: A.tint, border: `1px solid ${A.tintBorder}`, borderRadius: 999, padding: "5px 13px", fontFamily: DISP, fontSize: 11.5, color: "#3a352f", ...band }}>{s}</span>
                ))}
              </div>
            </>}
          </div>
          <div style={{ borderLeft: `1px solid ${RULE}`, paddingLeft: 38, marginLeft: -38 }}>
            {data.mission && <MvBox A={A} label="Mission" text={data.mission} mb />}
            {data.vision && <MvBox A={A} label="Vision" text={data.vision} />}
          </div>
        </div>

        {stats.length > 0 && (
          <section style={{ marginTop: 30 }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1.5px solid ${INK}`, borderBottom: `1.5px solid ${INK}`, padding: "16px 0" }}>
              {stats.map(([k, v], i) => (
                <div key={i} style={{ display: "flex", flex: 1 }}>
                  {i > 0 && <div style={{ width: 1, background: RULE }} />}
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontFamily: DISP, fontWeight: 800, fontSize: 28, color: A.accent, lineHeight: 1 }}>{v}</div>
                    <div style={{ fontFamily: DISP, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: FAINT, marginTop: 6 }}>{k}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── PAGE 2: CEO + Services ── */}
      <div className="cpage" style={{ fontFamily: BODYF, padding: "48px 56px", display: "flex", flexDirection: "column" }}>
        <RunHead data={data} />
        {ceoVisible(data) && (
          <section style={{ marginTop: 30 }}>
            <Label A={A}>Message from the CEO</Label>
            <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
              <div style={{ flex: "none", textAlign: "center", width: 94 }}>
                <CeoAvatar data={data} A={A} font={DISP} size={94} />
                {data.ceo.name && <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 13, color: INK, marginTop: 12 }}>{data.ceo.name}</div>}
                {data.ceo.title && <div style={{ fontSize: 11.5, color: MUTE }}>{data.ceo.title}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {data.ceo.quote && <p style={{ margin: "0 0 13px", fontStyle: "italic", fontSize: 20, lineHeight: 1.42, color: A.accent }}>&ldquo;{data.ceo.quote}&rdquo;</p>}
                {paragraphs(data.ceo.message).map((para, i) => (
                  <p key={i} style={{ margin: "0 0 11px", fontSize: 14, lineHeight: 1.62, color: "#43403a" }}>{para}</p>
                ))}
                {data.ceo.name && <div style={{ marginTop: 14, fontStyle: "italic", fontSize: 22, color: INK }}>{data.ceo.name}</div>}
              </div>
            </div>
          </section>
        )}

        {data.servicesFull.length > 0 && (
          <section style={{ marginTop: 34 }}>
            <Label A={A} ruled>What We Do</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 36px" }}>
              {data.servicesFull.map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 14, color: INK }}>{s.name}</div>
                  {s.description && <div style={{ fontSize: 13, color: MUTE, lineHeight: 1.55, marginTop: 3 }}>{s.description}</div>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── PAGE 3: Selected Projects ── */}
      {projectsVisible(data) && (
        <div className="cpage" style={{ fontFamily: BODYF, padding: "48px 56px", display: "flex", flexDirection: "column" }}>
          <RunHead data={data} />
          <section style={{ marginTop: 26 }}>
            <Label A={A} ruled>Selected Projects</Label>
            <p style={{ margin: "0 0 14px", fontSize: 12.5, color: MUTE, lineHeight: 1.55 }}>
              Verified entries are independently confirmed with the named client or donor.
            </p>
            <CompanyProjects data={data} A={A} headFont={DISP} />
          </section>
        </div>
      )}

      {/* ── PAGE 4: Org + Clients ── */}
      <div className="cpage" style={{ fontFamily: BODYF, padding: "48px 56px", display: "flex", flexDirection: "column" }}>
        <RunHead data={data} />
        {orgVisible(data) && (
          <section style={{ marginTop: 26 }}>
            <Label A={A}>Organisation</Label>
            <CompanyOrgChart data={data} A={A} nameFont={DISP} unitFont={BODYF} />
          </section>
        )}
        {data.clientGroups.length > 0 && (
          <section style={{ marginTop: 30 }}>
            <Label A={A} ruled>Clients We&rsquo;ve Worked With</Label>
            <CompanyClientGroups data={data} A={A} variant="bordered" chipFont={DISP} />
          </section>
        )}
        <div style={{ marginTop: 26, background: A.tint, borderRadius: 7, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, ...band }}>
          <div>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 18, color: INK }}>Let&rsquo;s work together.</div>
            {locations && <div style={{ fontSize: 12.5, color: "#52524c", marginTop: 3 }}>{locations}</div>}
          </div>
          <ContactBlock data={data} color="#43403a" font={DISP} />
        </div>
      </div>
    </>
  );
}

function Label({ A, ruled, mt, children }: { A: ReturnType<typeof deriveAccent>; ruled?: boolean; mt?: boolean; children: React.ReactNode }) {
  return <div style={{ fontFamily: DISP, fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ruled ? "0.18em" : "0.2em", color: A.accent, marginBottom: ruled ? 14 : 18, marginTop: mt ? 22 : undefined, borderBottom: ruled ? `1px solid ${RULE}` : undefined, paddingBottom: ruled ? 7 : undefined }}>{children}</div>;
}
function MvBox({ A, label, text, mb }: { A: ReturnType<typeof deriveAccent>; label: string; text: string; mb?: boolean }) {
  return (
    <div style={{ background: A.tint, borderRadius: 7, padding: "18px 20px", marginBottom: mb ? 14 : 0, ...band }}>
      <div style={{ fontFamily: DISP, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em", color: A.accent, marginBottom: 7 }}>{label}</div>
      <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.45, color: "#2a2722" }}>{text}</p>
    </div>
  );
}
function RunHead({ data }: { data: CompanyData }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 13, borderBottom: `1px solid ${RULE}` }}>
      <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", color: INK }}>{data.name}</span>
      <span style={{ fontFamily: DISP, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.2em", color: "#a8a29a" }}>Company Profile</span>
    </div>
  );
}
