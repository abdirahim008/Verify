"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import {
  basicsSchema, experienceSchema, educationSchema, certificationSchema, refereeSchema,
  skillSchema, languagesSchema, toIntOrNull,
} from "@/lib/schemas";
import { normalizeDraft, type ProfileDraft } from "@/lib/ai/draft";
import { trackEvent } from "@/lib/track";

// Save a reviewed AI draft into the profile. The draft comes from the
// browser (the member may have edited it), so it is normalised again and
// every entry re-validated with the same schemas as manual entry; entries
// that fail are skipped rather than failing the whole import.
//
// Merge rules, so a member who already started isn't overwritten:
//  - basics: only empty fields are filled;
//  - experiences / education / certifications / referees: appended;
//  - skills and languages: added unless already present.
// Nothing here can mark an entry verified (the columns keep their default).

export interface ImportResult { saved: Record<string, number>; skipped: number }

export async function saveImportedProfile(input: ProfileDraft): Promise<ImportResult> {
  const supabase = createSupabaseRouteClient();
  if (!supabase) throw new Error("Supabase isn't configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const uid = user.id;
  const d = normalizeDraft({
    // normalizeDraft reads the model's field names; map the draft back to them.
    full_name: input.fullName, headline: input.headline, summary: input.summary,
    location: input.location, phone: input.phone, email: input.email,
    experiences: input.experiences.map((e) => ({ ...e, end: e.current ? "present" : e.end, bullets: e.description })),
    educations: input.educations.map((e) => ({ ...e, start_year: e.startYear, end_year: e.endYear })),
    skills: input.skills, languages: (input.languages ?? []).map((l) => ({ name: String(l).split(" (")[0], level: langLevel(String(l)) })),
    certifications: input.certifications, referees: input.referees,
  });

  const saved: Record<string, number> = { basics: 0, experiences: 0, educations: 0, skills: 0, languages: 0, certifications: 0, referees: 0 };
  let skipped = 0;

  // ── basics: fill blanks only ──
  const { data: cur } = await supabase.from("individual_details").select("*").eq("profile_id", uid).maybeSingle();
  const pick = (have: string | null | undefined, next: string) => (have && have.trim() ? have : next);
  const basics = basicsSchema.safeParse({
    full_name: pick(cur?.full_name, d.fullName) || (await displayName(supabase, uid)),
    headline: pick(cur?.headline, d.headline), summary: pick(cur?.summary, d.summary),
    location: pick(cur?.location, d.location), phone: pick(cur?.phone, d.phone),
    email: pick(cur?.email, d.email), photo_url: cur?.photo_url ?? "",
  });
  if (basics.success && basics.data.full_name) {
    const v = basics.data;
    const { error } = await supabase.from("individual_details").upsert({
      profile_id: uid, full_name: v.full_name, headline: v.headline || null, summary: v.summary || null,
      location: v.location || null, phone: v.phone || null, email: v.email || null, photo_url: v.photo_url || null,
    }, { onConflict: "profile_id" });
    if (error) throw new Error(error.message);
    await supabase.from("profiles").update({ display_name: v.full_name }).eq("id", uid);
    saved.basics = 1;
  } else skipped++;

  // ── languages (stored on individual_details) ──
  if (d.languages.length && saved.basics) {
    const existing: string[] = cur?.languages ?? [];
    const have = new Set(existing.map((l) => l.split(" (")[0].toLowerCase()));
    const add = d.languages.filter((l) => !have.has(l.split(" (")[0].toLowerCase()));
    const merged = languagesSchema.safeParse({ languages: [...existing, ...add].slice(0, 30) });
    if (merged.success && add.length) {
      await supabase.from("individual_details").update({ languages: merged.data.languages }).eq("profile_id", uid);
      saved.languages = add.length;
    }
  }

  // ── experiences ──
  for (const e of d.experiences) {
    const v = experienceSchema.safeParse({
      organization: e.organization, title: e.title, location: e.location,
      start_date: e.start, end_date: e.current ? "" : e.end, description: e.description, is_current: e.current,
    });
    if (!v.success) { skipped++; continue; }
    const x = v.data;
    const { error } = await supabase.from("experiences").insert({
      profile_id: uid, organization: x.organization, title: x.title, location: x.location || null,
      start_date: x.start_date ? `${x.start_date}-01` : null,
      end_date: x.is_current || !x.end_date ? null : `${x.end_date}-01`,
      description: x.description || null,
    });
    if (error) skipped++; else saved.experiences++;
  }

  // ── education ──
  for (const e of d.educations) {
    const v = educationSchema.safeParse({
      institution: e.institution, qualification_level: e.qualification, field_of_study: e.field,
      start_year: e.startYear, end_year: e.endYear,
    });
    if (!v.success) { skipped++; continue; }
    const x = v.data;
    const { error } = await supabase.from("educations").insert({
      profile_id: uid, institution: x.institution, qualification_level: x.qualification_level,
      field_of_study: x.field_of_study || null, start_year: toIntOrNull(x.start_year), end_year: toIntOrNull(x.end_year),
    });
    if (error) skipped++; else saved.educations++;
  }

  // ── skills: skip ones already on the profile ──
  const { data: curSkills } = await supabase.from("skills").select("name").eq("profile_id", uid);
  const haveSkill = new Set((curSkills ?? []).map((s) => String(s.name).toLowerCase()));
  for (const name of d.skills) {
    const v = skillSchema.safeParse({ name });
    if (!v.success || haveSkill.has(v.data.name.toLowerCase())) continue;
    const { error } = await supabase.from("skills").insert({ profile_id: uid, name: v.data.name });
    if (error) skipped++; else { saved.skills++; haveSkill.add(v.data.name.toLowerCase()); }
  }

  // ── certifications ──
  for (const c of d.certifications) {
    const v = certificationSchema.safeParse({ name: c.name, issuer: c.issuer, year: c.year });
    if (!v.success) { skipped++; continue; }
    const { error } = await supabase.from("certifications").insert({
      profile_id: uid, name: v.data.name, issuer: v.data.issuer || null, year: toIntOrNull(v.data.year),
    });
    if (error) skipped++; else saved.certifications++;
  }

  // ── referees (private by RLS) ──
  for (const r of d.referees) {
    const v = refereeSchema.safeParse({ ...r, relationship: "", experience_id: null });
    if (!v.success) { skipped++; continue; }
    const x = v.data;
    const { error } = await supabase.from("referees").insert({
      profile_id: uid, experience_id: null, name: x.name, position: x.position || null,
      organization: x.organization || null, phone: x.phone || null, email: x.email || null, relationship: null,
    });
    if (error) skipped++; else saved.referees++;
  }

  await trackEvent(supabase, uid, "ai_import_saved", { ...saved, skipped });
  revalidatePath("/profile"); revalidatePath("/home");
  return { saved, skipped };
}

function langLevel(stored: string): string {
  const inner = /\((.*)\)/.exec(stored)?.[1]?.toLowerCase() ?? "";
  if (/mother|native/.test(inner)) return "native";
  return ["fluent", "professional", "conversational", "basic"].find((w) => inner.includes(w)) ?? "";
}

async function displayName(supabase: NonNullable<ReturnType<typeof createSupabaseRouteClient>>, uid: string): Promise<string> {
  const { data } = await supabase.from("profiles").select("display_name").eq("id", uid).maybeSingle();
  return (data?.display_name as string | null) ?? "";
}
