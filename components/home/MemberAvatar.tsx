import type { ShowcaseMember } from "@/lib/showcase";

// Avatar for the member cards on /home and the landing page: the photo when
// there is one, otherwise a standard initials tile — same blue-on-soft-blue
// for everyone, so the grid stays calm rather than a rainbow of random hues.
// People get a circle, companies a rounded square. The green check badge is
// part of the avatar so both surfaces stay identical.
export function MemberAvatar({ member: m }: { member: ShowcaseMember }) {
  const isCompany = m.kind === "company";
  const shape = isCompany ? "rounded-[18px]" : "rounded-full";
  return (
    <span className="relative inline-block">
      {m.photoUrl ? (
        isCompany ? (
          <span className={`flex w-[84px] h-[84px] items-center justify-center ${shape} bg-white border border-border-soft shadow-card overflow-hidden`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.photoUrl} alt="" loading="lazy" className="max-w-[62px] max-h-[62px] object-contain" />
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.photoUrl} alt="" loading="lazy" className={`w-[84px] h-[84px] ${shape} object-cover ring-[3px] ring-white shadow-card`} />
        )
      ) : (
        <span
          aria-hidden
          className={`flex w-[84px] h-[84px] items-center justify-center ${shape} bg-sienna-soft text-sienna ring-[3px] ring-white shadow-card font-serif font-semibold text-[30px] tracking-tight select-none`}
        >
          {m.initials}
        </span>
      )}
      <span className="absolute -bottom-0.5 -right-0.5 flex w-[22px] h-[22px] items-center justify-center rounded-full bg-white shadow-sm" aria-hidden>
        <svg width="15" height="15" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="12" fill="#067a5e" />
          <path d="M6.8 12.4 L10.4 16 L17.2 8.9" stroke="#fff" strokeWidth="2.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  );
}
