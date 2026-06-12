import { createElement } from "react";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { loadCompanyDataForPdf } from "@/lib/pdf/company-data";
import { renderPdf } from "@/lib/pdf/render";
import { WadaniCompanyProfile } from "@/components/cv/WadaniCompanyProfile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TEMPLATES = {
  wadani: { name: "Wadani", component: WadaniCompanyProfile },
} as const;

const PROFILE_FONTS =
  "https://fonts.googleapis.com/css2" +
  "?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;1,8..60,300;1,8..60,400" +
  "&family=Public+Sans:wght@400;500;600;700" +
  "&family=IBM+Plex+Mono:wght@400;500" +
  "&display=swap";

export async function GET(
  _req: NextRequest,
  { params }: { params: { template: string } },
) {
  const t = TEMPLATES[params.template as keyof typeof TEMPLATES];
  if (!t) {
    return NextResponse.json({ error: "Unknown template" }, { status: 404 });
  }

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

  const Template = t.component;
  let pdf: Buffer;
  try {
    pdf = await renderPdf(createElement(Template, { data }), {
      pageTitle: `${data.name} — Company Profile`,
      fonts: PROFILE_FONTS,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const body = new Uint8Array(pdf);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition(`${data.name} - Company Profile.pdf`),
      "Content-Length": String(body.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}

// HTTP headers are ByteStrings — non-Latin-1 characters (em-dashes, Somali
// or Arabic company names) throw at Response construction. ASCII fallback
// in `filename`, real UTF-8 name via RFC 5987 `filename*`.
function contentDisposition(name: string) {
  const cleaned = name.replace(/[\\/:*?"<>|\r\n]+/g, "_").trim();
  const ascii = cleaned.replace(/[^\x20-\x7E]/g, "-") || "company-profile.pdf";
  const utf8 = encodeURIComponent(cleaned).replace(/['()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
  return `attachment; filename="${ascii}"; filename*=UTF-8''${utf8}`;
}
