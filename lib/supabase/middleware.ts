import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Middleware needs to read AND refresh the auth cookie on each protected
// request. We pass a NextResponse through so setAll can re-attach the refreshed
// cookies to the outgoing response.
//
// Uses the getAll/setAll cookie interface (required by @supabase/ssr ≥0.5):
// the deprecated per-cookie get/set/remove methods mishandle the *chunked*
// auth-token cookies Supabase writes for large sessions, which desyncs the
// browser client (server stays authed, client's getUser() returns null).
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Missing env vars → behave as "logged out". The middleware's caller
  // decides what to do (redirect to /login etc.).
  if (!url || !anon) return { response, user: null };

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  return { response, user };
}
