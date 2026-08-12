"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

// Toggle the member's presence in the /home community showcase
// (profiles.showcase, migration 0009). Own-row update — RLS enforces it.
export async function setShowcase(visible: boolean): Promise<void> {
  const supabase = createSupabaseRouteClient();
  if (!supabase) throw new Error("Supabase isn't configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { error } = await supabase.from("profiles").update({ showcase: visible }).eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/home");
  revalidatePath("/settings");
}
