"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

// In-app feedback (migration 0008). One row per user — submitting a rating or
// dismissing the prompt both write the row, which is what makes the card
// disappear for good.

export async function submitFeedback(rating: number, comment: string): Promise<void> {
  const supabase = createSupabaseRouteClient();
  if (!supabase) throw new Error("Supabase isn't configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const clean = Math.min(5, Math.max(1, Math.round(rating)));
  const { error } = await supabase.from("app_feedback").upsert({
    profile_id: user.id,
    rating: clean,
    comment: comment.trim().slice(0, 1000) || null,
    dismissed: false,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/profile");
}

export async function dismissFeedback(): Promise<void> {
  const supabase = createSupabaseRouteClient();
  if (!supabase) throw new Error("Supabase isn't configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { error } = await supabase.from("app_feedback").upsert({
    profile_id: user.id,
    rating: null,
    comment: null,
    dismissed: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/profile");
}
