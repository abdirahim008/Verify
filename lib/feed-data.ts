import "server-only";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export interface FeedItem {
  id: string;
  title: string;
  snippet: string | null;
  source_name: string;
  source_url: string;
  published_at: string | null;
  tag: string | null;
  approved: boolean;
  created_at: string;
}

// User-facing feed on /home — only approved items. RLS already enforces
// "approved or is_admin" so the regular server client is fine.
export async function loadApprovedFeed(limit = 6): Promise<FeedItem[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("feed_items")
    .select("*")
    .eq("approved", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  return (data ?? []) as FeedItem[];
}

// Admin queue — needs every item including unapproved. Service-role
// because the admin policy expects is_admin() and we're explicit anyway.
export async function loadFeedQueue(filter: "pending" | "approved" | "all" = "pending"): Promise<FeedItem[]> {
  const svc = createSupabaseServiceClient();
  if (!svc) return [];
  let q = svc.from("feed_items").select("*").order("published_at", { ascending: false, nullsFirst: false });
  if (filter === "pending") q = q.eq("approved", false);
  if (filter === "approved") q = q.eq("approved", true);
  const { data } = await q.limit(100);
  return (data ?? []) as FeedItem[];
}
