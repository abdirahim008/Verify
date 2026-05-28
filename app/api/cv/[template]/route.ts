import { createElement } from "react";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { loadCVData } from "@/lib/pdf/data";
import { renderPdf } from "@/lib/pdf/render";
import { EditorialCV } from "@/components/cv/EditorialCV";
import { SidebarCV } from "@/components/cv/SidebarCV";
import { MonoCV } from "@/components/cv/MonoCV";

// PDF endpoint must run on Node (puppeteer-core + chromium-min). Edge can't
// host a headless browser.
export const runtime = "nodejs";
// Each user has unique data, and downloads should always be fresh after an
// edit. No static caching.
export const dynamic = "force-dynamic";

// Per-template font URLs. Editorial leans on serif; Sidebar is grotesque
// sans; Mono pairs sans + mono. Loading only what each template actually
// uses keeps headless Chromium's fetches tight.
const EDITORIAL_FONTS =
  "https://fonts.googleapis.com/css2" +
  "?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;1,8..60,300;1,8..60,400" +
  "&family=IBM+Plex+Sans:wght@400;500;600" +
  "&display=swap";

const SIDEBAR_FONTS =
  "https://fonts.googleapis.com/css2" +
  "?family=Public+Sans:wght@400;500;600;700" +
  "&family=IBM+Plex+Sans:wght@400;500;600" +
  "&display=swap";

const MONO_FONTS =
  "https://fonts.googleapis.com/css2" +
  "?family=IBM+Plex+Sans:wght@400;500;600;700" +
  "&family=IBM+Plex+Mono:wght@400;500" +
  "&display=swap";

const TEMPLATES = {
  editorial: { name: "Editorial", component: EditorialCV, fonts: EDITORIAL_FONTS },
  sidebar:   { name: "Sidebar",   component: SidebarCV,   fonts: SIDEBAR_FONTS },
  mono:      { name: "Mono",      component: MonoCV,      fonts: MONO_FONTS },
} as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: { template: string } },
) {
  const t = TEMPLATES[params.template as keyof typeof TEMPLATES];
  if (!t) {
    return NextResponse.json({ error: "Unknown template" }, { status: 404 });
  }

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
    pdf = await renderPdf(createElement(Template, { data }), {
      pageTitle: `${data.fullName} — CV`,
      fonts: t.fonts,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const filename = sanitiseFilename(`${data.fullName} — CV (${t.name}).pdf`);
  // NextResponse's BodyInit typing in v14 doesn't include Node's Buffer
  // directly — wrap in Uint8Array (Buffer extends it) so the cast is safe.
  const body = new Uint8Array(pdf);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(body.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}

function sanitiseFilename(name: string) {
  // Strip anything that breaks a Content-Disposition header / filesystem.
  return name.replace(/[\\/:*?"<>|\r\n]+/g, "_");
}
