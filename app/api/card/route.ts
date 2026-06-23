import { createElement } from "react";
import { NextResponse, type NextRequest } from "next/server";
import QRCode from "qrcode";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { loadIndividualProfile } from "@/lib/profile-data";
import { loadCompanyProfile } from "@/lib/company-data";
import { renderCard } from "@/lib/pdf/render";
import { BusinessCard, type BusinessCardData } from "@/components/cv/BusinessCard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CARD_FONTS =
  "https://fonts.googleapis.com/css2" +
  "?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700" +
  "&family=Public+Sans:wght@400;500;600;700" +
  "&display=swap";

// The same curated accents the card mockup ships with.
const ACCENTS = ["#20304d", "#1d3b3b", "#262626", "#243d31", "#532330"];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const format = url.searchParams.get("format") === "pdf" ? "pdf" : "png";
  const accentParam = url.searchParams.get("accent");
  const accent = accentParam && ACCENTS.includes(accentParam) ? accentParam : ACCENTS[0];

  const supabase = createSupabaseRouteClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
  const isCompany = profile?.account_type === "company";

  const profileUrl = `${url.origin}/u/${user.id}`;
  const qrDataUrl = await QRCode.toDataURL(profileUrl, {
    margin: 0, width: 320, errorCorrectionLevel: "M",
    color: { dark: "#16130f", light: "#00000000" },
  });

  let cardData: BusinessCardData;

  if (isCompany) {
    const data = await loadCompanyProfile(user.id);
    const b = data.basics;
    if (!b?.company_name) {
      return NextResponse.json({ error: "Add your company name and contact details before downloading a card." }, { status: 400 });
    }
    const verified =
      data.projects.filter((x) => x.verified).length +
      data.certifications.filter((x) => x.verified).length;
    const sectors: string[] = b.sectors ?? [];
    const founded = b.founded_year ? `Est. ${b.founded_year}` : "";
    cardData = {
      name: b.company_name,
      role: b.tagline || sectors[0] || "",
      org: [b.country, founded].filter(Boolean).join(" · ") || sectors.slice(0, 2).join(" · "),
      email: b.email || "",
      phone: b.phone || "",
      location: b.country || b.locations?.[0] || "",
      photoUrl: b.logo_url || "",
      verified: verified > 0,
      profileUrl,
      profileLabel: url.host,
      qrDataUrl,
    };
  } else {
    const data = await loadIndividualProfile(user.id);
    const b = data.basics;
    if (!b?.full_name) {
      return NextResponse.json({ error: "Add your name and contact details before downloading a card." }, { status: 400 });
    }
    const latest = data.experiences[0];
    const verified =
      data.experiences.filter((x) => x.verified).length +
      data.educations.filter((x) => x.verified).length +
      data.certifications.filter((x) => x.verified).length;
    cardData = {
      name: b.full_name,
      role: b.headline || latest?.title || "",
      org: latest?.organization || "",
      email: b.email || "",
      phone: b.phone || "",
      location: b.location || "",
      photoUrl: b.photo_url || "",
      verified: verified > 0,
      profileUrl,
      profileLabel: url.host,
      qrDataUrl,
    };
  }

  let buf: Buffer;
  try {
    buf = await renderCard(createElement(BusinessCard, { data: cardData, theme: { accent } }), { format, fonts: CARD_FONTS, scale: 3 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Card generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const body = new Uint8Array(buf);
  return new NextResponse(body, {
    headers: {
      "Content-Type": format === "pdf" ? "application/pdf" : "image/png",
      "Content-Disposition": contentDisposition(`${cardData.name} - Sahan card.${format}`),
      "Content-Length": String(body.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}

// Non-Latin-1 names break the header; ASCII fallback + RFC 5987 filename*.
function contentDisposition(name: string) {
  const cleaned = name.replace(/[\\/:*?"<>|\r\n]+/g, "_").trim();
  const ascii = cleaned.replace(/[^\x20-\x7E]/g, "-") || "sahan-card";
  const utf8 = encodeURIComponent(cleaned).replace(/['()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
  return `attachment; filename="${ascii}"; filename*=UTF-8''${utf8}`;
}
