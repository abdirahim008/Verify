-- Company profile sections for the multi-page company profile templates.
-- Adds: cover positioning + office locations + at-a-glance stats + a CEO
-- message + a board label on company_details; a category on clients; unit
-- tags on team (for the organogram); and two new owned tables — company
-- values and detailed services. Idempotent (safe to re-run).

-- ── company_details: positioning, locations, stats, CEO message, org top ──
alter table public.company_details add column if not exists tagline text;
alter table public.company_details add column if not exists cover_statement text;
alter table public.company_details add column if not exists locations text[] not null default '{}';
alter table public.company_details add column if not exists staff_count int;
alter table public.company_details add column if not exists countries_count int;
alter table public.company_details add column if not exists projects_count int;
alter table public.company_details add column if not exists ceo_name text;
alter table public.company_details add column if not exists ceo_title text;
alter table public.company_details add column if not exists ceo_photo_url text;
alter table public.company_details add column if not exists ceo_quote text;
alter table public.company_details add column if not exists ceo_message text;
alter table public.company_details add column if not exists board_name text;

-- ── company_clients: grouping (e.g. donor / government / private) ──────────
alter table public.company_clients add column if not exists category text;

-- ── company_team: department/unit tags shown under each leader in the org ──
alter table public.company_team add column if not exists units text[] not null default '{}';

-- ── company_values ────────────────────────────────────────────────────────
create table if not exists public.company_values (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists company_values_profile_idx on public.company_values(profile_id);

-- ── company_services (name + description; supersedes core_services text[]) ─
create table if not exists public.company_services (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists company_services_profile_idx on public.company_services(profile_id);

-- One-time backfill: seed company_services from any existing core_services[]
-- names (description left blank) for companies that have none yet.
insert into public.company_services (profile_id, name, order_index)
select cd.profile_id, s.name, (s.ord - 1)::int
from public.company_details cd
cross join lateral unnest(cd.core_services) with ordinality as s(name, ord)
where coalesce(array_length(cd.core_services, 1), 0) > 0
  and not exists (
    select 1 from public.company_services cs where cs.profile_id = cd.profile_id
  );

-- ── RLS ───────────────────────────────────────────────────────────────────
alter table public.company_values   enable row level security;
alter table public.company_services enable row level security;

select public._owner_only_policies('public.company_values');
select public._owner_only_policies('public.company_services');

drop policy if exists company_values_owner_update on public.company_values;
create policy company_values_owner_update on public.company_values
  for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists company_services_owner_update on public.company_services;
create policy company_services_owner_update on public.company_services
  for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
