-- 0010: Featured-on-landing flag. Admin-curated (flipped from /admin/metrics)
-- and consent-based: the admin asks the member first, then features them.
-- Featured members appear on the LOGGED-OUT landing page, so this is stricter
-- than the members-only showcase — nobody is featured by default.

alter table public.profiles
  add column if not exists featured boolean not null default false;
