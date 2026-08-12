import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { INDIVIDUAL_SECTIONS, COMPANY_SECTIONS, defaultVisibility, type VisibilityLevel } from "@/lib/visibility";
import { VisibilityForm } from "@/components/settings/VisibilityForm";
import { ShowcaseToggle } from "@/components/settings/ShowcaseToggle";
import { FEATURES } from "@/lib/flags";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles").select("account_type, section_visibility")
    .eq("id", user.id).maybeSingle();
  // Separate query: before migration 0009 the column doesn't exist, and this
  // failing must not take the visibility form down with it.
  const { data: showcaseRow } = await supabase
    .from("profiles").select("showcase").eq("id", user.id).maybeSingle();

  const sections = profile?.account_type === "company" ? COMPANY_SECTIONS : INDIVIDUAL_SECTIONS;
  const raw = (profile?.section_visibility ?? {}) as Record<string, VisibilityLevel>;
  // Backfill missing keys with the section's safe default — guarantees the
  // form renders every section even if the trigger seeded a partial JSON.
  const current: Record<string, VisibilityLevel> = {};
  for (const def of sections) current[def.key] = raw[def.key] ?? defaultVisibility(def);

  return (
    <div className="max-w-3xl">
      <p className="section-eyebrow text-sienna">Settings</p>
      <h1 className="font-serif text-[32px] sm:text-[40px] tracking-[-0.02em] mt-2">Privacy &amp; visibility</h1>
      <p className="mt-2 text-[14.5px] text-ink-soft max-w-xl leading-relaxed">
        Pick who can see each section. Safe defaults are pre-selected — sensitive fields stay closed until you open them. Some rows are locked because they protect third parties.
      </p>

      <div className="mt-6 card bg-cream/60 border-border-soft">
        <p className="section-eyebrow">Hard rules</p>
        <ul className="mt-2 space-y-1 text-[13px] text-ink-soft">
          <li>&middot; Referee contact details are <strong>always private</strong> — they&apos;re third parties who didn&apos;t sign up here.</li>
          <li>&middot; Contact info and location <strong>cannot be set public</strong>. Default is registered-only.</li>
          {FEATURES.verification && (
            <li>&middot; Verification evidence is admin-only. Never visible to other users.</li>
          )}
        </ul>
      </div>

      <ShowcaseToggle initial={showcaseRow?.showcase ?? true} />

      <div className="mt-6"><VisibilityForm sections={sections} initial={current} /></div>
    </div>
  );
}
