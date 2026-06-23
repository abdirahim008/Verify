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
import { ProfileWorkspace, type WorkspaceSection } from "@/components/profile/ProfileWorkspace";
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

  const langCount = data.basics?.languages?.length ?? 0;
  const sections: WorkspaceSection[] = [
    {
      id: "basics", label: "Basics", done: Boolean(data.basics?.full_name),
      node: <BasicsCard initial={{
        full_name: data.basics?.full_name ?? "",
        headline: data.basics?.headline ?? "",
        summary: data.basics?.summary ?? "",
        location: data.basics?.location ?? "",
        phone: data.basics?.phone ?? "",
        email: data.basics?.email ?? "",
        photo_url: data.basics?.photo_url ?? "",
        hasRow: Boolean(data.basics),
      }} />,
    },
    {
      id: "experience", label: "Experience", count: data.experiences.length, done: data.experiences.length >= 1,
      node: <ExperienceCard items={data.experiences} pendingIds={pendingExp} />,
    },
    {
      id: "education", label: "Education", count: data.educations.length, done: data.educations.length >= 1,
      node: <EducationCard items={data.educations} pendingIds={pendingEdu} />,
    },
    {
      id: "skills", label: "Skills", count: data.skills.length, done: data.skills.length >= 3,
      node: <SkillsCard items={data.skills} />,
    },
    {
      id: "languages", label: "Languages", count: langCount, done: langCount >= 1,
      node: <LanguagesCard initial={data.basics?.languages ?? []} />,
    },
    {
      id: "certifications", label: "Certifications", count: data.certifications.length, done: data.certifications.length >= 1,
      node: <CertificationsCard items={data.certifications} pendingIds={pendingCert} />,
    },
    {
      id: "referees", label: "Referees", count: data.referees.length, done: data.referees.length >= 1,
      node: <RefereesCard
        items={data.referees}
        experiences={data.experiences.map((e) => ({ id: e.id, title: e.title, organization: e.organization }))}
      />,
    },
  ];

  return (
    <ProfileWorkspace
      eyebrow="Your profile"
      title="Profile builder"
      publicHref={`/u/${userId}`}
      sections={sections}
      minCore={{
        passed: minCore,
        label: "You've passed the minimum — your CV is ready to download.",
        hint: "Add basics, one experience, one education, and one skill to unlock your first CV.",
      }}
      rail={<CompletenessRail percent={percent} todos={todos} hasMinimumCore={minCore} verifiedCount={verifiedCount} />}
    />
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

  const sectorCount = (data.basics?.sectors?.length ?? 0) + (data.basics?.core_services?.length ?? 0);
  const sections: WorkspaceSection[] = [
    {
      id: "basics", label: "Basics", done: Boolean(data.basics?.company_name),
      node: <CompanyBasicsCard initial={{
        company_name: data.basics?.company_name ?? "",
        logo_url: data.basics?.logo_url ?? "",
        tagline: data.basics?.tagline ?? "",
        cover_statement: data.basics?.cover_statement ?? "",
        locations: data.basics?.locations ?? [],
        country: data.basics?.country ?? "",
        registration_number: data.basics?.registration_number ?? "",
        registration_country: data.basics?.registration_country ?? "",
        founded_year: data.basics?.founded_year != null ? String(data.basics.founded_year) : "",
        staff_count: data.basics?.staff_count != null ? String(data.basics.staff_count) : "",
        countries_count: data.basics?.countries_count != null ? String(data.basics.countries_count) : "",
        projects_count: data.basics?.projects_count != null ? String(data.basics.projects_count) : "",
        website: data.basics?.website ?? "",
        email: data.basics?.email ?? "",
        phone: data.basics?.phone ?? "",
        hasRow: Boolean(data.basics),
      }} />,
    },
    {
      id: "about", label: "About & vision", done: (data.basics?.about?.length ?? 0) > 0,
      node: <CompanyAboutCard initial={{
        about: data.basics?.about ?? "",
        mission: data.basics?.mission ?? "",
        vision: data.basics?.vision ?? "",
      }} />,
    },
    {
      id: "offerings", label: "Sectors & services", count: sectorCount,
      done: (data.basics?.sectors?.length ?? 0) >= 1 && (data.basics?.core_services?.length ?? 0) >= 1,
      node: <CompanyOfferingsCard initial={{
        sectors: data.basics?.sectors ?? [],
        core_services: data.basics?.core_services ?? [],
      }} />,
    },
    {
      id: "projects", label: "Selected projects", count: data.projects.length, done: data.projects.length >= 1,
      node: <CompanyProjectsCard items={data.projects} pendingIds={pendingProj} />,
    },
    {
      id: "clients", label: "Clients", count: data.clients.length, done: data.clients.length >= 1,
      node: <CompanyClientsCard items={data.clients} />,
    },
    {
      id: "team", label: "Key personnel", count: data.team.length, done: data.team.length >= 1,
      node: <CompanyTeamCard items={data.team} />,
    },
    {
      id: "certifications", label: "Certifications", count: data.certifications.length, done: data.certifications.length >= 1,
      node: <CompanyCertificationsCard items={data.certifications} pendingIds={pendingCert} />,
    },
  ];

  return (
    <ProfileWorkspace
      eyebrow="Your company"
      title="Company profile"
      publicHref={`/u/${userId}`}
      sections={sections}
      minCore={{
        passed: minCore,
        label: "You've passed the minimum — your company profile is ready to download.",
        hint: "Add basics, an about paragraph, and one project to unlock the download.",
      }}
      rail={<CompanyCompletenessRail percent={percent} todos={todos} hasMinimumCore={minCore} verifiedCount={verifiedCount} />}
    />
  );
}
