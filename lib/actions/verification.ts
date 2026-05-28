"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  PRICING_BY_TARGET, resolveTargetTable, TARGET_LABELS, type TargetType,
} from "@/lib/verification";
import { sendVerificationRequestEmail } from "@/lib/email";

// ─── shared auth helpers ───────────────────────────────────────────
async function authedUser() {
  const supabase = createSupabaseRouteClient();
  if (!supabase) throw new Error("Supabase isn't configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  return { supabase, userId: user.id, userEmail: user.email ?? null };
}

async function authedAdmin() {
  const { supabase, userId } = await authedUser();
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", userId).maybeSingle();
  if (!me?.is_admin) throw new Error("Admin only.");
  return { supabase, userId };
}

function bust() {
  revalidatePath("/profile");
  revalidatePath("/verification");
  revalidatePath("/home");
  revalidatePath("/admin");
}

// ─── user: create a verification request ───────────────────────────
// Manual payment workflow (per user spec):
//  1. Submit form with claim, phone, payment acknowledgment.
//  2. Action writes DB row + emails the Sahan inbox.
//  3. Sahan calls the user to arrange payment.
//  4. Once paid, Sahan runs verification with the named employer.
//  5. Admin marks the claim verified in the admin panel.
const createSchema = z.object({
  id: z.string().uuid(),
  target_type: z.enum(["experience", "education", "project", "certification"]),
  target_id: z.string().uuid(),
  contact_phone: z.string().trim().min(5, "Enter a usable phone number").max(40),
  accept_payment: z.literal(true, {
    errorMap: () => ({ message: "Tick the payment acknowledgment to continue." }),
  }),
  contact_email: z.string().email().optional(),
});

export async function createVerificationRequest(input: z.infer<typeof createSchema>) {
  const v = createSchema.parse(input);
  const { supabase, userId, userEmail } = await authedUser();

  // Confirm the user actually owns the claim they're requesting verification
  // on. RLS already scopes the rows they can read; this is a sanity check
  // so we return a friendlier error than a foreign-key violation.
  const { data: profile } = await supabase
    .from("profiles").select("account_type, display_name").eq("id", userId).maybeSingle();
  if (!profile) throw new Error("Profile not found.");
  const table = resolveTargetTable(v.target_type as TargetType, profile.account_type);
  const { data: target } = await supabase
    .from(table).select("*").eq("id", v.target_id).eq("profile_id", userId).maybeSingle();
  if (!target) throw new Error("Claim not found.");
  if ((target as { verified?: boolean }).verified) throw new Error("Already verified.");

  // Block duplicates: one pending request per target.
  const { count } = await supabase
    .from("verification_requests")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", userId)
    .eq("target_type", v.target_type)
    .eq("target_id", v.target_id)
    .eq("status", "pending");
  if ((count ?? 0) > 0) throw new Error("There's already a pending request for this claim.");

  const price = PRICING_BY_TARGET[v.target_type as TargetType];

  // Insert request row. evidence_urls stays empty in the new flow —
  // attachments come over email later if needed.
  const { error } = await supabase.from("verification_requests").insert({
    id: v.id,
    profile_id: userId,
    requested_by: userId,
    target_type: v.target_type,
    target_id: v.target_id,
    status: "pending",
    price_amount: price.amount,
    price_currency: price.currency,
    payment_status: "unpaid",
    evidence_urls: [],
    contact_phone: v.contact_phone,
  });
  if (error) throw new Error(error.message);

  // Notify the Sahan inbox. Failure here doesn't fail the user's
  // submission — the DB row is the source of truth and the admin
  // queue will still surface it.
  try {
    const { claimLabel, claimSublabel } = describeClaim(v.target_type as TargetType, target);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await sendVerificationRequestEmail({
      requestId: v.id,
      requesterName: profile.display_name || userEmail || "(no name)",
      requesterAccountType: profile.account_type,
      requesterContactEmail: v.contact_email || userEmail,
      requesterContactPhone: v.contact_phone,
      targetTypeLabel: TARGET_LABELS[v.target_type as TargetType],
      claimLabel,
      claimSublabel,
      priceAmount: price.amount,
      priceCurrency: price.currency,
      adminUrl: `${baseUrl}/admin/${v.id}`,
    });
  } catch (e) {
    console.error("[verification] email notify failed:", e);
  }

  bust();
}

// Format a claim row into the same "label / sublabel" pair the UI uses,
// so the email and admin view stay consistent.
function describeClaim(t: TargetType, target: Record<string, unknown>): { claimLabel: string; claimSublabel: string } {
  const r = target as Record<string, string | number | null | undefined>;
  switch (t) {
    case "experience":
      return {
        claimLabel: `${r.title ?? ""}${r.organization ? ` · ${r.organization}` : ""}`,
        claimSublabel: [r.location, datePair(r.start_date, r.end_date)].filter(Boolean).join(" · "),
      };
    case "education":
      return {
        claimLabel: `${r.qualification_level ?? ""}${r.field_of_study ? ` · ${r.field_of_study}` : ""}`,
        claimSublabel: [r.institution, yearPair(r.start_year, r.end_year)].filter(Boolean).join(" · "),
      };
    case "project":
      return {
        claimLabel: String(r.project_name ?? ""),
        claimSublabel: [r.client_name, r.sector, yearPair(r.year_start, r.year_end)].filter(Boolean).join(" · "),
      };
    case "certification":
      return {
        claimLabel: String(r.name ?? ""),
        claimSublabel: [r.issuer, r.year].filter(Boolean).join(" · "),
      };
  }
}

function datePair(s: string | number | null | undefined, e: string | number | null | undefined): string {
  if (!s && !e) return "";
  const start = s ? String(s).slice(0, 7) : "?";
  const end = e ? String(e).slice(0, 7) : "Present";
  return `${start} – ${end}`;
}
function yearPair(s: string | number | null | undefined, e: string | number | null | undefined): string {
  if (!s && !e) return "";
  return `${s ?? ""} – ${e ?? ""}`;
}

// ─── user: cancel their own pending request ────────────────────────
export async function cancelVerificationRequest(requestId: string) {
  const { supabase, userId } = await authedUser();
  const { data: req } = await supabase
    .from("verification_requests")
    .select("status, profile_id, evidence_urls")
    .eq("id", requestId)
    .maybeSingle();
  if (!req || req.profile_id !== userId) throw new Error("Request not found.");
  if (req.status !== "pending") throw new Error("Only pending requests can be cancelled.");

  // Clean up any evidence (legacy from the upload-based flow). New
  // requests have empty evidence_urls so this is a no-op for them.
  if (req.evidence_urls?.length) {
    await supabase.storage.from("verification-evidence").remove(req.evidence_urls).catch(() => {});
  }

  const { error } = await supabase.from("verification_requests").delete().eq("id", requestId);
  if (error) throw new Error(error.message);
  bust();
}

// ─── admin: mark a request verified ────────────────────────────────
const verifySchema = z.object({
  request_id: z.string().uuid(),
  verified_note: z.string().trim().min(1, "Add a short note (e.g. 'UNICEF Somalia')").max(200),
});

export async function adminVerifyRequest(input: z.infer<typeof verifySchema>) {
  const v = verifySchema.parse(input);
  const { userId } = await authedAdmin();
  const svc = createSupabaseServiceClient();
  if (!svc) throw new Error("Service-role client not configured.");

  const { data: req } = await svc.from("verification_requests").select("*").eq("id", v.request_id).maybeSingle();
  if (!req) throw new Error("Request not found.");
  if (req.status !== "pending") throw new Error("Already resolved.");

  const { data: ownerProfile } = await svc.from("profiles").select("account_type").eq("id", req.profile_id).maybeSingle();
  const table = resolveTargetTable(req.target_type as TargetType, ownerProfile?.account_type ?? null);

  const now = new Date().toISOString();
  const { error: claimErr } = await svc.from(table).update({
    verified: true,
    verified_note: v.verified_note,
    verified_at: now,
  }).eq("id", req.target_id);
  if (claimErr) throw new Error(claimErr.message);

  const { error: reqErr } = await svc.from("verification_requests").update({
    status: "verified",
    admin_note: v.verified_note,
    resolved_at: now,
    resolved_by: userId,
    payment_status: "paid", // marking verified implies admin received payment
  }).eq("id", v.request_id);
  if (reqErr) throw new Error(reqErr.message);

  bust();
}

// ─── admin: reject a request ───────────────────────────────────────
const rejectSchema = z.object({
  request_id: z.string().uuid(),
  admin_note: z.string().trim().min(1, "Explain why so the user can fix it").max(500),
});

export async function adminRejectRequest(input: z.infer<typeof rejectSchema>) {
  const v = rejectSchema.parse(input);
  const { userId } = await authedAdmin();
  const svc = createSupabaseServiceClient();
  if (!svc) throw new Error("Service-role client not configured.");

  const { data: req } = await svc.from("verification_requests").select("status").eq("id", v.request_id).maybeSingle();
  if (!req) throw new Error("Request not found.");
  if (req.status !== "pending") throw new Error("Already resolved.");

  const { error } = await svc.from("verification_requests").update({
    status: "rejected",
    admin_note: v.admin_note,
    resolved_at: new Date().toISOString(),
    resolved_by: userId,
  }).eq("id", v.request_id);
  if (error) throw new Error(error.message);
  bust();
}

// ─── admin: mark a request as paid (without verifying yet) ─────────
// Useful when the user has paid but verification with the employer is
// still in progress. Lets the admin row reflect reality.
const paidSchema = z.object({ request_id: z.string().uuid() });
export async function adminMarkPaid(input: z.infer<typeof paidSchema>) {
  const v = paidSchema.parse(input);
  await authedAdmin();
  const svc = createSupabaseServiceClient();
  if (!svc) throw new Error("Service-role client not configured.");
  const { error } = await svc.from("verification_requests")
    .update({ payment_status: "paid" })
    .eq("id", v.request_id);
  if (error) throw new Error(error.message);
  bust();
}

// ─── admin: generate a short-lived signed URL for one evidence file ─
// Retained for any legacy requests that still have files in the bucket.
// New requests carry no evidence.
export async function adminSignEvidence(path: string): Promise<string | null> {
  await authedAdmin();
  const svc = createSupabaseServiceClient();
  if (!svc) return null;
  const { data, error } = await svc.storage
    .from("verification-evidence")
    .createSignedUrl(path, 60 * 5);
  if (error) return null;
  return data?.signedUrl ?? null;
}
