import "server-only";
import type { CompanyData } from "@/lib/pdf/company-data";
import { deriveAccent, monogram, profileLine } from "./companyShared";
import {
  INK, BODY, MUTE, FAINT, RULE, band, paragraphs, ceoVisible, orgVisible,
  CeoAvatar, ContactBlock, CompanyOrgChart, CompanyClientGroups, CompanyProjects,
  projectsVisible, SHELL_CSS,
} from "./companyProfileParts";

// Company Profile — "The Dossier" (Company-2-Sidebar). Left sidebar carries
// the at-a-glance facts; a vertical rule separates it from the main column.
// Space Grotesk display + Hanken Grotesk body. Default accent: Deep Teal.

const DISP = "'Space Grotesk', system-ui, sans-serif";
const BODYF = "'Hanken Grotesk', system-ui, sans-serif";

export function DossierCompanyProfile({ data, theme }: { data: CompanyData; theme?: Record<string, string> }) {
  const A = deriveAccent(theme?.accent ?? "#1d3b3b");
  const mono = monogram(data.name);
  const blurb = data.coverStatement || data.mission;
  const glance = [
    ["Founded", data.foundedYear],
    ["Headquarters", data.country || data.locations[0] || ""],
    ["Team", data.staffCount],
    ["Presence", data.countriesCount ? `${data.countriesCount} countries` : ""],
    ["Projects", data.projectsCount ? `${data.projectsCount} delivered` : ""],
  ].filter(([, v]) => v) as [string, string][];
  const contactLines = [data.locations.join(" · "), data.email, data.phone, data.website].filter(Boolean);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHELL_CSS }} />

      {/* ── COVER ── */}
      <div className="cpage" style={{ fontFamily: BODYF, display: "flex" }}>
        <div style={{ width: 11, flex: "none", background: A.accent, ...band }} />
        <div style={{ flex: 1, padding: "62px 58px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {data.logoUrl ? (
              // Logo is the brand mark here — shown large; the company name is
              // already the cover's hero heading below, so no label beside it.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logoUrl} alt="" style={{ height: 92, maxWidth: 330, objectFit: "contain", objectPosition: "left center", display: "block" }} />
            ) : (
              <>
                <Mono mono={mono} A={A} size={46} radius={10} font={23} />
                <span style={{ fontFamily: DISP, fontWeight: 600, fontSize: 14, color: INK }}>{data.name}</span>
              </>
            )}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3em", color: A.accent }}>{profileLine(data.year)}</div>
          <h1 style={{ margin: "18px 0 0", fontFamily: DISP, fontWeight: 700, fontSize: 60, letterSpacing: "-0.025em", color: INK, lineHeight: 0.94 }}>{data.name}</h1>
          {data.tagline && <div style={{ marginTop: 18, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.24em", color: A.accent }}>{data.tagline}</div>}
          {blurb && <p style={{ margin: "26px 0 0", maxWidth: 470, fontSize: 14.5, lineHeight: 1.6, color: "#52524c" }}>{blurb}</p>}
          <div style={{ flex: 1 }} />
          {contactLines.length > 0 && <div style={{ fontSize: 12, color: MUTE, letterSpacing: "0.03em" }}>{contactLines.join("  ·  ")}</div>}
        </div>
      </div>

      {/* ── PAGE 1: Sidebar facts + overview ── */}
      <div className="cpage" style={{ fontFamily: BODYF, display: "flex" }}>
        <aside style={{ width: 244, flex: "none", borderRight: "1px solid #ddd8d0", padding: "48px 28px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 30 }}>
            <Mono mono={mono} A={A} size={36} radius={7} font={18} />
            <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 13, color: INK, lineHeight: 1.1 }}>{data.name}</div>
          </div>
          {glance.length > 0 && <>
            <SideLabel A={A}>At a Glance</SideLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {glance.map(([k, v], i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9a948c" }}>{k}</div>
                  <div style={{ fontSize: 13.5, color: INK, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </>}
          {data.sectors.length > 0 && <>
            <SideLabel A={A} mt>Sectors</SideLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 13, color: "#43403a" }}>
              {data.sectors.map((s, i) => <span key={i}>{s}</span>)}
            </div>
          </>}
          {contactLines.length > 0 && <>
            <SideLabel A={A} mt>Contact</SideLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 12, color: "#52524c", lineHeight: 1.4 }}>
              {contactLines.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          </>}
        </aside>

        <main style={{ flex: 1, padding: "50px 40px", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <header style={{ borderBottom: `1.5px solid ${INK}`, paddingBottom: 18 }}>
            <h1 style={{ margin: 0, fontFamily: DISP, fontWeight: 700, fontSize: 40, letterSpacing: "-0.02em", color: INK, lineHeight: 1.0 }}>{data.name}</h1>
            {data.tagline && <div style={{ marginTop: 9, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.26em", color: A.accent }}>{data.tagline}</div>}
            <div style={{ marginTop: 6, fontSize: 12, color: FAINT }}>{profileLine(data.year)}</div>
          </header>

          {data.about && (
            <section style={{ marginTop: 24 }}>
              <MainLabel A={A}>About Us</MainLabel>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.64, color: "#43403a" }}>{data.about}</p>
            </section>
          )}

          {(data.mission || data.vision) && (
            <div style={{ marginTop: 22, background: A.tint, borderLeft: `3px solid ${A.accent}`, borderRadius: "0 6px 6px 0", padding: "20px 24px", ...band }}>
              {data.mission && <>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em", color: A.accent, marginBottom: 7 }}>Mission</div>
                <p style={{ margin: "0 0 14px", fontFamily: DISP, fontSize: 15, lineHeight: 1.45, color: "#2a2722" }}>{data.mission}</p>
              </>}
              {data.vision && <>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em", color: A.accent, marginBottom: 7 }}>Vision</div>
                <p style={{ margin: 0, fontFamily: DISP, fontSize: 15, lineHeight: 1.45, color: "#2a2722" }}>{data.vision}</p>
              </>}
            </div>
          )}

          {data.values.length > 0 && (
            <section style={{ marginTop: 24 }}>
              <MainLabel A={A} ruled>Our Values</MainLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
                {data.values.map((v, i) => (
                  <div key={i} style={{ display: "flex", gap: 11 }}>
                    <span style={{ flex: "none", width: 7, height: 7, background: A.accent, borderRadius: "50%", marginTop: 5, ...band }} />
                    <div>
                      <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 13.5, color: INK }}>{v.name}</div>
                      {v.description && <div style={{ fontSize: 12, color: MUTE, lineHeight: 1.4 }}>{v.description}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ── PAGE 2: CEO + Services ── */}
      <div className="cpage" style={{ fontFamily: BODYF, padding: "50px 56px", display: "flex", flexDirection: "column" }}>
        <RunHead data={data} A={A} mono={mono} />
        {ceoVisible(data) && (
          <section style={{ marginTop: 28 }}>
            <MainLabel A={A}>Message from the CEO</MainLabel>
            <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
              <div style={{ flex: "none", textAlign: "center", width: 92 }}>
                <CeoAvatar data={data} A={A} font={DISP} size={92} />
                {data.ceo.name && <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 13, color: INK, marginTop: 12 }}>{data.ceo.name}</div>}
                {data.ceo.title && <div style={{ fontSize: 11.5, color: MUTE }}>{data.ceo.title}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {data.ceo.quote && <p style={{ margin: "0 0 13px", fontFamily: DISP, fontSize: 18, lineHeight: 1.4, color: A.accent }}>&ldquo;{data.ceo.quote}&rdquo;</p>}
                {paragraphs(data.ceo.message).map((para, i) => (
                  <p key={i} style={{ margin: "0 0 11px", fontSize: 13, lineHeight: 1.62, color: "#43403a" }}>{para}</p>
                ))}
                {data.ceo.name && <div style={{ marginTop: 14, fontFamily: DISP, fontWeight: 600, fontSize: 16, color: INK }}>{data.ceo.name}</div>}
              </div>
            </div>
          </section>
        )}

        {data.servicesFull.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <MainLabel A={A} ruled>What We Do</MainLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 36px" }}>
              {data.servicesFull.map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 14.5, color: INK }}>{s.name}</div>
                  {s.description && <div style={{ fontSize: 12.5, color: MUTE, lineHeight: 1.55, marginTop: 3 }}>{s.description}</div>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── PAGE 3: Selected Projects ── */}
      {projectsVisible(data) && (
        <div className="cpage" style={{ fontFamily: BODYF, padding: "50px 56px", display: "flex", flexDirection: "column" }}>
          <RunHead data={data} A={A} mono={mono} />
          <section style={{ marginTop: 28 }}>
            <MainLabel A={A} ruled>Selected Projects</MainLabel>
            <p style={{ margin: "0 0 14px", fontSize: 12.5, color: MUTE, lineHeight: 1.55 }}>
              Verified entries are independently confirmed with the named client or donor.
            </p>
            <CompanyProjects data={data} A={A} headFont={DISP} />
          </section>
        </div>
      )}

      {/* ── PAGE 4: Org + Clients + CTA ── */}
      <div className="cpage" style={{ fontFamily: BODYF, padding: "50px 56px", display: "flex", flexDirection: "column" }}>
        <RunHead data={data} A={A} mono={mono} />
        {orgVisible(data) && (
          <section style={{ marginTop: 26 }}>
            <MainLabel A={A}>Organisation</MainLabel>
            <CompanyOrgChart data={data} A={A} nameFont={DISP} />
          </section>
        )}

        {data.clientGroups.length > 0 && (
          <section style={{ marginTop: 30 }}>
            <MainLabel A={A} ruled>Clients We&rsquo;ve Worked With</MainLabel>
            <CompanyClientGroups data={data} A={A} variant="bordered" />
          </section>
        )}

        <div style={{ marginTop: 26, background: A.accent, borderRadius: 6, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, color: A.onAccent, ...band }}>
          <div>
            <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 18 }}>Let&rsquo;s work together.</div>
            {data.locations.length > 0 && <div style={{ fontSize: 12.5, color: A.onAccentMuted, marginTop: 3 }}>{data.locations.join(" · ")}</div>}
          </div>
          <ContactBlock data={data} color={A.onAccentMuted} />
        </div>
      </div>
    </>
  );
}

function Mono({ mono, A, size, radius, font }: { mono: string; A: ReturnType<typeof deriveAccent>; size: number; radius: number; font: number }) {
  return (
    <div style={{ width: size, height: size, flex: "none", borderRadius: radius, background: A.accent, color: A.onAccent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISP, fontWeight: 700, fontSize: font, ...band }}>{mono}</div>
  );
}
function SideLabel({ A, mt, children }: { A: ReturnType<typeof deriveAccent>; mt?: boolean; children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: A.accent, margin: mt ? "26px 0 13px" : "0 0 13px" }}>{children}</div>;
}
function MainLabel({ A, ruled, children }: { A: ReturnType<typeof deriveAccent>; ruled?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: ruled ? 16 : 12 }}>
      <span style={{ display: "inline-flex", alignItems: "center", background: A.tint, borderLeft: `3px solid ${A.accent}`, borderRadius: "0 7px 7px 0", padding: "8px 16px", fontFamily: DISP, fontWeight: 600, fontSize: 16, letterSpacing: "0.005em", color: A.accent, ...band }}>{children}</span>
    </div>
  );
}
function RunHead({ data, A, mono }: { data: CompanyData; A: ReturnType<typeof deriveAccent>; mono: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottom: `1px solid ${RULE}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <Mono mono={mono} A={A} size={24} radius={5} font={12} />
        <span style={{ fontFamily: DISP, fontWeight: 600, fontSize: 14, color: INK }}>{data.name}</span>
      </div>
      <span style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.2em", color: "#a8a29a" }}>Company Profile</span>
    </div>
  );
}
