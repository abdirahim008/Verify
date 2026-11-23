"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { sendJobAlertTest } from "@/lib/job-alerts";

// Turn Sahan's member emails (weekly job alert, profile reminders) on or off
// from Settings. Same flag the unsubscribe link in every email sets
// (profiles.email_opt_out, migration 0012). Own-row update — RLS enforces it.
export async function setMemberEmails(on: boolean): Promise<void> {
  const supabase = createSupabaseRouteClient();
  if (!supabase) throw new Error("Supabase isn't configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { error } = await supabase.from("profiles").update({ email_opt_out: !on }).eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

// Admin-only: email this week's job alert to the admin's own address, to
// check it before (or between) the weekly runs.
export async function sendMeJobAlertTest(): Promise<{ sent: boolean; reason?: string; to?: string }> {
  const supabase = createSupabaseRouteClient();
  if (!supabase) return { sent: false, reason: "Supabase isn't configured." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { sent: false, reason: "Not signed in." };
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) return { sent: false, reason: "Admin only." };
  return sendJobAlertTest(user.id);
}
