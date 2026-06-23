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
  const cols = Math.min(Math.max(data.team.length, 1), 3);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ background: A.tint, border: `1px solid ${A.tintBorder}`, borderRadius: 6, padding: "9px 22px", textAlign: "center", ...band }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em", color: FAINT }}>Governance</div>
        <div style={{ fontFamily: nameFont, fontWeight: 600, fontSize: 13, color: INK }}>{board}</div>
      </div>
      {data.ceo.name && (
        <>
          <div style={{ width: 1.5, height: 18, background: A.accentLine }} />
          <div style={{ background: A.accent, borderRadius: 6, padding: "11px 26px", textAlign: "center", color: A.onAccent, ...band }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em", color: A.onAccentMuted }}>Chief Executive</div>
            <div style={{ fontFamily: nameFont, fontWeight: 600, fontSize: 14 }}>{[data.ceo.name, data.ceo.title].filter(Boolean).join(" · ")}</div>
          </div>
        </>
      )}
      {data.team.length > 0 && (
        <>
          <div style={{ width: 1.5, height: 18, background: A.accentLine }} />
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 20, width: "100%" }}>
            {data.team.slice(0, 6).map((m) => (
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {g.clients.map((c, i) => (
              <span key={i} style={{ borderRadius: 5, padding: "7px 14px", fontFamily: chipFont, fontSize: 12, color: BODY, whiteSpace: "nowrap", ...chip }}>{c}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
