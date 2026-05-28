import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadPublicProfile, viewerContext } from "@/lib/public-profile";
import { SahanMark } from "@/components/SahanMark";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Button } from "@/components/Button";

// Public profile page. No (app) layout — accessible to logged-out viewers.
// Visibility is filtered at the data layer per CLAUDE.md §10.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const profile = await loadPublicProfile(params.id, "public");
  if (!profile) return { title: "Profile" };
  const name = profile.kind === "company" ? profile.name : profile.fullName;
  return { title: name, description: profile.kind === "individual" ? profile.headline : profile.about?.slice(0, 160) };
}

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  // Resolve viewer (anon vs registered vs owner).
  const supabase = createSupabaseServerClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const ctx = viewerContext(params.id, user?.id ?? null);

  const profile = await loadPublicProfile(params.id, ctx);
  if (!profile) notFound();

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-paper">
        <div className="mx-auto max-w-5xl px-5 sm:px-10 h-[60px] flex items-center justify-between">
          <Link href="/" aria-label="Sahan home"><SahanMark /></Link>
          {ctx === "owner" ? (
            <Link href="/profile"><Button kind="secondary" size="sm">Edit your profile</Button></Link>
          ) : ctx === "public" ? (
            <Link href="/signup"><Button kind="sienna" size="sm">Join Sahan</Button></Link>
          ) : (
            <Link href="/home"><Button kind="ghost" size="sm">Your home →</Button></Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 sm:px-10 py-10 sm:py-16">
        {profile.kind === "individual" ? <IndividualProfile p={profile} /> : <CompanyProfile p={profile} />}

        {/* Hint for sections the viewer can't see — tells the visitor that
            more exists behind sign-in / behind the owner's settings, without
            leaking what. */}
        {ctx !== "owner" && (
          <p className="mt-12 text-center text-[12px] text-muted">
            Some sections are hidden by privacy settings.
            {ctx === "public" && <> <Link href="/signup" className="text-sienna hover:underline">Sign up</Link> to see more.</>}
          </p>
        )}
      </main>
    </div>
  );
}

function IndividualProfile({ p }: { p: Extract<Awaited<ReturnType<typeof loadPublicProfile>>, { kind: "individual" }> }) {
  return (
    <article>
      <h1 className="font-serif text-[32px] sm:text-[44px] lg:text-[52px] tracking-[-0.025em] leading-[1.05] break-words">{p.fullName}</h1>
      {p.headline && <p className="font-serif italic text-[16px] sm:text-[18px] text-ink-soft mt-2 break-words">{p.headline}</p>}
      <div className="mt-2 text-[13px] text-muted break-words">
        {[p.location, p.email, p.phone].filter(Boolean).join(" · ")}
      </div>

      {p.summary && (
        <section className="mt-8">
          <p className="text-[15px] leading-relaxed text-ink-soft max-w-2xl whitespace-pre-line">{p.summary}</p>
        </section>
      )}

      {p.experiences.length > 0 && (
        <Section title="Experience">
          {p.experiences.map((e) => (
            <article key={e.id} className="card mb-3">
              <div className="flex flex-wrap items-baseline gap-2">
                <h3 className="font-serif text-[18px] tracking-tightish">{e.title}</h3>
                {e.verified && <VerifiedBadge note={e.verifiedNote || undefined} />}
              </div>
              <p className="text-[13px] text-ink-soft mt-1">
                <span className="font-medium">{e.organization}</span>{e.location && <> · {e.location}</>}{e.dateRange && <> · <span className="text-muted">{e.dateRange}</span></>}
              </p>
              {e.description && <p className="text-[14px] text-ink-soft mt-2 leading-relaxed">{e.description}</p>}
            </article>
          ))}
        </Section>
      )}

      {p.educations.length > 0 && (
        <Section title="Education">
          {p.educations.map((e) => (
            <article key={e.id} className="card mb-3">
              <div className="flex flex-wrap items-baseline gap-2">
                <h3 className="font-serif text-[17px] tracking-tightish">{e.qualification}{e.field ? ` · ${e.field}` : ""}</h3>
                {e.verified && <VerifiedBadge note={e.verifiedNote || undefined} />}
              </div>
              <p className="text-[13px] text-ink-soft mt-1"><span className="font-medium">{e.institution}</span>{e.dateRange && <> · <span className="text-muted">{e.dateRange}</span></>}</p>
            </article>
          ))}
        </Section>
      )}

      {p.skills.length > 0 && (
        <Section title="Skills">
          <ul className="flex flex-wrap gap-2">
            {p.skills.map((s) => <li key={s.id} className="inline-flex rounded-full bg-paper border border-border px-3 py-1 text-[13px] text-ink-soft">{s.name}</li>)}
          </ul>
        </Section>
      )}

      {p.languages.length > 0 && (
        <Section title="Languages">
          <ul className="flex flex-wrap gap-2">
            {p.languages.map((l) => <li key={l} className="inline-flex rounded-full bg-paper border border-border px-3 py-1 text-[13px] text-ink-soft">{l}</li>)}
          </ul>
        </Section>
      )}

      {p.certifications.length > 0 && (
        <Section title="Certifications">
          {p.certifications.map((c) => (
            <div key={c.id} className="card mb-3 flex flex-wrap items-baseline gap-2">
              <h3 className="font-serif text-[16px]">{c.name}</h3>
              <span className="text-[13px] text-muted">{[c.issuer, c.year].filter(Boolean).join(" · ")}</span>
              {c.verified && <VerifiedBadge note={c.verifiedNote || undefined} />}
            </div>
          ))}
        </Section>
      )}
    </article>
  );
}

function CompanyProfile({ p }: { p: Extract<Awaited<ReturnType<typeof loadPublicProfile>>, { kind: "company" }> }) {
  return (
    <article>
      <h1 className="font-serif text-[32px] sm:text-[44px] lg:text-[52px] tracking-[-0.025em] leading-[1.05] break-words">{p.name}</h1>
      <div className="mt-2 text-[13px] text-muted break-words">
        {[p.country, p.foundedYear && `Founded ${p.foundedYear}`, p.website, p.email].filter(Boolean).join(" · ")}
      </div>

      {p.about && (
        <Section title="About">
          <p className="text-[15px] leading-relaxed text-ink-soft max-w-2xl whitespace-pre-line break-words">{p.about}</p>
        </Section>
      )}

      {(p.mission || p.vision) && (
        <Section title="Mission & vision">
          <div className="grid gap-3 sm:grid-cols-2">
            {p.mission && (
              <div className="card bg-paper"><p className="section-eyebrow text-sienna">Mission</p><p className="mt-2 font-serif italic text-[15px]">&ldquo;{p.mission}&rdquo;</p></div>
            )}
            {p.vision && (
              <div className="card bg-ink text-paper"><p className="section-eyebrow text-sienna-soft">Vision</p><p className="mt-2 font-serif italic text-[15px]">&ldquo;{p.vision}&rdquo;</p></div>
            )}
          </div>
        </Section>
      )}

      {(p.sectors.length > 0 || p.services.length > 0) && (
        <Section title="Sectors & services">
          <div className="grid sm:grid-cols-2 gap-6">
            {p.sectors.length > 0 && (
              <div>
                <p className="section-eyebrow">Sectors</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {p.sectors.map((s) => <li key={s} className="inline-flex rounded-full bg-paper border border-border px-3 py-1 text-[13px]">{s}</li>)}
                </ul>
              </div>
            )}
            {p.services.length > 0 && (
              <div>
                <p className="section-eyebrow">Services</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {p.services.map((s) => <li key={s} className="inline-flex rounded-full bg-paper border border-border px-3 py-1 text-[13px]">{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {p.projects.length > 0 && (
        <Section title="Selected projects">
          {p.projects.map((proj) => (
            <article key={proj.id} className="card mb-3">
              <div className="flex flex-wrap items-baseline gap-2">
                <h3 className="font-serif text-[18px] tracking-tightish">{proj.project_name}</h3>
                {proj.verified && <VerifiedBadge note={proj.verifiedNote || undefined} />}
              </div>
              <p className="text-[13px] text-ink-soft mt-1 italic">{[proj.client_name, proj.sector, proj.dateRange].filter(Boolean).join(" · ")}</p>
              {proj.scope && <p className="mt-2 text-[14px] text-ink-soft leading-relaxed">{proj.scope}</p>}
            </article>
          ))}
        </Section>
      )}

      {p.team.length > 0 && (
        <Section title="Key personnel">
          <div className="grid sm:grid-cols-2 gap-3">
            {p.team.map((m) => (
              <div key={m.id} className="card">
                <p className="font-serif text-[16px] tracking-tightish">{m.person_name}</p>
                <p className="text-[13px] text-muted mt-0.5">{m.role}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {p.publicClients.length > 0 && (
        <Section title="Selected clients">
          <ul className="flex flex-wrap gap-2">
            {p.publicClients.map((c) => <li key={c} className="inline-flex rounded-full bg-paper border border-border px-3 py-1 text-[13px]">{c}</li>)}
          </ul>
        </Section>
      )}

      {p.certifications.length > 0 && (
        <Section title="Accreditations">
          {p.certifications.map((c) => (
            <div key={c.id} className="card mb-3 flex flex-wrap items-baseline gap-2">
              <h3 className="font-serif text-[16px]">{c.name}</h3>
              <span className="text-[13px] text-muted">{[c.issuer, c.year].filter(Boolean).join(" · ")}</span>
              {c.verified && <VerifiedBadge note={c.verifiedNote || undefined} />}
            </div>
          ))}
        </Section>
      )}
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <p className="section-eyebrow text-sienna">{title}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}
