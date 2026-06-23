import "server-only";
import type { CompanyData } from "@/lib/pdf/company-data";
import { deriveAccent, monogram, profileLine } from "./companyShared";
import {
  INK, MUTE, FAINT, RULE, band, paragraphs, ceoVisible, orgVisible,
  CeoAvatar, ContactBlock, CompanyOrgChart, CompanyClientGroups, SHELL_CSS,
} from "./companyProfileParts";

// Company Profile — "The Banner" (Company-3-Header-Footer-Band). Each page
// is framed top and bottom by a full-width accent band. Bodoni Moda display
// + Karla body. Default accent: Ink Navy.

const DISP = "'Bodoni Moda', Georgia, serif";
const BODYF = "'Karla', system-ui, sans-serif";

export function BannerCompanyProfile({ data, theme }: { data: CompanyData; theme?: Record<string, string> }) {
  const A = deriveAccent(theme?.accent ?? "#20304d");
  const mono = monogram(data.name);
  const blurb = data.coverStatement || data.mission;
  const locations = data.locations.join(" · ");
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
      <div className="cpage" style={{ fontFamily: BODYF, display: "flex", flexDirection: "column" }}>
        <div style={{ background: A.accent, padding: "30px 56px", display: "flex", justifyContent: "space-between", alignItems: "center", ...band }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Circle mono={mono} A={A} size={46} font={23} />
            <span style={{ fontFamily: DISP, fontWeight: 600, fontSize: 18, color: A.onAccent }}>{data.name}</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.28em", color: A.onAccentMuted }}>{profileLine(data.year)}</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 60 }}>
          <h1 style={{ margin: 0, fontFamily: DISP, fontWeight: 600, fontSize: 74, letterSpacing: "0.01em", color: INK, lineHeight: 1.0 }}>{data.name}</h1>
          <div style={{ width: 62, height: 2, background: A.accent, margin: "26px 0", ...band }} />
          {data.tagline && <div style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.34em", color: A.accent }}>{data.tagline}</div>}
          {blurb && <p style={{ margin: "30px 0 0", maxWidth: 460, fontFamily: DISP, fontStyle: "italic", fontSize: 21, lineHeight: 1.45, color: "#52524c" }}>{blurb}</p>}
        </div>
        <div style={{ background: A.accent, padding: "18px 56px", display: "flex", justifyContent: "space-between", alignItems: "center", color: A.onAccentMuted, fontSize: 11.5, ...band }}>
          <span>{locations}</span><span>{[data.email, data.website].filter(Boolean).join(" · ")}</span>
        </div>
      </div>

      {/* ── PAGE 1: Overview ── */}
      <div className="cpage" style={{ fontFamily: BODYF, display: "flex", flexDirection: "column" }}>
        <header style={{ background: A.accent, padding: "34px 56px", ...band }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Circle mono={mono} A={A} size={52} font={26} />
              <div>
                <h1 style={{ margin: 0, fontFamily: DISP, fontWeight: 600, fontSize: 36, color: A.onAccent, lineHeight: 1.0 }}>{data.name}</h1>
                {data.tagline && <div style={{ marginTop: 6, fontSize: 11.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.28em", color: A.onAccentMuted }}>{data.tagline}</div>}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: 11.5, lineHeight: 1.7, color: A.onAccentMuted, whiteSpace: "nowrap" }}>{profileLine(data.year)}{locations && <><br />{locations}</>}</div>
          </div>
        </header>

        <div style={{ padding: "30px 56px", flex: 1 }}>
          {data.about && (
            <section>
              <Label A={A}>About the Firm</Label>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.64, color: "#43403a" }}>{data.about}</p>
            </section>
          )}

          {(data.mission || data.vision) && (
            <div style={{ display: "grid", gridTemplateColumns: data.mission && data.vision ? "1fr 1px 1fr" : "1fr", gap: 28, marginTop: 24, alignItems: "start" }}>
              {data.mission && <MvCol A={A} label="Mission" text={data.mission} />}
              {data.mission && data.vision && <div style={{ background: RULE, width: 1, height: "100%" }} />}
              {data.vision && <MvCol A={A} label="Vision" text={data.vision} />}
            </div>
          )}

          {data.values.length > 0 && (
            <section style={{ marginTop: 26 }}>
              <Label A={A} ruled>Our Values</Label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
                {data.values.map((v, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 19, color: INK }}>{v.name}</div>
                    {v.description && <div style={{ fontSize: 11.5, color: MUTE, lineHeight: 1.45, marginTop: 3 }}>{v.description}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {stats.length > 0 && (
            <section style={{ marginTop: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1.5px solid ${A.accent}`, borderBottom: `1.5px solid ${A.accent}`, padding: "16px 0" }}>
                {stats.map(([k, v], i) => (
                  <div key={i} style={{ display: "flex", flex: 1 }}>
                    {i > 0 && <div style={{ width: 1, background: RULE }} />}
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 32, color: INK, lineHeight: 1 }}>{v}</div>
                      <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.14em", color: FAINT, marginTop: 5 }}>{k}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <FootBand A={A}>{data.name}</FootBand>
      </div>

      {/* ── PAGE 2: CEO + Services ── */}
      <div className="cpage" style={{ fontFamily: BODYF, display: "flex", flexDirection: "column" }}>
        <ThinHead data={data} A={A} mono={mono} />
        <div style={{ padding: "34px 56px", flex: 1 }}>
          {ceoVisible(data) && (
            <section>
              <Label A={A}>Message from the CEO</Label>
              <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
                <div style={{ flex: "none", textAlign: "center", width: 94 }}>
                  <CeoAvatar data={data} A={A} font={DISP} size={94} />
                  {data.ceo.name && <div style={{ fontWeight: 700, fontSize: 13, color: INK, marginTop: 12 }}>{data.ceo.name}</div>}
                  {data.ceo.title && <div style={{ fontSize: 11.5, color: MUTE }}>{data.ceo.title}</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {data.ceo.quote && <p style={{ margin: "0 0 13px", fontFamily: DISP, fontStyle: "italic", fontSize: 20, lineHeight: 1.42, color: A.accent }}>&ldquo;{data.ceo.quote}&rdquo;</p>}
                  {paragraphs(data.ceo.message).map((para, i) => (
                    <p key={i} style={{ margin: "0 0 11px", fontSize: 13.5, lineHeight: 1.62, color: "#43403a" }}>{para}</p>
                  ))}
                  {data.ceo.name && <div style={{ marginTop: 14, fontFamily: DISP, fontStyle: "italic", fontSize: 22, color: INK }}>{data.ceo.name}</div>}
                </div>
              </div>
            </section>
          )}

          {data.servicesFull.length > 0 && (
            <section style={{ marginTop: 32 }}>
              <Label A={A} ruled>What We Do</Label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 36px" }}>
                {data.servicesFull.map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 17, color: INK }}>{s.name}</div>
                    {s.description && <div style={{ fontSize: 12.5, color: MUTE, lineHeight: 1.55, marginTop: 3 }}>{s.description}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <FootBand A={A}>{data.name}</FootBand>
      </div>

      {/* ── PAGE 3: Org + Clients ── */}
      <div className="cpage" style={{ fontFamily: BODYF, display: "flex", flexDirection: "column" }}>
        <ThinHead data={data} A={A} mono={mono} />
        <div style={{ padding: "32px 56px", flex: 1 }}>
          {orgVisible(data) && (
            <section>
              <Label A={A}>Organisation</Label>
              <CompanyOrgChart data={data} A={A} nameFont={DISP} />
            </section>
          )}
          {data.clientGroups.length > 0 && (
            <section style={{ marginTop: 30 }}>
              <Label A={A} ruled>Clients We&rsquo;ve Worked With</Label>
              <CompanyClientGroups data={data} A={A} variant="bordered" />
            </section>
          )}
        </div>
        <div style={{ background: A.accent, padding: "22px 56px", color: A.onAccent, ...band }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div>
              <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 20 }}>Let&rsquo;s work together.</div>
              {locations && <div style={{ fontSize: 12, color: A.onAccentMuted, marginTop: 3 }}>{locations}</div>}
            </div>
            <ContactBlock data={data} color={A.onAccentMuted} />
          </div>
        </div>
      </div>
    </>
  );
}

function Circle({ mono, A, size, font }: { mono: string; A: ReturnType<typeof deriveAccent>; size: number; font: number }) {
  return <div style={{ width: size, height: size, flex: "none", border: `1px solid ${A.accentLine}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISP, fontWeight: 600, fontSize: font, color: A.onAccent }}>{mono}</div>;
}
function Label({ A, ruled, children }: { A: ReturnType<typeof deriveAccent>; ruled?: boolean; children: React.ReactNode }) {
  return <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: A.accent, marginBottom: ruled ? 13 : 9, borderBottom: ruled ? `1px solid ${RULE}` : undefined, paddingBottom: ruled ? 7 : undefined }}>{children}</div>;
}
function MvCol({ A, label, text }: { A: ReturnType<typeof deriveAccent>; label: string; text: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em", color: A.accent, marginBottom: 8 }}>{label}</div>
      <p style={{ margin: 0, fontFamily: DISP, fontStyle: "italic", fontSize: 17, lineHeight: 1.42, color: "#2a2722" }}>{text}</p>
    </div>
  );
}
function ThinHead({ data, A, mono }: { data: CompanyData; A: ReturnType<typeof deriveAccent>; mono: string }) {
  return (
    <header style={{ background: A.accent, padding: "16px 56px", display: "flex", justifyContent: "space-between", alignItems: "center", ...band }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <Circle mono={mono} A={A} size={28} font={15} />
        <span style={{ fontFamily: DISP, fontWeight: 600, fontSize: 17, color: A.onAccent }}>{data.name}</span>
      </div>
      <span style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.2em", color: A.onAccentMuted }}>Company Profile</span>
    </header>
  );
}
function FootBand({ A, children }: { A: ReturnType<typeof deriveAccent>; children: React.ReactNode }) {
  return (
    <footer style={{ background: A.accent, padding: "16px 56px", display: "flex", justifyContent: "space-between", alignItems: "center", ...band }}>
      <span style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: A.onAccent }}>{children}</span>
    </footer>
  );
}
