import { createElement } from "react";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { loadCompanyDataForPdf } from "@/lib/pdf/company-data";
import { renderPdf } from "@/lib/pdf/render";
import { resolveThemeOverrides } from "@/lib/pdf/themes";
import { WadaniCompanyProfile } from "@/components/cv/WadaniCompanyProfile";
import { AnnualCompanyProfile } from "@/components/cv/AnnualCompanyProfile";
import { MinimalCompanyProfile } from "@/components/cv/MinimalCompanyProfile";
import { StandardCompanyProfile } from "@/components/cv/StandardCompanyProfile";
import { DossierCompanyProfile } from "@/components/cv/DossierCompanyProfile";
import { BannerCompanyProfile } from "@/components/cv/BannerCompanyProfile";
import { BroadsheetCompanyProfile } from "@/components/cv/BroadsheetCompanyProfile";
import { BentoCompanyProfile } from "@/components/cv/BentoCompanyProfile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Chromium cold-start can take 5–15s; the 10s default would time out the
// first request. 60 is the Hobby ceiling and ample once warm.
export const maxDuration = 60;

const FONT_BASE = "https://fonts.googleapis.com/css2?";

// The original three templates share the Source Serif 4 + Public Sans +
// Plex Mono palette. Variable wght ranges so the lighter display weights
// (Minimal's 250–280 cover) resolve exactly instead of snapping to 300.
const PROFILE_FONTS =
  FONT_BASE +
  "family=Source+Serif+4:ital,opsz,wght@0,8..60,200..600;1,8..60,200..600" +
  "&family=Public+Sans:wght@400..700" +
  "&family=IBM+Plex+Mono:wght@400;500" +
  "&display=swap";

// Each "Company Profile System" template pairs a display + body face.
const TEMPLATES = {
  wadani:  { name: "Wadani",  component: WadaniCompanyProfile,  fonts: PROFILE_FONTS },
  annual:  { name: "Annual",  component: AnnualCompanyProfile,  fonts: PROFILE_FONTS },
  minimal: { name: "Minimal", component: MinimalCompanyProfile, fonts: PROFILE_FONTS },
  standard: { name: "The Standard", component: StandardCompanyProfile,
    fonts: FONT_BASE + "family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Public+Sans:wght@400;500;600;700&display=swap" },
  dossier: { name: "The Dossier", component: DossierCompanyProfile,
    fonts: FONT_BASE + "family=Space+Grotesk:wght@500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" },
  banner: { name: "The Banner", component: BannerCompanyProfile,
    fonts: FONT_BASE + "family=Bodoni+Moda:ital,wght@0,500;0,600;1,500&family=Karla:wght@400;500;600;700&display=swap" },
  broadsheet: { name: "The Broadsheet", component: BroadsheetCompanyProfile,
    fonts: FONT_BASE + "family=Archivo:wght@500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" },
  bento: { name: "The Bento", component: BentoCompanyProfile,
    fonts: FONT_BASE + "family=Spectral:ital,wght@0,500;0,600;1,500&family=Public+Sans:wght@400;500;600;700&display=swap" },
} as const;

export async function GET(
  req: NextRequest,
  { params }: { params: { template: string } },
) {
  const t = TEMPLATES[params.template as keyof typeof TEMPLATES];
  if (!t) {
    return NextResponse.json({ error: "Unknown template" }, { status: 404 });
  }
  // ?theme=<id> picks a curated palette (unknown ids → default).
  // ?preview=1 serves inline so the templates page can iframe the PDF.
  const url = new URL(req.url);
  const theme = resolveThemeOverrides("company", params.template, url.searchParams.get("theme"));
  const inline = url.searchParams.get("preview") === "1";

  const supabase = createSupabaseRouteClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  // Belt-and-braces: only companies can download a company profile.
  const { data: profile } = await supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
  if (profile?.account_type !== "company") {
    return NextResponse.json({ error: "Company-account only" }, { status: 403 });
  }

  const data = await loadCompanyDataForPdf(user.id);
  if (!data) {
    return NextResponse.json({
      error: "Fill in the company name and at least one project before downloading.",
    }, { status: 400 });
  }

  // Optional year filter (?from / ?to). Keep projects whose year span overlaps
  // [from, to]; undated projects are always kept so nothing silently vanishes.
  const from = Number(url.searchParams.get("from")) || null;
  const to = Number(url.searchParams.get("to")) || null;
  if (from || to) {
    const lo = from ?? -Infinity, hi = to ?? Infinity;
    data.projects = data.projects.filter((p) => {
      const start = p.yearStart ?? p.yearEnd;
      const end = p.yearEnd ?? p.yearStart;
      if (start == null && end == null) return true;
      return (end ?? start)! >= lo && (start ?? end)! <= hi;
    });
  }

  const Template = t.component;
  let pdf: Buffer;
  try {
    pdf = await renderPdf(createElement(Template, { data, theme }), {
      pageTitle: `${data.name} — Company Profile`,
      fonts: t.fonts,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const body = new Uint8Array(pdf);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition(`${data.name} - Company Profile (${t.name}).pdf`, inline),
      "Content-Length": String(body.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}

// HTTP headers are ByteStrings — non-Latin-1 characters (em-dashes, Somali
// or Arabic company names) throw at Response construction. ASCII fallback
// in `filename`, real UTF-8 name via RFC 5987 `filename*`.
function contentDisposition(name: string, inline = false) {
  const cleaned = name.replace(/[\\/:*?"<>|\r\n]+/g, "_").trim();
  const ascii = cleaned.replace(/[^\x20-\x7E]/g, "-") || "company-profile.pdf";
  const utf8 = encodeURIComponent(cleaned).replace(/['()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
  return `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${utf8}`;
}
