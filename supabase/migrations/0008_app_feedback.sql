-- 0008: In-app feedback — a 1–5 star rating plus an optional short comment,
-- asked once in the profile builder rail. One row per user: submitting OR
-- dismissing writes the row, and the prompt never shows again (the card is
-- rendered only when no row exists).
--
-- `rating` is null when the user dismissed without rating.

create table if not exists public.app_feedback (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  rating smallint check (rating is null or (rating between 1 and 5)),
  comment text,
  dismissed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists app_feedback_created_idx on public.app_feedback(created_at desc);

alter table public.app_feedback enable row level security;

-- Owner writes their own row; owner or admin reads. The admin dashboard reads
-- with the service-role client (RLS-exempt), but keep the policy honest.
drop policy if exists "app_feedback_insert_own" on public.app_feedback;
create policy "app_feedback_insert_own" on public.app_feedback
  for insert with check (profile_id = auth.uid());

drop policy if exists "app_feedback_update_own" on public.app_feedback;
create policy "app_feedback_update_own" on public.app_feedback
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists "app_feedback_select_own_or_admin" on public.app_feedback;
create policy "app_feedback_select_own_or_admin" on public.app_feedback
  for select using (profile_id = auth.uid() or public.is_admin());
