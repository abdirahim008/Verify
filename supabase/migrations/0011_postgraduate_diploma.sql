-- 0011: Add 'postgraduate_diploma' to the qualification level enum.
-- A PGDip is a common qualification in the region (and in UK-modelled systems
-- generally) that previously had to be filed under the generic "Diploma".
--
-- Postgres only appends enum values, so ordering here is by value position;
-- the UI orders the dropdown from QUALIFICATION_LABELS in lib/format.ts.
alter type public.qualification_level add value if not exists 'postgraduate_diploma';
