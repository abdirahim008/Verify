import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { trackEvent } from "@/lib/track";
import { aiConfigured, deepseekJson } from "@/lib/ai/deepseek";
import { normalizeDraft, draftHasContent } from "@/lib/ai/draft";
import { PROFILE_DRAFT_SYSTEM, profileDraftUserMessage } from "@/lib/ai/profile-prompt";
import { cvKind, extractCvText, MAX_CV_BYTES } from "@/lib/cv-text";

// AI profile import: free text or an uploaded CV (PDF/DOCX) → a profile
// draft the member reviews before anything is saved. Nothing the member
// sends is stored: the text goes to the AI provider and the draft comes
// back to the browser. Usage is logged (event "ai_draft", no content) to
// cap requests per member per day.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAILY_LIMIT = 6;
const MIN_TEXT = 40;
const MAX_TEXT = 15000;

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: NextRequest) {
  if (!aiConfigured()) return fail("AI import isn't available right now.", 503);
  const supabase = createSupabaseRouteClient();
  if (!supabase) return fail("Not configured.", 500);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("Not signed in.", 401);

  const { data: profile } = await supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
  if (profile?.account_type !== "individual") return fail("AI import is for personal profiles.", 403);

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await supabase.from("usage_events").select("id", { count: "exact", head: true })
    .eq("profile_id", user.id).eq("event", "ai_draft").gte("created_at", since);
  if ((count ?? 0) >= DAILY_LIMIT) return fail("You've used the AI helper a lot today. Please try again tomorrow, or fill in your profile by hand.", 429);

  let form: FormData;
  try { form = await req.formData(); } catch { return fail("Couldn't read the request."); }
  const file = form.get("file");
  let text = "";
  let source: "text" | "cv" = "text";

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_CV_BYTES) return fail("That file is over 5 MB. Please upload a smaller PDF or Word file.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = cvKind(file.name, file.type, bytes.subarray(0, 8));
    if (!kind) return fail("Please upload your CV as a PDF or Word (.docx) file.");
    try {
      text = await extractCvText(bytes, kind);
    } catch (e) {
      console.error("[ai-draft] extract failed", e);
      return fail("We couldn't read that file. Try saving it as a PDF, or type your details instead.");
    }
    if (text.replace(/\s/g, "").length < MIN_TEXT) {
      return fail("This file looks like a scan or photo, so there's no text to read. Please type your details in the box instead.");
    }
    source = "cv";
  } else {
    text = String(form.get("text") ?? "").trim();
    if (text.length < MIN_TEXT) return fail("Tell us a little more — your jobs, studies and skills.");
  }
  text = text.slice(0, MAX_TEXT);

  await trackEvent(supabase, user.id, "ai_draft", { source, chars: text.length });

  try {
    const raw = await deepseekJson(PROFILE_DRAFT_SYSTEM, profileDraftUserMessage(source, text));
    const draft = normalizeDraft(raw);
    if (!draftHasContent(draft)) {
      return fail(source === "cv"
        ? "We couldn't find CV details in that file. Please type your details instead."
        : "We couldn't find enough about your work or studies. Try adding your jobs, school and skills.", 422);
    }
    return NextResponse.json({ draft, source });
  } catch (e) {
    console.error("[ai-draft] AI call failed", e);
    return fail(e instanceof Error ? e.message : "Something went wrong. Please try again.", 502);
  }
}
