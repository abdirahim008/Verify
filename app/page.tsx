import Link from "next/link";
import { SahanMark } from "@/components/SahanMark";
import { Button } from "@/components/Button";
import { AuthCard } from "@/components/landing/AuthCard";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { FeaturedProfiles } from "@/components/landing/FeaturedProfiles";
import { CV_TEMPLATES } from "@/components/templates/CvThumbnails";
import { loadFeaturedMembers, countMembers } from "@/lib/showcase";

// Public marketing landing. Logged-out visitors (and crawlers) land here;
// logged-in users are redirected to /home by middleware.ts. The signup/sign-in
// forms live inline in the hero via <AuthCard />.
//
// ISR: the featured strip + member count come from the DB, but a marketing
// page shouldn't hit it per request — revalidate every 30 minutes.
export const revalidate = 1800;

// The social-proof line only appears once it stops sounding small. Real
// count from the DB, never fabricated (CLAUDE.md §11).
const SOCIAL_PROOF_MIN = 50;

export default async function LandingPage() {
  const [featured, memberCount] = await Promise.all([
    loadFeaturedMembers(4),
    countMembers(),
  ]);
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <Hero memberCount={memberCount} />
      <TrustStrip />
      <FeaturedProfiles members={featured} />
      <FeatureShowcase />
      <HowItWorks />
      <Templates />
      <PhonePitch />
      <ClosingCta />
      <SiteFooter />
    </div>
  );
}

// ── Header ───────────────────────────────────────────────────────────────
function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-cream/85 border-b border-border/70">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-5 sm:px-8 h-[60px] gap-4">
        <Link href="/" aria-label="Sahan home"><SahanMark /></Link>
        <nav className="hidden lg:flex items-center gap-7 text-[13px] text-ink-soft">
          <a href="#how" className="hover:text-ink transition">How it works</a>
          <a href="#build" className="hover:text-ink transition">What you&apos;ll create</a>
          <a href="#templates" className="hover:text-ink transition">Templates</a>
          <Link href="/guides" className="hover:text-ink transition">Guides</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="text-[13px] text-ink-soft hover:text-ink hidden sm:inline-flex min-h-[36px] items-center px-1">
            Sign in
          </Link>
          <a href="#get-started">
            <Button kind="sienna" size="sm" className="rounded-full px-5 min-h-[44px]">Get started</Button>
          </a>
        </div>
      </div>
    </header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────
function Hero({ memberCount }: { memberCount: number }) {
  return (
    <section className="relative overflow-hidden">
      {/* Soft layered backdrop — subtle, print-paper feel. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sienna-soft/50 blur-3xl" />
        <div className="absolute top-40 -left-20 h-64 w-64 rounded-full bg-verified-soft/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-12 sm:pt-16 pb-14 sm:pb-20 grid gap-10 lg:grid-cols-[1.05fr_minmax(0,440px)] lg:gap-14 items-start">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-paper/70 px-3 py-1 text-[12px] text-ink-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-verified" aria-hidden />
            For the Horn of Africa&apos;s humanitarian &amp; engineering sector
          </p>

          <h1 className="font-serif font-medium text-[38px] sm:text-[54px] lg:text-[60px] leading-[1.04] tracking-[-0.025em] mt-5">
            A genuinely <em className="text-sienna font-medium not-italic underline decoration-sienna/25 underline-offset-[6px]">elegant</em> CV or company profile — in a tap.
          </h1>

          <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
            <Check>Free CV &amp; profile</Check>
            <Check>Works on any phone</Check>
            <Check>A4, print-clean PDF</Check>
            <Check>No ads, no spam</Check>
          </ul>

          {/* On mobile the auth card sits right below this; this row gives a
              secondary nudge without competing with it. */}
          <div className="mt-8 hidden lg:flex items-center gap-4 text-[13px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-verified" />
              {memberCount >= SOCIAL_PROOF_MIN
                ? <>Join {memberCount} professionals &amp; firms already building verified profiles</>
                : <>Eight editorial templates — switch any time, nothing re-typed</>}
            </span>
          </div>
        </div>

        <div className="min-w-0 lg:pt-1">
          <AuthCard />
        </div>
      </div>
    </section>
  );
}

// ── Trust strip ──────────────────────────────────────────────────────────
function TrustStrip() {
  return (
    <section className="bg-paper border-y border-border">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-7">
        <p className="section-eyebrow">Built around the records that matter to teams at</p>
        <ul className="mt-3.5 flex flex-wrap items-center gap-x-7 gap-y-2.5 text-[14px] sm:text-[15.5px] font-semibold text-ink-soft/90">
          {["UNICEF", "World Bank", "UNHCR", "IOM", "FCDO", "ReliefWeb", "AfDB", "EU"].map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── How it works ─────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", title: "Build your profile", body: "Fill in structured sections once — experience, projects, education. Preview the real PDF on screen as you go." },
    { n: "02", title: "Choose a template", body: "Pick from eight editorial CV templates, or a matching set of company-profile designs. Switch any time — your details flow into every one." },
    { n: "03", title: "Share or export", body: "Publish a public profile link, download an A4 print-clean PDF, or share a digital business card with a QR to your live profile." },
  ];
  return (
    <section id="how" className="bg-cream">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-14 sm:pt-20 pb-6">
        <p className="section-eyebrow text-sienna">How it works</p>
        <h2 className="font-serif text-[28px] sm:text-[40px] tracking-[-0.02em] mt-3 max-w-2xl leading-[1.13]">
          From a blank form to a polished PDF — in three steps.
        </h2>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <article key={s.n} className="relative rounded-2xl border border-border bg-paper p-6">
              <span className="font-serif text-[34px] text-sienna/30 leading-none">{s.n}</span>
              <h3 className="font-serif text-[19px] tracking-tightish mt-3">{s.title}</h3>
              <p className="mt-2 text-[13.5px] text-ink-soft leading-relaxed">{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Templates ────────────────────────────────────────────────────────────
function Templates() {
  return (
    <section id="templates" className="bg-paper border-y border-border">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow text-sienna">CV templates</p>
            <h2 className="font-serif text-[28px] sm:text-[40px] tracking-[-0.02em] mt-2 max-w-2xl leading-[1.13]">
              Eight registers. One set of details.
            </h2>
            <p className="mt-2 text-[14.5px] text-ink-soft max-w-xl leading-relaxed">
              Same structured data, a different look in each. Switch any time — your edits flow into every template. Companies get a matching set of profile templates.
            </p>
          </div>
          <a href="#get-started">
            <Button kind="secondary" size="md">Create an account to download</Button>
          </a>
        </div>

        <div className="mt-9 grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {CV_TEMPLATES.map(({ id, name, tagline, Thumb }) => (
            <article key={id} className="rounded-2xl border border-border bg-cream/50 overflow-hidden flex flex-col">
              <div className="h-48 flex items-center justify-center bg-[#f1ede4]">
                <div className="drop-shadow-[0_8px_20px_rgba(0,0,0,0.14)] scale-90 sm:scale-100"><Thumb /></div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-serif text-[16.5px] tracking-tightish">{name}</h3>
                <p className="text-[12px] text-ink-soft mt-0.5">{tagline}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Phone pitch ──────────────────────────────────────────────────────────
function PhonePitch() {
  return (
    <section id="about" className="bg-cream">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14 sm:py-20">
        <div className="max-w-2xl">
          <p className="section-eyebrow text-sienna">Simple in, beautiful out</p>
          <h2 className="font-serif text-[28px] sm:text-[40px] tracking-[-0.02em] mt-3 leading-[1.12]">
            Not another design tool you fight with.
          </h2>
          <p className="mt-4 text-[15px] sm:text-[16px] text-ink-soft leading-relaxed">
            You shouldn&apos;t need design skills, a laptop, or an afternoon to produce a professional CV or company profile. Fill in plain fields — once — and download a genuinely elegant PDF. Update anything later and regenerate in a tap.
          </p>
        </div>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          <Pillar icon={<PhoneIcon />} title="Built for your phone" body="Most people here build their profile on a phone, so that's how Sahan is built. No app to install. Fill in, preview the real PDF, download." />
          <Pillar icon={<BoltIcon />} title="Minutes, not afternoons" body="Reach the minimum core — name, one experience, one skill — and your CV is ready. Enrich it whenever; nothing is ever re-typed." />
          <Pillar icon={<SparkIcon />} title="Output that looks designed" body="A4, embedded fonts, print-clean, with curated colour themes. Panels see a polished document — not a form someone filled in." />
        </div>
      </div>
    </section>
  );
}

// ── Closing CTA ──────────────────────────────────────────────────────────
function ClosingCta() {
  return (
    <section className="bg-cream pb-16 sm:pb-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="rounded-3xl bg-ink text-paper px-6 sm:px-12 py-12 sm:py-16 text-center relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-sienna/30 blur-3xl" />
          <p className="section-eyebrow text-sienna-soft relative">Free to start</p>
          <h2 className="font-serif text-[30px] sm:text-[44px] tracking-[-0.02em] mt-3 leading-[1.1] relative">
            Build the record your work deserves.
          </h2>
          <p className="mt-4 text-[15px] text-paper/75 max-w-xl mx-auto leading-relaxed relative">
            Create a free profile and download an elegant CV, company profile or business card today — no design skills needed.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 relative">
            <a href="#get-started">
              <Button kind="sienna" size="lg" className="min-h-[48px] px-7">Get started — free →</Button>
            </a>
            <Link href="/guides" className="text-[13.5px] text-paper/80 hover:text-paper underline underline-offset-4 min-h-[44px] inline-flex items-center px-2">
              Read the guides
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer (SEO-rich; internal links help long-tail guide pages rank) ────
function SiteFooter() {
  const cvGuides = [
    ["Humanitarian CV template", "/guides/humanitarian-cv-template"],
    ["NGO CV template", "/guides/ngo-cv-template"],
    ["M&E / MEAL CV", "/guides/monitoring-evaluation-cv"],
    ["CV format · Somalia", "/guides/cv-format-somalia"],
    ["Make a CV on your phone", "/guides/make-cv-on-phone"],
  ] as const;
  const coGuides = [
    ["Company profile for tenders", "/guides/company-profile-for-tender"],
    ["Construction company profile", "/guides/construction-company-profile"],
    ["NGO organizational profile", "/guides/ngo-organizational-profile"],
    ["Consultancy profile", "/guides/consultancy-company-profile"],
  ] as const;

  return (
    <footer className="bg-paper border-t border-border">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-[13px]">
        <div>
          <SahanMark size={18} />
          <p className="mt-3 text-muted max-w-[24ch] leading-relaxed">
            Elegant CVs, company profiles and business cards — built for Somalia &amp; East Africa.
          </p>
        </div>
        <div>
          <p className="section-eyebrow">Guides · CVs</p>
          <ul className="mt-3 space-y-1.5 text-ink-soft">
            {cvGuides.map(([label, href]) => (
              <li key={href}><Link href={href} className="hover:text-ink">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="section-eyebrow">Guides · Companies</p>
          <ul className="mt-3 space-y-1.5 text-ink-soft">
            {coGuides.map(([label, href]) => (
              <li key={href}><Link href={href} className="hover:text-ink">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="section-eyebrow">Product</p>
          <ul className="mt-3 space-y-1.5 text-ink-soft">
            <li><a href="#get-started" className="hover:text-ink">Create an account</a></li>
            <li><Link href="/login" className="hover:text-ink">Sign in</Link></li>
            <li><Link href="/guides" className="hover:text-ink">All guides</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center gap-2 text-[12px] text-muted">
          <span>&copy; {new Date().getFullYear()} Sahan · Mogadishu · Nairobi</span>
          <span className="sm:ml-auto">Made with restraint, for the Horn of Africa.</span>
        </div>
      </div>
    </footer>
  );
}

// ── Composables ──────────────────────────────────────────────────────────
function Pillar({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-border bg-paper p-6">
      <div className="w-9 h-9 rounded-lg bg-sienna-soft text-sienna flex items-center justify-center">{icon}</div>
      <h3 className="font-serif text-[19px] tracking-tightish mt-4">{title}</h3>
      <p className="mt-2 text-[13.5px] text-ink-soft leading-relaxed">{body}</p>
    </article>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-ink-soft">
      <svg width="14" height="14" viewBox="0 0 11 11" className="text-verified mt-0.5 shrink-0" aria-hidden>
        <circle cx="5.5" cy="5.5" r="5.5" fill="currentColor" />
        <path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────
function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18h2" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" />
    </svg>
  );
}
