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
      country: v.country || null,
      registration_number: v.registration_number || null,
      registration_country: v.registration_country || null,
      founded_year: toIntOrNull(v.founded_year),
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
    display_public: !!v.display_public,
    note: v.note || null,
  });
  if (error) throw new Error(error.message);
  bust();
}
export async function updateCompanyClient(id: string, values: CompanyClientValues) {
  const v = companyClientSchema.parse(values);
  const { supabase } = await authedClient();
  const { error } = await supabase.from("company_clients").update({
    client_name: v.client_name,
    display_public: !!v.display_public,
    note: v.note || null,
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
    reports_to: v.reports_to || null,
  }).eq("id", id);
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
