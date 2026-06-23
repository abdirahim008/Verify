import "server-only";

// Digital business card — a downloadable PNG / PDF the user can share or send
// to print. Landscape two-column layout (Sahan-Business-Card handoff): accent
// panel with identity + contact on the left, QR panel on the right.
// Adjustable accent; the rest of the colour roles derive from it by luminance.

const SERIF = "'Source Serif 4', Georgia, serif";
const SANS = "'Public Sans', system-ui, sans-serif";
const INK = "#16130f";
const band = { WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as const;

export interface BusinessCardData {
  name: string;
  role: string;
  org: string;
  email: string;
  phone: string;
  location: string;
  photoUrl: string;
  verified: boolean;
  profileUrl: string;     // absolute, for the QR
  profileLabel: string;   // shown under "Scan to view profile"
  qrDataUrl: string;      // pre-rendered QR PNG data URL
}

function derive(accent: string) {
  const hex = (accent || "#20304d").replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) || 0, g = parseInt(hex.slice(2, 4), 16) || 0, b = parseInt(hex.slice(4, 6), 16) || 0;
  const dark = (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.6;
  return {
    accent,
    onAccent: dark ? "#ffffff" : "#1a1a1a",
    onAccentMuted: dark ? "rgba(255,255,255,0.72)" : "#5a544c",
    accentLine: dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.18)",
    iconBg: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)",
  };
}

function initials(name: string) {
  const t = name.trim().split(/\s+/).filter(Boolean);
  return ((t[0]?.[0] ?? "") + (t[1]?.[0] ?? "")).toUpperCase() || "·";
}

export function BusinessCard({ data, theme }: { data: BusinessCardData; theme?: Record<string, string> }) {
  const C = derive(theme?.accent ?? "#20304d");
  const rows: Array<[React.ReactNode, string, string]> = [];
  if (data.email) rows.push([<MailIcon key="m" />, "Email", data.email]);
  if (data.phone) rows.push([<PhoneIcon key="p" />, "Phone", data.phone]);
  if (data.location) rows.push([<PinIcon key="l" />, "Location", data.location]);

  return (
    <div id="card" style={{ width: 780, display: "flex", background: "#ffffff", borderRadius: 22, boxShadow: "0 18px 50px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden", fontFamily: SANS, color: INK }}>
      {/* Left: accent identity + contact */}
      <div style={{ flex: 1.3, background: C.accent, padding: "34px 34px 32px", display: "flex", flexDirection: "column", ...band }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {data.photoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={data.photoUrl} alt="" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", border: `1.5px solid ${C.accentLine}` }} />
            : <div style={{ width: 60, height: 60, borderRadius: "50%", border: `1.5px solid ${C.accentLine}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 600, fontSize: 25, color: C.onAccent }}>{initials(data.name)}</div>}
          {data.verified && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.14)", border: `1px solid ${C.accentLine}`, borderRadius: 999, padding: "5px 11px" }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#36c98a", color: "#0b3a26", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", color: C.onAccent }}>Verified</span>
            </div>
          )}
        </div>

        <h1 style={{ margin: "18px 0 0", fontFamily: SERIF, fontWeight: 600, fontSize: 27, lineHeight: 1.12, color: C.onAccent }}>{data.name}</h1>
        {data.role && <div style={{ marginTop: 6, fontSize: 13, fontWeight: 600, color: C.onAccent }}>{data.role}</div>}
        {data.org && <div style={{ fontSize: 12.5, color: C.onAccentMuted }}>{data.org}</div>}

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 13, paddingTop: 26 }}>
          {rows.map(([icon, label, value], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 32, height: 32, flex: "none", borderRadius: 9, background: C.iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: C.onAccent, ...band }}>{icon}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.12em", color: C.onAccentMuted }}>{label}</div>
                <div style={{ fontSize: 13, color: C.onAccent }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: QR */}
      <div style={{ flex: 1, padding: "34px 30px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ width: 150, height: 150, borderRadius: 14, background: "#ffffff", border: "1px solid #e6e3dc", padding: 11 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.qrDataUrl} alt="QR code to profile" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        <div style={{ marginTop: 16, fontFamily: SERIF, fontWeight: 600, fontSize: 17, color: INK }}>Scan to view profile</div>
        <p style={{ margin: "6px 0 0", fontSize: 12, lineHeight: 1.5, color: "#6a6a64", maxWidth: 230 }}>Opens the full verified CV and contact details, always up to date.</p>
        {data.profileLabel && <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: C.accent, wordBreak: "break-all" }}>{data.profileLabel}</div>}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #efedea", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 15, color: INK }}>Sahan<span style={{ color: C.accent }}>.</span></span>
          <span style={{ fontSize: 11, color: "#a8a29a" }}>· Digital business card</span>
        </div>
      </div>
    </div>
  );
}

function MailIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden><rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M2 4l6 4.5L14 4" stroke="currentColor" strokeWidth="1.3" fill="none" /></svg>;
}
function PhoneIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M4.5 2.5l2 .5 1 2.5-1.5 1a7 7 0 003 3l1-1.5 2.5 1 .5 2c0 .8-.7 1.5-1.5 1.4A11 11 0 013.1 4C3 3.2 3.7 2.5 4.5 2.5z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round" /></svg>;
}
function PinIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M8 14.5s5-4.2 5-8a5 5 0 10-10 0c0 3.8 5 8 5 8z" stroke="currentColor" strokeWidth="1.2" fill="none" /><circle cx="8" cy="6.5" r="1.8" stroke="currentColor" strokeWidth="1.2" /></svg>;
}
