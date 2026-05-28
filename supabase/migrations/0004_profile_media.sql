-- Sahan — public bucket for individual avatars + company logos.
-- Different shape from verification-evidence (which is admin-only):
-- profile media is PUBLIC so it can be rendered on /u/[id] without
-- signed URLs and embedded by puppeteer in the generated PDFs.
-- Idempotent.

insert into storage.buckets (id, name, public)
values ('profile-media', 'profile-media', true)
on conflict (id) do update set public = excluded.public;

-- ─── policies on storage.objects ──────────────────────────────────
-- Path convention: {auth.uid()}/avatar.{ext} or {auth.uid()}/logo.{ext}

-- Anyone (incl. anon) reads — it's a public bucket. Without this,
-- Supabase's storage gateway returns 400 even on public buckets.
drop policy if exists pm_public_select on storage.objects;
create policy pm_public_select on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'profile-media');

-- Owner can upload/replace/delete files in their own folder.
drop policy if exists pm_owner_insert on storage.objects;
create policy pm_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists pm_owner_update on storage.objects;
create policy pm_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists pm_owner_delete on storage.objects;
create policy pm_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
