import "server-only";
import type { CompanyData } from "@/lib/pdf/company-data";
import { deriveAccent, monogram, profileLine } from "./companyShared";
import {
  INK, BODY, MUTE, FAINT, RULE, band, paragraphs, ceoVisible, orgVisible,
  CeoAvatar, ContactBlock, CompanyOrgChart, CompanyClientGroups, CompanyProjects,
  projectsVisible, SHELL_CSS,
} from "./companyProfileParts";

// Company Profile — "The Standard" (Company-1-Classic). Classic centered
// layout, tint mission/vision boxes, Cormorant Garamond display + Public
// Sans body. 4 pages: Cover · Overview · CEO + Services · Org + Clients.
// One adjustable accent; all other colour roles derive from it.

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Public Sans', system-ui, sans-serif";

export function StandardCompanyProfile({ data, theme }: { data: CompanyData; theme?: Record<string, string> }) {
  const A = deriveAccent(theme?.accent ?? "#20304d");
  const mono = monogram(data.name);
  const blurb = data.coverStatement || data.mission;
  const contact = [data.locations.join(" · "), data.website, String(data.year)].filter(Boolean).join("  ");
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
      <div className="cpage" style={{ fontFamily: SANS, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, margin: 44, border: `1px solid ${A.tintBorder}`, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "70px 64px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.42em", color: A.accent }}>Company Profile</div>
          <div style={{ width: 42, height: 1.5, background: A.accent, margin: "22px 0 0", ...band }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            {data.logoUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={data.logoUrl} alt="" style={{ width: 78, height: 78, objectFit: "contain", marginBottom: 28 }} />
              : <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 78, height: 78, border: `1.5px solid ${A.accent}`, borderRadius: "50%", fontFamily: SERIF, fontWeight: 700, fontSize: 38, color: A.accent, marginBottom: 28 }}>{mono}</div>}
            <h1 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: 68, letterSpacing: "0.01em", color: INK, lineHeight: 1.0 }}>{data.name}</h1>
            {data.tagline && <div style={{ marginTop: 16, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.34em", color: A.accent }}>{data.tagline}</div>}
            {blurb && <p style={{ margin: "32px 0 0", maxWidth: 440, fontFamily: SERIF, fontStyle: "italic", fontSize: 20, lineHeight: 1.45, color: "#52524c" }}>{blurb}</p>}
          </div>
          {contact && <div style={{ fontSize: 11.5, letterSpacing: "0.06em", color: MUTE }}>{contact}</div>}
        </div>
      </div>

      {/* ── PAGE 1: Overview ── */}
      <div className="cpage" style={{ fontFamily: SANS, padding: "58px 66px", display: "flex", flexDirection: "column" }}>
        <header style={{ textAlign: "center", paddingBottom: 22, borderBottom: `1.5px solid ${INK}` }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 54, height: 54, border: `1.5px solid ${A.accent}`, borderRadius: "50%", fontFamily: SERIF, fontWeight: 700, fontSize: 27, color: A.accent, marginBottom: 14 }}>{mono}</div>
          <h1 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: 50, letterSpacing: "0.01em", color: INK, lineHeight: 1.0 }}>{data.name}</h1>
          {data.tagline && <div style={{ marginTop: 9, fontSize: 12.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3em", color: A.accent }}>{data.tagline}</div>}
          <div style={{ marginTop: 7, fontSize: 12, color: FAINT, letterSpacing: "0.04em" }}>{profileLine(data.year)}</div>
        </header>

        {data.about && (
          <section style={{ marginTop: 26 }}>
            <Eyebrow A={A}>About Us</Eyebrow>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.66, color: BODY }}>{data.about}</p>
          </section>
        )}

        {(data.mission || data.vision) && (
          <div style={{ display: "grid", gridTemplateColumns: data.mission && data.vision ? "1fr 1fr" : "1fr", gap: 18, marginTop: 24 }}>
            {data.mission && <MvBox A={A} label="Our Mission" text={data.mission} />}
            {data.vision && <MvBox A={A} label="Our Vision" text={data.vision} />}
          </div>
        )}

        {data.values.length > 0 && (
          <section style={{ marginTop: 24 }}>
            <RuledEyebrow A={A}>Our Values</RuledEyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
              {data.values.map((v, i) => (
                <div key={i}>
                  <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 20, color: A.accent }}>{v.name}</div>
                  {v.description && <div style={{ fontSize: 11.5, color: MUTE, lineHeight: 1.45, marginTop: 3 }}>{v.description}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {stats.length > 0 && (
          <section style={{ marginTop: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1.5px solid ${INK}`, borderBottom: `1.5px solid ${INK}`, padding: "18px 0" }}>
              {stats.map(([k, v], i) => (
                <div key={i} style={{ display: "flex", flex: 1 }}>
                  {i > 0 && <div style={{ width: 1, background: "#ddd8d0" }} />}
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 36, color: A.accent, lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", color: FAINT, marginTop: 6 }}>{k}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── PAGE 2: CEO + Services ── */}
      <div className="cpage" style={{ fontFamily: SANS, padding: "54px 66px", display: "flex", flexDirection: "column" }}>
        <RunHead name={data.name} />
        {ceoVisible(data) && (
          <section style={{ marginTop: 30 }}>
            <Eyebrow A={A}>Message from the CEO</Eyebrow>
            <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
              <div style={{ flex: "none", textAlign: "center", width: 96 }}>
                <CeoAvatar data={data} A={A} font={SERIF} size={96} filled={false} />
                {data.ceo.name && <div style={{ fontWeight: 700, fontSize: 13, color: INK, marginTop: 12 }}>{data.ceo.name}</div>}
                {data.ceo.title && <div style={{ fontSize: 11.5, color: MUTE }}>{data.ceo.title}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {data.ceo.quote && <p style={{ margin: "0 0 13px", fontFamily: SERIF, fontStyle: "italic", fontSize: 21, lineHeight: 1.4, color: A.accent }}>&ldquo;{data.ceo.quote}&rdquo;</p>}
                {paragraphs(data.ceo.message).map((para, i) => (
                  <p key={i} style={{ margin: "0 0 11px", fontSize: 13.5, lineHeight: 1.62, color: BODY }}>{para}</p>
                ))}
                {data.ceo.name && <div style={{ marginTop: 16, fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: INK }}>{data.ceo.name}</div>}
              </div>
            </div>
          </section>
        )}

        {data.servicesFull.length > 0 && (
          <section style={{ marginTop: 34 }}>
            <RuledEyebrow A={A}>What We Do</RuledEyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 36px" }}>
              {data.servicesFull.map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 18, color: INK }}>{s.name}</div>
                  {s.description && <div style={{ fontSize: 12.5, color: MUTE, lineHeight: 1.55, marginTop: 3 }}>{s.description}</div>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── PAGE 3: Selected Projects ── */}
      {projectsVisible(data) && (
        <div className="cpage" style={{ fontFamily: SANS, padding: "54px 66px", display: "flex", flexDirection: "column" }}>
          <RunHead name={data.name} />
          <section style={{ marginTop: 30 }}>
            <RuledEyebrow A={A}>Selected Projects</RuledEyebrow>
            <p style={{ margin: "0 0 14px", fontSize: 12.5, color: MUTE, lineHeight: 1.55 }}>
              Verified entries are independently confirmed with the named client or donor.
            </p>
            <CompanyProjects data={data} A={A} headFont={SERIF} />
          </section>
        </div>
      )}

      {/* ── PAGE 4: Org + Clients ── */}
      <div className="cpage" style={{ fontFamily: SANS, padding: "54px 66px", display: "flex", flexDirection: "column" }}>
        <RunHead name={data.name} />
        {orgVisible(data) && (
          <section style={{ marginTop: 26 }}>
            <Eyebrow A={A}>Organisation</Eyebrow>
            <CompanyOrgChart data={data} A={A} nameFont={SANS} />
          </section>
        )}

        {data.clientGroups.length > 0 && (
          <section style={{ marginTop: 30 }}>
            <RuledEyebrow A={A}>Clients We&rsquo;ve Worked With</RuledEyebrow>
            <CompanyClientGroups data={data} A={A} variant="bordered" />
          </section>
        )}

        <div style={{ marginTop: 28, background: A.tint, borderRadius: 6, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, ...band }}>
          <div>
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 20, color: INK }}>Let&rsquo;s work together.</div>
            {data.locations.length > 0 && <div style={{ fontSize: 12.5, color: "#52524c", marginTop: 3 }}>{data.locations.join(" · ")}</div>}
          </div>
          <ContactBlock data={data} color={BODY} />
        </div>
      </div>
    </>
  );
}

function Eyebrow({ A, children }: { A: ReturnType<typeof deriveAccent>; children: React.ReactNode }) {
  return <div style={{ fontSize: 11.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.22em", color: A.accent, marginBottom: 9 }}>{children}</div>;
}
function RuledEyebrow({ A, children }: { A: ReturnType<typeof deriveAccent>; children: React.ReactNode }) {
  return <div style={{ fontSize: 11.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.22em", color: A.accent, marginBottom: 14, borderBottom: `1px solid ${RULE}`, paddingBottom: 7 }}>{children}</div>;
}
function MvBox({ A, label, text }: { A: ReturnType<typeof deriveAccent>; label: string; text: string }) {
  return (
    <div style={{ background: A.tint, border: `1px solid ${A.tintBorder}`, borderRadius: 6, padding: 22, ...band }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.24em", color: A.accent, marginBottom: 8 }}>{label}</div>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 19, lineHeight: 1.4, color: "#2a2722" }}>{text}</p>
    </div>
  );
}
function RunHead({ name }: { name: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 14, borderBottom: `1px solid ${RULE}` }}>
      <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 16, color: INK }}>{name}</span>
      <span style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.2em", color: "#a8a29a" }}>Company Profile</span>
    </div>
  );
}
