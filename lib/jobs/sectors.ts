// SomKenJobs sector taxonomy. `value` is the exact category string the RSS
// feed (somkenjobs.com/feed) emits per job; `label` is a tidied display
// name. Users pick from this list as their career interests, and we match
// their picks against each job's <category> tags + parsed "Sector:" line.
//
// Pure module — imported by both the server feed matcher and the client
// profile editor. Keep it dependency-free.

export interface JobSector { value: string; label: string }

export const JOB_SECTORS: JobSector[] = [
  { value: "Health/wash", label: "Health & WASH" },
  { value: "Project Management", label: "Project Management" },
  { value: "Programme Affairs", label: "Programme Affairs" },
  { value: "Planning and Coordination", label: "Planning & Coordination" },
  { value: "Operation Affairs", label: "Operations" },
  { value: "Supply Chain and Logistics", label: "Supply Chain & Logistics" },
  { value: "Finance and Accounting", label: "Finance & Accounting" },
  { value: "Management/leadership", label: "Management & Leadership" },
  { value: "Protection Affairs", label: "Protection" },
  { value: "Assessment/evaluation/audit", label: "Assessment, Evaluation & Audit" },
  { value: "Ict/technology/computers", label: "ICT & Technology" },
  { value: "Trainer/teacher/lecturer", label: "Training & Education" },
  { value: "Policy Affairs", label: "Policy" },
  { value: "Risk Management", label: "Risk Management" },
  { value: "Security", label: "Security" },
  { value: "Agriculture", label: "Agriculture" },
  { value: "Investment", label: "Investment" },
  { value: "Business", label: "Business" },
  { value: "Consultancies", label: "Consultancies" },
];

const BY_VALUE = new Map(JOB_SECTORS.map((s) => [norm(s.value), s]));

export function norm(s: string): string {
  return s.trim().toLowerCase();
}

// Keep only recognised sector values (used to sanitise what we persist).
export function sanitizeCategories(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const hit = BY_VALUE.get(norm(raw));
    if (hit && !out.includes(hit.value)) out.push(hit.value);
  }
  return out;
}

export function labelFor(value: string): string {
  return BY_VALUE.get(norm(value))?.label ?? value;
}
