import "server-only";
import { loadIndividualProfile, hasMinimumCore, profileCompleteness } from "@/lib/profile-data";
import { loadCompanyProfile, hasCompanyMinimumCore, companyCompleteness } from "@/lib/company-data";

// One view of "how far along is this member", shared by the Home progress
// card, the builder's starter banner and the onboarding emails, so all three
// always name the same next step.

export interface OnboardingStep {
  /** Builder section id — the anchor is `#sec-${id}` on /profile. */
  id: string;
  label: string;
  done: boolean;
  /** Part of the minimum core that unlocks the download. */
  required: boolean;
}

export interface OnboardingProgress {
  kind: "individual" | "company";
  percent: number;
  /** The download is unlocked. */
  minCore: boolean;
  /** Has added anything beyond the signup name. */
  started: boolean;
  steps: OnboardingStep[];
  /** First unfinished step, required ones first; null when all are done. */
  next: OnboardingStep | null;
  /** "CV" or "company profile", for copy. */
  noun: string;
}

type IndividualData = Awaited<ReturnType<typeof loadIndividualProfile>>;
type CompanyData = Awaited<ReturnType<typeof loadCompanyProfile>>;

export function individualProgress(d: IndividualData): OnboardingProgress {
  const steps: OnboardingStep[] = [
    { id: "basics", label: "Add your name and headline", done: Boolean(d.basics?.full_name), required: true },
    { id: "experience", label: "Add your current or latest job", done: d.experiences.length >= 1, required: true },
    { id: "education", label: "Add your education", done: d.educations.length >= 1, required: true },
    { id: "skills", label: "Add your skills", done: d.skills.length >= 1, required: true },
    { id: "languages", label: "Add the languages you speak", done: (d.basics?.languages?.length ?? 0) >= 1, required: false },
    { id: "referees", label: "Add a referee", done: d.referees.length >= 1, required: false },
    { id: "certifications", label: "Add a certification", done: d.certifications.length >= 1, required: false },
  ];
  return finish("individual", "CV", profileCompleteness(d), hasMinimumCore(d),
    d.experiences.length + d.educations.length + d.skills.length > 0, steps);
}

export function companyProgress(d: CompanyData): OnboardingProgress {
  const b = d.basics;
  const steps: OnboardingStep[] = [
    { id: "basics", label: "Add your company name", done: Boolean(b?.company_name), required: true },
    { id: "about", label: "Write a short about paragraph", done: (b?.about?.length ?? 0) > 0, required: true },
    { id: "projects", label: "Add one project you delivered", done: d.projects.length >= 1, required: true },
    { id: "services", label: "List your services", done: d.services.length >= 1, required: false },
    { id: "team", label: "Add a key team member", done: d.team.length >= 1, required: false },
    { id: "offerings", label: "Choose your sectors", done: (b?.sectors?.length ?? 0) >= 1, required: false },
  ];
  return finish("company", "company profile", companyCompleteness(d), hasCompanyMinimumCore(d),
    d.projects.length + d.services.length > 0 || (b?.about?.length ?? 0) > 0, steps);
}

function finish(
  kind: OnboardingProgress["kind"], noun: string, percent: number, minCore: boolean,
  started: boolean, steps: OnboardingStep[],
): OnboardingProgress {
  const next = steps.find((s) => s.required && !s.done) ?? steps.find((s) => !s.done) ?? null;
  return { kind, noun, percent, minCore, started, steps, next };
}

type Client = Parameters<typeof loadIndividualProfile>[1];

/** Loads with the caller's session (RLS: the member's own rows) unless a
 *  service client is passed, as the email cron does. */
export async function loadOnboardingProgress(userId: string, accountType: string | null | undefined, client?: Client) {
  return accountType === "company"
    ? companyProgress(await loadCompanyProfile(userId, client))
    : individualProgress(await loadIndividualProfile(userId, client));
}
