import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/Button";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { loadIndividualProfile, hasMinimumCore, profileCompleteness } from "@/lib/profile-data";
import { loadApprovedFeed } from "@/lib/feed-data";

export const metadata = { title: "Home" };

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, account_type, display_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.display_name || user.email || "";
  const isCompany = profile?.account_type === "company";

  // Show real completeness for individuals; company side lands in Milestone 6.
  const [data, feed] = await Promise.all([
    !isCompany ? loadIndividualProfile(user.id) : Promise.resolve(null),
    loadApprovedFeed(6),
  ]);
  const percent = data ? profileCompleteness(data) : 0;
  const minCore = data ? hasMinimumCore(data) : false;
  const verifiedCount = data
    ? data.experiences.filter((x) => x.verified).length +
      data.educations.filter((x) => x.verified).length +
      data.certifications.filter((x) => x.verified).length
    : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <main className="space-y-6">
        <section className="card relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-sienna/[0.07] blur-2xl" aria-hidden />
          <p className="section-eyebrow text-sienna">This week — your record</p>
          <h1 className="font-serif text-[28px] sm:text-[36px] tracking-[-0.02em] leading-[1.15] mt-3 max-w-2xl">
            Welcome{displayName ? `, ${firstName(displayName)}` : ""}.
            {minCore ? " Your CV is ready to download." : ` Your ${isCompany ? "company profile" : "CV"} is ready to start.`}
          </h1>
          <p className="mt-3 text-[14.5px] text-ink-soft max-w-xl leading-relaxed">
            {minCore
              ? "Pick a template and download. You can always come back to enrich your profile or request verification."
              : `Add the basics, drop in one ${isCompany ? "project" : "experience"}, and download a ${isCompany ? "company profile" : "CV"} in minutes.`}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/profile"><Button kind="primary" size="md">{minCore ? "Continue your profile" : "Start your profile"}</Button></Link>
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="section-eyebrow text-sienna">Sector feed</p>
              <h2 className="font-serif text-[22px] tracking-tightish mt-1">From the sources</h2>
            </div>
            <p className="text-[12px] text-muted">Curated from approved syndication sources.</p>
          </div>

          {feed.length === 0 ? (
            <div className="card mt-4">
              <p className="text-[13.5px] text-ink-soft">
                Sector news from approved humanitarian sources will appear here. In the meantime, the most valuable thing you can do is{" "}
                <Link href="/profile" className="text-sienna font-medium hover:underline">finish your profile</Link> so your {isCompany ? "company profile" : "CV"} is ready to share.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {feed.map((item) => (
                <li key={item.id} className="card hover:bg-cream/30 transition">
                  <div className="flex flex-wrap items-center gap-2 text-[11.5px]">
                    <span className="font-semibold text-ink-soft">{item.source_name}</span>
                    {item.tag && <span className="text-muted">&middot; {item.tag}</span>}
                    {item.published_at && (
                      <span className="text-muted">&middot; {new Date(item.published_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
                    )}
                  </div>
                  <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="block font-serif text-[18px] tracking-tightish mt-1 hover:underline">
                    {item.title} ↗
                  </a>
                  {item.snippet && <p className="mt-2 text-[13.5px] text-ink-soft leading-relaxed">{item.snippet}</p>}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[11.5px] text-muted">
            Titles + short snippets only, with attribution and a link back. Sahan does not rehost third-party articles.
          </p>
        </section>
      </main>

      <aside className="space-y-4">
        <div className="card">
          <p className="section-eyebrow">Profile completeness</p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="font-serif text-[32px]">{percent}</span>
            <span className="text-muted text-[13px]">%</span>
          </div>
          <div className="h-1 bg-border-soft rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-ink transition-all" style={{ width: `${percent}%` }} />
          </div>
          {data && (
            <ul className="mt-4 space-y-1.5 text-[12.5px]">
              <Todo done={Boolean(data.basics?.full_name)}>Fill in the basics</Todo>
              <Todo done={data.experiences.length >= 1}>Add 1 {isCompany ? "project" : "experience"}</Todo>
              <Todo done={data.educations.length >= 1}>Add 1 education</Todo>
              <Todo done={data.skills.length >= 3}>Add 3 skills</Todo>
              <Todo done={minCore}>Download your first CV</Todo>
            </ul>
          )}
        </div>

        <div className="card">
          <p className="section-eyebrow">Verified claims</p>
          {verifiedCount > 0 ? (
            <p className="mt-2 text-[13px] text-ink-soft">
              <span className="text-ink font-medium">{verifiedCount}</span> verified — they&apos;ll render on every CV with a green check.
            </p>
          ) : (
            <>
              <p className="mt-2 text-[13px] text-ink-soft">
                None yet. Once you&apos;ve added an experience, request verification to earn a badge like this:
              </p>
              <div className="mt-3"><VerifiedBadge note="UNICEF Somalia" /></div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function firstName(s: string) {
  const f = s.trim().split(/\s+/)[0];
  return f ? f.charAt(0).toUpperCase() + f.slice(1) : "";
}
function Todo({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`w-3.5 h-3.5 rounded-full border-[1.5px] ${done ? "bg-verified border-verified" : "border-muted"}`} aria-hidden />
      <span className={done ? "line-through text-muted" : ""}>{children}</span>
    </li>
  );
}
