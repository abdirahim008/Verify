import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadIndividualProfile, hasMinimumCore } from "@/lib/profile-data";
import { loadCompanyProfile, hasCompanyMinimumCore } from "@/lib/company-data";
import { Button } from "@/components/Button";
import { TemplateActions } from "@/components/templates/TemplateActions";
import { EditorialThumb, SidebarThumb, MonoThumb } from "@/components/templates/CvThumbnails";
import { CV_THEMES, COMPANY_THEMES, type PdfTheme } from "@/lib/pdf/themes";

export const metadata = { title: "Templates" };

export default async function TemplatesPage() {
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
  const isCompany = profile?.account_type === "company";

  if (isCompany) {
    const data = await loadCompanyProfile(user.id);
    const minCore = hasCompanyMinimumCore(data);
    return <CompanyTemplates minCore={minCore} />;
  }
  const data = await loadIndividualProfile(user.id);
  const minCore = hasMinimumCore(data);
  return <IndividualTemplates minCore={minCore} />;
}

function IndividualTemplates({ minCore }: { minCore: boolean }) {
  const status = minCore ? "ready" : "locked";
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow text-sienna">Templates</p>
          <h1 className="font-serif text-[32px] sm:text-[44px] tracking-[-0.025em] mt-2 max-w-2xl">
            Three CVs, designed with intent.
          </h1>
          <p className="mt-2 text-[14.5px] text-ink-soft max-w-xl leading-relaxed">
            Each template uses the same structured data — pick a register, switch any time. Verified claims always render with a green check.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <TemplateCard name="Editorial" kind="CV" tagline="Magazine register. Drop cap. Cream paper." pairing="Fraunces · Newsreader" status={status} href="/api/cv/editorial" preview={<EditorialThumb />} themes={CV_THEMES.editorial} storageKey="cv:editorial" />
        <TemplateCard name="Sidebar" kind="CV" tagline="Two columns. Built for executives." pairing="Archivo · IBM Plex Sans" status={status} href="/api/cv/sidebar" preview={<SidebarThumb />} themes={CV_THEMES.sidebar} storageKey="cv:sidebar" />
        <TemplateCard name="Mono" kind="CV" tagline="Minimalist, technical, single accent." pairing="Space Grotesk · IBM Plex Mono" status={status} href="/api/cv/mono" preview={<MonoThumb />} themes={CV_THEMES.mono} storageKey="cv:mono" />
      </div>

      {!minCore && <LockedBanner href="/profile" />}
    </div>
  );
}

function CompanyTemplates({ minCore }: { minCore: boolean }) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-eyebrow text-sienna">Templates</p>
          <h1 className="font-serif text-[32px] sm:text-[44px] tracking-[-0.025em] mt-2 max-w-2xl">
            Three bid-ready company profiles.
          </h1>
          <p className="mt-2 text-[14.5px] text-ink-soft max-w-xl leading-relaxed">
            Same structured data, three registers — cover, about, mission &amp; vision, sectors, services, and selected projects. Verified projects render with a green check on every one.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <TemplateCard name="Wadani" kind="Company" tagline="Dark teal gradient cover. Topographic ornament." pairing="Source Serif 4 · Public Sans" status={minCore ? "ready" : "locked"} href="/api/company/wadani" preview={<WadaniPreview />} themes={COMPANY_THEMES.wadani} storageKey="company:wadani" />
        <TemplateCard name="Annual" kind="Company" tagline="Annual-report register. Navy band, stat tiles." pairing="Source Serif 4 · Public Sans" status={minCore ? "ready" : "locked"} href="/api/company/annual" preview={<AnnualPreview />} themes={COMPANY_THEMES.annual} storageKey="company:annual" />
        <TemplateCard name="Minimal" kind="Company" tagline="Massive type, hairlines, one accent." pairing="Source Serif 4 · Public Sans" status={minCore ? "ready" : "locked"} href="/api/company/minimal" preview={<MinimalPreview />} themes={COMPANY_THEMES.minimal} storageKey="company:minimal" />
      </div>

      {!minCore && <LockedBanner href="/profile" company />}
    </div>
  );
}

// Company template mini-previews — small static mockups mirroring each
// register so the cards read at a glance.
function WadaniPreview() {
  return (
    <div className="w-[120px] h-[170px] shadow text-[#e8edf3] p-2.5 relative overflow-hidden" style={{ background: "linear-gradient(165deg, #0a1a2e 0%, #0e2a4a 55%, #0c1f38 100%)", fontFamily: "system-ui, sans-serif" }}>
      <div className="text-[4px] uppercase tracking-[0.2em] opacity-70">— Company profile</div>
      <div className="mt-7 leading-[0.92]" style={{ fontSize: 14, fontWeight: 300, letterSpacing: "-0.04em", fontFamily: "Source Serif 4, Georgia, serif" }}>
        Wadani<br />Engineering<br /><em className="opacity-70">Group.</em>
      </div>
      <div className="absolute bottom-2 left-2.5 right-2.5 pt-1.5 border-t border-white/20 text-[3.5px] uppercase tracking-wider opacity-70">
        Founded · Registration · HQ · Web
      </div>
    </div>
  );
}
function AnnualPreview() {
  return (
    <div className="w-[120px] h-[170px] shadow bg-[#fafaf7] relative overflow-hidden" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="h-12 relative" style={{ background: "linear-gradient(180deg, #0d3b66, #072044)" }}>
        <div className="absolute bottom-1 left-2 text-white leading-[1.0]" style={{ fontSize: 9, fontWeight: 350, fontFamily: "Source Serif 4, Georgia, serif" }}>
          Wadani Engineering<br /><em className="text-[#b6c4d6]">Group.</em>
        </div>
      </div>
      <div className="mx-2 -mt-1.5 h-9 rounded-[2px] border border-[#d8dde3] relative" style={{ background: "repeating-linear-gradient(45deg, #d3dae3 0px, #d3dae3 1px, #e3e8ef 1px, #e3e8ef 6px)" }} />
      <div className="px-2 mt-1.5 text-[3.5px] uppercase tracking-[0.2em] text-[#0d3b66] font-bold">Established Mogadishu, 2012</div>
      <div className="px-2 mt-0.5 text-[5px] italic text-[#072044] leading-snug" style={{ fontFamily: "Source Serif 4, Georgia, serif" }}>
        Civil infrastructure for the Horn of Africa.
      </div>
      <div className="absolute bottom-2 left-2 right-2 pt-1 border-t border-[#d8dde3] grid grid-cols-4 gap-1">
        {["14", "$22M", "23", "9"].map((n, i) => (
          <div key={i}>
            <div className="text-[7px] text-[#072044]" style={{ fontFamily: "Source Serif 4, Georgia, serif" }}>{n}</div>
            <div className="text-[3px] uppercase tracking-wider text-[#0d3b66] font-bold">Stat</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function MinimalPreview() {
  return (
    <div className="w-[120px] h-[170px] shadow bg-[#fbfbfa] p-2.5 relative overflow-hidden text-[#0e1116]" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="flex justify-between text-[3.5px] uppercase tracking-[0.2em] text-[#6e7480] font-semibold">
        <span>Wadani Engineering</span><span>MMXXVI</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1">
        <em className="text-[6px] text-[#0a5cad]" style={{ fontFamily: "Source Serif 4, Georgia, serif" }}>W.E.G</em>
        <span className="w-2 h-px bg-[#0e1116]" />
        <span className="text-[3.5px] uppercase tracking-wider text-[#6e7480] font-semibold">Est. 2012</span>
      </div>
      <div className="mt-6 leading-[0.88]" style={{ fontSize: 17, fontWeight: 250, letterSpacing: "-0.05em", fontFamily: "Source Serif 4, Georgia, serif" }}>
        Wadani<br />Engineering<br /><em className="text-[#0a5cad]">Group.</em>
      </div>
      <div className="absolute bottom-2 left-2.5 right-2.5 pt-1 border-t-[1.5px] border-[#0e1116] grid grid-cols-3 gap-1">
        {["Founded", "HQ", "Web"].map((k, i) => (
          <div key={i}>
            <div className="text-[3px] uppercase tracking-wider text-[#6e7480] font-bold">{k}</div>
            <div className="text-[4.5px]" style={{ fontFamily: "Source Serif 4, Georgia, serif" }}>—</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LockedBanner({ href, company }: { href: string; company?: boolean }) {
  return (
    <div className="mt-6 card bg-cream/60">
      <p className="text-[13.5px] text-ink-soft">
        Download is locked until you&apos;ve filled in the <strong>minimum core</strong> — {company ? "basics, an about paragraph, and one project" : "basics, one experience, one education, and one skill"}.{" "}
        <Link href={href} className="text-sienna font-medium hover:underline">Go to your profile →</Link>
      </p>
    </div>
  );
}

function TemplateCard({
  name, kind, tagline, pairing, status, href, preview, themes, storageKey,
}: {
  name: string; kind: "CV" | "Company"; tagline: string; pairing: string;
  status: "ready" | "locked" | "coming-soon"; href?: string; preview?: React.ReactNode;
  themes?: PdfTheme[]; storageKey?: string;
}) {
  return (
    <article className="card p-0 overflow-hidden flex flex-col">
      <div className="h-44 sm:h-56 bg-[#ece8df] flex items-center justify-center overflow-hidden border-b border-border">
        {preview ?? <span className="text-muted text-[11.5px] uppercase tracking-[0.14em]">Preview</span>}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-serif text-[22px] tracking-tightish">{name}</h3>
          <span className="text-[11px] uppercase tracking-[0.14em] text-muted">{kind}</span>
        </div>
        <p className="text-[13.5px] text-ink-soft mt-1">{tagline}</p>
        <p className="text-[11.5px] text-muted mt-2">{pairing}</p>

        <div className="mt-auto pt-4">
          {status === "ready" && href && themes && storageKey && (
            <TemplateActions href={href} storageKey={storageKey} templateName={name} themes={themes} />
          )}
          {status === "ready" && href && !(themes && storageKey) && (
            <a href={href} download>
              <Button kind="primary" size="md" className="w-full">Download PDF</Button>
            </a>
          )}
          {status === "locked" && (
            <Button kind="quiet" size="md" className="w-full" disabled>Locked — finish minimum core</Button>
          )}
          {status === "coming-soon" && (
            <Button kind="quiet" size="md" className="w-full" disabled>Coming next</Button>
          )}
        </div>
      </div>
    </article>
  );
}
