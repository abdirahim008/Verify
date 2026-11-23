import { NextResponse, type NextRequest } from "next/server";
import { runJobAlerts } from "@/lib/job-alerts";

// Weekly job alert, run by Vercel Cron (vercel.json) on Sunday morning East
// Africa time, and again on Monday to catch up. Who gets it and what it
// contains: lib/job-alerts.ts. Each member gets at most one per week
// (email_log), so the Monday run only reaches members Sunday's run missed
// (it stopped for time, or the email provider refused a batch).
//
// ?dry=1 reports what would be sent without sending anything.
//
// Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set
// in the project's env. Without it the route refuses to run.

export const dynamic = "force-dynamic";
// Nothing in this run may come from Next's fetch cache. The jobs feed is
// fetched with a 30-minute revalidate (lib/jobs/feed.ts), and once a route
// makes one cached fetch, Next 14 caches its other fetches for as long too:
// the Supabase lookups and even the POST to the email provider, which then
// "succeeds" from cache without sending anything.
export const fetchCache = "force-no-store";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not set" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const run = await runJobAlerts({
      dryRun: request.nextUrl.searchParams.get("dry") === "1",
      // Leave room to finish the batch in flight inside maxDuration.
      deadline: Date.now() + 45_000,
    });
    console.log("[job-alerts]", JSON.stringify(run));
    // A 500 makes a failed send show up as an error in Vercel's cron log.
    return NextResponse.json(run, { status: run.failed ? 500 : 200 });
  } catch (e) {
    console.error("[job-alerts] run failed", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "run failed" }, { status: 500 });
  }
}
