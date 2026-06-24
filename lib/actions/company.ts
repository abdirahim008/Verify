"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import {
  companyBasicsSchema, type CompanyBasicsValues,
  companyAboutSchema, type CompanyAboutValues,
  companyOfferingsSchema,
  companyProjectSchema, type CompanyProjectValues,
  companyClientSchema, type CompanyClientValues,
  companyTeamSchema, type CompanyTeamValues,
  companyCertificationSchema, type CompanyCertificationValues,
  companyCeoSchema, type CompanyCeoValues,
  companyValueSchema, type CompanyValueValues,
  companyServiceSchema, type CompanyServiceValues,
  toIntOrNull, toNumOrNull,
} from "@/lib/schemas";

async function authedClient() {
  const supabase = createSupabaseRouteClient();
  if (!supabase) throw new Error("Supabase isn't configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  return { supabase, userId: user.id };
}
function bust() { revalidatePath("/profile"); revalidatePath("/home"); }

// ─── basics ─────────────────────────────────────────────────────────
export async function saveCompanyBasics(values: CompanyBasicsValues) {
  const v = companyBasicsSchema.parse(values);
  const { supabase, userId } = await authedClient();
  const { error } = await supabase
    .from("company_details")
    .upsert({
      profile_id: userId,
      company_name: v.company_name,
      logo_url: v.logo_url || null,
      tagline: v.tagline || null,
      cover_statement: v.cover_statement || null,
      locations: v.locations ?? [],
      country: v.country || null,
      registration_number: v.registration_number || null,
      registration_country: v.registration_country || null,
      founded_year: toIntOrNull(v.founded_year),
      staff_count: toIntOrNull(v.staff_count),
      countries_count: toIntOrNull(v.countries_count),
      projects_count: toIntOrNull(v.projects_count),
      website: v.website || null,
      email: v.email || null,
      phone: v.phone || null,
    }, { onConflict: "profile_id" });
  if (error) throw new Error(error.message);

  // Mirror company_name onto profiles.display_name for nav/home greeting.
  if (v.company_name) {
    await supabase.from("profiles").update({ display_name: v.company_name }).eq("id", userId);
  }
  bust();
}

// ─── logo URL (company) ────────────────────────────────────────────
// Separate action so the uploader can persist independently of the
// rest of the basics form. URL is null on remove.
export async function setCompanyLogoUrl(url: string | null) {
  const v = url === null ? null : String(url).trim().slice(0, 600);
  const { supabase, userId } = await authedClient();
  const { error } = await supabase
    .from("company_details")
    .upsert({ profile_id: userId, logo_url: v }, { onConflict: "profile_id" });
  if (error) throw new Error(error.message);
  bust();
}

// ─── about / mission / vision ──────────────────────────────────────
export async function saveCompanyAbout(values: CompanyAboutValues) {
  const v = companyAboutSchema.parse(values);
  const { supabase, userId } = await authedClient();
  const { error } = await supabase
    .from("company_details")
    .upsert({
      profile_id: userId,
      about: v.about || null,
      mission: v.mission || null,
      vision: v.vision || null,
    }, { onConflict: "profile_id" });
  if (error) throw new Error(error.message);
  bust();
}

// ─── sectors + services (arrays) ───────────────────────────────────
export async function saveCompanyOfferings(values: { sectors: string[]; core_services: string[] }) {
  const v = companyOfferingsSchema.parse(values);
  const { supabase, userId } = await authedClient();
  const { error } = await supabase
    .from("company_details")
    .upsert({ profile_id: userId, sectors: v.sectors, core_services: v.core_services }, { onConflict: "profile_id" });
  if (error) throw new Error(error.message);
  bust();
}

// ─── projects ──────────────────────────────────────────────────────
export async function addCompanyProject(values: CompanyProjectValues) {
  const v = companyProjectSchema.parse(values);
  const { supabase, userId } = await authedClient();
  const { error } = await supabase.from("company_projects").insert({
    profile_id: userId,
    project_name: v.project_name,
    client_name: v.client_name || null,
    sector: v.sector || null,
    value_amount: toNumOrNull(v.value_amount),
    currency: v.currency || null,
    year_start: toIntOrNull(v.year_start),
    year_end: toIntOrNull(v.year_end),
    scope: v.scope || null,
  });
  if (error) throw new Error(error.message);
  bust();
}

export async function updateCompanyProject(id: string, values: CompanyProjectValues) {
  const v = companyProjectSchema.parse(values);
  const { supabase } = await authedClient();
  const { error } = await supabase.from("company_projects").update({
    project_name: v.project_name,
    client_name: v.client_name || null,
    sector: v.sector || null,
    value_amount: toNumOrNull(v.value_amount),
    currency: v.currency || null,
    year_start: toIntOrNull(v.year_start),
    year_end: toIntOrNull(v.year_end),
    scope: v.scope || null,
  }).eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}

export async function deleteCompanyProject(id: string) {
  const { supabase } = await authedClient();
  const { error } = await supabase.from("company_projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}

// ─── clients ───────────────────────────────────────────────────────
export async function addCompanyClient(values: CompanyClientValues) {
  const v = companyClientSchema.parse(values);
  const { supabase, userId } = await authedClient();
  const { error } = await supabase.from("company_clients").insert({
    profile_id: userId,
    client_name: v.client_name,
    category: v.category || null,
    display_public: !!v.display_public,
    note: v.note || null,
    logo_url: v.logo_url || null,
  });
  if (error) throw new Error(error.message);
  bust();
}
export async function updateCompanyClient(id: string, values: CompanyClientValues) {
  const v = companyClientSchema.parse(values);
  const { supabase } = await authedClient();
  const { error } = await supabase.from("company_clients").update({
    client_name: v.client_name,
    category: v.category || null,
    display_public: !!v.display_public,
    note: v.note || null,
    logo_url: v.logo_url || null,
  }).eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}
export async function deleteCompanyClient(id: string) {
  const { supabase } = await authedClient();
  const { error } = await supabase.from("company_clients").delete().eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}

// ─── team ──────────────────────────────────────────────────────────
export async function addCompanyTeamMember(values: CompanyTeamValues) {
  const v = companyTeamSchema.parse(values);
  const { supabase, userId } = await authedClient();
  const { error } = await supabase.from("company_team").insert({
    profile_id: userId,
    person_name: v.person_name,
    role: v.role || null,
    units: v.units ?? [],
    reports_to: v.reports_to || null,
  });
  if (error) throw new Error(error.message);
  bust();
}
export async function updateCompanyTeamMember(id: string, values: CompanyTeamValues) {
  const v = companyTeamSchema.parse(values);
  const { supabase } = await authedClient();
  const { error } = await supabase.from("company_team").update({
    person_name: v.person_name,
    role: v.role || null,
    units: v.units ?? [],
    reports_to: v.reports_to || null,
  }).eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}

// ─── CEO message + organogram top label ────────────────────────────
export async function saveCompanyCeo(values: CompanyCeoValues) {
  const v = companyCeoSchema.parse(values);
  const { supabase, userId } = await authedClient();
  const { error } = await supabase.from("company_details").upsert({
    profile_id: userId,
    ceo_name: v.ceo_name || null,
    ceo_title: v.ceo_title || null,
    ceo_photo_url: v.ceo_photo_url || null,
    ceo_quote: v.ceo_quote || null,
    ceo_message: v.ceo_message || null,
    board_name: v.board_name || null,
  }, { onConflict: "profile_id" });
  if (error) throw new Error(error.message);
  bust();
}

// ─── sectors (services moved to the company_services table) ─────────
export async function saveCompanySectors(sectors: string[]) {
  const v = companyOfferingsSchema.parse({ sectors, core_services: [] });
  const { supabase, userId } = await authedClient();
  const { error } = await supabase
    .from("company_details")
    .upsert({ profile_id: userId, sectors: v.sectors }, { onConflict: "profile_id" });
  if (error) throw new Error(error.message);
  bust();
}

// ─── values ─────────────────────────────────────────────────────────
export async function addCompanyValue(values: CompanyValueValues) {
  const v = companyValueSchema.parse(values);
  const { supabase, userId } = await authedClient();
  const { error } = await supabase.from("company_values").insert({
    profile_id: userId, name: v.name, description: v.description || null,
  });
  if (error) throw new Error(error.message);
  bust();
}
export async function updateCompanyValue(id: string, values: CompanyValueValues) {
  const v = companyValueSchema.parse(values);
  const { supabase } = await authedClient();
  const { error } = await supabase.from("company_values").update({
    name: v.name, description: v.description || null,
  }).eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}
export async function deleteCompanyValue(id: string) {
  const { supabase } = await authedClient();
  const { error } = await supabase.from("company_values").delete().eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}

// ─── services (name + description) ─────────────────────────────────
export async function addCompanyService(values: CompanyServiceValues) {
  const v = companyServiceSchema.parse(values);
  const { supabase, userId } = await authedClient();
  const { error } = await supabase.from("company_services").insert({
    profile_id: userId, name: v.name, description: v.description || null,
  });
  if (error) throw new Error(error.message);
  bust();
}
export async function updateCompanyService(id: string, values: CompanyServiceValues) {
  const v = companyServiceSchema.parse(values);
  const { supabase } = await authedClient();
  const { error } = await supabase.from("company_services").update({
    name: v.name, description: v.description || null,
  }).eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}
export async function deleteCompanyService(id: string) {
  const { supabase } = await authedClient();
  const { error } = await supabase.from("company_services").delete().eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}
export async function deleteCompanyTeamMember(id: string) {
  const { supabase } = await authedClient();
  const { error } = await supabase.from("company_team").delete().eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}

// ─── certifications ────────────────────────────────────────────────
export async function addCompanyCertification(values: CompanyCertificationValues) {
  const v = companyCertificationSchema.parse(values);
  const { supabase, userId } = await authedClient();
  const { error } = await supabase.from("company_certifications").insert({
    profile_id: userId,
    name: v.name,
    issuer: v.issuer || null,
    year: toIntOrNull(v.year),
  });
  if (error) throw new Error(error.message);
  bust();
}
export async function updateCompanyCertification(id: string, values: CompanyCertificationValues) {
  const v = companyCertificationSchema.parse(values);
  const { supabase } = await authedClient();
  const { error } = await supabase.from("company_certifications").update({
    name: v.name,
    issuer: v.issuer || null,
    year: toIntOrNull(v.year),
  }).eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}
export async function deleteCompanyCertification(id: string) {
  const { supabase } = await authedClient();
  const { error } = await supabase.from("company_certifications").delete().eq("id", id);
  if (error) throw new Error(error.message);
  bust();
}
