import "server-only";
import type { CompanyData } from "@/lib/pdf/company-data";
import { deriveAccent, monogram, profileLine } from "./companyShared";
import {
  INK, MUTE, band, paragraphs, ceoVisible, orgVisible,
  CeoAvatar, ContactBlock, CompanyOrgChart, CompanyClientGroups, CompanyProjects,
  projectsVisible, galleryVisible, CompanyGallery, SHELL_CSS,
} from "./companyProfileParts";

// Company Profile — "The Bento" (Company-5-Modular). Modular rounded cards
// with one accent stat tile. Spectral display + Public Sans body. Default
// accent: Oxblood.

const DISP = "'Spectral', Georgia, serif";
const BODYF = "'Public Sans', system-ui, sans-serif";
const CARD = "#e6e2da";

export function BentoCompanyProfile({ data, theme }: { data: CompanyData; theme?: Record<string, string> }) {
  const A = deriveAccent(theme?.accent ?? "#532330");
  const mono = monogram(data.name);
  const blurb = data.coverStatement || data.mission;
  const locations = data.locations.join(" · ");
  const glance = [
    ["Founded", data.foundedYear],
    ["Specialists", data.staffCount],
    ["Projects", data.projectsCount ? `${data.projectsCount}${data.countriesCount ? ` · ${data.countriesCount} countries` : ""}` : ""],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHELL_CSS }} />

      {/* ── COVER ── */}
      <div className="cpage" style={{ fontFamily: BODYF, display: "flex", flexDirection: "column", padding: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {data.logoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={data.logoUrl} alt="" style={{ height: 42, maxWidth: 120, objectFit: "contain" }} />
              : <Mono mono={mono} A={A} size={42} radius={9} font={21} />}
            <span style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: INK }}>{data.name}</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.26em", color: A.accent }}>{profileLine(data.year)}</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
          <div style={{ flex: 1, background: A.accent, borderRadius: 14, color: A.onAccent, padding: 48, display: "flex", flexDirection: "column", justifyContent: "center", ...band }}>
            <h1 style={{ margin: 0, fontFamily: DISP, fontWeight: 600, fontSize: 74, lineHeight: 0.98 }}>{data.name}</h1>
            {data.tagline && <div style={{ marginTop: 18, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.26em", color: A.onAccentMuted }}>{data.tagline}</div>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div style={{ border: `1px solid ${CARD}`, borderRadius: 14, padding: 26, display: "flex", alignItems: "center" }}>
              {blurb && <p style={{ margin: 0, fontFamily: DISP, fontStyle: "italic", fontSize: 18, lineHeight: 1.45, color: "#52524c" }}>{blurb}</p>}
            </div>
            <div style={{ background: A.tint, border: `1px solid ${A.tintBorder}`, borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", justifyContent: "center", ...band }}>
              {data.foundedYear && <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 30, color: A.accent, lineHeight: 1 }}>Est.<br />{data.foundedYear}</div>}
              {locations && <div style={{ fontSize: 11, color: MUTE, marginTop: 8 }}>{locations}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ── PAGE 1: Overview bento ── */}
      <div className="cpage" style={{ fontFamily: BODYF, padding: 50, display: "flex", flexDirection: "column" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Mono mono={mono} A={A} size={46} radius={10} font={24} />
            <div>
              <h1 style={{ margin: 0, fontFamily: DISP, fontWeight: 600, fontSize: 32, color: INK, lineHeight: 1.0 }}>{data.name}</h1>
              {data.tagline && <div style={{ marginTop: 4, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.26em", color: A.accent }}>{data.tagline}</div>}
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 11, lineHeight: 1.7, color: MUTE, whiteSpace: "nowrap" }}>{profileLine(data.year)}{locations && <><br />{locations}</>}</div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 15, flex: 1, alignContent: "start" }}>
          {data.about && (
            <div style={{ gridColumn: "1 / -1", background: "#fff", border: `1px solid ${CARD}`, borderRadius: 10, padding: "22px 24px" }}>
              <CardLabel A={A}>About</CardLabel>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "#43403a" }}>{data.about}</p>
            </div>
          )}
          {data.mission && <TintCard A={A} label="Mission" text={data.mission} />}
          {data.vision && <TintCard A={A} label="Vision" text={data.vision} />}
          {data.values.length > 0 && (
            <div style={{ background: A.tint, border: `1px solid ${A.tintBorder}`, borderRadius: 10, padding: "18px 20px", ...band }}>
              <CardLabel A={A}>Values</CardLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 13, fontWeight: 600, color: "#2a2722" }}>
                {data.values.map((v, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, alignItems: "center" }}>
                    <span style={{ width: 5, height: 5, background: A.accent, borderRadius: "50%", ...band }} />{v.name}
                  </div>
                ))}
              </div>
            </div>
          )}
          {glance.length > 0 && (
            <div style={{ gridColumn: "span 1", background: A.accent, borderRadius: 10, padding: "20px 22px", color: A.onAccent, ...band }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: A.onAccentMuted, marginBottom: 14 }}>At a Glance</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {glance.map(([k, v], i) => (
                  <div key={i}>
                    <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 25, lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: A.onAccentMuted, marginTop: 2 }}>{k}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.sectors.length > 0 && (
            <div style={{ gridColumn: "span 2", background: "#fff", border: `1px solid ${CARD}`, borderRadius: 10, padding: "20px 24px" }}>
              <CardLabel A={A}>Sectors We Serve</CardLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "11px 24px", fontSize: 13, color: "#2a2722" }}>
                {data.sectors.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, alignItems: "center" }}>
                    <span style={{ width: 6, height: 6, background: A.accent, borderRadius: "50%", ...band }} />{s}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PAGE 2: CEO + Services ── */}
      <div className="cpage" style={{ fontFamily: BODYF, padding: 50, display: "flex", flexDirection: "column" }}>
        <RunHead data={data} A={A} mono={mono} />
        {ceoVisible(data) && (
          <div style={{ background: "#fff", border: `1px solid ${CARD}`, borderRadius: 10, padding: 24, marginTop: 18 }}>
            <CardLabel A={A}>Message from the CEO</CardLabel>
            <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
              <div style={{ flex: "none", textAlign: "center", width: 90 }}>
                <CeoAvatar data={data} A={A} font={DISP} size={90} />
                {data.ceo.name && <div style={{ fontWeight: 700, fontSize: 12.5, color: INK, marginTop: 11 }}>{data.ceo.name}</div>}
                {data.ceo.title && <div style={{ fontSize: 11, color: MUTE }}>{data.ceo.title}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {data.ceo.quote && <p style={{ margin: "0 0 12px", fontFamily: DISP, fontStyle: "italic", fontSize: 19, lineHeight: 1.4, color: A.accent }}>&ldquo;{data.ceo.quote}&rdquo;</p>}
                {paragraphs(data.ceo.message).map((para, i) => (
                  <p key={i} style={{ margin: "0 0 10px", fontSize: 13, lineHeight: 1.6, color: "#43403a" }}>{para}</p>
                ))}
                {data.ceo.name && <div style={{ marginTop: 13, fontFamily: DISP, fontStyle: "italic", fontSize: 20, color: INK }}>{data.ceo.name}</div>}
              </div>
            </div>
          </div>
        )}

        {data.servicesFull.length > 0 && (
          <div style={{ background: "#fff", border: `1px solid ${CARD}`, borderRadius: 10, padding: "22px 24px", marginTop: 15, flex: 1 }}>
            <CardLabel A={A}>What We Do</CardLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px" }}>
              {data.servicesFull.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 11 }}>
                  <span style={{ flex: "none", width: 7, height: 7, background: A.accent, borderRadius: "50%", marginTop: 6, ...band }} />
                  <div>
                    <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: INK }}>{s.name}</div>
                    {s.description && <div style={{ fontSize: 12, color: MUTE, lineHeight: 1.5, marginTop: 2 }}>{s.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── PAGE 3: Selected Projects ── */}
      {projectsVisible(data) && (
        <div className="cpage" style={{ fontFamily: BODYF, padding: 50, display: "flex", flexDirection: "column" }}>
          <RunHead data={data} A={A} mono={mono} />
          <div style={{ background: "#fff", border: `1px solid ${CARD}`, borderRadius: 10, padding: "22px 24px", marginTop: 18, flex: 1 }}>
            <CardLabel A={A}>Selected Projects</CardLabel>
            <p style={{ margin: "0 0 12px", fontSize: 12.5, color: MUTE, lineHeight: 1.55 }}>
              Verified entries are independently confirmed with the named client or donor.
            </p>
            <CompanyProjects data={data} A={A} headFont={DISP} />
          </div>
        </div>
      )}

      {/* ── PAGE: Project gallery ── */}
      {galleryVisible(data) && (
        <div className="cpage" style={{ fontFamily: BODYF, padding: 50, display: "flex", flexDirection: "column" }}>
          <RunHead data={data} A={A} mono={mono} />
          <div style={{ background: "#fff", border: `1px solid ${CARD}`, borderRadius: 10, padding: "22px 24px", marginTop: 18, flex: 1 }}>
            <CardLabel A={A}>Project Gallery</CardLabel>
            <CompanyGallery data={data} headFont={DISP} />
          </div>
        </div>
      )}

      {/* ── PAGE 4: Org + Clients ── */}
      <div className="cpage" style={{ fontFamily: BODYF, padding: 50, display: "flex", flexDirection: "column" }}>
        <RunHead data={data} A={A} mono={mono} />
        {orgVisible(data) && (
          <div style={{ background: "#fff", border: `1px solid ${CARD}`, borderRadius: 10, padding: "22px 24px", marginTop: 18 }}>
            <CardLabel A={A}>Organisation</CardLabel>
            <CompanyOrgChart data={data} A={A} nameFont={DISP} />
          </div>
        )}
        {data.clientGroups.length > 0 && (
          <div style={{ background: "#fff", border: `1px solid ${CARD}`, borderRadius: 10, padding: "22px 24px", marginTop: 15, flex: 1 }}>
            <CardLabel A={A}>Clients We&rsquo;ve Worked With</CardLabel>
            <CompanyClientGroups data={data} A={A} variant="tinted" />
          </div>
        )}
        <div style={{ marginTop: 15, background: A.accent, borderRadius: 10, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, color: A.onAccent, ...band }}>
          <div>
            <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 18 }}>Let&rsquo;s work together.</div>
            {locations && <div style={{ fontSize: 12, color: A.onAccentMuted, marginTop: 2 }}>{locations}</div>}
          </div>
          <ContactBlock data={data} color={A.onAccentMuted} />
        </div>
      </div>
    </>
  );
}

function Mono({ mono, A, size, radius, font }: { mono: string; A: ReturnType<typeof deriveAccent>; size: number; radius: number; font: number }) {
  return <div style={{ width: size, height: size, flex: "none", borderRadius: radius, background: A.accent, color: A.onAccent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISP, fontWeight: 600, fontSize: font, ...band }}>{mono}</div>;
}
function CardLabel({ A, children }: { A: ReturnType<typeof deriveAccent>; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <span style={{ display: "inline-flex", alignItems: "center", background: A.tint, borderLeft: `3px solid ${A.accent}`, borderRadius: "0 7px 7px 0", padding: "7px 15px", fontFamily: DISP, fontWeight: 600, fontSize: 16, letterSpacing: "0.005em", color: A.accent, ...band }}>{children}</span>
    </div>
  );
}
function TintCard({ A, label, text }: { A: ReturnType<typeof deriveAccent>; label: string; text: string }) {
  return (
    <div style={{ background: A.tint, border: `1px solid ${A.tintBorder}`, borderRadius: 10, padding: "18px 20px", ...band }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: A.accent, marginBottom: 8 }}>{label}</div>
      <p style={{ margin: 0, fontFamily: DISP, fontSize: 14, lineHeight: 1.45, color: "#2a2722" }}>{text}</p>
    </div>
  );
}
function RunHead({ data, A, mono }: { data: CompanyData; A: ReturnType<typeof deriveAccent>; mono: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: `1px solid ${CARD}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Mono mono={mono} A={A} size={26} radius={6} font={14} />
        <span style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: INK }}>{data.name}</span>
      </div>
      <span style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.2em", color: "#a8a29a" }}>Company Profile</span>
    </div>
  );
}
