import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { refreshFeed } from "@/lib/feed-refresh";

// Admin-only endpoint that pulls from approved syndication sources and
// upserts into `feed_items` (with approved=false for admin review).
// Triggered from the /admin/feed UI today; the same endpoint can be hit
// by a Vercel Cron or external scheduler later.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest) {
  const supabase = createSupabaseRouteClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  try {
    const out = await refreshFeed();
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Feed refresh failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
