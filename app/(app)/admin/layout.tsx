import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Hard gate: any non-admin who lands on /admin/* gets bounced to /home.
// The outer (app)/layout already verifies the user is signed in.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) redirect("/home");
  return <>{children}</>;
}
