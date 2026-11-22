import { createElement } from "react";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { trackEvent } from "@/lib/track";
import { loadCVData } from "@/lib/pdf/data";
import { renderPdf } from "@/lib/pdf/render";
import { resolveThemeOverrides } from "@/lib/pdf/themes";
import { CV_RENDER } from "@/lib/pdf/templates";
import { CoverLetter } from "@/components/cv/CoverLetter";
import { LETTER_LIMITS } from "@/lib/ai/cover-letter";

// Cover letter PDF. The letter isn't stored, so the edited text arrives in
// the request (POST) and is printed straight to A4. The letterhead (name,
// title, contact details) always comes from the member's own profile, never
// from the request.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Chromium cold-start; see app/api/cv/[template]/route.ts.
export const maxDuration = 60;

const Body = z.object({
  template: z.string().max(40),
  theme: z.string().max(40).optional(),
  organization: z.string().trim().max(LETTER_LIMITS.organization),
  addressee: z.string().trim().max(LETTER_LIMITS.addressee),
  subject: z.string().trim().max(LETTER_LIMITS.subject),
  body: z.string().trim().min(LETTER_LIMITS.bodyMin).max(LETTER_LIMITS.body),
  /** The member's local date, YYYY-MM-DD. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// The letter is dated in the member's timezone (the server runs in UTC, so
// its date is yesterday's for an East African member before 3am). Only a
// date within a day of the server's is accepted; anything else prints today.
function letterDate(local: string | undefined): string {
  const now = new Date();
  const given = local ? new Date(`${local}T12:00:00Z`) : null;
  const ok = given && !Number.isNaN(+given) && Math.abs(+given - +now) <= 36 * 3600 * 1000;
  return (ok ? given : now).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseRouteClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "The letter is too short or too long to print. Check the text and try again." }, { status: 400 });
  }
  const { template: requested, theme: themeId, date: localDate, ...letter } = parsed.data;
  const template = (requested in CV_RENDER ? requested : "classic") as keyof typeof CV_RENDER;

  const data = await loadCVData(user.id);
  if (!data) {
    return NextResponse.json({ error: "Add your name to your profile before downloading." }, { status: 400 });
  }

  const date = letterDate(localDate);
  let pdf: Buffer;
  try {
    pdf = await renderPdf(
      createElement(CoverLetter, { data, letter, template, theme: resolveThemeOverrides("cv", template, themeId), date }),
      { pageTitle: `${data.fullName} — Cover letter`, fonts: CV_RENDER[template].fonts },
    );
  } catch (e) {
    console.error(`[letter pdf] render failed for template=${template}`, e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "PDF generation failed" }, { status: 500 });
  }

  await trackEvent(supabase, user.id, "cover_letter_download", { template, theme: themeId ?? "" });

  const body = new Uint8Array(pdf);
  const name = letter.organization ? `${data.fullName} - Cover letter (${letter.organization}).pdf` : `${data.fullName} - Cover letter.pdf`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition(name),
      "Content-Length": String(body.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}

// ASCII fallback + RFC 5987 UTF-8 name; see app/api/cv/[template]/route.ts.
function contentDisposition(name: string) {
  const cleaned = name.replace(/[\\/:*?"<>|\r\n]+/g, "_").trim();
  const ascii = cleaned.replace(/[^\x20-\x7E]/g, "-") || "cover-letter.pdf";
  const utf8 = encodeURIComponent(cleaned).replace(/['()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
  return `attachment; filename="${ascii}"; filename*=UTF-8''${utf8}`;
}
