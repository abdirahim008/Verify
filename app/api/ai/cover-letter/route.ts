import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { trackEvent } from "@/lib/track";
import { aiConfigured, deepseekJson } from "@/lib/ai/deepseek";
import { normalizeLetter } from "@/lib/ai/cover-letter";
import { COVER_LETTER_SYSTEM, coverLetterUserMessage } from "@/lib/ai/cover-letter-prompt";
import { loadCVData } from "@/lib/pdf/data";
import { readJobPage, JobPageError, JOB_TEXT_MAX, JOB_TEXT_MIN } from "@/lib/job-page";

// AI cover letter: a job link (or the pasted advert) + the member's profile
// → a letter the member edits before downloading it. Nothing is stored: the
// advert is read once, sent to the AI provider with the member's work
// history, and the draft goes back to the browser. Usage is logged (event
// "ai_cover_letter", no content) to cap requests per member per day.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAILY_LIMIT = 10;

// `code` lets the editor react: "paste" opens the paste-the-advert box.
const fail = (error: string, status = 400, code?: string) => NextResponse.json({ error, code }, { status });

export async function POST(req: NextRequest) {
  if (!aiConfigured()) return fail("The cover letter helper isn't available right now.", 503);
  const supabase = createSupabaseRouteClient();
  if (!supabase) return fail("Not configured.", 500);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("Not signed in.", 401);

  const { data: account } = await supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
  if (account?.account_type !== "individual") return fail("Cover letters are for individual accounts.", 403);

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await supabase.from("usage_events").select("id", { count: "exact", head: true })
    .eq("profile_id", user.id).eq("event", "ai_cover_letter").gte("created_at", since);
  if ((count ?? 0) >= DAILY_LIMIT) return fail("You've written a lot of letters today. Please try again tomorrow.", 429);

  let input: { url?: unknown; text?: unknown };
  try { input = await req.json(); } catch { return fail("Couldn't read the request."); }
  const url = typeof input.url === "string" ? input.url.trim() : "";
  const pasted = typeof input.text === "string" ? input.text.trim() : "";

  // The letter can only be as good as the profile behind it.
  const profile = await loadCVData(user.id);
  if (!profile || (profile.experiences.length === 0 && profile.educations.length === 0)) {
    return fail("Add your work experience or education to your profile first, so the letter has something to draw on.", 400, "profile");
  }

  let jobText = pasted;
  let source: "link" | "text" = "text";
  let host = "";
  if (!jobText) {
    if (!url) return fail("Paste the link to the job, or the text of the advert.");
    try {
      ({ text: jobText, host } = await readJobPage(url));
      source = "link";
    } catch (e) {
      if (e instanceof JobPageError) return fail(e.message, 422, "paste");
      console.error("[cover-letter] job page failed", e);
      return fail("We couldn't read that page. Copy the job advert and paste the text instead.", 422, "paste");
    }
  } else if (jobText.replace(/\s/g, "").length < JOB_TEXT_MIN) {
    return fail("That's too short to be a job advert. Paste the full advert, including the requirements.");
  }
  // The prompt fences the advert with these markers.
  jobText = jobText.replace(/<<<|>>>/g, " ").slice(0, JOB_TEXT_MAX);

  await trackEvent(supabase, user.id, "ai_cover_letter", { source, host, chars: jobText.length });

  try {
    const raw = await deepseekJson(COVER_LETTER_SYSTEM, coverLetterUserMessage(jobText, profile), { maxTokens: 1800, timeoutMs: 45000 });
    const letter = normalizeLetter(raw);
    if (!letter) {
      return fail(source === "link"
        ? "We couldn't find one job advert on that page. Open the job itself (not a list of jobs) and paste that link, or paste the advert text."
        : "That doesn't read like a job advert. Paste the full advert, including the requirements.", 422, "paste");
    }
    return NextResponse.json({ letter, source });
  } catch (e) {
    console.error("[cover-letter] AI call failed", e);
    return fail(e instanceof Error ? e.message : "Something went wrong. Please try again.", 502);
  }
}
