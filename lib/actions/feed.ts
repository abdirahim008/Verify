"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { refreshFeed } from "@/lib/feed-refresh";

async function authedAdmin() {
  const supabase = createSupabaseRouteClient();
  if (!supabase) throw new Error("Supabase isn't configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) throw new Error("Admin only.");
  return { userId: user.id };
}

function bust() { revalidatePath("/admin/feed"); revalidatePath("/home"); }

export async function adminRefreshFeed() {
  await authedAdmin();
  const out = await refreshFeed();
  bust();
  return out;
}

const idSchema = z.object({ id: z.string().uuid() });

export async function adminApproveFeedItem(input: { id: string }) {
  const v = idSchema.parse(input);
  await authedAdmin();
  const svc = createSupabaseServiceClient();
  if (!svc) throw new Error("Service-role client not configured.");
  const { error } = await svc.from("feed_items").update({ approved: true }).eq("id", v.id);
  if (error) throw new Error(error.message);
  bust();
}

export async function adminRejectFeedItem(input: { id: string }) {
  const v = idSchema.parse(input);
  await authedAdmin();
  const svc = createSupabaseServiceClient();
  if (!svc) throw new Error("Service-role client not configured.");
  // Delete outright — easier than tracking a "rejected" state. The
  // refresh skips inserting items whose source_url already exists, so
  // a rejected item won't keep reappearing during the same window. Once
  // the source rotates it out, we'd reconsider; that's acceptable for
  // an admin-curated feed.
  const { error } = await svc.from("feed_items").delete().eq("id", v.id);
  if (error) throw new Error(error.message);
  bust();
}
