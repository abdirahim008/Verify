import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Uses the getAll/setAll cookie interface (required by @supabase/ssr ≥0.5). The
// deprecated per-cookie get/set/remove methods mishandle the *chunked*
// auth-token cookies Supabase writes for large sessions, desyncing the browser
// client (server stays authed while the client's getUser() returns null).
export function createSupabaseServerClient() {
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
        // In RSC reads we can't mutate cookies; ignore. Route handlers / Server
        // Actions use a separate helper (lib/supabase/route.ts), and the
        // middleware refreshes + persists the session on every request.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...options }));
        } catch { /* RSC render — read-only cookie store */ }
      },
    },
  });
}

// Privileged client for admin operations (verification approvals, server-side
// reads that must bypass RLS — e.g. composing a PDF for the profile owner).
// NEVER expose this client to a request that hasn't been authn-checked.
export function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  // Service role is exempt from RLS — wire it through createServerClient with
  // no cookie support so it can't accidentally pick up a user session.
  return createServerClient(url, key, {
    cookies: { getAll: () => [], setAll: () => {} },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
