import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const cookieStore = cookies();
  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // In RSC reads we can't mutate cookies; ignore. Route handlers / Server
        // Actions use a separate helper (lib/supabase/route.ts) when they need
        // to write cookies during auth flows.
        try { cookieStore.set({ name, value, ...options }); } catch {}
      },
      remove(name: string, options: CookieOptions) {
        try { cookieStore.set({ name, value: "", ...options }); } catch {}
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
    cookies: { get: () => undefined, set: () => {}, remove: () => {} },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
