import "server-only";

// Digital business card — a downloadable PNG / PDF the user can share or send
// to print. Faithful port of the Sahan-Business-Card handoff: accent header,
// contact rows, a real QR to the public profile, Sahan footer. Adjustable
// accent; the rest of the colour roles derive from it by luminance.

const SERIF = "'Source Serif 4', Georgia, serif";
const SANS = "'Public Sans', system-ui, sans-serif";
const INK = "#16130f";

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
    tint: `rgba(${r},${g},${b},0.07)`,
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
    <div id="card" style={{ width: 464, background: "#ffffff", borderRadius: 24, boxShadow: "0 18px 50px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden", fontFamily: SANS, color: INK }}>
      {/* Header band */}
      <div style={{ background: C.accent, padding: "34px 34px 30px", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {data.photoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={data.photoUrl} alt="" style={{ width: 66, height: 66, borderRadius: "50%", objectFit: "cover", border: `1.5px solid ${C.accentLine}` }} />
            : <div style={{ width: 66, height: 66, borderRadius: "50%", border: `1.5px solid ${C.accentLine}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 600, fontSize: 27, color: C.onAccent }}>{initials(data.name)}</div>}
          {data.verified && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.14)", border: `1px solid ${C.accentLine}`, borderRadius: 999, padding: "5px 11px" }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#36c98a", color: "#0b3a26", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", color: C.onAccent }}>Verified</span>
            </div>
          )}
        </div>
        <h1 style={{ margin: "20px 0 0", fontFamily: SERIF, fontWeight: 600, fontSize: 27, lineHeight: 1.15, color: C.onAccent }}>{data.name}</h1>
        {data.role && <div style={{ marginTop: 7, fontSize: 13, fontWeight: 600, color: C.onAccent }}>{data.role}</div>}
        {data.org && <div style={{ fontSize: 12.5, color: C.onAccentMuted }}>{data.org}</div>}
      </div>

      {/* Contact rows */}
      <div style={{ padding: "24px 34px 6px", display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map(([icon, label, value], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ width: 36, height: 36, flex: "none", borderRadius: 10, background: C.tint, display: "flex", alignItems: "center", justifyContent: "center", color: C.accent, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>{icon}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9a948c" }}>{label}</div>
              <div style={{ fontSize: 13.5, color: INK }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ margin: "18px 34px 0", height: 1, background: "#efedea" }} />

      {/* QR */}
      <div style={{ padding: "22px 34px 30px", display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ flex: "none", width: 124, height: 124, borderRadius: 14, background: "#ffffff", border: "1px solid #e6e3dc", padding: 9 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.qrDataUrl} alt="QR code to profile" style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 17, color: INK, lineHeight: 1.25 }}>Scan to view profile</div>
          <p style={{ margin: "6px 0 0", fontSize: 12.5, lineHeight: 1.5, color: "#6a6a64" }}>Opens the full verified CV and contact details, always up to date.</p>
          {data.profileLabel && <div style={{ marginTop: 11, fontSize: 12, fontWeight: 600, color: C.accent, wordBreak: "break-all" }}>{data.profileLabel}</div>}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: C.tint, padding: "13px 34px", display: "flex", alignItems: "center", justifyContent: "space-between", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 15, color: INK }}>Sahan<span style={{ color: C.accent }}>.</span></span>
        <span style={{ fontSize: 11, letterSpacing: "0.04em", color: "#8a857c" }}>Digital business card</span>
      </div>
    </div>
  );
}

function MailIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden><rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M2 4l6 4.5L14 4" stroke="currentColor" strokeWidth="1.3" fill="none" /></svg>;
}
function PhoneIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M4.5 2.5l2 .5 1 2.5-1.5 1a7 7 0 003 3l1-1.5 2.5 1 .5 2c0 .8-.7 1.5-1.5 1.4A11 11 0 013.1 4C3 3.2 3.7 2.5 4.5 2.5z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round" /></svg>;
}
function PinIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M8 14.5s5-4.2 5-8a5 5 0 10-10 0c0 3.8 5 8 5 8z" stroke="currentColor" strokeWidth="1.2" fill="none" /><circle cx="8" cy="6.5" r="1.8" stroke="currentColor" strokeWidth="1.2" /></svg>;
}
