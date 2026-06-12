import Link from "next/link";
import { SahanMark } from "@/components/SahanMark";
import { Button } from "@/components/Button";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { HeroLoginForm } from "@/components/landing/HeroLoginForm";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-5 sm:px-10 pt-10 sm:pt-16 pb-12 sm:pb-20 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          <div>
            <p className="inline-flex items-center gap-2 text-[12.5px] text-ink-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-sienna" aria-hidden />
              Verified professional profile &middot; for the humanitarian &amp; engineering sector
            </p>
            <h1 className="font-serif font-medium text-[44px] sm:text-[68px] leading-[1.04] tracking-[-0.025em] mt-5">
              Your work, <em className="text-sienna font-medium">verified</em>
              <br />
              by the people you did
              <br />
              it for.
            </h1>
            <p className="mt-6 max-w-xl text-[15px] sm:text-[16.5px] text-ink-soft leading-relaxed">
              Sahan is a verified professional profile platform for the Horn of Africa — built for the consultants, engineers, programme staff and firms whose work changes lives but never sits cleanly in a LinkedIn box.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/signup?type=individual">
                <Button kind="sienna" size="lg">Get started — free →</Button>
              </Link>
              <Link href="/signup?type=company">
                <Button kind="secondary" size="lg">I&apos;m signing up as a company</Button>
              </Link>
            </div>

            {/* Social proof. NOTE: the headcount below is a marketing
                placeholder copied from the agreed landing comp — replace
                with a real number once we have one, or drop the digit. */}
            <div className="mt-6 flex items-center gap-3">
              <AvatarStack />
              <p className="text-[12.5px] text-muted">
                <span className="text-ink font-medium">4,200+ professionals</span> across Somalia, Kenya, Ethiopia &amp; South Sudan
              </p>
            </div>
          </div>

          <div className="lg:pl-4 lg:-mt-2"><HeroLoginForm /></div>
        </div>
      </section>

      {/* ── Trust band — partners (text-only, factual listing) ─────── */}
      <section className="bg-paper border-y border-border">
        <div className="mx-auto max-w-6xl px-5 sm:px-10 py-8">
          <p className="section-eyebrow">Verification partners &amp; trusted by teams at</p>
          <ul className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 text-[15px] sm:text-[16px] font-semibold text-ink-soft">
            {["UNICEF", "World Bank", "UNHCR", "IOM", "FCDO", "ReliefWeb", "AfDB", "EU"].map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Why Sahan ──────────────────────────────────────────────── */}
      <section id="features" className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 sm:px-10 pt-14 sm:pt-20 pb-6 sm:pb-10">
          <p className="section-eyebrow text-sienna">Why Sahan</p>
          <h2 className="font-serif text-[28px] sm:text-[40px] tracking-[-0.02em] mt-3 max-w-3xl leading-[1.15]">
            A LinkedIn was never built for our sector.
            <br />
            <span className="text-muted">So we built one that is.</span>
          </h2>

          <div className="mt-9 grid gap-5 md:grid-cols-3">
            <Pillar
              icon={<TrustIcon />}
              title="Verification you can trust"
              body="Every claim is verified by the employer that issued it — not by us. A badge sits next to the specific role, project, or qualification it attests to."
            />
            <Pillar
              icon={<DocIcon />}
              title="CVs and profiles that match the bar"
              body="Editorial PDF templates tuned for the humanitarian and engineering sectors. Export to A4. Recruiters will think you hired a designer."
            />
            <Pillar
              icon={<BuildingIcon />}
              title="Built for companies, too"
              body="Civil-engineering firms, NGOs, and consultancies maintain a verified profile of selected projects and team — the same one used in tender packs."
            />
          </div>
        </div>
      </section>

      {/* ── Verification process (anchor target) ───────────────────── */}
      <section id="verification" className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 sm:px-10 pt-6 pb-16 sm:pb-24">
          <div className="grid gap-px bg-border rounded-[10px] overflow-hidden md:grid-cols-4">
            <Step n="01" title="Build your profile" body="Structured sections, live PDF preview, no copy-paste from a CV." />
            <Step n="02" title="Request verification" body="Pick a claim. Sahan contacts the employer that issued it." />
            <Step n="03" title="Get a badge per claim" body="Verified marks live next to the specific role or project." />
            <Step n="04" title="Share or export" body="Public profile URL, or A4 PDF in three editorial templates." />
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr] items-start">
            <div>
              <p className="section-eyebrow text-sienna">How verification works</p>
              <h3 className="font-serif text-[26px] sm:text-[34px] tracking-[-0.02em] mt-2 leading-[1.15]">
                A green check next to the <em className="text-sienna">specific</em> claim that was checked.
              </h3>
              <p className="mt-4 text-[14.5px] text-ink-soft leading-relaxed max-w-md">
                Verification on Sahan isn&apos;t a vague global badge. You pick a single experience, project, or qualification and submit it for review. An admin contacts the issuing employer or client. When confirmed, the badge sits inline next to that one claim — both on your profile and on the PDF.
              </p>
              <ul className="mt-5 space-y-2.5 text-[13.5px]">
                <Check>Per-claim, never global</Check>
                <Check>Employer-confirmed, not self-asserted</Check>
                <Check>Referee contacts stay private</Check>
                <Check>Evidence stays in an admin-only bucket</Check>
              </ul>
            </div>
            <div className="card">
              <p className="section-eyebrow">From the Editorial CV</p>
              <article className="mt-3">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-serif text-[17px] font-medium">Senior Health Coordinator</span>
                  <span className="font-serif text-[17px] italic text-sienna">· UNICEF Somalia</span>
                  <VerifiedBadge note="UNICEF Somalia" />
                </div>
                <p className="text-[12px] text-muted mt-1">Mogadishu &middot; Mar 2021 — Present</p>
                <p className="text-[13.5px] text-ink-soft leading-[1.6] mt-2 text-justify hyphens-auto">
                  Lead a team of fourteen across Banadir, Lower Shabelle and Middle Shabelle. Designed the cold-chain expansion that brought routine immunisation to 64 previously unreached settlements.
                </p>
              </article>
              <div className="mt-6 pt-5 border-t border-border-soft text-[12.5px] text-muted">
                Same role, no badge: a claim. <span className="text-ink-soft">With the badge: a record.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Templates (anchor target) ──────────────────────────────── */}
      <section id="templates" className="bg-paper border-y border-border">
        <div className="mx-auto max-w-6xl px-5 sm:px-10 py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-eyebrow text-sienna">Templates</p>
              <h2 className="font-serif text-[28px] sm:text-[40px] tracking-[-0.02em] mt-2 max-w-2xl leading-[1.15]">
                Four templates, designed with intent.
              </h2>
              <p className="mt-2 text-[14.5px] text-ink-soft max-w-xl leading-relaxed">
                Same structured data, different register. Switch any time — your changes flow into every template.
              </p>
            </div>
            <Link href="/signup">
              <Button kind="secondary" size="md">Create an account to download</Button>
            </Link>
          </div>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <TemplateCard
              name="Editorial"
              kind="CV"
              tagline="Magazine register. Drop cap. Cream paper."
              pairing="Fraunces · Newsreader"
              ready
              mini={<EditorialMini />}
            />
            <TemplateCard
              name="Sidebar"
              kind="CV"
              tagline="Two columns. Built for executives."
              pairing="Archivo · IBM Plex Sans"
              mini={<SidebarMini />}
            />
            <TemplateCard
              name="Mono"
              kind="CV"
              tagline="Minimalist, technical, single accent."
              pairing="Space Grotesk · IBM Plex Mono"
              mini={<MonoMini />}
            />
            <TemplateCard
              name="Wadani"
              kind="Company"
              tagline="Bid-ready. Cover + about + projects."
              pairing="Source Serif 4 · Public Sans"
              mini={<CompanyMini />}
            />
          </div>
        </div>
      </section>

      {/* ── About (anchor target) ──────────────────────────────────── */}
      <section id="about" className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 sm:px-10 py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] items-start">
            <div>
              <p className="section-eyebrow text-sienna">About</p>
              <h2 className="font-serif text-[28px] sm:text-[40px] tracking-[-0.02em] mt-2 leading-[1.15]">
                Built where the work is.
              </h2>
              <p className="mt-4 text-[14.5px] text-ink-soft leading-relaxed max-w-md">
                Sahan is built for the East Africa humanitarian and engineering sector — a context where a one-line LinkedIn job title leaves out almost everything that matters: which donor, which region, which actual outcome.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <AboutCard
                eyebrow="Mission"
                body="Make verifiable professional records the default in our sector, so the right people get hired for the right work."
              />
              <AboutCard
                eyebrow="Vision"
                body="A Horn of Africa where every consultant, engineer and firm has a record that earns trust at first glance."
                accent
              />
              <AboutCard
                eyebrow="Privacy"
                body="Sensitive fields are private by default. Referee contacts never leave admin review. Evidence is admin-only."
              />
              <AboutCard
                eyebrow="No scraping"
                body="We never scrape, copy or repost third-party content. Our feed uses only legitimate, attributed syndication."
              />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// ── chrome ──────────────────────────────────────────────────────────

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-paper/85 border-b border-border">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-5 sm:px-10 h-[60px] gap-4">
        <Link href="/" aria-label="Sahan home"><SahanMark /></Link>
        {/* Marketing nav stays inline at lg+ only — at md (tablet portrait)
            the 5-item link row + CTAs would overflow the content area. */}
        <nav className="hidden lg:flex items-center gap-6 text-[13px] text-ink-soft">
          <Link href="/signup?type=individual" className="hover:text-ink">For individuals</Link>
          <Link href="/signup?type=company" className="hover:text-ink">For organisations</Link>
          <Link href="#verification" className="hover:text-ink">Verification</Link>
          <Link href="#templates" className="hover:text-ink">Templates</Link>
          <Link href="#about" className="hover:text-ink">About</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="#signin" className="text-[13px] text-ink-soft hover:text-ink hidden sm:inline-flex">Sign in</Link>
          <Link href="/signup">
            <Button kind="sienna" size="sm" className="rounded-full px-4">Join now</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-paper border-t border-border">
      <div className="mx-auto max-w-6xl px-5 sm:px-10 py-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-[12.5px] text-muted">
        <div className="flex items-center gap-3">
          <SahanMark size={16} />
          <span>&copy; {new Date().getFullYear()} Sahan &middot; Mogadishu &middot; Nairobi</span>
        </div>
        <ul className="sm:ml-auto flex flex-wrap gap-x-6 gap-y-1">
          <li><Link href="#about" className="hover:text-ink">About</Link></li>
          <li><Link href="#verification" className="hover:text-ink">Verification policy</Link></li>
          <li><Link href="#privacy" className="hover:text-ink">Privacy</Link></li>
          <li><Link href="#terms" className="hover:text-ink">Terms</Link></li>
          <li><Link href="#contact" className="hover:text-ink">Contact</Link></li>
        </ul>
      </div>
    </footer>
  );
}

// ── composables ─────────────────────────────────────────────────────

function Pillar({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <article className="card border border-border bg-paper">
      <div className="w-9 h-9 rounded-md bg-sienna-soft text-sienna flex items-center justify-center">{icon}</div>
      <h3 className="font-serif text-[19px] tracking-tightish mt-4">{title}</h3>
      <p className="mt-2 text-[13.5px] text-ink-soft leading-relaxed">{body}</p>
    </article>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="bg-paper p-5">
      <span className="text-[11.5px] text-muted font-medium tracking-wide">{n}</span>
      <h3 className="font-serif text-[16.5px] tracking-tightish mt-1">{title}</h3>
      <p className="mt-2 text-[12.5px] text-ink-soft leading-relaxed">{body}</p>
    </div>
  );
}

function AvatarStack() {
  const colors = ["#0a5cad", "#067a5e", "#a04020", "#5e3c8a", "#073563"];
  return (
    <div className="flex -space-x-2">
      {colors.map((c, i) => (
        <span
          key={i}
          className="inline-block w-7 h-7 rounded-full border-2 border-paper"
          style={{ background: c }}
          aria-hidden
        />
      ))}
    </div>
  );
}

function AboutCard({ eyebrow, body, accent }: { eyebrow: string; body: string; accent?: boolean }) {
  return (
    <article className={`rounded-[10px] p-5 ${accent ? "bg-ink text-paper" : "bg-paper border border-border"}`}>
      <p className={`section-eyebrow ${accent ? "text-sienna-soft" : ""}`}>{eyebrow}</p>
      <p className={`mt-2 text-[13.5px] leading-relaxed ${accent ? "text-paper/80" : "text-ink-soft"}`}>{body}</p>
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

function TemplateCard({
  name, kind, tagline, pairing, ready, mini,
}: { name: string; kind: "CV" | "Company"; tagline: string; pairing: string; ready?: boolean; mini?: React.ReactNode }) {
  return (
    <article className="rounded-[12px] border border-border bg-cream/50 overflow-hidden flex flex-col">
      <div className="h-44 flex items-center justify-center bg-[#f6f2ea]">
        {mini ?? <span className="text-muted text-[12px]">Preview soon</span>}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-serif text-[18px] tracking-tightish">{name}</h3>
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted">{kind}</span>
        </div>
        <p className="text-[12.5px] text-ink-soft mt-1">{tagline}</p>
        <p className="text-[11px] text-muted mt-1.5">{pairing}</p>
        <div className="mt-auto pt-3">
          {ready ? (
            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-verified font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-verified" />
              Available now
            </span>
          ) : (
            <span className="text-[11.5px] text-muted">Coming next</span>
          )}
        </div>
      </div>
    </article>
  );
}

// Mini previews — small placeholder mockups for each template card.
function EditorialMini() {
  return (
    <div className="w-28 h-40 bg-[#f6f2ea] shadow-md p-2.5 text-[#1a1a17]" style={{ fontFamily: "Source Serif 4, Georgia, serif" }}>
      <div className="text-[4px] uppercase tracking-[0.18em] text-[#6e7480]">Curriculum vitae</div>
      <div className="mt-2 leading-[0.95]" style={{ fontSize: 13, fontWeight: 350, letterSpacing: "-0.035em" }}>
        Ifrah<br /><em className="text-[#0d3b66] font-light">Abdi.</em>
      </div>
      <div className="text-[4.5px] italic text-[#3a3a3d] mt-0.5">Senior Health Coordinator</div>
      <div className="h-px bg-[#dcd6c8] my-1.5" />
      <div className="text-[4px] leading-[1.4] text-[#3a3a3d] line-clamp-5">
        <span className="float-left text-[#0d3b66] italic font-light" style={{ fontSize: 12, lineHeight: 0.85, marginRight: 1 }}>P</span>
        ublic health practitioner with eleven years coordinating maternal, newborn and child health.
      </div>
    </div>
  );
}
function SidebarMini() {
  return (
    <div className="w-28 h-40 shadow-md flex" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="w-10 bg-[#0f3a3a] text-white p-2 text-[4px] leading-[1.3]">
        <div className="font-bold tracking-tight" style={{ fontSize: 7 }}>Ifrah<br />Abdi</div>
        <div className="mt-2 opacity-70 text-[3.5px]">Health</div>
        <div className="mt-1 opacity-70 text-[3.5px]">Mogadishu</div>
        <div className="mt-3 text-[3.5px] uppercase tracking-wider opacity-60">Skills</div>
        <div className="mt-1 space-y-0.5 text-[3.5px] opacity-80"><div>Cold-chain</div><div>BHA</div><div>DHIS2</div></div>
      </div>
      <div className="flex-1 bg-white p-2 text-[#1a1a17]">
        <div style={{ fontSize: 8, fontWeight: 700 }}>Senior Health Coordinator</div>
        <div className="text-[4px] text-[#6e7480] mt-0.5">UNICEF Somalia · 2021—</div>
        <div className="h-px bg-[#e5e7eb] my-1.5" />
        <div className="text-[4px] leading-[1.4] text-[#3a3a3d] line-clamp-6">
          Lead a team of fourteen across Banadir and Lower Shabelle. Designed the cold-chain expansion.
        </div>
      </div>
    </div>
  );
}
function MonoMini() {
  return (
    <div className="w-28 h-40 bg-white shadow-md p-2.5 text-[#111]" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="flex items-baseline justify-between text-[3.5px] uppercase tracking-[0.2em] text-[#6e7480]">
        <span>CV</span><span>—</span>
      </div>
      <div className="mt-3 leading-tight" style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em" }}>
        Ifrah Abdi<span className="text-[#d97706]">.</span>
      </div>
      <div className="text-[4px] text-[#6e7480] mt-0.5">Senior Health Coordinator</div>
      <div className="h-px bg-black my-1.5" />
      <div className="grid grid-cols-[12px_1fr] gap-x-1.5 gap-y-0.5 text-[3.5px]">
        <span className="text-[#d97706]">21—</span><span>UNICEF Somalia</span>
        <span className="text-[#d97706]">17—</span><span>Save the Children</span>
        <span className="text-[#d97706]">14—</span><span>SRCS</span>
      </div>
    </div>
  );
}
function CompanyMini() {
  return (
    <div className="w-28 h-40 shadow-md text-[#e8edf3] p-2 relative overflow-hidden" style={{ background: "linear-gradient(165deg, #0a1a2e 0%, #0e2a4a 55%, #0c1f38 100%)", fontFamily: "system-ui, sans-serif" }}>
      <div className="text-[3.5px] uppercase tracking-[0.2em] opacity-70">Company profile</div>
      <div className="mt-6 leading-[0.92]" style={{ fontSize: 13, fontWeight: 300, letterSpacing: "-0.04em", fontFamily: "Source Serif 4, Georgia, serif" }}>
        Wadani<br />Engineering<br /><em className="opacity-70">Group.</em>
      </div>
      <div className="absolute bottom-2 left-2 right-2 pt-1.5 border-t border-white/20 text-[3.5px] uppercase tracking-wider opacity-70">
        Civil infrastructure
      </div>
    </div>
  );
}

// ── icons ───────────────────────────────────────────────────────────

function TrustIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01" />
    </svg>
  );
}
