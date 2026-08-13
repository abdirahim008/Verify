import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/Button";
import { loadApprovedFeed } from "@/lib/feed-data";
import { fetchJobs, selectJobs, selectConsultancies } from "@/lib/jobs/feed";
import { fetchTraining } from "@/lib/feeds/training";
import { TrainingCard } from "@/components/home/TrainingCard";
import { HeroJobsSlider, type SlideJob } from "@/components/home/HeroJobsSlider";
import { CommunityShowcase } from "@/components/home/CommunityShowcase";
import { loadShowcaseMembers } from "@/lib/showcase";
import { labelFor } from "@/lib/jobs/sectors";

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

  const isCompany = profile?.account_type === "company";
  const careerCategories: string[] = profile?.career_categories ?? [];
  const noInterests = !isCompany && careerCategories.length === 0;

  // Home is a curated landing — opportunities + learning + sector news. The
  // jobs feed is shared (also powers tenders, shown to companies too); only the
  // personalised jobs list is individual-only.
  const [feed, jobs, training, showcase] = await Promise.all([
    loadApprovedFeed(6),
    fetchJobs(),
    fetchTraining(4),
    loadShowcaseMembers(12),
  ]);
  const matchedJobs = selectJobs(jobs, careerCategories, 14);
  const tenders = selectConsultancies(jobs, 8);

  // The carousel is the ONLY jobs surface on the page — the old "Matched to
  // your profile" and "Tenders & consultancies" cards fold into it.
  // Individuals lead with matched roles then tenders; companies lead with
  // tenders. Both top up from the wider feed so the carousel stays full even
  // when interest-matching is narrow. Deduped by link, so a consultancy that
  // also matched as a role appears once.
  const TARGET_SLIDES = 18;
  const toSlide = (j: (typeof jobs)[number], tag: string): SlideJob => ({
    title: j.title, org: j.org, location: j.location, link: j.link, deadline: j.deadline, tag,
  });
  const slides: SlideJob[] = [];
  const seen = new Set<string>();
  const take = (pool: typeof jobs, tag: string, cap: number) => {
    let taken = 0;
    for (const j of pool) {
      if (taken >= cap || slides.length >= TARGET_SLIDES) break;
      if (seen.has(j.link)) continue;
      seen.add(j.link);
      slides.push(toSlide(j, tag));
      taken++;
    }
  };
  if (isCompany) {
    take(tenders, "Tender", 8);
  } else {
    take(matchedJobs.items, "Role", 12);
    take(tenders, "Tender", 6);
  }
  take(jobs, "Role", TARGET_SLIDES); // top up to a full carousel
  const slideEyebrow = isCompany
    ? "Curated tenders"
    : matchedJobs.personalised ? "Curated for you" : "Curated opportunities";

  return (
    <div className="space-y-6">
      {/* ── Masthead: the curated-opportunity slideshow ────────────── */}
      <HeroJobsSlider jobs={slides} eyebrow={slideEyebrow} />

      {/* Only nudge: interest selection (it personalises the slideshow). */}
      {noInterests && (
        <div>
          <Link href="/profile"><Button kind="primary" size="md">Pick your career interests</Button></Link>
        </div>
      )}

      {/* ── Community showcase: real member profiles ───────────────── */}
      <CommunityShowcase members={showcase} />

      {/* ── Main column + curated right rail. Companies have no rail cards
          (the interests card is individual-only), so they get the full
          width instead of a blank 320px column. ── */}
      <div className={`grid gap-6 items-start ${!isCompany ? "lg:grid-cols-[1fr_320px]" : ""}`}>
        <main className="space-y-6 min-w-0">
          {/* Jobs & tenders live in the hero slideshow above. */}

          {/* Learning — warm accent band */}
          <TrainingCard items={training} />

          {/* Sector news */}
          <section>
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="section-eyebrow text-sienna">Sector feed</p>
                <h2 className="font-serif text-[22px] tracking-tightish mt-1">From the sources</h2>
              </div>
              <p className="text-[12px] text-muted">Curated from approved sources.</p>
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
        </main>

        {/* Right rail (individuals only) — curated, not profile-record data. */}
        {!isCompany && (
          <aside className="space-y-4 lg:sticky lg:top-6">
            <div className="card">
              <p className="section-eyebrow text-sienna">Your feed</p>
              {careerCategories.length > 0 ? (
                <>
                  <p className="mt-2 text-[12.5px] text-ink-soft leading-relaxed">Roles are matched to these interests.</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {careerCategories.map((c) => (
                      <span key={c} className="rounded-full border border-border bg-cream/50 px-2.5 py-1 text-[11.5px] text-ink-soft">{labelFor(c)}</span>
                    ))}
                  </div>
                  <Link href="/profile" className="inline-block mt-3 text-[12.5px] font-medium text-sienna hover:underline">Manage interests →</Link>
                </>
              ) : (
                <>
                  <h3 className="font-serif text-[17px] tracking-tightish mt-1">Personalise your roles</h3>
                  <p className="mt-1.5 text-[12.5px] text-ink-soft leading-relaxed">Pick the sectors you work in and the jobs feed tailors itself to you.</p>
                  <Link href="/profile" className="inline-block mt-3 text-[12.5px] font-medium text-sienna hover:underline">Choose interests →</Link>
                </>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
