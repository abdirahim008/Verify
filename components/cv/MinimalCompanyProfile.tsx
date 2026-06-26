import "server-only";
import type { CompanyData } from "@/lib/pdf/company-data";
import { deriveAccent, type AccentSet } from "./companyShared";
import {
  INK, BODY, MUTE, FAINT, RULE, band, paragraphs, ceoVisible, orgVisible,
  CeoAvatar, ContactBlock, CompanyOrgChart, CompanyClientGroups, CompanyProjects,
  projectsVisible, galleryVisible, CompanyGallery, SHELL_CSS,
} from "./companyProfileParts";

// Company Profile — "Minimal". The architectural register: maximal white
// space, hairline rules, one giant understated name on the cover, and a
// single restrained accent. Source Serif 4 display + Public Sans body.
// Default accent: graphite (kept near-monochrome on purpose). Section
// headers are bare tracked labels over a hairline — no tinted boxes — which
// is what keeps the register quiet. Wired to the shared new-system parts.

const SERIF = "'Source Serif 4', Georgia, serif";
const SANS = "'Public Sans', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

export function MinimalCompanyProfile({ data, theme }: { data: CompanyData; theme?: Record<string, string> }) {
  const A = deriveAccent(theme?.accent ?? "#2b2b2b");
  const lines = nameLines(data.name);
  const sizePx = fitSize(lines);
  const facts = coverFacts(data);
  const blurb = data.coverStatement || data.mission || data.about;
  const locations = data.locations.join(" · ");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHELL_CSS }} />

      {/* ── COVER ── */}
      <div className="cpage" style={{ fontFamily: SANS, padding: "60px 64px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTE, fontWeight: 600 }}>
          {data.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logoUrl} alt="" style={{ height: 40, maxWidth: 180, objectFit: "contain" }} />
          ) : (
            <span>{data.name}</span>
          )}
          <span>Profile · {data.year}</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 300, fontSize: sizePx, letterSpacing: "-0.04em", lineHeight: 0.96, color: INK }}>
            {lines.map((l, i) => (
              <span key={i}>
                {i === lines.length - 1 ? <em style={{ fontStyle: "italic", color: A.accent, fontWeight: 400 }}>{l}.</em> : l}
                <br />
              </span>
            ))}
          </div>
          {blurb && <div style={{ marginTop: 26, fontSize: 11, color: MUTE, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, maxWidth: 420, lineHeight: 1.7 }}>{firstSentence(blurb)}</div>}
        </div>

        {facts.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${facts.length},1fr)`, gap: 14, paddingTop: 16, borderTop: `2px solid ${INK}`, ...band }}>
            {facts.map(([k, v], i) => (
              <div key={i}>
                <div style={{ fontSize: 9, color: MUTE, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700 }}>{k}</div>
                <div style={{ fontFamily: SERIF, fontSize: 14, marginTop: 4, color: INK, wordBreak: "break-word" }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── PAGE 1: Overview ── */}
      <div className="cpage" style={{ fontFamily: SANS, padding: "60px 64px", display: "flex", flexDirection: "column" }}>
        <RunHead name={data.name} page="02" />
        {data.about && (
          <section style={{ marginTop: 32 }}>
            <Head no="01">The Firm</Head>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.72, color: BODY, maxWidth: 520 }}>{data.about}</p>
          </section>
        )}
        {(data.mission || data.vision) && (
          <section style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 22 }}>
            {data.mission && <Statement A={A} label="Mission" text={data.mission} />}
            {data.vision && <Statement A={A} label="Vision" text={data.vision} />}
          </section>
        )}
        {data.values.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <Head no="02">Values</Head>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px 36px" }}>
              {data.values.map((v, i) => (
                <div key={i}>
                  <div style={{ fontFamily: SERIF, fontSize: 16, color: INK }}>{v.name}</div>
                  {v.description && <div style={{ fontSize: 12, color: MUTE, lineHeight: 1.5, marginTop: 3 }}>{v.description}</div>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── PAGE 2: CEO + Services ── */}
      <div className="cpage" style={{ fontFamily: SANS, padding: "60px 64px", display: "flex", flexDirection: "column" }}>
        <RunHead name={data.name} page="03" />
        {ceoVisible(data) && (
          <section style={{ marginTop: 32 }}>
            <Head no="03">Leadership</Head>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div style={{ flex: "none", textAlign: "center", width: 90 }}>
                <CeoAvatar data={data} A={A} font={SERIF} size={90} filled={false} />
                {data.ceo.name && <div style={{ fontWeight: 700, fontSize: 13, color: INK, marginTop: 12 }}>{data.ceo.name}</div>}
                {data.ceo.title && <div style={{ fontSize: 11.5, color: MUTE }}>{data.ceo.title}</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {data.ceo.quote && <p style={{ margin: "0 0 14px", fontFamily: SERIF, fontStyle: "italic", fontSize: 21, lineHeight: 1.4, color: INK }}>&ldquo;{data.ceo.quote}&rdquo;</p>}
                {paragraphs(data.ceo.message).map((para, i) => (
                  <p key={i} style={{ margin: "0 0 11px", fontSize: 13.5, lineHeight: 1.64, color: BODY }}>{para}</p>
                ))}
                {data.ceo.name && <div style={{ marginTop: 14, fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: A.accent }}>{data.ceo.name}</div>}
              </div>
            </div>
          </section>
        )}
        {data.servicesFull.length > 0 && (
          <section style={{ marginTop: 34 }}>
            <Head no="04">Services</Head>
            <div>
              {data.servicesFull.map((s, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 14, padding: "12px 0", borderBottom: i < data.servicesFull.length - 1 ? `1px solid ${RULE}` : "none" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: MUTE, paddingTop: 3 }}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <div style={{ fontFamily: SERIF, fontSize: 16, color: INK }}>{s.name}</div>
                    {s.description && <div style={{ fontSize: 12.5, color: MUTE, lineHeight: 1.55, marginTop: 3 }}>{s.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── PAGE: Selected Projects ── */}
      {projectsVisible(data) && (
        <div className="cpage" style={{ fontFamily: SANS, padding: "60px 64px", display: "flex", flexDirection: "column" }}>
          <RunHead name={data.name} page="04" />
          <section style={{ marginTop: 32 }}>
            <Head no="05">Selected Projects</Head>
            <CompanyProjects data={data} A={A} headFont={SERIF} />
          </section>
        </div>
      )}

      {/* ── PAGE: Project gallery ── */}
      {galleryVisible(data) && (
        <div className="cpage" style={{ fontFamily: SANS, padding: "60px 64px", display: "flex", flexDirection: "column" }}>
          <RunHead name={data.name} page="05" />
          <section style={{ marginTop: 32 }}>
            <Head no="06">Project Gallery</Head>
            <CompanyGallery data={data} headFont={SERIF} />
          </section>
        </div>
      )}

      {/* ── PAGE: Org + Clients + close ── */}
      <div className="cpage" style={{ fontFamily: SANS, padding: "60px 64px", display: "flex", flexDirection: "column" }}>
        <RunHead name={data.name} page="06" />
        {orgVisible(data) && (
          <section style={{ marginTop: 32 }}>
            <Head no="07">Organisation</Head>
            <CompanyOrgChart data={data} A={A} nameFont={SERIF} unitFont={SANS} />
          </section>
        )}
        {data.clientGroups.length > 0 && (
          <section style={{ marginTop: 34 }}>
            <Head no="08">Clients &amp; Donors</Head>
            <CompanyClientGroups data={data} A={A} variant="bordered" chipFont={SERIF} />
          </section>
        )}
        <div style={{ marginTop: 36, paddingTop: 18, borderTop: `2px solid ${INK}`, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, ...band }}>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 22, color: INK }}>Let&rsquo;s work together.</div>
            {locations && <div style={{ fontSize: 12, color: MUTE, marginTop: 4 }}>{locations}</div>}
          </div>
          <ContactBlock data={data} color={MUTE} />
        </div>
      </div>
    </>
  );
}

function Head({ no, children }: { no: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, paddingBottom: 8, marginBottom: 18, borderBottom: `1px solid ${INK}` }}>
      <span style={{ fontFamily: MONO, fontSize: 11, color: MUTE }}>{no}</span>
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: INK }}>{children}</span>
    </div>
  );
}
function Statement({ A, label, text }: { A: AccentSet; label: string; text: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 24, alignItems: "start" }}>
      <div style={{ fontSize: 10, color: MUTE, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700, paddingTop: 6 }}>{label}</div>
      <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 19, lineHeight: 1.42, color: INK }}>{text}</p>
    </div>
  );
}
function RunHead({ name, page }: { name: string; page: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: FAINT, fontWeight: 600 }}>
      <span>{name}</span>
      <span style={{ fontFamily: MONO }}>{page}</span>
    </div>
  );
}

// ── cover helpers ──
// One word per line, capped at 4 lines (overflow words fold into the
// penultimate line) so a long name still stacks like the prototype.
function nameLines(name: string): string[] {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 4) return words.length ? words : [name];
  const last = words[words.length - 1];
  const head = words.slice(0, 3);
  const mid = words.slice(3, -1).join(" ");
  return [...head.slice(0, 2), [head[2], mid].filter(Boolean).join(" "), last];
}
// Auto-fit so the longest line fills the ~666px measure. Source Serif at
// weight 300 averages ~0.52em per glyph.
function fitSize(lines: string[]): number {
  const longest = Math.max(...lines.map((l) => l.length), 1);
  const size = Math.floor(666 / (0.52 * longest + 0.6));
  return Math.max(40, Math.min(122, size));
}
function firstSentence(s: string): string {
  const m = s.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : s).trim();
}
function coverFacts(d: CompanyData): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  if (d.foundedYear) out.push(["Founded", d.foundedYear]);
  if (d.country) out.push(["HQ", d.country]);
  if (d.staffCount) out.push(["Staff", d.staffCount]);
  else if (d.locations.length) out.push(["Offices", String(d.locations.length)]);
  if (d.website) out.push(["Web", d.website]);
  return out.slice(0, 5);
}
