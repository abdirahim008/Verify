"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import {
  INDIVIDUAL_SECTIONS, COMPANY_SECTIONS, clampLevel, type VisibilityLevel,
} from "@/lib/visibility";

const schema = z.object({
  section_visibility: z.record(z.enum(["public", "registered_only", "private"])),
});

export async function saveVisibility(values: z.infer<typeof schema>) {
  const v = schema.parse(values);
  const supabase = createSupabaseRouteClient();
  if (!supabase) throw new Error("Supabase isn't configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  // Figure out which section list applies to this account, then clamp each
  // requested level against the hard rules. Server-side: never trust the
  // client's payload to bypass the §10 invariants.
  const { data: profile } = await supabase
    .from("profiles").select("account_type, section_visibility")
    .eq("id", user.id).maybeSingle();
  const sections = profile?.account_type === "company" ? COMPANY_SECTIONS : INDIVIDUAL_SECTIONS;

  const out: Record<string, VisibilityLevel> = { ...(profile?.section_visibility as Record<string, VisibilityLevel> ?? {}) };
  for (const def of sections) {
    const requested = v.section_visibility[def.key];
    if (!requested) continue;
    out[def.key] = clampLevel(def, requested);
  }

  const { error } = await supabase.from("profiles")
    .update({ section_visibility: out })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/profile");
  revalidatePath(`/u/${user.id}`);
}
