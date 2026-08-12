import Link from "next/link";
import type { ShowcaseMember } from "@/lib/showcase";

// "Profiles on Sahan" — a LinkedIn-style multi-row grid of member cards on
// /home: a soft banner band, the photo straddling it, name, one line,
// location, and a "View profile" pill. The point is aspiration: see what a
// finished profile looks like, want one. The grid's last cell is a dark
// "Your profile here" CTA. Server component — no JS.
export function CommunityShowcase({ members }: { members: ShowcaseMember[] }) {
  if (members.length < 3) return null; // a two-card "gallery" looks like a bug

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="section-eyebrow text-sienna">The community</p>
          <h2 className="font-serif text-[22px] tracking-tightish mt-1">Profiles on Sahan</h2>
        </div>
        <p className="hidden sm:block text-[12px] text-muted">Members with a finished profile.</p>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {members.map((m) => (
          <Link
            key={m.id}
            href={`/u/${m.id}`}
            className="group rounded-[14px] border border-border bg-paper overflow-hidden text-center transition hover:border-muted/60 hover:shadow-card hover:-translate-y-0.5 flex flex-col"
          >
            {/* Banner band — the avatar straddles its lower edge. */}
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

            <div className="flex-1 flex flex-col px-4 pt-3 pb-4">
              <p className="font-serif text-[15.5px] tracking-tightish leading-snug text-ink group-hover:text-sienna transition-colors line-clamp-2">
                {m.name}
              </p>
              <p className="mt-1 text-[11.5px] text-muted leading-snug line-clamp-2">{m.line}</p>
              {m.location && (
                <p className="mt-1.5 text-[10.5px] uppercase tracking-[0.12em] text-muted-soft">{m.location}</p>
              )}
              <span className="mt-auto pt-3">
                <span className="inline-block rounded-full border border-sienna/50 px-4 py-1.5 text-[12px] font-semibold text-sienna transition group-hover:bg-sienna group-hover:text-white">
                  View profile
                </span>
              </span>
            </div>
          </Link>
        ))}

        {/* Closing CTA cell — the whole grid funnels here. */}
        <Link
          href="/profile"
          className="rounded-[14px] bg-ink text-paper px-4 pt-6 pb-4 text-center flex flex-col items-center justify-center transition hover:-translate-y-0.5 hover:shadow-card min-h-[230px]"
        >
          <span className="flex w-[84px] h-[84px] items-center justify-center rounded-full border-2 border-dashed border-paper/35">
            <span className="font-serif text-[34px] leading-none text-paper/80">+</span>
          </span>
          <p className="mt-3.5 font-serif text-[15.5px] tracking-tightish leading-snug">Your profile here</p>
          <p className="mt-1 text-[11.5px] text-paper/60 leading-snug">Photo, headline, verified record.</p>
          <span className="mt-3 inline-block rounded-full bg-paper px-4 py-1.5 text-[12px] font-semibold text-ink">Create yours →</span>
        </Link>
      </div>
    </section>
  );
}
