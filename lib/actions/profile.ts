"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import {
  basicsSchema, type BasicsValues,
  experienceSchema, type ExperienceValues,
  educationSchema, type EducationValues,
  certificationSchema, type CertificationValues,
  refereeSchema, type RefereeValues,
  skillSchema, languagesSchema, toIntOrNull,
} from "@/lib/schemas";

// Common helper: get the current user + a supabase client, or throw a
// uniform error string the client form can display.
async function authedClient() {
  const supabase = createSupabaseRouteClient();
  if (!supabase) throw new Error("Supabase isn't configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  return { supabase, userId: user.id };
}

// Month string → date (first of month). null when blank.
function monthToDate(s: string | undefined | null) {
  if (!s) return null;
  return `${s}-01`;
}

function bust() { revalidatePath("/profile"); revalidatePath("/home"); }

// ─── basics ─────────────────────────────────────────────────────────────
export async function saveBasics(values: BasicsValues) {
  const v = basicsSchema.parse(values);
  const { supabase, userId } = await authedClient();
  // Upsert because the row may not exist yet (signup creates `profiles` but
  // not `individual_details` — that happens on first save).
  const { error } = await supabase
    .from("individual_details")
    .upsert({
      profile_id: userId,
      full_name: v.full_name,
      headline: v.headline || null,
      summary: v.summary || null,
      location: v.location || null,
      phone: v.phone || null,
      email: v.email || null,
      photo_url: v.photo_url || null,
    }, { onConflict: "profile_id" });
  if (error) throw new Error(error.message);

  // Mirror display_name on profiles so other UI (nav avatar, home greeting)
  // updates without an extra query.
  if (v.full_name) {
    await supabase.from("profiles").update({ display_name: v.full_name }).eq("id", userId);
  }
  bust();
}

// ─── languages (lives on individual_details.languages array) ────────────
export async function saveLanguages(values: { languages: string[] }) {
  const v = languagesSchema.parse(values);
  const { supabase, userId } = await authedClient();
  const { error } = await supabase
    .from("individual_details")
    .upsert({ profile_id: userId, languages: v.languages }, { onConflict: "profile_id" });
  if (error) throw new Error(error.message);
  bust();
}

// ─── experiences ────────────────────────────────────────────────────────
export async function addExperience(values: ExperienceValues) {
  const v = experienceSchema.parse(values);
  const { supabase, userId } = await authedClient();
  const { error } = await supabase.from("experiences").insert({
    profile_id: userId,
    organization: v.organization,
    title: v.title,
    location: v.location || null,
    start_date: monthToDate(v.start_date),
    end_date: v.is_current ? null : monthToDate(v.end_date),
    description: v.description || null,
  });
  if (error) throw new Error(error.message);
  bust();
}

export async function updateExperience(id: string, values: ExperienceValues) {
  const v = experienceSchema.parse(values);
  const { supabase } = await authedClient();
  // RLS scopes the update to the owner — and the WITH CHECK clause blocks
  // tampering with verified_*.
  const { error } = await supabase.from("experiences").update({
    organization: v.organization,
    title: v.title,
    location: v.location || null,
    start_date: monthToDate(v.start_date),
    end_date: v.is_current ? null : monthToDate(v.end_date),
    description: v.description || null,
  }).eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}

export async function deleteExperience(id: string) {
  const { supabase } = await authedClient();
  const { error } = await supabase.from("experiences").delete().eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}

// ─── educations ─────────────────────────────────────────────────────────
export async function addEducation(values: EducationValues) {
  const v = educationSchema.parse(values);
  const { supabase, userId } = await authedClient();
  const { error } = await supabase.from("educations").insert({
    profile_id: userId,
    institution: v.institution,
    qualification_level: v.qualification_level,
    field_of_study: v.field_of_study || null,
    start_year: toIntOrNull(v.start_year),
    end_year: toIntOrNull(v.end_year),
  });
  if (error) throw new Error(error.message);
  bust();
}

export async function updateEducation(id: string, values: EducationValues) {
  const v = educationSchema.parse(values);
  const { supabase } = await authedClient();
  const { error } = await supabase.from("educations").update({
    institution: v.institution,
    qualification_level: v.qualification_level,
    field_of_study: v.field_of_study || null,
    start_year: toIntOrNull(v.start_year),
    end_year: toIntOrNull(v.end_year),
  }).eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}

export async function deleteEducation(id: string) {
  const { supabase } = await authedClient();
  const { error } = await supabase.from("educations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}

// ─── skills ─────────────────────────────────────────────────────────────
export async function addSkill(name: string) {
  const v = skillSchema.parse({ name });
  const { supabase, userId } = await authedClient();
  const { error } = await supabase.from("skills").insert({ profile_id: userId, name: v.name });
  if (error) throw new Error(error.message);
  bust();
}

export async function deleteSkill(id: string) {
  const { supabase } = await authedClient();
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}

// ─── certifications ─────────────────────────────────────────────────────
export async function addCertification(values: CertificationValues) {
  const v = certificationSchema.parse(values);
  const { supabase, userId } = await authedClient();
  const { error } = await supabase.from("certifications").insert({
    profile_id: userId,
    name: v.name,
    issuer: v.issuer || null,
    year: toIntOrNull(v.year),
  });
  if (error) throw new Error(error.message);
  bust();
}

export async function updateCertification(id: string, values: CertificationValues) {
  const v = certificationSchema.parse(values);
  const { supabase } = await authedClient();
  const { error } = await supabase.from("certifications").update({
    name: v.name,
    issuer: v.issuer || null,
    year: toIntOrNull(v.year),
  }).eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}

export async function deleteCertification(id: string) {
  const { supabase } = await authedClient();
  const { error } = await supabase.from("certifications").delete().eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}

// ─── referees (PRIVATE) ─────────────────────────────────────────────────
export async function addReferee(values: RefereeValues) {
  const v = refereeSchema.parse(values);
  const { supabase, userId } = await authedClient();
  const { error } = await supabase.from("referees").insert({
    profile_id: userId,
    experience_id: v.experience_id || null,
    name: v.name,
    position: v.position || null,
    organization: v.organization || null,
    phone: v.phone || null,
    email: v.email || null,
    relationship: v.relationship || null,
  });
  if (error) throw new Error(error.message);
  bust();
}

export async function updateReferee(id: string, values: RefereeValues) {
  const v = refereeSchema.parse(values);
  const { supabase } = await authedClient();
  const { error } = await supabase.from("referees").update({
    experience_id: v.experience_id || null,
    name: v.name,
    position: v.position || null,
    organization: v.organization || null,
    phone: v.phone || null,
    email: v.email || null,
    relationship: v.relationship || null,
  }).eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}

export async function deleteReferee(id: string) {
  const { supabase } = await authedClient();
  const { error } = await supabase.from("referees").delete().eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}
