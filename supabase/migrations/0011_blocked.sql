-- 0011: Blocked (spam) profiles. Set automatically by scripts/block-spam.mjs
-- for link-spam signups and manually from /admin/metrics. A blocked profile
-- is hidden from the community showcase, the landing strip, its public
-- /u/[id] page and share card, and the member count. The account itself
-- still exists so an admin can reverse a false positive.

alter table public.profiles
  add column if not exists blocked boolean not null default false,
  add column if not exists blocked_reason text;

create index if not exists profiles_blocked_idx on public.profiles(blocked) where blocked;
