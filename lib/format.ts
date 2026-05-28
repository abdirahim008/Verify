// Display formatting helpers — kept in one place so they stay consistent
// across the profile UI and the PDF templates.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonth(dateLike: string | null | undefined): string {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function dateRange(start: string | null | undefined, end: string | null | undefined): string {
  const s = formatMonth(start);
  const e = end ? formatMonth(end) : "Present";
  if (!s && !e) return "";
  if (!s) return e;
  return `${s} – ${e}`;
}

// YYYY-MM-DD → YYYY-MM for <input type="month"> round-trip.
export function dateToMonthInput(dateLike: string | null | undefined): string {
  if (!dateLike) return "";
  return dateLike.slice(0, 7);
}

export const QUALIFICATION_LABELS = {
  high_school: "High school",
  diploma: "Diploma",
  certificate: "Certificate",
  degree: "Bachelor's degree",
  masters: "Master's degree",
  phd: "PhD",
} as const;
export type QualLevel = keyof typeof QUALIFICATION_LABELS;

export function yearRange(start: number | null | undefined, end: number | null | undefined): string {
  if (!start && !end) return "";
  if (start && end) return `${start} – ${end}`;
  return `${start ?? end}`;
}
