import Link from "next/link";
import type { ShowcaseMember } from "@/lib/showcase";

// Landing-page strip of real member profiles — admin-curated, consent-based
// (profiles.featured). Faces beat copy: this is the "people like you already
// use this" moment for a logged-out visitor. Hidden below 3 members so it
// can never read as a dead platform.
export function FeaturedProfiles({ members }: { members: ShowcaseMember[] }) {
  if (members.length < 3) return null;

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-14 sm:pt-20 pb-14">
        <p className="section-eyebrow text-sienna">On Sahan today</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-[28px] sm:text-[40px] tracking-[-0.02em] leading-[1.13] max-w-2xl">
            Real profiles, built here.
          </h2>
          <p className="text-[13px] text-muted pb-1.5">Shared with each member&rsquo;s permission.</p>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {members.slice(0, 4).map((m) => (
            <Link
              key={m.id}
              href={`/u/${m.id}`}
              className="group rounded-2xl border border-border bg-paper overflow-hidden text-center transition hover:border-muted/60 hover:shadow-card hover:-translate-y-0.5 flex flex-col"
            >
              <div className="h-[58px] bg-gradient-to-r from-sienna-soft/70 via-cream to-verified-soft/60" aria-hidden />
              <div className="-mt-[42px] flex justify-center">
                <span className="relative inline-block">
                  {m.kind === "company" ? (
                    <span className="flex w-[84px] h-[84px] items-center justify-center rounded-[18px] bg-white border border-border-soft shadow-card overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.photoUrl} alt="" loading="lazy" className="max-w-[62px] max-h-[62px] object-contain" />
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photoUrl} alt="" loading="lazy" className="w-[84px] h-[84px] rounded-full object-cover ring-[3px] ring-white shadow-card" />
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 flex w-[22px] h-[22px] items-center justify-center rounded-full bg-white shadow-sm" aria-hidden>
                    <svg width="15" height="15" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="12" fill="#067a5e" />
                      <path d="M6.8 12.4 L10.4 16 L17.2 8.9" stroke="#fff" strokeWidth="2.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
              </div>
              <div className="flex-1 flex flex-col px-4 pt-3 pb-5">
                <p className="font-serif text-[15.5px] tracking-tightish leading-snug text-ink group-hover:text-sienna transition-colors line-clamp-2">{m.name}</p>
                <p className="mt-1 text-[11.5px] text-muted leading-snug line-clamp-2">{m.line}</p>
                {m.location && <p className="mt-1.5 text-[10.5px] uppercase tracking-[0.12em] text-muted-soft">{m.location}</p>}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <a href="#get-started" className="text-[13.5px] font-semibold text-sienna hover:underline underline-offset-4">
            Build yours in 10 minutes →
          </a>
        </div>
      </div>
    </section>
  );
}
