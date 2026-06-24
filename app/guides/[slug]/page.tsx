import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GUIDES, getGuide, relatedGuides, type Guide } from "@/lib/content/guides";
import { Button } from "@/components/Button";
import { JsonLd } from "@/components/JsonLd";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import {
  SITE, absoluteUrl, articleLd, breadcrumbLd, faqLd,
} from "@/lib/seo";

// Statically generate every guide at build time — fast, cacheable,
// crawler-friendly. New slugs ship with a deploy.
export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = getGuide(params.slug);
  if (!g) return {};
  const path = `/guides/${g.slug}`;
  return {
    title: g.title,
    description: g.metaDescription,
    keywords: [g.keyword],
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: g.title,
      description: g.metaDescription,
      url: absoluteUrl(path),
      type: "article",
    },
    twitter: { card: "summary_large_image", title: g.title, description: g.metaDescription },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = getGuide(params.slug);
  if (!g) notFound();
  const path = `/guides/${g.slug}`;
  const related = relatedGuides(g.slug);

  return (
    <>
      <JsonLd data={[
        articleLd({
          headline: g.h1,
          description: g.metaDescription,
          path,
          datePublished: g.updated,
          dateModified: g.updated,
        }),
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: g.shortLabel, path },
        ]),
        faqLd(g.faq),
      ]} />

      <main className="mx-auto max-w-3xl px-5 sm:px-8 py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav className="text-[12.5px] text-muted flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ink">Home</Link><span aria-hidden>/</span>
          <Link href="/guides" className="hover:text-ink">Guides</Link><span aria-hidden>/</span>
          <span className="text-ink-soft">{g.shortLabel}</span>
        </nav>

        <header className="mt-4">
          <p className="section-eyebrow text-sienna">{g.category === "cv" ? "For professionals" : "For organisations"}</p>
          <h1 className="font-serif text-[32px] sm:text-[42px] tracking-[-0.025em] mt-2 leading-[1.08]">{g.h1}</h1>
          {g.intro.map((p, i) => (
            <p key={i} className="mt-4 text-[15.5px] text-ink-soft leading-relaxed">{p}</p>
          ))}
        </header>

        {/* Inline primary CTA — high on the page for mobile readers who
            decide fast. */}
        <InlineCta g={g} />

        <article className="mt-10 space-y-9">
          {g.sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-serif text-[24px] sm:text-[28px] tracking-tightish">{s.heading}</h2>
              {s.body.map((p, j) => (
                <p key={j} className="mt-3 text-[15px] text-ink-soft leading-relaxed">{p}</p>
              ))}
              {s.bullets && (
                <ul className="mt-4 space-y-2">
                  {s.bullets.map((b, k) => (
                    <li key={k} className="flex items-start gap-2.5 text-[14.5px] text-ink-soft">
                      <Check />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {g.checklist && (
            <section className="card bg-paper">
              <p className="section-eyebrow text-sienna">{g.checklist.title}</p>
              <ul className="mt-3 space-y-2">
                {g.checklist.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14.5px] text-ink-soft">
                    <Check /><span>{it}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Why Sahan — the positioning, woven in once, not spammed. */}
          <section className="rounded-[12px] border border-sienna/30 bg-sienna-soft/30 p-6">
            <h2 className="font-serif text-[22px] tracking-tightish">Why people use Sahan for this</h2>
            <p className="mt-2 text-[14.5px] text-ink-soft leading-relaxed">
              Sahan isn&apos;t a generic design tool. It&apos;s built for one job: making it effortless to keep a structured profile and generate a genuinely elegant {g.category === "cv" ? "CV" : "company profile"} from it — on any phone, in minutes — with optional verified badges on the claims that matter.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              <Feature>Simple to build, satisfying to download</Feature>
              <Feature>Works fully on mobile — no app to install</Feature>
              <Feature>Update once, regenerate any time</Feature>
              <Feature>Verified badges, per claim</Feature>
            </ul>
            <div className="mt-4"><VerifiedBadge /></div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="font-serif text-[24px] sm:text-[28px] tracking-tightish">Frequently asked questions</h2>
            <dl className="mt-4 divide-y divide-border">
              {g.faq.map((f, i) => (
                <div key={i} className="py-4">
                  <dt className="font-medium text-[15px] text-ink">{f.q}</dt>
                  <dd className="mt-1.5 text-[14.5px] text-ink-soft leading-relaxed">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </article>

        {/* Closing CTA */}
        <section className="mt-12 rounded-[14px] bg-ink text-paper p-7 sm:p-9 text-center">
          <h2 className="font-serif text-[26px] sm:text-[32px] tracking-[-0.02em]">{g.cta.title}</h2>
          <p className="mt-3 text-[14.5px] text-paper/75 max-w-md mx-auto leading-relaxed">{g.cta.body}</p>
          <Link href={g.cta.href} className="inline-block mt-6">
            <Button kind="sienna" size="lg">{g.cta.label}</Button>
          </Link>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="section-eyebrow">Related guides</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/guides/${r.slug}`} className="card bg-paper hover:bg-cream/40 transition block">
                  <h3 className="font-serif text-[16px] tracking-tightish leading-snug">{r.shortLabel}</h3>
                  <span className="mt-2 inline-block text-[12.5px] text-sienna font-medium">Read →</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

function InlineCta({ g }: { g: Guide }) {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-3 rounded-[12px] border border-border bg-paper p-4">
      <p className="text-[13.5px] text-ink-soft flex-1 min-w-[180px]">
        {g.category === "cv" ? "Build a recruiter-ready CV free." : "Generate a bid-ready company profile free."} A few minutes, on any phone.
      </p>
      <Link href={g.cta.href}><Button kind="primary" size="md">{g.cta.label}</Button></Link>
    </div>
  );
}

function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 11 11" className="text-verified mt-1 shrink-0" aria-hidden>
      <circle cx="5.5" cy="5.5" r="5.5" fill="currentColor" />
      <path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-[13.5px] text-ink-soft">
      <Check /><span>{children}</span>
    </li>
  );
}
