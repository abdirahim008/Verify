import "server-only";
import type { CompanyData } from "@/lib/pdf/company-data";
import { deriveAccent, monogram, profileLine, type AccentSet } from "./companyShared";
import {
  INK, BODY, MUTE, FAINT, RULE, band, paragraphs, ceoVisible, orgVisible,
  CeoAvatar, ContactBlock, CompanyOrgChart, CompanyClientGroups, CompanyProjects,
  projectsVisible, galleryVisible, CompanyGallery, SHELL_CSS,
} from "./companyProfileParts";

// Company Profile — "Wadani". Its signature is the full-bleed DARK cover
// (the only dark-cover template in the system) opening onto light interior
// pages. Source Serif 4 display + Public Sans body. Default accent: Deep
// Teal. Wired to the shared new-system parts so it carries the same sections
// as The Dossier (CEO message, values, services, gallery, org chart, grouped
// client logos) rather than the old 3-page layout.

const SERIF = "'Source Serif 4', Georgia, serif";
const SANS = "'Public Sans', system-ui, sans-serif";
const COVER_LINE = "rgba(255,255,255,0.28)";

export function WadaniCompanyProfile({ data, theme }: { data: CompanyData; theme?: Record<string, string> }) {
  const A = deriveAccent(theme?.accent ?? "#1d3b3b");
  const mono = monogram(data.name);
  const blurb = data.coverStatement || data.mission;
  const locations = data.locations.join(" · ");
  const stats = ([
    ["Founded", data.foundedYear],
    ["Specialists", data.staffCount],
    ["Countries", data.countriesCount],
    ["Projects", data.projectsCount],
  ] as [string, string][]).filter(([, v]) => v);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHELL_CSS }} />

      {/* ── COVER (dark) ── */}
      <div className="cpage" style={{ fontFamily: SANS, color: A.onAccent, padding: "62px 58px", display: "flex", flexDirection: "column", background: `linear-gradient(155deg, rgba(0,0,0,0.58), rgba(0,0,0,0.10)), ${A.accent}`, ...band }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {data.logoUrl ? (
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 64, padding: "8px 16px", borderRadius: 10, background: "#fff", ...band }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.logoUrl} alt="" style={{ height: 46, maxWidth: 220, objectFit: "contain", display: "block" }} />
            </span>
          ) : (
            <div style={{ width: 60, height: 60, borderRadius: "50%", border: `1.5px solid ${COVER_LINE}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 600, fontSize: 26 }}>{mono}</div>
          )}
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3em", color: "#ffffff", opacity: 0.72 }}>{profileLine(data.year)}</span>
        </div>
        <div style={{ flex: 1 }} />
        <h1 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: 66, letterSpacing: "-0.01em", lineHeight: 1.0 }}>{data.name}</h1>
        {data.tagline && <div style={{ marginTop: 16, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3em", color: "#ffffff", opacity: 0.72 }}>{data.tagline}</div>}
        {blurb && <p style={{ margin: "26px 0 0", maxWidth: 480, fontFamily: SERIF, fontStyle: "italic", fontSize: 21, lineHeight: 1.45 }}>{blurb}</p>}
        <div style={{ flex: 1 }} />
        <div style={{ paddingTop: 18, borderTop: `1px solid ${COVER_LINE}`, fontSize: 12, color: "#ffffff", opacity: 0.78 }}>
          {[locations, data.email, data.website].filter(Boolean).join("   ·   ")}
        </div>
      </div>

      {/* ── PAGE 1: Overview ── */}
      <div className="cpage" style={{ fontFamily: SANS, padding: "54px 60px", display: "flex", flexDirection: "column" }}>
        <RunHead name={data.name} />
        {data.about && (
          <section style={{ marginTop: 28 }}>
            <Label A={A}>About Us</Label>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.66, color: BODY }}>{data.about}</p>
          </section>
        )}
        {(data.mission || data.vision) && (
          <div style={{ display: "grid", gridTemplateColumns: data.mission && data.vision ? "1fr 1fr" : "1fr", gap: 16, marginTop: 22 }}>
            {data.mission && <MvBox A={A} label="Mission" text={data.mission} />}
            {data.vision && <MvBox A={A} label="Vision" text={data.vision} />}
          </div>
        )}
        {data.values.length > 0 && (
          <section style={{ marginTop: 24 }}>
            <Label A={A}>Our Values</Label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px 28px" }}>
              {data.values.map((v, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <span style={{ flex: "none", width: 7, height: 7, borderRadius: "50%", background: A.accent, marginTop: 6, ...band }} />
                  <div>
                    <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15, color: INK }}>{v.name}</div>
                    {v.description && <div style={{ fontSize: 12, color: MUTE, lineHeight: 1.45 }}>{v.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {stats.length > 0 && (
          <section style={{ marginTop: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1.5px solid ${A.accent}`, borderBottom: `1.5px solid ${A.accent}`, padding: "16px 0", ...band }}>
              {stats.map(([k, v], i) => (
                <div key={i} style={{ display: "flex", flex: 1 }}>
                  {i > 0 && <div style={{ width: 1, background: RULE }} />}
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 34, color: A.accent, lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.14em", color: FAINT, marginTop: 5 }}>{k}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── PAGE 2: CEO + Services ── */}
      <div className="cpage" style={{ fontFamily: SANS, padding: "54px 60px", display: "flex", flexDirection: "column" }}>
        <RunHead name={data.name} />
        {ceoVisible(data) && (
          <section style={{ marginTop: 28 }}>
            <Label A={A}>Message from the CEO</Label>
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
          <section style={{ marginTop: 32 }}>
            <Label A={A}>What We Do</Label>
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
          <RunHead name={data.name} />
          <section style={{ marginTop: 28 }}>
            <Label A={A}>Selected Projects</Label>
            <CompanyProjects data={data} A={A} headFont={SERIF} />
          </section>
        </div>
      )}

      {/* ── PAGE: Project gallery ── */}
      {galleryVisible(data) && (
        <div className="cpage" style={{ fontFamily: SANS, padding: "54px 60px", display: "flex", flexDirection: "column" }}>
          <RunHead name={data.name} />
          <section style={{ marginTop: 28 }}>
            <Label A={A}>Project Gallery</Label>
            <CompanyGallery data={data} headFont={SERIF} />
          </section>
        </div>
      )}

      {/* ── PAGE: Org + Clients + CTA ── */}
      <div className="cpage" style={{ fontFamily: SANS, padding: "54px 60px", display: "flex", flexDirection: "column" }}>
        <RunHead name={data.name} />
        {orgVisible(data) && (
          <section style={{ marginTop: 28 }}>
            <Label A={A}>Organisation</Label>
            <CompanyOrgChart data={data} A={A} nameFont={SERIF} unitFont={SANS} />
          </section>
        )}
        {data.clientGroups.length > 0 && (
          <section style={{ marginTop: 30 }}>
            <Label A={A}>Clients We&rsquo;ve Worked With</Label>
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

function Label({ A, children }: { A: AccentSet; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <span style={{ display: "inline-flex", alignItems: "center", background: A.tint, borderLeft: `3px solid ${A.accent}`, borderRadius: "0 7px 7px 0", padding: "8px 16px", fontFamily: SERIF, fontWeight: 600, fontSize: 17, letterSpacing: "0.005em", color: A.accent, ...band }}>{children}</span>
    </div>
  );
}
function MvBox({ A, label, text }: { A: AccentSet; label: string; text: string }) {
  return (
    <div style={{ background: A.tint, border: `1px solid ${A.tintBorder}`, borderRadius: 6, padding: 20, ...band }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.22em", color: A.accent, marginBottom: 7 }}>{label}</div>
      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 17, lineHeight: 1.42, color: "#2a2722" }}>{text}</p>
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
