import { createSupabaseServerClient } from "@/lib/supabase/server";

// One-shot loader for the profile builder. Runs all section reads in
// parallel; RLS scopes everything to the calling user automatically.
// `userId` is the auth user id (= profile_id).
export async function loadIndividualProfile(userId: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      profile: null, basics: null,
      experiences: [], educations: [], skills: [], certifications: [], referees: [],
    };
  }

  const [
    profileRes, basicsRes, expRes, eduRes, skillsRes, certsRes, refsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("individual_details").select("*").eq("profile_id", userId).maybeSingle(),
    supabase.from("experiences").select("*").eq("profile_id", userId).order("order_index").order("start_date", { ascending: false, nullsFirst: false }),
    supabase.from("educations").select("*").eq("profile_id", userId).order("order_index").order("end_year", { ascending: false, nullsFirst: false }),
    supabase.from("skills").select("*").eq("profile_id", userId).order("order_index").order("created_at"),
    supabase.from("certifications").select("*").eq("profile_id", userId).order("order_index").order("year", { ascending: false, nullsFirst: false }),
    supabase.from("referees").select("*").eq("profile_id", userId).order("created_at"),
  ]);

  return {
    profile: profileRes.data,
    basics: basicsRes.data,
    experiences: expRes.data ?? [],
    educations: eduRes.data ?? [],
    skills: skillsRes.data ?? [],
    certifications: certsRes.data ?? [],
    referees: refsRes.data ?? [],
  };
}

export type IndividualProfileData = Awaited<ReturnType<typeof loadIndividualProfile>>;

// "Minimum core" = basics name + 1 experience + 1 education + 1 skill.
// Unlocks the "Download CV" affordance (CLAUDE.md §2).
export function hasMinimumCore(data: IndividualProfileData) {
  return Boolean(
    data.basics?.full_name &&
    data.experiences.length > 0 &&
    data.educations.length > 0 &&
    data.skills.length > 0,
  );
}

export function profileCompleteness(data: IndividualProfileData) {
  // Simple weighted scorer. The numbers are deliberately approximate — this
  // is a nudge, not a metric. Tune later from real usage.
  let score = 0;
  if (data.basics?.full_name) score += 15;
  if (data.basics?.headline) score += 10;
  if (data.basics?.summary && data.basics.summary.length > 60) score += 10;
  if (data.basics?.location) score += 5;
  if (data.basics?.phone || data.basics?.email) score += 5;
  if (data.experiences.length >= 1) score += 15;
  if (data.experiences.length >= 2) score += 5;
  if (data.educations.length >= 1) score += 10;
  if (data.skills.length >= 3) score += 10;
  if (data.skills.length >= 6) score += 5;
  if (data.certifications.length >= 1) score += 5;
  if (data.referees.length >= 1) score += 5;
  if ((data.basics?.languages?.length ?? 0) >= 1) score += 5;
  return Math.min(100, score);
}
