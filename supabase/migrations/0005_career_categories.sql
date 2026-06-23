-- Career interest categories for individuals. Drives the personalised
-- "Roles matched to your profile" jobs feed on /home (matched against the
-- sector tags from the SomKenJobs RSS feed). Stored on profiles because it
-- is a preference, not CV content, and is read on every home render.
-- Idempotent — safe to re-run.

alter table public.profiles
  add column if not exists career_categories text[] not null default '{}';

comment on column public.profiles.career_categories is
  'SomKenJobs sector tags the user follows; used to personalise the home jobs feed.';
