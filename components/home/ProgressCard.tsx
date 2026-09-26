import Link from "next/link";
import type { OnboardingProgress } from "@/lib/onboarding";

// Home's "finish your profile" card. Shown until the profile is complete.
// While the download is locked it leads with the unlock (the reward people
// signed up for); after that it's a quieter "make it stronger" nudge.
export function ProgressCard({ progress: p }: { progress: OnboardingProgress }) {
  if (p.percent >= 100 || !p.next) return null;
  const required = p.steps.filter((s) => s.required);
  const left = required.filter((s) => !s.done).length;
  const href = `/profile#sec-${p.next.id}`;

  if (p.minCore) {
    return (
      <div className="card flex flex-col sm:flex-row sm:items-center gap-4">
        <Bar percent={p.percent} />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] text-ink">
            Your {p.noun} is ready to download. Make it stronger: <span className="font-medium">{lowerFirst(p.next.label)}</span>.
          </p>
        </div>
        <Link href={href} className="shrink-0 text-[13px] font-semibold text-sienna hover:underline">Improve my {p.noun} →</Link>
      </div>
    );
  }

  return (
    <div className="card border-sienna/30 bg-cream/40">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex-1 min-w-0">
          <p className="section-eyebrow text-sienna">Your {p.noun}</p>
          <h2 className="font-serif text-[22px] tracking-tightish mt-1 leading-tight">
            {p.started
              ? `${left} step${left === 1 ? "" : "s"} left to unlock your ${p.noun}`
              : `Build your ${p.noun} in about 10 minutes`}
          </h2>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2 text-[13px]">
            {required.map((s) => (
              <li key={s.id} className="flex items-center gap-2">
                <Dot done={s.done} />
                <span className={s.done ? "text-muted line-through" : "text-ink-soft"}>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="sm:w-[200px] shrink-0">
          <Bar percent={p.percent} />
          <Link
            href={href}
            className="mt-3 flex items-center justify-center rounded-lg bg-sienna text-white font-semibold text-[14px] min-h-[44px] px-4 hover:opacity-90 transition"
          >
            {p.started ? "Continue" : "Start now"} →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Bar({ percent }: { percent: number }) {
  return (
    <div className="sm:w-[200px] shrink-0">
      <div className="flex items-baseline justify-between text-[12px] text-muted">
        <span>Profile</span>
        <span className="font-semibold text-ink tabular-nums">{percent}%</span>
      </div>
      <div className="h-1.5 bg-border-soft rounded-full mt-1 overflow-hidden">
        <div className="h-full bg-sienna rounded-full" style={{ width: `${Math.max(4, percent)}%` }} />
      </div>
    </div>
  );
}

function Dot({ done }: { done: boolean }) {
  return done ? (
    <svg width="16" height="16" viewBox="0 0 22 22" className="shrink-0" aria-hidden>
      <circle cx="11" cy="11" r="11" fill="#067a5e" />
      <path d="M6 11.2 L9.4 14.6 L16 8" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <span className="shrink-0 w-4 h-4 rounded-full border-[1.5px] border-muted/60" aria-hidden />
  );
}

function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
