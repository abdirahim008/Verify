"use client";

import { createBrowserClient } from "@supabase/ssr";

// Returns null when env vars are missing so the UI can degrade to a login
// redirect instead of throwing during build / preview. Mirrors the defensive
// pattern used elsewhere in the user's projects.
// Untyped until we generate real types from Supabase
// (`supabase gen types typescript --linked`).
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createBrowserClient(url, anon);
}
