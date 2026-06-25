-- Per-project photo galleries (max 4 enforced in app code). Images live in the
-- public profile-media bucket; this table stores the URL + an optional caption
-- and ordering. Grouped per project on the public profile gallery. Idempotent.

create table if not exists public.company_project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.company_projects(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  url text not null,
  caption text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists company_project_media_project_idx on public.company_project_media(project_id);
create index if not exists company_project_media_profile_idx on public.company_project_media(profile_id);

alter table public.company_project_media enable row level security;
select public._owner_only_policies('public.company_project_media');

drop policy if exists company_project_media_owner_update on public.company_project_media;
create policy company_project_media_owner_update on public.company_project_media
  for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
