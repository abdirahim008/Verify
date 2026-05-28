import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadIndividualProfile, hasMinimumCore, profileCompleteness } from "@/lib/profile-data";
import { loadCompanyProfile, hasCompanyMinimumCore, companyCompleteness } from "@/lib/company-data";
import { loadPendingTargetIds } from "@/lib/verification-data";
// Individual sections
import { BasicsCard } from "@/components/profile/sections/BasicsCard";
import { ExperienceCard } from "@/components/profile/sections/ExperienceCard";
import { EducationCard } from "@/components/profile/sections/EducationCard";
import { SkillsCard } from "@/components/profile/sections/SkillsCard";
import { CertificationsCard } from "@/components/profile/sections/CertificationsCard";
import { LanguagesCard } from "@/components/profile/sections/LanguagesCard";
import { RefereesCard } from "@/components/profile/sections/RefereesCard";
import { CompletenessRail } from "@/components/profile/CompletenessRail";
// Company sections
import { CompanyBasicsCard } from "@/components/profile/company/CompanyBasicsCard";
import { CompanyAboutCard } from "@/components/profile/company/CompanyAboutCard";
import { CompanyOfferingsCard } from "@/components/profile/company/CompanyOfferingsCard";
import { CompanyProjectsCard } from "@/components/profile/company/CompanyProjectsCard";
import { CompanyClientsCard } from "@/components/profile/company/CompanyClientsCard";
import { CompanyTeamCard } from "@/components/profile/company/CompanyTeamCard";
import { CompanyCertificationsCard } from "@/components/profile/company/CompanyCertificationsCard";
import { CompanyCompletenessRail } from "@/components/profile/CompanyCompletenessRail";

export const metadata = { title: "My profile" };

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.account_type === "company") {
    return <CompanyBuilder userId={user.id} />;
  }
  return <IndividualBuilder userId={user.id} />;
}

async function IndividualBuilder({ userId }: { userId: string }) {
  const [data, pendingSet] = await Promise.all([
    loadIndividualProfile(userId),
    loadPendingTargetIds(userId),
  ]);
  const percent = profileCompleteness(data);
  const minCore = hasMinimumCore(data);
  const verifiedCount =
    data.experiences.filter((x) => x.verified).length +
    data.educations.filter((x) => x.verified).length +
    data.certifications.filter((x) => x.verified).length;

  // Per-section sets of ids that have a pending verification request.
  const pendingByType = (prefix: string) =>
    new Set(Array.from(pendingSet).filter((s) => s.startsWith(prefix + ":")).map((s) => s.slice(prefix.length + 1)));
  const pendingExp = pendingByType("experience");
  const pendingEdu = pendingByType("education");
  const pendingCert = pendingByType("certification");

  const todos = [
    { label: "Add basics", done: Boolean(data.basics?.full_name) },
    { label: "Add 1 experience", done: data.experiences.length >= 1 },
    { label: "Add 1 education", done: data.educations.length >= 1 },
    { label: "Add at least 3 skills", done: data.skills.length >= 3 },
    { label: "Add a language", done: (data.basics?.languages?.length ?? 0) >= 1 },
    { label: "Add a referee", done: data.referees.length >= 1 },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <main className="space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="section-eyebrow text-sienna">Your profile</p>
            <h1 className="font-serif text-[32px] sm:text-[40px] tracking-[-0.02em] mt-2">Profile builder</h1>
            <p className="mt-2 text-[14.5px] text-ink-soft max-w-2xl leading-relaxed">
              Fill in the basics and add at least one experience, education, and skill — that&apos;s the minimum to download your first CV. You can always come back and enrich the rest.
            </p>
          </div>
          <a href={`/u/${userId}`} target="_blank" rel="noopener noreferrer" className="text-[12.5px] text-sienna font-medium hover:underline whitespace-nowrap">
            View public profile ↗
          </a>
        </header>

        <BasicsCard initial={{
          full_name: data.basics?.full_name ?? "",
          headline: data.basics?.headline ?? "",
          summary: data.basics?.summary ?? "",
          location: data.basics?.location ?? "",
          phone: data.basics?.phone ?? "",
          email: data.basics?.email ?? "",
          photo_url: data.basics?.photo_url ?? "",
          hasRow: Boolean(data.basics),
        }} />
        <ExperienceCard items={data.experiences} pendingIds={pendingExp} />
        <EducationCard items={data.educations} pendingIds={pendingEdu} />
        <SkillsCard items={data.skills} />
        <LanguagesCard initial={data.basics?.languages ?? []} />
        <CertificationsCard items={data.certifications} pendingIds={pendingCert} />
        <RefereesCard
          items={data.referees}
          experiences={data.experiences.map((e) => ({ id: e.id, title: e.title, organization: e.organization }))}
        />
      </main>

      <CompletenessRail percent={percent} todos={todos} hasMinimumCore={minCore} verifiedCount={verifiedCount} />
    </div>
  );
}

async function CompanyBuilder({ userId }: { userId: string }) {
  const [data, pendingSet] = await Promise.all([
    loadCompanyProfile(userId),
    loadPendingTargetIds(userId),
  ]);
  const percent = companyCompleteness(data);
  const minCore = hasCompanyMinimumCore(data);
  const verifiedCount =
    data.projects.filter((x) => x.verified).length +
    data.certifications.filter((x) => x.verified).length;

  const pendingByType = (prefix: string) =>
    new Set(Array.from(pendingSet).filter((s) => s.startsWith(prefix + ":")).map((s) => s.slice(prefix.length + 1)));
  const pendingProj = pendingByType("project");
  const pendingCert = pendingByType("certification");

  const todos = [
    { label: "Add basics (company name)", done: Boolean(data.basics?.company_name) },
    { label: "Add an about paragraph", done: (data.basics?.about?.length ?? 0) > 0 },
    { label: "Add a mission", done: Boolean(data.basics?.mission) },
    { label: "List your sectors", done: (data.basics?.sectors?.length ?? 0) >= 1 },
    { label: "List core services", done: (data.basics?.core_services?.length ?? 0) >= 1 },
    { label: "Add 1 project", done: data.projects.length >= 1 },
    { label: "Add a team member", done: data.team.length >= 1 },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <main className="space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="section-eyebrow text-sienna">Your company</p>
            <h1 className="font-serif text-[32px] sm:text-[40px] tracking-[-0.02em] mt-2">Company profile builder</h1>
            <p className="mt-2 text-[14.5px] text-ink-soft max-w-2xl leading-relaxed">
              Build the bid-ready profile once. Add an about, one project, and the cover takes shape — that&apos;s your minimum core. Add team and accreditations to fill it out.
            </p>
          </div>
          <a href={`/u/${userId}`} target="_blank" rel="noopener noreferrer" className="text-[12.5px] text-sienna font-medium hover:underline whitespace-nowrap">
            View public profile ↗
          </a>
        </header>

        <CompanyBasicsCard initial={{
          company_name: data.basics?.company_name ?? "",
          logo_url: data.basics?.logo_url ?? "",
          country: data.basics?.country ?? "",
          registration_number: data.basics?.registration_number ?? "",
          registration_country: data.basics?.registration_country ?? "",
          founded_year: data.basics?.founded_year != null ? String(data.basics.founded_year) : "",
          website: data.basics?.website ?? "",
          email: data.basics?.email ?? "",
          phone: data.basics?.phone ?? "",
          hasRow: Boolean(data.basics),
        }} />
        <CompanyAboutCard initial={{
          about: data.basics?.about ?? "",
          mission: data.basics?.mission ?? "",
          vision: data.basics?.vision ?? "",
        }} />
        <CompanyOfferingsCard initial={{
          sectors: data.basics?.sectors ?? [],
          core_services: data.basics?.core_services ?? [],
        }} />
        <CompanyProjectsCard items={data.projects} pendingIds={pendingProj} />
        <CompanyClientsCard items={data.clients} />
        <CompanyTeamCard items={data.team} />
        <CompanyCertificationsCard items={data.certifications} pendingIds={pendingCert} />
      </main>

      <CompanyCompletenessRail percent={percent} todos={todos} hasMinimumCore={minCore} verifiedCount={verifiedCount} />
    </div>
  );
}
