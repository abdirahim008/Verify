"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

// Admin-only: feature/unfeature a member on the public landing page
// (profiles.featured, migration 0010). Caller's admin status is verified
// here; the write itself needs the service client because profiles RLS only
// allows own-row updates.
export async function setFeatured(profileId: string, value: boolean): Promise<void> {
  const supabase = createSupabaseRouteClient();
  if (!supabase) throw new Error("Supabase isn't configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) throw new Error("Admin only.");

  const svc = createSupabaseServiceClient();
  if (!svc) throw new Error("Service role not configured.");
  const { error } = await svc.from("profiles").update({ featured: value }).eq("id", profileId);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/metrics");
}
