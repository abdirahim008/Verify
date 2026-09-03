"use client";

import {
  MONTH_OPTIONS, splitMonthValue, joinMonthValue,
} from "@/lib/dates";

/**
 * Two dropdowns — month and year — instead of a native <input type="month">.
 * Native month inputs render inconsistently across browsers and are awkward on
 * phones, which is most of our users. Value round-trips as "YYYY-MM".
 */
export function MonthYearSelect({
  value, onChange, disabled, years, label,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  years: readonly number[];
  /** Used for the screen-reader names on each half, e.g. "Start". */
  label: string;
}) {
  const [year, month] = splitMonthValue(value);

  return (
    <div className="grid grid-cols-2 gap-2">
      <select
        className="field"
        aria-label={`${label} month`}
        disabled={disabled}
        value={month}
        onChange={(e) => onChange(joinMonthValue(year, e.target.value))}
      >
        <option value="">Month</option>
        {MONTH_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>
      <select
        className="field"
        aria-label={`${label} year`}
        disabled={disabled}
        value={year}
        onChange={(e) => onChange(joinMonthValue(e.target.value, month))}
      >
        <option value="">Year</option>
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}

/** Single year dropdown for sections that only record a year. */
export function YearSelect({
  years, placeholder = "Year", ...select
}: {
  years: readonly number[];
  placeholder?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className="field" {...select}>
      <option value="">{placeholder}</option>
      {years.map((y) => <option key={y} value={y}>{y}</option>)}
    </select>
  );
}
