import { ImageResponse } from "next/og";

// Social share card for public profiles. When a member drops their profile
// link in WhatsApp / LinkedIn / X, this is the preview that unfurls — which
// makes every shared profile a small ad for Sahan. Uses only the fields the
// public profile page itself leads with (name, headline, photo); location
// and contact stay off — they're registered-only per the visibility rules.
//
// Middleware already exempts *\/opengraph-image paths, so crawlers can fetch
// this logged-out. Any failure (missing data, unreachable photo, font fetch)
// degrades to the generic brand card rather than a broken preview.

// Edge runtime: @vercel/og's nodejs build has a broken Windows file-URL path
// (ERR_INVALID_URL loading its fallback font), and edge is the recommended
// runtime for OG images anyway. The REST fetches below are edge-compatible.
export const runtime = "edge";
export const alt = "Verified profile on Sahan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = {
  cream: "#f3f2ef", ink: "#1c1c1c", muted: "#5e6166",
  blue: "#0a5cad", green: "#067a5e", border: "#e0e0e0",
};

// Serif for the name — fetched once per lambda and reused. The old-browser
// UA makes Google Fonts serve TTF, which satori can consume (woff2 it can't).
let serifData: ArrayBuffer | null = null;
async function loadSerif(): Promise<ArrayBuffer | null> {
  if (serifData) return serifData;
  try {
    const css = await (await fetch(
      "https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@600",
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1)" } },
    )).text();
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    if (!url) return null;
    serifData = await (await fetch(url)).arrayBuffer();
    return serifData;
  } catch { return null; }
}

interface CardData { name: string; line: string; photoUrl: string; isCompany: boolean }

async function loadCard(id: string): Promise<CardData | null> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return null;
  const h = { apikey: key, Authorization: `Bearer ${key}` };
  try {
    const prof = await (await fetch(`${base}/rest/v1/profiles?id=eq.${id}&select=account_type`, { headers: h })).json();
    if (!Array.isArray(prof) || !prof[0]) return null;
    if (prof[0].account_type === "company") {
      const [c] = await (await fetch(`${base}/rest/v1/company_details?profile_id=eq.${id}&select=company_name,tagline,logo_url,sectors`, { headers: h })).json();
      if (!c?.company_name) return null;
      return { name: c.company_name, line: c.tagline || (c.sectors ?? []).slice(0, 3).join(" · "), photoUrl: c.logo_url ?? "", isCompany: true };
    }
    const [d] = await (await fetch(`${base}/rest/v1/individual_details?profile_id=eq.${id}&select=full_name,headline,photo_url`, { headers: h })).json();
    if (!d?.full_name) return null;
    return { name: d.full_name, line: d.headline ?? "", photoUrl: d.photo_url ?? "", isCompany: false };
  } catch { return null; }
}

function initials(name: string): string {
  const t = name.trim().split(/\s+/).filter(Boolean);
  return ((t[0]?.[0] ?? "") + (t.length > 1 ? t[t.length - 1][0] : "")).toUpperCase() || "S";
}

export default async function OgImage({ params }: { params: { id: string } }) {
  const [card, serif] = await Promise.all([loadCard(params.id), loadSerif()]);
  const fonts = serif ? [{ name: "serif4", data: serif, weight: 600 as const, style: "normal" as const }] : undefined;
  const serifFamily = serif ? "serif4" : "serif";

  const shell = (children: React.ReactNode) => (
    <div style={{
      width: "100%", height: "100%", display: "flex", flexDirection: "column",
      background: C.cream, padding: "56px 72px", position: "relative",
    }}>
      {/* wordmark */}
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <span style={{ fontFamily: serifFamily, fontSize: 44, fontWeight: 600, color: C.ink }}>Sahan</span>
        <span style={{ fontFamily: serifFamily, fontSize: 44, fontWeight: 600, color: C.blue }}>.</span>
      </div>
      {children}
      {/* footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: "auto" }}>
        <div style={{ display: "flex", width: 34, height: 34, borderRadius: 17, background: C.green, alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M5 12.5 L10 17.5 L19 7.5" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={{ fontSize: 26, color: C.muted }}>Verified profile · sahanprofiles.com</span>
      </div>
    </div>
  );

  // Generic brand card when the profile can't be loaded.
  if (!card) {
    return new ImageResponse(
      shell(
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
          <div style={{ fontFamily: serifFamily, fontSize: 84, fontWeight: 600, color: C.ink, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            Your work, verified.
          </div>
          <div style={{ fontSize: 32, color: C.muted, marginTop: 24 }}>
            Elegant CVs &amp; company profiles for the Horn of Africa.
          </div>
        </div>,
      ),
      { ...size, fonts },
    );
  }

  return new ImageResponse(
    shell(
      <div style={{ display: "flex", alignItems: "center", flex: 1, gap: 64 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontFamily: serifFamily, fontSize: card.name.length > 26 ? 60 : 76, fontWeight: 600, color: C.ink, lineHeight: 1.06, letterSpacing: "-0.02em" }}>
            {card.name}
          </div>
          {card.line && (
            <div style={{ fontSize: 32, color: C.muted, marginTop: 22, lineHeight: 1.35 }}>
              {card.line.length > 90 ? card.line.slice(0, 90).trimEnd() + "…" : card.line}
            </div>
          )}
        </div>
        {card.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.photoUrl}
            alt=""
            width={250}
            height={250}
            style={card.isCompany
              ? { width: 250, height: 250, borderRadius: 36, objectFit: "contain", background: "#fff", border: `1px solid ${C.border}`, padding: 24 }
              : { width: 250, height: 250, borderRadius: 125, objectFit: "cover", border: "6px solid #fff" }}
          />
        ) : (
          <div style={{
            display: "flex", width: 250, height: 250, borderRadius: card.isCompany ? 36 : 125,
            background: "#d6e4f2", border: "6px solid #fff",
            alignItems: "center", justifyContent: "center",
            fontFamily: serifFamily, fontSize: 96, fontWeight: 600, color: C.blue,
          }}>
            {initials(card.name)}
          </div>
        )}
      </div>,
    ),
    { ...size, fonts },
  );
}
