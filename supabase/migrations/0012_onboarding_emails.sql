-- 0012: Onboarding emails. A welcome email when a new member first lands in
-- the builder, then two reminders (day 1 and day 4) while their CV or
-- company profile is still locked. Sent by /api/cron/onboarding-emails.
--
-- email_log records each email once per member (primary key), so a retry or
-- a double cron run can never send the same email twice. Writes come only
-- from server code using the service-role client (RLS-exempt), so there is
-- no insert policy; admins can read it.
--
-- email_opt_out is set by the unsubscribe link in every email.
-- welcomed_at marks the one-time redirect from /home into the builder, so a
-- member who then clicks back to Home isn't bounced again.

create table if not exists public.email_log (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,               -- 'welcome' | 'reminder_1' | 'reminder_2'
  sent_at timestamptz not null default now(),
  primary key (profile_id, kind)
);

alter table public.email_log enable row level security;

drop policy if exists "email_log_select_admin" on public.email_log;
create policy "email_log_select_admin" on public.email_log
  for select using (public.is_admin());

alter table public.profiles
  add column if not exists email_opt_out boolean not null default false,
  add column if not exists welcomed_at timestamptz;
