import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Middleware needs to read AND refresh the auth cookie on each protected
// request. We pass a NextResponse through so set/remove can re-attach the
// refreshed cookies to the outgoing response.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Missing env vars → behave as "logged out". The middleware's caller
  // decides what to do (redirect to /login etc.).
  if (!url || !anon) return { response, user: null };

  const supabase = createServerClient(url, anon, {
    cookies: {
      get(name: string) { return request.cookies.get(name)?.value; },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  return { response, user };
}
