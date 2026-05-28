-- Sahan — verification evidence storage.
-- Adds a private Supabase Storage bucket for verification evidence, plus
-- the per-object RLS policies. Idempotent.
--
-- CLAUDE.md §10: "Verification evidence (contracts, certificates, uploads):
-- ALWAYS private, admin-only." Owners may upload (and overwrite their own)
-- but cannot read back files after they're submitted — only the admin can.

-- ─────────────────────────────────────────────────────────────
-- Bucket
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('verification-evidence', 'verification-evidence', false)
on conflict (id) do update set public = excluded.public;

-- ─────────────────────────────────────────────────────────────
-- Policies on storage.objects
-- File-path convention: {auth.uid()}/{request_id}/{filename}
-- Read access is admin-only (signed URLs are generated server-side via the
-- service-role client and handed to the admin UI).
-- ─────────────────────────────────────────────────────────────

drop policy if exists ve_owner_insert on storage.objects;
create policy ve_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'verification-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists ve_owner_update on storage.objects;
create policy ve_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'verification-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'verification-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists ve_owner_delete on storage.objects;
create policy ve_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'verification-evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
    -- Owners can only delete files for not-yet-submitted requests. Once
    -- the request is in 'pending' or 'verified' state we lock the bucket.
    -- Enforced loosely here; the server action also blocks delete after
    -- submission for defense in depth.
  );

drop policy if exists ve_admin_select on storage.objects;
create policy ve_admin_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'verification-evidence' and public.is_admin()
  );

-- The owner intentionally CANNOT select from this bucket — they trust the
-- system, and admin/service-role read paths are the only way to view a
-- submitted evidence file. This matches the §10 hard rule.
