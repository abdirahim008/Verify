import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/TopNav";

// Auth state lives in cookies — every page here must run at request time.
// Without this, Next prerenders the routes statically during build (when
// env vars are missing and our supabase client short-circuits), and users
// land on a stale shell with no session-aware redirects.
export const dynamic = "force-dynamic";

// Auth gate for everything under (app). Middleware already redirects when the
// session is missing, but RSC code that runs inside this layout still needs
// the user object — fetch it once and pass downwards.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/login?error=Supabase%20isn%27t%20configured");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Profile may not exist yet on the very first request after signup (the DB
  // trigger races with the redirect). Render the shell either way; pages
  // below can fetch their own slices.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, account_type, is_admin, display_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-cream">
      <TopNav
        accountType={profile?.account_type ?? null}
        displayName={profile?.display_name ?? user.email ?? ""}
        isAdmin={!!profile?.is_admin}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-8 py-6 sm:py-10">{children}</div>
    </div>
  );
}
