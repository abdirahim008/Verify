import { createElement } from "react";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { loadCVData } from "@/lib/pdf/data";
import { renderPdf } from "@/lib/pdf/render";
import { resolveThemeOverrides } from "@/lib/pdf/themes";
import { EditorialCV } from "@/components/cv/EditorialCV";
import { SidebarCV } from "@/components/cv/SidebarCV";
import { MonoCV } from "@/components/cv/MonoCV";

// PDF endpoint must run on Node (puppeteer-core + chromium-min). Edge can't
// host a headless browser.
export const runtime = "nodejs";
// Each user has unique data, and downloads should always be fresh after an
// edit. No static caching.
export const dynamic = "force-dynamic";

// Per-template font URLs — the §12 prototype pairings. Variable-font
// ranges (opsz + wght) so Fraunces' optical sizing and the in-between
// weights (e.g. 540) resolve exactly. Loading only what each template
// uses keeps headless Chromium's fetches tight.
const EDITORIAL_FONTS =
  "https://fonts.googleapis.com/css2" +
  "?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600" +
  "&family=Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..600" +
  "&family=IBM+Plex+Sans:wght@400;500;600;700" +
  "&display=swap";

const SIDEBAR_FONTS =
  "https://fonts.googleapis.com/css2" +
  "?family=Archivo:wght@400..800" +
  "&family=IBM+Plex+Sans:wght@400;500;600" +
  "&display=swap";

const MONO_FONTS =
  "https://fonts.googleapis.com/css2" +
  "?family=Space+Grotesk:wght@400..700" +
  "&family=IBM+Plex+Sans:wght@400;500;600" +
  "&family=IBM+Plex+Mono:wght@400;500" +
  "&display=swap";

const TEMPLATES = {
  editorial: { name: "Editorial", component: EditorialCV, fonts: EDITORIAL_FONTS },
  sidebar:   { name: "Sidebar",   component: SidebarCV,   fonts: SIDEBAR_FONTS },
  mono:      { name: "Mono",      component: MonoCV,      fonts: MONO_FONTS },
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
  const theme = resolveThemeOverrides("cv", params.template, url.searchParams.get("theme"));
  const inline = url.searchParams.get("preview") === "1";

  const supabase = createSupabaseRouteClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const data = await loadCVData(user.id);
  if (!data) {
    return NextResponse.json({
      error: "Fill in basics (at least your name) before downloading.",
    }, { status: 400 });
  }

  const Template = t.component;
  let pdf: Buffer;
  try {
    pdf = await renderPdf(createElement(Template, { data, theme }), {
      pageTitle: `${data.fullName} — CV`,
      fonts: t.fonts,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // NextResponse's BodyInit typing in v14 doesn't include Node's Buffer
  // directly — wrap in Uint8Array (Buffer extends it) so the cast is safe.
  const body = new Uint8Array(pdf);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition(`${data.fullName} - CV (${t.name}).pdf`, inline),
      "Content-Length": String(body.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}

// HTTP headers are ByteStrings — anything above Latin-1 (em-dashes, Somali
// names with diacritics, Arabic script) throws at Response construction.
// Send an ASCII fallback in `filename` and the real UTF-8 name via the
// RFC 5987 `filename*` parameter, which every modern browser prefers.
function contentDisposition(name: string, inline = false) {
  const cleaned = name.replace(/[\\/:*?"<>|\r\n]+/g, "_").trim();
  const ascii = cleaned.replace(/[^\x20-\x7E]/g, "-") || "cv.pdf";
  const utf8 = encodeURIComponent(cleaned).replace(/['()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
  return `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${utf8}`;
}
