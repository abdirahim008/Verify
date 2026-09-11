"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

// Admin-only: block/unblock a profile (profiles.blocked, migration 0011).
// Blocking hides the member from every public surface; it does not delete
// anything, so a false positive is one click to reverse.
export async function setBlocked(profileId: string, value: boolean, reason = "manual"): Promise<void> {
  const supabase = createSupabaseRouteClient();
  if (!supabase) throw new Error("Supabase isn't configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) throw new Error("Admin only.");
  if (profileId === user.id) throw new Error("You can't block yourself.");

  const svc = createSupabaseServiceClient();
  if (!svc) throw new Error("Service role not configured.");
  const { error } = await svc.from("profiles")
    .update({ blocked: value, blocked_reason: value ? reason : null })
    .eq("id", profileId);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/home");
  revalidatePath("/admin/metrics");
  revalidatePath(`/u/${profileId}`);
}
