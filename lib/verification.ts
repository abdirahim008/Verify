// Shared constants for the verification flow. Pricing is hard-coded for
// the MVP (§2: "Payment can be a STUB in v1"). When we wire a real payment
// processor this becomes a table or env-derived config.

export type TargetType = "experience" | "education" | "project" | "certification";

export const TARGET_LABELS: Record<TargetType, string> = {
  experience: "Experience",
  education: "Education",
  project: "Project",
  certification: "Certification",
};

export const PRICING_BY_TARGET: Record<TargetType, { amount: number; currency: string; note: string }> = {
  experience:    { amount: 25, currency: "USD", note: "Sahan will contact the named employer." },
  education:     { amount: 25, currency: "USD", note: "Sahan will contact the named institution." },
  project:       { amount: 49, currency: "USD", note: "Sahan will contact the named client/donor." },
  certification: { amount: 19, currency: "USD", note: "Sahan will contact the issuing body." },
};

export const EVIDENCE_BUCKET = "verification-evidence";

// Resolve which DB table holds the verifiable row, given a target_type AND
// the requester's account_type. Certifications live in two tables.
export function resolveTargetTable(
  targetType: TargetType,
  accountType: "individual" | "company" | null,
): "experiences" | "educations" | "company_projects" | "certifications" | "company_certifications" {
  switch (targetType) {
    case "experience":    return "experiences";
    case "education":     return "educations";
    case "project":       return "company_projects";
    case "certification": return accountType === "company" ? "company_certifications" : "certifications";
  }
}
