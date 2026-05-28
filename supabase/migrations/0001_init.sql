-- Sahan — initial schema.
-- Source of truth: verify/CLAUDE.md §5 (data model) and §10 (privacy).
-- Idempotent where reasonable; safe to re-run during local dev.

-- ─────────────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.account_type as enum ('individual', 'company');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.visibility_level as enum ('public', 'registered_only', 'private');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.qualification_level as enum
    ('high_school', 'diploma', 'degree', 'masters', 'phd', 'certificate');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.verification_target_type as enum
    ('experience', 'education', 'project', 'certification');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.verification_status as enum ('pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('unpaid', 'paid', 'waived');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- Shared: profiles
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  account_type public.account_type not null,
  is_admin boolean not null default false,
  display_name text,
  -- Per-section visibility, keyed by section name (CLAUDE.md §10). Safe
  -- defaults (registered_only / private for sensitive sections) are applied
  -- by the trigger that creates this row.
  section_visibility jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_account_type_idx on public.profiles(account_type);

-- Auto-create a profile row when a new auth user signs up. The signup form
-- stashes account_type + display_name in user_metadata; the trigger reads
-- them so the row is created with the chosen type. This also lets RLS-bound
-- clients sign up without needing an INSERT permission on profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type public.account_type;
  v_name text;
begin
  v_type := coalesce((new.raw_user_meta_data->>'account_type')::public.account_type, 'individual');
  v_name := new.raw_user_meta_data->>'display_name';

  insert into public.profiles (id, account_type, display_name, section_visibility)
  values (
    new.id,
    v_type,
    v_name,
    -- CLAUDE.md §10: defaults must be the safe option. Personal contact info
    -- is registered_only; referees are hard-private (never user-overridable
    -- but we still set it so the UI surfaces it correctly).
    jsonb_build_object(
      'summary', 'public',
      'experiences', 'public',
      'educations', 'public',
      'skills', 'public',
      'certifications', 'public',
      'languages', 'public',
      'projects', 'public',
      'clients', 'private',
      'team', 'public',
      'contact', 'registered_only',
      'location', 'registered_only',
      'referees', 'private'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- Individual side
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.individual_details (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  full_name text,
  headline text,
  summary text,
  location text,
  phone text,
  email text,
  languages text[] not null default '{}',
  photo_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  organization text not null,
  title text not null,
  location text,
  start_date date,
  end_date date,                  -- null = current
  description text,
  -- Verification: set ONLY by admin action (see policies below).
  verified boolean not null default false,
  verified_note text,
  verified_at timestamptz,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists experiences_profile_idx on public.experiences(profile_id);

create table if not exists public.educations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  institution text not null,
  qualification_level public.qualification_level not null,
  field_of_study text,
  start_year int,
  end_year int,
  verified boolean not null default false,
  verified_note text,
  verified_at timestamptz,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists educations_profile_idx on public.educations(profile_id);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists skills_profile_idx on public.skills(profile_id);

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  issuer text,
  year int,
  verified boolean not null default false,
  verified_note text,
  verified_at timestamptz,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists certifications_profile_idx on public.certifications(profile_id);

-- Referees: third parties who didn't sign up. PRIVATE (CLAUDE.md §10).
-- Never readable by anyone except the owner and an admin during verification.
create table if not exists public.referees (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  experience_id uuid references public.experiences(id) on delete set null,
  name text not null,
  position text,
  organization text,
  phone text,
  email text,
  relationship text,
  created_at timestamptz not null default now()
);
create index if not exists referees_profile_idx on public.referees(profile_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Company side
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.company_details (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  company_name text,
  logo_url text,
  about text,
  mission text,
  vision text,
  country text,
  registration_number text,
  registration_country text,
  founded_year int,
  website text,
  email text,
  phone text,
  sectors text[] not null default '{}',
  core_services text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.company_projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  project_name text not null,
  client_name text,
  sector text,
  value_amount numeric,
  currency text,
  year_start int,
  year_end int,
  scope text,
  verified boolean not null default false,
  verified_note text,
  verified_at timestamptz,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists company_projects_profile_idx on public.company_projects(profile_id);

create table if not exists public.company_clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  client_name text not null,
  display_public boolean not null default false,
  note text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists company_clients_profile_idx on public.company_clients(profile_id);

create table if not exists public.company_team (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  person_name text not null,
  role text,
  reports_to uuid references public.company_team(id) on delete set null,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists company_team_profile_idx on public.company_team(profile_id);

create table if not exists public.company_certifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  issuer text,
  year int,
  verified boolean not null default false,
  verified_note text,
  verified_at timestamptz,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists company_certifications_profile_idx on public.company_certifications(profile_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Verification
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete set null,
  target_type public.verification_target_type not null,
  target_id uuid not null,
  status public.verification_status not null default 'pending',
  price_amount numeric,
  price_currency text default 'USD',
  payment_status public.payment_status not null default 'unpaid',
  -- Evidence (uploads): private storage bucket, admin-only.
  evidence_urls text[] not null default '{}',
  admin_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null
);
create index if not exists verification_requests_profile_idx
  on public.verification_requests(profile_id);
create index if not exists verification_requests_status_idx
  on public.verification_requests(status);

-- ─────────────────────────────────────────────────────────────────────────
-- Homepage feed (CLAUDE.md §11). Populated by admin or scheduled fetcher
-- from approved RSS / public APIs. Read-only for users.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.feed_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  snippet text,
  source_name text not null,
  source_url text not null,
  published_at timestamptz,
  tag text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists feed_items_approved_idx on public.feed_items(approved, published_at desc);

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security — enable on every table.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles                enable row level security;
alter table public.individual_details      enable row level security;
alter table public.experiences             enable row level security;
alter table public.educations              enable row level security;
alter table public.skills                  enable row level security;
alter table public.certifications          enable row level security;
alter table public.referees                enable row level security;
alter table public.company_details         enable row level security;
alter table public.company_projects        enable row level security;
alter table public.company_clients         enable row level security;
alter table public.company_team            enable row level security;
alter table public.company_certifications  enable row level security;
alter table public.verification_requests   enable row level security;
alter table public.feed_items              enable row level security;

-- Helper: is the current auth user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Policies — profiles
-- Self can read/update own row. Anyone authed can read public-ish summary
-- columns for now (needed once we add public profile pages). Admin reads all.
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- Defense in depth: a regular user must not flip is_admin on themselves.
    and is_admin = (select is_admin from public.profiles where id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────────────────
-- Owner-only CRUD policies for the structured tables. Verified flags are
-- protected by the update policy WITH CHECK clause: a user CANNOT toggle
-- their own verified=true.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public._owner_only_policies(_table regclass)
returns void
language plpgsql
as $$
declare
  t text := _table::text;
begin
  execute format('drop policy if exists %I_owner_select on %s;', replace(t, '.', '_'), t);
  execute format('drop policy if exists %I_owner_insert on %s;', replace(t, '.', '_'), t);
  execute format('drop policy if exists %I_owner_update on %s;', replace(t, '.', '_'), t);
  execute format('drop policy if exists %I_owner_delete on %s;', replace(t, '.', '_'), t);

  execute format($f$
    create policy %I_owner_select on %s
      for select to authenticated
      using (profile_id = auth.uid() or public.is_admin());
  $f$, replace(t, '.', '_'), t);

  execute format($f$
    create policy %I_owner_insert on %s
      for insert to authenticated
      with check (profile_id = auth.uid());
  $f$, replace(t, '.', '_'), t);

  execute format($f$
    create policy %I_owner_delete on %s
      for delete to authenticated
      using (profile_id = auth.uid());
  $f$, replace(t, '.', '_'), t);
end;
$$;

select public._owner_only_policies('public.individual_details');
select public._owner_only_policies('public.experiences');
select public._owner_only_policies('public.educations');
select public._owner_only_policies('public.skills');
select public._owner_only_policies('public.certifications');
select public._owner_only_policies('public.company_details');
select public._owner_only_policies('public.company_projects');
select public._owner_only_policies('public.company_clients');
select public._owner_only_policies('public.company_team');
select public._owner_only_policies('public.company_certifications');

-- Update policies are bespoke per verified-bearing table: owners can update
-- everything EXCEPT the verified_* columns. Admins can update anything.

-- experiences
drop policy if exists experiences_owner_update on public.experiences;
create policy experiences_owner_update on public.experiences
  for update to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (
    profile_id = auth.uid()
    and verified = (select verified from public.experiences e2 where e2.id = experiences.id)
    and coalesce(verified_note,'') = (select coalesce(verified_note,'') from public.experiences e2 where e2.id = experiences.id)
    or public.is_admin()
  );

-- educations
drop policy if exists educations_owner_update on public.educations;
create policy educations_owner_update on public.educations
  for update to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (
    profile_id = auth.uid()
    and verified = (select verified from public.educations e2 where e2.id = educations.id)
    and coalesce(verified_note,'') = (select coalesce(verified_note,'') from public.educations e2 where e2.id = educations.id)
    or public.is_admin()
  );

-- certifications
drop policy if exists certifications_owner_update on public.certifications;
create policy certifications_owner_update on public.certifications
  for update to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (
    profile_id = auth.uid()
    and verified = (select verified from public.certifications c2 where c2.id = certifications.id)
    and coalesce(verified_note,'') = (select coalesce(verified_note,'') from public.certifications c2 where c2.id = certifications.id)
    or public.is_admin()
  );

-- company_projects
drop policy if exists company_projects_owner_update on public.company_projects;
create policy company_projects_owner_update on public.company_projects
  for update to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (
    profile_id = auth.uid()
    and verified = (select verified from public.company_projects p2 where p2.id = company_projects.id)
    and coalesce(verified_note,'') = (select coalesce(verified_note,'') from public.company_projects p2 where p2.id = company_projects.id)
    or public.is_admin()
  );

-- company_certifications
drop policy if exists company_certifications_owner_update on public.company_certifications;
create policy company_certifications_owner_update on public.company_certifications
  for update to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (
    profile_id = auth.uid()
    and verified = (select verified from public.company_certifications c2 where c2.id = company_certifications.id)
    and coalesce(verified_note,'') = (select coalesce(verified_note,'') from public.company_certifications c2 where c2.id = company_certifications.id)
    or public.is_admin()
  );

-- Tables without verified columns get a plain owner update.
drop policy if exists individual_details_owner_update on public.individual_details;
create policy individual_details_owner_update on public.individual_details
  for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists skills_owner_update on public.skills;
create policy skills_owner_update on public.skills
  for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists company_details_owner_update on public.company_details;
create policy company_details_owner_update on public.company_details
  for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists company_clients_owner_update on public.company_clients;
create policy company_clients_owner_update on public.company_clients
  for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists company_team_owner_update on public.company_team;
create policy company_team_owner_update on public.company_team
  for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────
-- Referees: HARD-PRIVATE. Only the owner and admins can read.
-- The owner-only policies helper already restricts SELECT this way, but we
-- repeat explicitly so the intent is grep-able.
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists referees_owner_select on public.referees;
create policy referees_owner_select on public.referees
  for select to authenticated
  using (profile_id = auth.uid() or public.is_admin());

drop policy if exists referees_owner_insert on public.referees;
create policy referees_owner_insert on public.referees
  for insert to authenticated
  with check (profile_id = auth.uid());

drop policy if exists referees_owner_update on public.referees;
create policy referees_owner_update on public.referees
  for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists referees_owner_delete on public.referees;
create policy referees_owner_delete on public.referees
  for delete to authenticated
  using (profile_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────
-- Verification requests: owner can create + read own; admin can do anything.
-- evidence_urls is admin-only-visible (the service-role client serves
-- signed URLs from a private bucket; the column itself is in this table for
-- audit, never returned to non-admin reads via app code).
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists vr_owner_select on public.verification_requests;
create policy vr_owner_select on public.verification_requests
  for select to authenticated
  using (profile_id = auth.uid() or public.is_admin());

drop policy if exists vr_owner_insert on public.verification_requests;
create policy vr_owner_insert on public.verification_requests
  for insert to authenticated
  with check (profile_id = auth.uid() and requested_by = auth.uid()
              and status = 'pending');

drop policy if exists vr_admin_update on public.verification_requests;
create policy vr_admin_update on public.verification_requests
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- Feed items: everyone (incl. anon) can SELECT approved rows. Only admins
-- can mutate.
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists feed_items_public_select on public.feed_items;
create policy feed_items_public_select on public.feed_items
  for select to anon, authenticated
  using (approved = true or public.is_admin());

drop policy if exists feed_items_admin_all on public.feed_items;
create policy feed_items_admin_all on public.feed_items
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- updated_at touchers
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'individual_details', 'company_details'
  ]
  loop
    execute format('drop trigger if exists touch_%I on public.%I;', t, t);
    execute format('create trigger touch_%I before update on public.%I
      for each row execute function public.touch_updated_at();', t, t);
  end loop;
end $$;
