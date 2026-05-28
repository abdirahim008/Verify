import "server-only";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import type { TargetType } from "@/lib/verification";
import { resolveTargetTable } from "@/lib/verification";

export interface VerificationRequestRow {
  id: string;
  profile_id: string;
  requested_by: string;
  target_type: TargetType;
  target_id: string;
  status: "pending" | "verified" | "rejected";
  price_amount: number | null;
  price_currency: string | null;
  payment_status: "unpaid" | "paid" | "waived";
  evidence_urls: string[];
  admin_note: string | null;
  contact_phone: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

// Load the current user's own requests. Used on /verification.
export async function loadOwnRequests(userId: string): Promise<VerificationRequestRow[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as VerificationRequestRow[];
}

// Set of target ids the user has a PENDING request on. Lets profile cards
// render a "Pending review" affordance instead of "Request verification".
export async function loadPendingTargetIds(userId: string): Promise<Set<string>> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return new Set();
  const { data } = await supabase
    .from("verification_requests")
    .select("target_type, target_id")
    .eq("profile_id", userId)
    .eq("status", "pending");
  return new Set((data ?? []).map((r) => `${r.target_type}:${r.target_id}`));
}

// ── admin loaders ─────────────────────────────────────────────────
// Uses the service-role client because the admin needs to see requests
// from every profile, plus enriched data (target row + requester
// display_name + email).

export interface AdminRequestSummary extends VerificationRequestRow {
  requesterName: string | null;
  requesterAccountType: "individual" | "company" | null;
  requesterAuthEmail: string | null;
}

export async function loadAdminRequests(filter?: "pending" | "verified" | "rejected" | "all"): Promise<AdminRequestSummary[]> {
  const svc = createSupabaseServiceClient();
  if (!svc) return [];

  let q = svc.from("verification_requests").select("*").order("created_at", { ascending: false });
  if (filter && filter !== "all") q = q.eq("status", filter);
  const { data: reqs } = await q;
  if (!reqs?.length) return [];

  const profileIds = Array.from(new Set(reqs.map((r) => r.profile_id)));
  const { data: profs } = await svc.from("profiles").select("id, display_name, account_type").in("id", profileIds);
  const byId = new Map((profs ?? []).map((p) => [p.id, p]));

  return reqs.map((r) => ({
    ...r as VerificationRequestRow,
    requesterName: byId.get(r.profile_id)?.display_name ?? null,
    requesterAccountType: byId.get(r.profile_id)?.account_type ?? null,
    requesterAuthEmail: null, // looked up per-row in detail view
  }));
}

// Full admin detail view: request + the underlying claim row + requester
// (with auth email for direct outreach).
export async function loadAdminRequestDetail(requestId: string) {
  const svc = createSupabaseServiceClient();
  if (!svc) return null;

  const { data: r } = await svc.from("verification_requests").select("*").eq("id", requestId).maybeSingle();
  if (!r) return null;

  const { data: prof } = await svc.from("profiles").select("id, display_name, account_type").eq("id", r.profile_id).maybeSingle();
  const accountType = prof?.account_type ?? null;
  const table = resolveTargetTable(r.target_type as TargetType, accountType);
  const { data: target } = await svc.from(table).select("*").eq("id", r.target_id).maybeSingle();

  // Get the requester's auth email. admin.getUserById is service-role-only.
  let authEmail: string | null = null;
  try {
    const { data: authUser } = await svc.auth.admin.getUserById(r.profile_id);
    authEmail = authUser?.user?.email ?? null;
  } catch { /* ignore — admin email is a nicety, not required */ }

  return {
    request: r as VerificationRequestRow,
    requester: prof,
    requesterAuthEmail: authEmail,
    target,
    targetTable: table,
  };
}
