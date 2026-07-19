-- 0007: Usage event log — powers the /admin/metrics dashboard.
--
-- One row per notable user action. Signups and profile content already leave
-- timestamps on their own tables, so this log only records actions that don't
-- otherwise write a row — today that's PDF/PNG generation:
--   cv_download       meta: { template, theme, preview }
--   company_download  meta: { template, theme, preview, from, to }
--   card_download     meta: { format, kind }
--
-- Inserts come from the authenticated download routes (anon key + session),
-- so RLS needs an owner-insert policy. Reads happen in admin loaders via the
-- service-role client (RLS-exempt); the select policies below just make the
-- table safely queryable from user-context code too.

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  event text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_profile_idx on public.usage_events(profile_id, created_at desc);
create index if not exists usage_events_event_idx on public.usage_events(event, created_at desc);

alter table public.usage_events enable row level security;

drop policy if exists "usage_events_insert_own" on public.usage_events;
create policy "usage_events_insert_own" on public.usage_events
  for insert with check (profile_id = auth.uid());

drop policy if exists "usage_events_select_own_or_admin" on public.usage_events;
create policy "usage_events_select_own_or_admin" on public.usage_events
  for select using (profile_id = auth.uid() or public.is_admin());
