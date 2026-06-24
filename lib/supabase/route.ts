import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Route handlers / Server Actions need to WRITE cookies during sign-in,
// sign-out, and magic-link callbacks. Use this client there.
//
// Uses the getAll/setAll cookie interface (required by @supabase/ssr ≥0.5) so
// the *chunked* auth-token cookies for large sessions are written/cleared
// atomically — the deprecated per-cookie set/remove leaves stale chunks behind,
// which leaves the browser client unable to reconstruct the session.
export function createSupabaseRouteClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const cookieStore = cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set({ name, value, ...options }));
      },
    },
  });
}
