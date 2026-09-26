import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { emailsConfigured, sendOnboardingEmail, type OnboardingKind } from "@/lib/onboarding-emails";

// Daily onboarding reminders, run by Vercel Cron (vercel.json). Members who
// signed up 1–4 days ago get reminder 1; 4–7 days ago, reminder 2. Each is
// sent at most once (email_log) and only while the download is still locked.
// Accounts older than 7 days are never picked up, so turning this on doesn't
// email the whole back catalogue.
//
// Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set
// in the project's env. Without it the route refuses to run.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAY = 86_400_000;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cfg = emailsConfigured();
  if (!cfg.ok) return NextResponse.json({ skipped: cfg.reason });

  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set" }, { status: 503 });

  const now = Date.now();
  const { data: members, error } = await svc
    .from("profiles").select("id, created_at")
    .eq("blocked", false).eq("email_opt_out", false)
    .gte("created_at", new Date(now - 7 * DAY).toISOString())
    .lte("created_at", new Date(now - 1 * DAY).toISOString());
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = (members ?? []).map((m) => m.id as string);
  const { data: logs } = ids.length
    ? await svc.from("email_log").select("profile_id, kind").in("profile_id", ids)
    : { data: [] as Array<{ profile_id: string; kind: string }> };
  const sent = new Set((logs ?? []).map((l) => `${l.profile_id}:${l.kind}`));

  const results: Array<{ id: string; kind: OnboardingKind; sent: boolean; reason?: string }> = [];
  for (const m of members ?? []) {
    const age = (now - new Date(m.created_at as string).getTime()) / DAY;
    const kind: OnboardingKind = age >= 4 ? "reminder_2" : "reminder_1";
    if (sent.has(`${m.id}:${kind}`)) continue;
    const r = await sendOnboardingEmail(m.id as string, kind);
    results.push({ id: m.id as string, kind, ...r });
    // Stay under Resend's default rate limit (2 requests/second).
    if (r.sent) await new Promise((res) => setTimeout(res, 600));
  }

  return NextResponse.json({
    considered: ids.length,
    sent: results.filter((r) => r.sent).length,
    results,
  });
}
