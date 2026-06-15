import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadIndividualProfile, hasMinimumCore } from "@/lib/profile-data";
import { loadCompanyProfile, hasCompanyMinimumCore } from "@/lib/company-data";
import { Button } from "@/components/Button";
import { TemplateActions } from "@/components/templates/TemplateActions";
import { EditorialThumb, SidebarThumb, MonoThumb } from "@/components/templates/CvThumbnails";
import { WadaniThumb, AnnualThumb, MinimalThumb } from "@/components/templates/CompanyThumbnails";
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
        <TemplateCard name="Wadani" kind="Company" tagline="Dark teal gradient cover. Topographic ornament." pairing="Source Serif 4 · Public Sans" status={minCore ? "ready" : "locked"} href="/api/company/wadani" preview={<WadaniThumb />} themes={COMPANY_THEMES.wadani} storageKey="company:wadani" />
        <TemplateCard name="Annual" kind="Company" tagline="Annual-report register. Navy band, stat tiles." pairing="Source Serif 4 · Public Sans" status={minCore ? "ready" : "locked"} href="/api/company/annual" preview={<AnnualThumb />} themes={COMPANY_THEMES.annual} storageKey="company:annual" />
        <TemplateCard name="Minimal" kind="Company" tagline="Massive type, hairlines, one accent." pairing="Source Serif 4 · Public Sans" status={minCore ? "ready" : "locked"} href="/api/company/minimal" preview={<MinimalThumb />} themes={COMPANY_THEMES.minimal} storageKey="company:minimal" />
      </div>

      {!minCore && <LockedBanner href="/profile" company />}
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
