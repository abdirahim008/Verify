-- 0011: Add 'postgraduate_diploma' to the qualification level enum.
-- A PGDip is a common qualification in the region (and in UK-modelled systems
-- generally) that previously had to be filed under the generic "Diploma".
-- Placed after 'degree' so the enum's own sort order reads by level too.
alter type public.qualification_level
  add value if not exists 'postgraduate_diploma' after 'degree';
