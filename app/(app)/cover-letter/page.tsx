import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/Button";
import { aiConfigured } from "@/lib/ai/deepseek";
import { loadCVData } from "@/lib/pdf/data";
import { CV_TEMPLATES } from "@/components/templates/catalog";
import { CoverLetterWorkspace } from "@/components/letter/CoverLetterWorkspace";

export const metadata = { title: "Cover letter" };

// AI cover letter for individuals (CLAUDE.md §3): job link or advert text +
// the member's profile → an editable letter → a PDF that matches their CV.
export default async function CoverLetterPage({ searchParams }: { searchParams: { job?: string | string[] } }) {
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
  if (account?.account_type !== "individual") redirect("/home");

  const [data, lastRes] = await Promise.all([
    loadCVData(user.id),
    // The CV template the member last downloaded sets the letter's style.
    supabase.from("usage_events").select("meta").eq("profile_id", user.id).eq("event", "cv_download")
      .order("created_at", { ascending: false }).limit(10),
  ]);
  const last = ((lastRes.data ?? []) as Array<{ meta: Record<string, unknown> | null }>)
    .map((e) => e.meta)
    .find((m) => m?.preview !== true && CV_TEMPLATES.some((t) => t.id === m?.template));
  const defaultTemplate = typeof last?.template === "string" ? last.template : CV_TEMPLATES[0].id;
  const defaultTheme = typeof last?.theme === "string" ? last.theme : "";

  // ?job=<link> comes from a job card on Home. Only ever used to prefill the box.
  const job = typeof searchParams.job === "string" ? searchParams.job : "";
  const initialUrl = /^https?:\/\//i.test(job) && job.length <= 2000 ? job : "";

  const ready = !!data && (data.experiences.length > 0 || data.educations.length > 0);

  return (
    <div className="mx-auto max-w-3xl">
      <header>
        <p className="section-eyebrow text-sienna">Cover letter</p>
        <h1 className="font-serif text-[30px] sm:text-[38px] tracking-[-0.02em] mt-2 leading-tight">A cover letter for any job</h1>
        <p className="mt-2 text-[14.5px] text-ink-soft max-w-xl leading-relaxed">
          Paste the link to a job. We read the advert and your profile, and draft a letter you can edit and download.
        </p>
      </header>

      <div className="mt-6">
        {!aiConfigured() ? (
          <div className="card">
            <p className="text-[13.5px] text-ink-soft">The cover letter helper isn&rsquo;t available right now. Please check back soon.</p>
          </div>
        ) : !ready ? (
          <div className="card">
            <h2 className="font-serif text-[20px] tracking-tightish">First, add your experience</h2>
            <p className="mt-1.5 text-[13.5px] text-ink-soft leading-relaxed max-w-lg">
              The letter is written from your profile: your jobs, education and skills. Add at least one job or
              qualification, then come back.
            </p>
            <Link href="/profile" className="inline-block mt-4"><Button kind="sienna" size="md">Build my profile →</Button></Link>
          </div>
        ) : (
          <CoverLetterWorkspace
            initialUrl={initialUrl}
            defaultTemplate={defaultTemplate}
            defaultTheme={defaultTheme}
            fullName={data.fullName}
          />
        )}
      </div>
    </div>
  );
}
