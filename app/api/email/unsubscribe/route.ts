import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { verifyUnsubscribeToken } from "@/lib/onboarding-emails";

// Unsubscribe from Sahan's member emails. The link is signed per member
// (lib/onboarding-emails.ts), so it works without signing in.
//
// GET shows a confirm button rather than unsubscribing straight away: mail
// scanners open links, and that would silently opt people out. POST does the
// work, which also serves the one-click List-Unsubscribe-Post header that
// Gmail and Outlook use.

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { u, t } = params(request);
  if (!verifyUnsubscribeToken(u, t)) return page("This unsubscribe link isn't valid.", "", 400);
  const action = `/api/email/unsubscribe?u=${encodeURIComponent(u)}&t=${encodeURIComponent(t)}`;
  return page(
    "Stop Sahan emails?",
    `<p>You'll no longer get reminders about finishing your profile. Your account stays as it is.</p>
     <form method="post" action="${action}"><button type="submit">Unsubscribe</button></form>`,
  );
}

export async function POST(request: NextRequest) {
  const { u, t } = params(request);
  if (!verifyUnsubscribeToken(u, t)) return page("This unsubscribe link isn't valid.", "", 400);
  const svc = createSupabaseServiceClient();
  if (!svc) return page("Something went wrong. Please try again later.", "", 503);
  const { error } = await svc.from("profiles").update({ email_opt_out: true }).eq("id", u);
  if (error) return page("Something went wrong. Please try again later.", "", 500);
  return page("You're unsubscribed.", "<p>You won't get any more of these emails.</p>");
}

function params(request: NextRequest) {
  const s = request.nextUrl.searchParams;
  return { u: s.get("u") ?? "", t: s.get("t") ?? "" };
}

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${title} · Sahan</title>
<style>
  body{margin:0;background:#f3f2ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1c1c1c}
  main{max-width:440px;margin:12vh auto;padding:28px;background:#fff;border:1px solid #e0e0e0;border-radius:12px}
  h1{margin:0 0 10px;font-family:Georgia,serif;font-weight:500;font-size:24px}
  p{font-size:15px;line-height:1.6;color:#3a3a3d;margin:0 0 18px}
  button{background:#1c1c1c;color:#fff;border:0;border-radius:8px;padding:11px 20px;font-size:15px;font-weight:600;cursor:pointer}
  a{color:#0a5cad}
</style></head><body><main><h1>${title}</h1>${body}<p style="margin:0"><a href="/">Back to Sahan</a></p></main></body></html>`;
  return new NextResponse(html, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}
