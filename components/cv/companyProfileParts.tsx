import "server-only";
import type { CompanyData } from "@/lib/pdf/company-data";
import { ceoInitials, type AccentSet } from "./companyShared";

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
// heavier real-world content grow rather than clip.
export const SHELL_CSS = `
@page { size: A4; margin: 0; }
.cpage {
  width: 794px; min-height: 1123px; background: #ffffff;
  box-sizing: border-box; color: #3a352f; overflow: hidden;
  break-after: page; page-break-after: always;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.cpage:last-child { break-after: auto; page-break-after: auto; }
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
export function CompanyProjects({ data, A, headFont }: {
  data: CompanyData; A: AccentSet; headFont: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {data.projects.map((p, i) => {
        const last = i === data.projects.length - 1;
        return (
          <article key={i} style={{ display: "flex", gap: 16, padding: "13px 0", borderBottom: last ? "none" : `1px solid ${RULE}` }}>
            <div style={{ width: 58, flex: "none" }}>
              <div style={{ fontFamily: headFont, fontWeight: 600, fontSize: 18, color: A.accent, lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</div>
              {p.sector && <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.1em", color: FAINT, marginTop: 4 }}>{p.sector}</div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: headFont, fontWeight: 600, fontSize: 14.5, color: INK }}>{p.name}</span>
                {p.verified && <PartVerified />}
              </div>
              {(p.client || p.yearRange) && (
                <div style={{ fontSize: 11.5, color: A.accent, marginTop: 2 }}>{[p.client, p.yearRange].filter(Boolean).join(" · ")}</div>
              )}
              {p.scope && <p style={{ fontSize: 12, color: BODY, lineHeight: 1.55, margin: "6px 0 0" }}>{p.scope}</p>}
            </div>
            {p.value && (
              <div style={{ width: 86, flex: "none", textAlign: "right" }}>
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

// ── grouped client list (category heading + chips) ──
export function CompanyClientGroups({ data, A, variant = "bordered", chipFont }: {
  data: CompanyData; A: AccentSet; variant?: "bordered" | "tinted"; chipFont?: string;
}) {
  const chip = variant === "tinted"
    ? { background: A.tint, border: `1px solid ${A.tintBorder}`, ...band }
    : { border: `1px solid ${RULE}` };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      {data.clientGroups.map((g, gi) => (
        <div key={gi}>
          {g.category !== "Clients" && <div style={{ fontFamily: chipFont, fontSize: 11, fontWeight: 600, color: FAINT, marginBottom: 7 }}>{g.category}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            {g.clients.map((c, i) => (
              c.logoUrl ? (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 64, padding: "9px 16px", borderRadius: 6, background: "#fff", border: `1px solid ${RULE}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.logoUrl} alt={c.name} style={{ maxHeight: 46, maxWidth: 150, objectFit: "contain", display: "block" }} />
                </span>
              ) : (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", height: 64, borderRadius: 6, padding: "0 16px", fontFamily: chipFont, fontSize: 12, color: BODY, whiteSpace: "nowrap", ...chip }}>{c.name}</span>
              )
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
