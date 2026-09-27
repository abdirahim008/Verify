import { createElement } from "react";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { trackEvent } from "@/lib/track";
import { loadCompanyDataForPdf } from "@/lib/pdf/company-data";
import { renderPdf } from "@/lib/pdf/render";
import { resolveThemeOverrides } from "@/lib/pdf/themes";
import { COMPANY_RENDER } from "@/lib/pdf/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Chromium cold-start can take 5–15s; the 10s default would time out the
// first request. 60 is the Hobby ceiling and ample once warm.
export const maxDuration = 60;

// Components + fonts live in lib/pdf/templates.ts, shared with the
// thumbnail generator so previews match downloads exactly.
const TEMPLATES = COMPANY_RENDER;

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

  await trackEvent(supabase, user.id, "company_download", {
    template: params.template,
    theme: url.searchParams.get("theme") ?? "",
    preview: inline,
    ...(from || to ? { from, to } : {}),
  });

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
