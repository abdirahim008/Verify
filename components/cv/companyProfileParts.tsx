import "server-only";
import type { CompanyData } from "@/lib/pdf/company-data";
import { ceoInitials, type AccentSet } from "./companyShared";
import { splitScope } from "@/components/ScopeList";

// Visual parts shared by the five "Company Profile System" templates. The
// org chart and client list are structurally identical across all five —
// only the heading font and the client-chip treatment vary — so they live
// here, parametrised, rather than copy-pasted into each template.

export const INK = "#16130f";
export const BODY = "#43403a";
export const MUTE = "#6a645c";
export const FAINT = "#8a847c";
export const RULE = "#e2ded7";

// Chromium only paints background colours into the PDF when each coloured
// element opts in (printBackground covers most, but be explicit on bands).
export const band = { WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as const;

// Per-page A4 sheet. 794×1123px == 210×297mm at 96dpi; `break-after: page`
// puts each .cpage on its own sheet. min-height (not fixed) lets a page with
// heavier real-world content grow rather than clip — and when it does run
// onto a second sheet, box-decoration-break: clone repeats the page's own
// padding on that sheet, so the overflow keeps its margins instead of
// printing flush against the paper edge (the sheet has no @page margin, so
// covers can bleed).
export const SHELL_CSS = `
@page { size: A4; margin: 0; }
.cpage {
  width: 794px; min-height: 1123px; background: #ffffff;
  box-sizing: border-box; color: #3a352f;
  box-decoration-break: clone; -webkit-box-decoration-break: clone;
  break-after: page; page-break-after: always;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.cpage:last-child { break-after: auto; page-break-after: auto; }
/* The cover (first sheet) is exactly one page: its flexible spacing absorbs
   any excess instead of spilling a stray footer onto a blank second sheet. */
.cpage:first-of-type { height: 1123px; overflow: hidden; }
`;

// ── content guards ──
export function paragraphs(text: string): string[] {
  return text.split(/\n{2,}|\n/).map((s) => s.trim()).filter(Boolean);
}
export function ceoVisible(data: CompanyData): boolean {
  return Boolean(data.ceo.name || data.ceo.message || data.ceo.quote);
}
export function orgVisible(data: CompanyData): boolean {
  return Boolean(data.ceo.name || data.team.length > 0);
}

// ── CEO avatar (uploaded photo, else initials in a tinted/outlined circle) ──
export function CeoAvatar({ data, A, font, size = 94, filled = true }: {
  data: CompanyData; A: AccentSet; font: string; size?: number; filled?: boolean;
}) {
  if (data.ceo.photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={data.ceo.photoUrl} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  }
  const ring = filled
    ? { background: A.tint, border: `1px solid ${A.tintBorder}`, ...band }
    : { border: `1.5px solid ${A.accent}` };
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, fontWeight: 600, fontSize: size * 0.34, color: A.accent, ...ring }}>
      {ceoInitials(data.ceo.name)}
    </div>
  );
}

// ── contact block (right-aligned email / phone · website) ──
export function ContactBlock({ data, color, font }: { data: CompanyData; color: string; font?: string }) {
  const top = data.email;
  const bottom = [data.phone, data.website].filter(Boolean).join(" · ");
  if (!top && !bottom) return null;
  return (
    <div style={{ textAlign: "right", fontSize: 12, color, lineHeight: 1.6, fontFamily: font }}>
      {top}{top && bottom && <br />}{bottom}
    </div>
  );
}

// ── organogram: Board → CEO → director cards (each with unit tags) ──
export function CompanyOrgChart({ data, A, nameFont, unitFont }: {
  data: CompanyData; A: AccentSet; nameFont: string; unitFont?: string;
}) {
  const board = data.boardName || "Board of Directors";
  // Leadership for the chart comes from Key Personnel. If a team member's role
  // marks them as the chief executive, they become the CEO node and drop out of
  // the director grid. Only when no such member exists do we fall back to the
  // CEO-message name/title — so the same person never shows up twice (e.g. once
  // from the CEO message and again as a key-personnel card).
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const CEO_ROLE = /\b(ceo|chief exec|managing director|managing partner|executive director|director general)\b/i;
  const teamCeo = data.team.find((m) => CEO_ROLE.test(m.role || ""));
  let ceoNode: { name: string; title: string } | null = null;
  let directors = data.team;
  if (teamCeo) {
    ceoNode = { name: teamCeo.name, title: teamCeo.role };
    directors = data.team.filter((m) => m.id !== teamCeo.id);
  } else if (data.ceo.name) {
    ceoNode = { name: data.ceo.name, title: data.ceo.title };
    directors = data.team.filter((m) => norm(m.name) !== norm(data.ceo.name));
  }
  const cols = Math.min(Math.max(directors.length, 1), 3);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ background: A.tint, border: `1px solid ${A.tintBorder}`, borderRadius: 6, padding: "9px 22px", textAlign: "center", ...band }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em", color: FAINT }}>Governance</div>
        <div style={{ fontFamily: nameFont, fontWeight: 600, fontSize: 13, color: INK }}>{board}</div>
      </div>
      {ceoNode && (
        <>
          <div style={{ width: 1.5, height: 18, background: A.accentLine }} />
          <div style={{ background: A.accent, borderRadius: 6, padding: "11px 26px", textAlign: "center", color: A.onAccent, ...band }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em", color: A.onAccentMuted }}>Chief Executive</div>
            <div style={{ fontFamily: nameFont, fontWeight: 600, fontSize: 14 }}>{[ceoNode.name, ceoNode.title].filter(Boolean).join(" · ")}</div>
          </div>
        </>
      )}
      {directors.length > 0 && (
        <>
          <div style={{ width: 1.5, height: 18, background: A.accentLine }} />
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 20, width: "100%" }}>
            {directors.slice(0, 6).map((m) => (
              <div key={m.id} style={{ textAlign: "center" }}>
                <div style={{ border: "1px solid #ddd8d0", borderRadius: 6, padding: 10 }}>
                  <div style={{ fontFamily: nameFont, fontWeight: 600, fontSize: 12.5, color: INK }}>{m.name}</div>
                  {m.role && <div style={{ fontSize: 11, color: A.accent }}>{m.role}</div>}
                </div>
                {m.units.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 10, fontFamily: unitFont, fontSize: 11, color: "#52524c" }}>
                    {m.units.map((u, i) => <span key={i}>{u}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function projectsVisible(data: CompanyData): boolean {
  return data.projects.length > 0;
}

// The first photo of each project sits in its row on the projects page, so
// the gallery only carries the extra ones — and is skipped entirely (no
// half-empty page) when no project has more than one photo.
export function galleryVisible(data: CompanyData): boolean {
  return data.projects.some((p) => p.media.length > 1);
}

// Project gallery — the extra photos, two to a row, each captioned with its
// project so it reads on its own.
export function CompanyGallery({ data, headFont }: { data: CompanyData; headFont: string }) {
  const photos = data.projects.flatMap((p) => p.media.slice(1).map((m) => ({ ...m, project: p.name })));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 18px" }}>
      {photos.map((m, i) => (
        <figure key={i} style={{ margin: 0, breakInside: "avoid" }}>
          <div style={{ borderRadius: 6, overflow: "hidden", border: `1px solid ${RULE}`, ...band }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt="" style={{ width: "100%", height: 190, objectFit: "cover", display: "block" }} />
          </div>
          <figcaption style={{ marginTop: 7, lineHeight: 1.4 }}>
            <div style={{ fontFamily: headFont, fontWeight: 600, fontSize: 12.5, color: INK }}>{m.project}</div>
            {m.caption && <div style={{ fontSize: 11, color: MUTE }}>{m.caption}</div>}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

// ── small green "Verified" mark for a confirmed project (issuer not shown) ──
function PartVerified() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "#067a5e", whiteSpace: "nowrap", ...band }}>
      <svg width="10" height="10" viewBox="0 0 11 11" aria-hidden style={{ flex: "none" }}>
        <circle cx="5.5" cy="5.5" r="5.5" fill="#067a5e" />
        <path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
      Verified
    </span>
  );
}

// ── selected-projects list (numbered, with sector / client / value / badge) ──
// Shared by the five templates; the heading + run-line stay per-template so
// each design keeps its own voice, but the project rows are identical.
// Scope as an accent-dot list. Newlines/bullet glyphs become separate items;
// a single-item scope renders as a plain paragraph. Inline-styled because the
// PDF render has no Tailwind.
function ScopeBullets({ text, A }: { text: string; A: AccentSet }) {
  const items = splitScope(text);
  if (items.length <= 1) {
    return <p style={{ fontSize: 12, color: BODY, lineHeight: 1.55, margin: "6px 0 0" }}>{text}</p>;
  }
  return (
    <div style={{ margin: "6px 0 0" }}>
      {items.map((it, j) => (
        <div key={j} style={{ display: "flex", gap: 7, fontSize: 12, color: BODY, lineHeight: 1.5, marginTop: j > 0 ? 4 : 0 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: A.accent, flex: "none", marginTop: 6, ...band }} />
          <span style={{ minWidth: 0 }}>{it}</span>
        </div>
      ))}
    </div>
  );
}

// Each project row: number, name (+ verified), a meta line (sector tag ·
// client · years), the scope, the contract value on the right, and — when
// the project has a photo — that photo as a thumbnail, so a bid reviewer
// sees the work beside the claim. The sector used to sit under the number in
// a 58px column, where long sectors ("Roads & infrastructure") ran into the
// client line; it's now a tag on the meta line.
export function CompanyProjects({ data, A, headFont }: {
  data: CompanyData; A: AccentSet; headFont: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {data.projects.map((p, i) => {
        const last = i === data.projects.length - 1;
        const photo = p.media[0];
        return (
          <article key={i} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: last ? "none" : `1px solid ${RULE}`, breakInside: "avoid" }}>
            <div style={{ width: 30, flex: "none", fontFamily: headFont, fontWeight: 600, fontSize: 18, color: A.accent, lineHeight: 1.15 }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            {photo && (
              <div style={{ width: 132, height: 92, flex: "none", borderRadius: 5, overflow: "hidden", border: `1px solid ${RULE}`, ...band }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: headFont, fontWeight: 600, fontSize: 14.5, color: INK, lineHeight: 1.3 }}>{p.name}</span>
                {p.verified && <PartVerified />}
              </div>
              {(p.sector || p.client || p.yearRange) && (
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px 8px", fontSize: 11.5, marginTop: 4 }}>
                  {p.sector && (
                    <span style={{ fontSize: 9.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: A.accent, background: A.tint, border: `1px solid ${A.tintBorder}`, borderRadius: 3, padding: "2px 6px", whiteSpace: "nowrap", ...band }}>{p.sector}</span>
                  )}
                  {(p.client || p.yearRange) && <span style={{ color: MUTE }}>{[p.client, p.yearRange].filter(Boolean).join(" · ")}</span>}
                </div>
              )}
              {p.scope && <ScopeBullets text={p.scope} A={A} />}
            </div>
            {p.value && (
              <div style={{ width: 74, flex: "none", textAlign: "right" }}>
                <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: FAINT }}>Value</div>
                <div style={{ fontFamily: headFont, fontWeight: 600, fontSize: 15, color: INK, marginTop: 2 }}>{p.value}</div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

// ── client list — an even wall of equal cards, logo (or name) centred ──
// Logos are sized by height with width auto: an uploaded SVG without its
// own pixel size used to collapse to zero width in a shrink-wrapped chip,
// printing an empty box.
export function CompanyClientGroups({ data, A, variant = "bordered", chipFont }: {
  data: CompanyData; A: AccentSet; variant?: "bordered" | "tinted"; chipFont?: string;
}) {
  const card = variant === "tinted"
    ? { background: A.tint, border: `1px solid ${A.tintBorder}`, ...band }
    : { background: "#fff", border: `1px solid ${RULE}` };
  const clients = data.clientGroups.flatMap((g) => g.clients);
  // Fill rows evenly: 3 across unless 4 across leaves fewer gaps.
  const n = clients.length;
  const cols = n % 3 === 0 ? 3 : n % 4 === 0 || n >= 9 ? 4 : 3;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
      {clients.map((c, i) => (
        <div key={i} style={{ height: 74, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 14px", breakInside: "avoid", ...card }}>
          {c.logoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={c.logoUrl} alt={c.name} style={{ height: 40, width: "auto", maxWidth: "100%", objectFit: "contain", display: "block" }} />
            : <span style={{ fontFamily: chipFont, fontSize: 12.5, fontWeight: 600, color: BODY, textAlign: "center", lineHeight: 1.3 }}>{c.name}</span>}
        </div>
      ))}
    </div>
  );
}

// ── Registration & certifications — the compliance facts a tender
// evaluator looks for first: registration number and country, year
// founded, and each certificate / licence with issuer, year and (when
// admin-checked) the verified mark. ──
export function credentialsVisible(data: CompanyData): boolean {
  return Boolean(data.registrationNumber || data.certifications.length > 0);
}

export function CompanyCredentials({ data, A, headFont }: { data: CompanyData; A: AccentSet; headFont: string }) {
  const facts = [
    ["Registration No.", data.registrationNumber],
    ["Registered in", data.country],
    ["Founded", data.foundedYear],
  ].filter(([, v]) => v) as [string, string][];
  return (
    <div>
      {facts.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${facts.length}, 1fr)`, border: `1px solid ${RULE}`, borderRadius: 6, marginBottom: data.certifications.length ? 12 : 0 }}>
          {facts.map(([k, v], i) => (
            <div key={i} style={{ padding: "10px 14px", borderLeft: i ? `1px solid ${RULE}` : "none" }}>
              <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.12em", color: FAINT }}>{k}</div>
              <div style={{ fontFamily: headFont, fontWeight: 600, fontSize: 13.5, color: INK, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      )}
      {data.certifications.map((c, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 2px", borderBottom: i < data.certifications.length - 1 ? `1px solid ${RULE}` : "none", breakInside: "avoid" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden style={{ flex: "none" }}>
            <circle cx="8" cy="6.5" r="4.5" fill="none" stroke={A.accent} strokeWidth="1.4" />
            <path d="M5.6 10l-1 4.5L8 13l3.4 1.5-1-4.5" fill="none" stroke={A.accent} strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: headFont, fontWeight: 600, fontSize: 13, color: INK }}>{c.name}</span>
            {c.issuer && <span style={{ fontSize: 11.5, color: MUTE }}>{"  ·  "}{c.issuer}</span>}
            {c.verified && <>&nbsp;&nbsp;<PartVerified /></>}
          </div>
          {c.year && <div style={{ fontSize: 11.5, fontWeight: 600, color: MUTE, fontVariantNumeric: "tabular-nums" }}>{c.year}</div>}
        </div>
      ))}
    </div>
  );
}

// ── Section heading shared by the six templates that used a tinted tab:
// the title in the display face, ink, over a hairline with a short accent
// bar sitting on it. Reads as a designed document rather than a form label.
export function SectionTitle({ A, font, weight = 600, size = 19, mb = 14, children }: {
  A: AccentSet; font: string; weight?: number; size?: number; mb?: number; children: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative", marginBottom: mb, paddingBottom: 7, borderBottom: `1px solid ${RULE}`, breakAfter: "avoid" }}>
      <span style={{ fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1.2, color: INK, letterSpacing: "0.005em" }}>{children}</span>
      <span style={{ position: "absolute", left: 0, bottom: -1.5, width: 38, height: 3, background: A.accent, ...band }} />
    </div>
  );
}
