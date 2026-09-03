// Month/year option lists for the profile date pickers. Kept here so the
// experience, education and certification forms all offer the same ranges.

export const MONTH_OPTIONS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
] as const;

/** Years newest-first — the common case (a recent role) is at the top. */
export function yearOptions(earliest: number, latest: number): number[] {
  return Array.from({ length: latest - earliest + 1 }, (_, i) => latest - i);
}

const NOW = new Date().getFullYear();

// Work history reaches further back than study dates need to; education
// allows a few years forward for an expected graduation date.
export const EXPERIENCE_YEARS = yearOptions(1960, NOW + 1);
export const EDUCATION_YEARS = yearOptions(1950, NOW + 8);
export const CERTIFICATION_YEARS = yearOptions(1950, NOW + 1);

/** "YYYY-MM" → ["YYYY", "MM"]. Anything else → ["", ""]. */
export function splitMonthValue(value: string | undefined | null): [string, string] {
  if (!value) return ["", ""];
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (m) return [m[1], m[2]];
  // Half-filled sentinel written by MonthYearSelect ("2019-" / "-03").
  const [y = "", mo = ""] = value.split("-");
  return [y, mo];
}

/**
 * Recombine the two selects. When only one half is chosen we deliberately emit
 * a half-filled string rather than "" so zod flags it — silently dropping a
 * year the user just picked is worse than an inline error.
 */
export function joinMonthValue(year: string, month: string): string {
  if (!year && !month) return "";
  return `${year}-${month}`;
}
