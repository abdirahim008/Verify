import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadApprovedFeed } from "@/lib/feed-data";
import { fetchJobs, selectJobs } from "@/lib/jobs/feed";
import { JobsCard } from "@/components/home/JobsCard";

export const metadata = { title: "Home" };

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, display_name, career_categories")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.display_name || user.email || "";
  const isCompany = profile?.account_type === "company";
  const careerCategories: string[] = profile?.career_categories ?? [];

  // Home is a curated landing — jobs + sector news. Profile state (CV
  // readiness, completeness, verified counts) lives on /profile, not here.
  // Jobs are personalised for individuals only (companies have no interests).
  const [feed, jobs] = await Promise.all([
    loadApprovedFeed(6),
    !isCompany ? fetchJobs() : Promise.resolve([]),
  ]);
  const matchedJobs = selectJobs(jobs, careerCategories, 4);

  const { greeting, dateLabel } = nowInEAT();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Editorial hero — welcoming, no profile data. */}
      <section className="card relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-sienna/[0.06] blur-3xl" aria-hidden />
        <div className="absolute -left-16 bottom-0 w-64 h-64 rounded-full bg-ink/[0.03] blur-3xl" aria-hidden />
        <div className="relative">
          <p className="section-eyebrow text-sienna">{dateLabel}</p>
          <h1 className="font-serif text-[28px] sm:text-[38px] tracking-[-0.02em] leading-[1.1] mt-3 max-w-2xl">
            {greeting}{firstName(displayName) ? `, ${firstName(displayName)}` : ""}.
          </h1>
          <p className="mt-3 text-[15px] text-ink-soft max-w-xl leading-relaxed">
            The latest roles and sector updates from across the Horn of Africa — curated in one place,
            and refreshed through the week.
          </p>
          <p className="mt-4 text-[12px] text-muted">
            Jobs from <a href="https://somkenjobs.com" target="_blank" rel="noopener noreferrer" className="text-sienna font-medium hover:underline">SomKenJobs</a> · sector news from approved humanitarian sources
          </p>
        </div>
      </section>

      {!isCompany && <JobsCard matched={matchedJobs} categories={careerCategories} />}

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
              Sector news from approved humanitarian sources will appear here as it&apos;s curated.
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
    </div>
  );
}

function firstName(s: string) {
  const f = s.trim().split(/\s+/)[0];
  return f ? f.charAt(0).toUpperCase() + f.slice(1) : "";
}

// Greeting + date in East Africa Time (the audience is Somalia / the Horn),
// so it reads right regardless of where the server runs.
function nowInEAT() {
  const now = new Date();
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Mogadishu", hour: "numeric", hour12: false }).format(now));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateLabel = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Mogadishu", weekday: "long", day: "numeric", month: "long" }).format(now);
  return { greeting, dateLabel };
}
