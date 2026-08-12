import Link from "next/link";
import type { ShowcaseMember } from "@/lib/showcase";

// "Profiles on Sahan" — an elegant horizontally-scrolling gallery of member
// cards (photo, name, one line, location) shown to signed-in users on /home.
// The point is aspiration: see what a finished profile looks like, want one.
// Ends with a dark CTA card. Server component — no JS, scroll-snap only.
export function CommunityShowcase({ members }: { members: ShowcaseMember[] }) {
  if (members.length < 3) return null; // a two-card "gallery" looks like a bug

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="section-eyebrow text-sienna">The community</p>
          <h2 className="font-serif text-[22px] tracking-tightish mt-1">Profiles on Sahan</h2>
        </div>
        <p className="hidden sm:block text-[12px] text-muted">Tap a card to see the full profile.</p>
      </div>

      <div className="mt-4 -mx-1 px-1 flex gap-3.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
        {members.map((m) => (
          <Link
            key={m.id}
            href={`/u/${m.id}`}
            className="group snap-start shrink-0 w-[186px] rounded-[14px] border border-border bg-paper px-5 pt-6 pb-5 text-center transition hover:border-muted/60 hover:shadow-card hover:-translate-y-0.5"
          >
            <span className="relative inline-block">
              {m.kind === "company" ? (
                <span className="flex w-[84px] h-[84px] items-center justify-center rounded-[18px] bg-cream border border-border-soft overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.photoUrl} alt="" loading="lazy" className="max-w-[64px] max-h-[64px] object-contain" />
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

            <p className="mt-3.5 font-serif text-[15.5px] tracking-tightish leading-snug text-ink group-hover:text-sienna transition-colors line-clamp-2">
              {m.name}
            </p>
            <p className="mt-1 text-[11.5px] text-muted leading-snug line-clamp-2">{m.line}</p>
            {m.location && (
              <p className="mt-2 text-[10.5px] uppercase tracking-[0.12em] text-muted-soft">{m.location}</p>
            )}
          </Link>
        ))}

        {/* Closing CTA card — the whole gallery funnels here. */}
        <Link
          href="/profile"
          className="snap-start shrink-0 w-[186px] rounded-[14px] bg-ink text-paper px-5 pt-6 pb-5 text-center flex flex-col items-center justify-center transition hover:-translate-y-0.5 hover:shadow-card"
        >
          <span className="flex w-[84px] h-[84px] items-center justify-center rounded-full border-2 border-dashed border-paper/35">
            <span className="font-serif text-[34px] leading-none text-paper/80">+</span>
          </span>
          <p className="mt-3.5 font-serif text-[15.5px] tracking-tightish leading-snug">Your profile here</p>
          <p className="mt-1 text-[11.5px] text-paper/60 leading-snug">Photo, headline, verified record.</p>
          <span className="mt-2.5 text-[12px] font-semibold text-paper underline underline-offset-4 decoration-paper/40">Create yours →</span>
        </Link>
      </div>
    </section>
  );
}
