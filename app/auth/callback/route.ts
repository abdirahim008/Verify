import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

// Magic-link / email-confirmation callback. Supabase appends ?code=... which
// we exchange for a session cookie, then bounce to ?next=.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/home";

  if (code) {
    const supabase = createSupabaseRouteClient();
    if (supabase) await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(next, request.url));
}
