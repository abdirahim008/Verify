-- Client logos: store an optional logo image URL per client so the company
-- profile can show clients as a horizontal logo strip (with the client name
-- as a fallback when no logo is uploaded). Idempotent (safe to re-run).
--
-- The image bytes live in the existing public `profile-media` Storage bucket;
-- this column holds only the public URL. No RLS change is needed — logo_url is
-- covered by the existing owner-only policies on company_clients.

alter table public.company_clients add column if not exists logo_url text;
