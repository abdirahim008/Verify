import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// Fire-and-forget usage-event logging (see supabase/migrations/0007).
// Tracking must NEVER break the action being tracked: errors (including
// "table does not exist" before the migration is applied) are swallowed.
// Await it — routes are serverless, so an un-awaited insert can be killed
// when the response is sent — but treat the result as advisory.
export async function trackEvent(
  supabase: SupabaseClient | null,
  profileId: string,
  event: string,
  meta: Record<string, unknown> = {},
): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from("usage_events").insert({ profile_id: profileId, event, meta });
  } catch {
    /* advisory only */
  }
}
