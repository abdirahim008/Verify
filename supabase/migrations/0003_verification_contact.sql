-- Sahan — verification flow shift to email-based payment.
-- Adds a contact_phone column to verification_requests so the user's
-- preferred number is captured at submission time (may differ from the
-- one on their profile). Idempotent — safe to re-run.
--
-- Evidence-bucket policies (migration 0002) are intentionally left in
-- place. The flow no longer uploads files at submit time, but the bucket
-- + policies are harmless to keep and ready if we wire in an "attach
-- supporting docs" reply path later.

alter table public.verification_requests
  add column if not exists contact_phone text;

comment on column public.verification_requests.contact_phone is
  'Phone number the user provided when submitting the form. Sahan calls this to arrange payment before starting verification.';
