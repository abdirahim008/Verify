-- Sahan — clean reset of the application schema.
-- Drops everything the migrations create, WITHOUT touching auth.users
-- (your login accounts survive). Run this, then re-run the migrations in
-- supabase/migrations/ to rebuild a pristine schema.
--
-- Safe to run repeatedly. NOT idempotent-sensitive — uses IF EXISTS / CASCADE.

-- ── Drop the signup trigger first (it references public.handle_new_user) ──
drop trigger if exists on_auth_user_created on auth.users;

-- ── Drop application tables (CASCADE clears their policies, FKs, indexes) ──
drop table if exists public.verification_requests   cascade;
drop table if exists public.feed_items              cascade;
drop table if exists public.referees                cascade;
drop table if exists public.experiences             cascade;
drop table if exists public.educations              cascade;
drop table if exists public.skills                  cascade;
drop table if exists public.certifications          cascade;
drop table if exists public.individual_details      cascade;
drop table if exists public.company_projects        cascade;
drop table if exists public.company_clients         cascade;
drop table if exists public.company_team            cascade;
drop table if exists public.company_certifications  cascade;
drop table if exists public.company_details         cascade;
drop table if exists public.profiles                cascade;

-- ── Drop helper functions ──
drop function if exists public.handle_new_user()           cascade;
drop function if exists public.is_admin()                  cascade;
drop function if exists public.touch_updated_at()          cascade;
drop function if exists public._owner_only_policies(regclass) cascade;

-- ── Drop enums ──
drop type if exists public.account_type              cascade;
drop type if exists public.visibility_level          cascade;
drop type if exists public.qualification_level       cascade;
drop type if exists public.verification_target_type  cascade;
drop type if exists public.verification_status       cascade;
drop type if exists public.payment_status            cascade;

-- ── Storage policies ──
-- NOTE: Supabase blocks direct DELETE on storage.objects / storage.buckets
-- from SQL (must use the Storage API). We don't drop the buckets here —
-- migrations 0002 / 0004 re-upsert them idempotently, so leaving them is
-- correct. Any previously-uploaded files stay in place but are harmless;
-- their owning rows in the app tables are gone, so nothing references them.
-- We DO drop the policies (allowed) so the migrations re-create them cleanly.
drop policy if exists ve_owner_insert  on storage.objects;
drop policy if exists ve_owner_update  on storage.objects;
drop policy if exists ve_owner_delete  on storage.objects;
drop policy if exists ve_admin_select  on storage.objects;
drop policy if exists pm_public_select on storage.objects;
drop policy if exists pm_owner_insert  on storage.objects;
drop policy if exists pm_owner_update  on storage.objects;
drop policy if exists pm_owner_delete  on storage.objects;

-- Done. Now re-run supabase/migrations/*.sql in order.
