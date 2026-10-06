"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import {
  companyBasicsSchema, companyAboutSchema, companyCeoSchema, companyOfferingsSchema,
  companyProjectSchema, companyServiceSchema, companyValueSchema, companyClientSchema,
  companyTeamSchema, companyCertificationSchema, toIntOrNull, toNumOrNull,
} from "@/lib/schemas";
import { normalizeCompanyDraft, type CompanyDraft } from "@/lib/ai/company-draft";
import { trackEvent } from "@/lib/track";

// Save a reviewed AI company draft. Mirrors lib/actions/ai-import.ts (the
// individual version): the draft comes from the browser, so it's
// normalised again and every entry re-validated with the manual-entry
// schemas; entries that fail are skipped rather than failing the import.
//
// Merge rules, so a company that already started isn't overwritten:
//  - basics, about/mission/vision, CEO: only empty fields are filled;
//  - sectors and locations: added unless already present;
//  - projects, services, values, clients, team, certifications: appended,
//    skipping names already on the profile.
// Projects keep verified = false (the column default) — verification is a
// separate, admin-only step. Clients stay hidden publicly (display_public
// false), as when added by hand.

export interface CompanyImportResult { saved: Record<string, number>; skipped: number }

export async function saveImportedCompany(input: CompanyDraft): Promise<CompanyImportResult> {
  const supabase = createSupabaseRouteClient();
  if (!supabase) throw new Error("Supabase isn't configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const uid = user.id;
  const { data: prof } = await supabase.from("profiles").select("account_type, display_name").eq("id", uid).maybeSingle();
  if (prof?.account_type !== "company") throw new Error("This is for company accounts.");

  const d = normalizeCompanyDraft({
    // normalizeCompanyDraft reads the model's field names; map back to them.
    company_name: input.companyName, tagline: input.tagline,
    about: input.about, mission: input.mission, vision: input.vision,
    country: input.country, locations: input.locations, founded_year: input.foundedYear,
    registration_number: input.registrationNumber, registration_country: input.registrationCountry,
    staff_count: input.staffCount, website: input.website, email: input.email, phone: input.phone,
    sectors: input.sectors, services: input.services, values: input.values,
    projects: (input.projects ?? []).map((p) => ({ ...p, year_start: p.yearStart, year_end: p.yearEnd })),
    clients: input.clients, team: input.team, certifications: input.certifications,
    ceo_name: input.ceoName, ceo_title: input.ceoTitle, ceo_message: input.ceoMessage,
  });

  const saved: Record<string, number> = {
    basics: 0, about: 0, sectors: 0, services: 0, values: 0, projects: 0, clients: 0, team: 0, certifications: 0, ceo: 0,
  };
  let skipped = 0;

  const { data: cur } = await supabase.from("company_details").select("*").eq("profile_id", uid).maybeSingle();
  const blank = (v: unknown) => v === null || v === undefined || (typeof v === "string" && !v.trim());
  const pick = (have: unknown, next: string) => (blank(have) ? next : String(have));
  const num = (v: unknown) => (v === null || v === undefined ? "" : String(v));
  const merge = (have: string[] | null | undefined, add: string[], cap: number) => {
    const list = [...(have ?? [])];
    const seen = new Set(list.map((s) => s.toLowerCase()));
    let added = 0;
    for (const s of add) if (!seen.has(s.toLowerCase()) && list.length < cap) { list.push(s); seen.add(s.toLowerCase()); added++; }
    return { list, added };
  };

  // ── basics: fill blanks only ──
  const locations = merge(cur?.locations, d.locations, 20);
  const basics = companyBasicsSchema.safeParse({
    company_name: pick(cur?.company_name, d.companyName) || (prof?.display_name ?? ""),
    logo_url: cur?.logo_url ?? "",
    tagline: pick(cur?.tagline, d.tagline),
    cover_statement: cur?.cover_statement ?? "",
    locations: locations.list,
    country: pick(cur?.country, d.country),
    registration_number: pick(cur?.registration_number, d.registrationNumber),
    registration_country: pick(cur?.registration_country, d.registrationCountry),
    founded_year: pick(num(cur?.founded_year), d.foundedYear),
    staff_count: pick(num(cur?.staff_count), d.staffCount),
    countries_count: num(cur?.countries_count), projects_count: num(cur?.projects_count),
    website: pick(cur?.website, d.website), email: pick(cur?.email, d.email), phone: pick(cur?.phone, d.phone),
  });
  if (!basics.success || !basics.data.company_name) throw new Error("Please add your company name.");
  const v = basics.data;
  const { error: basicsErr } = await supabase.from("company_details").upsert({
    profile_id: uid, company_name: v.company_name, tagline: v.tagline || null, locations: v.locations,
    country: v.country || null, registration_number: v.registration_number || null,
    registration_country: v.registration_country || null, founded_year: toIntOrNull(v.founded_year),
    staff_count: toIntOrNull(v.staff_count), website: v.website || null, email: v.email || null, phone: v.phone || null,
  }, { onConflict: "profile_id" });
  if (basicsErr) throw new Error(basicsErr.message);
  await supabase.from("profiles").update({ display_name: v.company_name }).eq("id", uid);
  saved.basics = 1;

  // ── about / mission / vision ──
  const about = companyAboutSchema.safeParse({
    about: pick(cur?.about, d.about), mission: pick(cur?.mission, d.mission), vision: pick(cur?.vision, d.vision),
  });
  if (about.success) {
    const a = about.data;
    const { error } = await supabase.from("company_details")
      .update({ about: a.about || null, mission: a.mission || null, vision: a.vision || null }).eq("profile_id", uid);
    if (error) skipped++; else saved.about = 1;
  } else skipped++;

  // ── CEO ──
  if (d.ceoName || d.ceoMessage) {
    const ceo = companyCeoSchema.safeParse({
      ceo_name: pick(cur?.ceo_name, d.ceoName), ceo_title: pick(cur?.ceo_title, d.ceoTitle),
      ceo_photo_url: cur?.ceo_photo_url ?? "", ceo_quote: cur?.ceo_quote ?? "",
      ceo_message: pick(cur?.ceo_message, d.ceoMessage), board_name: cur?.board_name ?? "",
    });
    if (ceo.success) {
      const c = ceo.data;
      const { error } = await supabase.from("company_details").update({
        ceo_name: c.ceo_name || null, ceo_title: c.ceo_title || null, ceo_message: c.ceo_message || null,
      }).eq("profile_id", uid);
      if (error) skipped++; else saved.ceo = 1;
    } else skipped++;
  }

  // ── sectors ──
  const sectors = merge(cur?.sectors, d.sectors, 30);
  if (sectors.added) {
    const ok = companyOfferingsSchema.safeParse({ sectors: sectors.list, core_services: [] });
    if (ok.success) {
      const { error } = await supabase.from("company_details").update({ sectors: ok.data.sectors }).eq("profile_id", uid);
      if (error) skipped++; else saved.sectors = sectors.added;
    } else skipped++;
  }

  // Existing names per table, so a second import doesn't duplicate rows.
  const existing = async (table: string, col: string) => {
    const { data } = await supabase.from(table).select(col).eq("profile_id", uid);
    return new Set(((data ?? []) as unknown as Record<string, unknown>[]).map((r) => String(r[col] ?? "").toLowerCase()));
  };

  // ── services ──
  const haveServices = await existing("company_services", "name");
  for (const s of d.services) {
    const ok = companyServiceSchema.safeParse(s);
    if (!ok.success) { skipped++; continue; }
    if (haveServices.has(ok.data.name.toLowerCase())) continue;
    const { error } = await supabase.from("company_services").insert({ profile_id: uid, name: ok.data.name, description: ok.data.description || null });
    if (error) skipped++; else { saved.services++; haveServices.add(ok.data.name.toLowerCase()); }
  }

  // ── values ──
  const haveValues = await existing("company_values", "name");
  for (const s of d.values) {
    const ok = companyValueSchema.safeParse(s);
    if (!ok.success) { skipped++; continue; }
    if (haveValues.has(ok.data.name.toLowerCase())) continue;
    const { error } = await supabase.from("company_values").insert({ profile_id: uid, name: ok.data.name, description: ok.data.description || null });
    if (error) skipped++; else { saved.values++; haveValues.add(ok.data.name.toLowerCase()); }
  }

  // ── projects (never verified here) ──
  const haveProjects = await existing("company_projects", "project_name");
  for (const p of d.projects) {
    const ok = companyProjectSchema.safeParse({
      project_name: p.name, client_name: p.client, sector: p.sector, value_amount: p.value,
      currency: p.currency, year_start: p.yearStart, year_end: p.yearEnd, scope: p.scope,
    });
    if (!ok.success) { skipped++; continue; }
    const x = ok.data;
    if (haveProjects.has(x.project_name.toLowerCase())) continue;
    const { error } = await supabase.from("company_projects").insert({
      profile_id: uid, project_name: x.project_name, client_name: x.client_name || null, sector: x.sector || null,
      value_amount: toNumOrNull(x.value_amount), currency: x.value_amount ? x.currency || null : null,
      year_start: toIntOrNull(x.year_start), year_end: toIntOrNull(x.year_end), scope: x.scope || null,
    });
    if (error) skipped++; else { saved.projects++; haveProjects.add(x.project_name.toLowerCase()); }
  }

  // ── clients (hidden publicly by default) ──
  const haveClients = await existing("company_clients", "client_name");
  for (const name of d.clients) {
    const ok = companyClientSchema.safeParse({ client_name: name, display_public: false });
    if (!ok.success) { skipped++; continue; }
    if (haveClients.has(ok.data.client_name.toLowerCase())) continue;
    const { error } = await supabase.from("company_clients").insert({ profile_id: uid, client_name: ok.data.client_name, display_public: false });
    if (error) skipped++; else { saved.clients++; haveClients.add(ok.data.client_name.toLowerCase()); }
  }

  // ── team ──
  const haveTeam = await existing("company_team", "person_name");
  for (const t of d.team) {
    const ok = companyTeamSchema.safeParse({ person_name: t.name, role: t.role, units: [], reports_to: null });
    if (!ok.success) { skipped++; continue; }
    if (haveTeam.has(ok.data.person_name.toLowerCase())) continue;
    const { error } = await supabase.from("company_team").insert({
      profile_id: uid, person_name: ok.data.person_name, role: ok.data.role || null, units: [], reports_to: null,
    });
    if (error) skipped++; else { saved.team++; haveTeam.add(ok.data.person_name.toLowerCase()); }
  }

  // ── certifications ──
  const haveCerts = await existing("company_certifications", "name");
  for (const c of d.certifications) {
    const ok = companyCertificationSchema.safeParse(c);
    if (!ok.success) { skipped++; continue; }
    if (haveCerts.has(ok.data.name.toLowerCase())) continue;
    const { error } = await supabase.from("company_certifications").insert({
      profile_id: uid, name: ok.data.name, issuer: ok.data.issuer || null, year: toIntOrNull(ok.data.year),
    });
    if (error) skipped++; else { saved.certifications++; haveCerts.add(ok.data.name.toLowerCase()); }
  }

  await trackEvent(supabase, uid, "ai_import_saved", { kind: "company", ...saved, skipped });
  revalidatePath("/profile"); revalidatePath("/home");
  return { saved, skipped };
}
