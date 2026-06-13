# Deploying Sahan to production

A practical, ordered checklist. Do these in sequence the first time.

---

## 1. Prerequisites

- The repo is on GitHub: `abdirahim008/Verify`.
- A Supabase project exists with all migrations applied
  (`supabase/migrations/0001`–`0004` + `reset.sql` is only for resets).
- A custom domain you control (recommended — SEO needs a real domain).

---

## 2. Import to Vercel

1. Go to **vercel.com → Add New → Project** and import the GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Leave build settings default
   — `postinstall` copies the PDF.js worker automatically.
3. **Don't deploy yet** — add the environment variables first (next step).

---

## 3. Environment variables (Vercel → Settings → Environment Variables)

Set these for **Production** (and Preview, if you want preview deploys to work):

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | From Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ…` (anon public) | Safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ…` (service_role) | **Secret.** Admin + PDF reads |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` | **Critical for SEO** — drives canonicals, sitemap, OG image URLs. No trailing slash. |
| `CHROMIUM_REMOTE_EXEC_PATH` | tarball URL in `.env.example` | Needed for PDF generation on serverless |
| `RESEND_API_KEY` | `re_…` | Optional — for verification-request emails |
| `VERIFICATION_INBOX_EMAIL` | `verify@yourdomain.com` | Where requests are emailed |
| `SAHAN_FROM_EMAIL` | `Sahan <verify@yourdomain.com>` | Verified Resend sender |

> **The single most important one is `NEXT_PUBLIC_SITE_URL`.** Without the real
> domain, every canonical tag, the sitemap, and OG image links point at the
> wrong host and your SEO work is wasted.

---

## 4. Deploy + attach the domain

1. Click **Deploy**. First build takes a few minutes (Chromium download for PDFs).
2. Vercel → **Settings → Domains** → add your custom domain and follow the DNS steps.
3. Re-check that `NEXT_PUBLIC_SITE_URL` matches the final domain exactly.

---

## 5. Point Supabase Auth at the live site

Supabase → **Authentication → URL Configuration**:

- **Site URL**: `https://yourdomain.com`
- **Redirect URLs** — add:
  - `https://yourdomain.com/auth/callback`
  - `https://yourdomain.com/**` (covers magic-link + OAuth returns)

Without this, signup confirmation and magic links bounce to the wrong place.

**Email confirmation** (Authentication → Providers → Email): keep "Confirm email"
ON for production. For your own first test you can toggle it off briefly, then
turn it back on.

---

## 6. First admin

After you sign up on the live site, grant yourself admin in the Supabase SQL editor:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'YOUR_EMAIL');
```

Refresh — **Admin** and **Feed** links appear in the nav.

---

## 7. Post-deploy SEO (do this within the first day)

1. **Google Search Console** (search.google.com/search-console):
   - Add your domain as a property, verify (DNS TXT or the HTML tag).
   - Submit `https://yourdomain.com/sitemap.xml`.
2. **Bing Webmaster Tools** — same, submit the sitemap.
3. Spot-check a guide URL in Search Console's **URL Inspection** → Request Indexing
   for your 2–3 highest-value guides to nudge first crawl.
4. Validate structured data: paste a guide URL into
   [search.google.com/test/rich-results](https://search.google.com/test/rich-results) —
   you should see Article + FAQ + Breadcrumb.

---

## 8. Verify social sharing

Paste your domain and a guide URL into:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

You should see the generated OG card (branded title image). If it's stale, hit
"Scrape Again" — these tools cache aggressively.

---

## 9. Smoke test the real flow (on a phone)

Do this as a brand-new user, on a phone, before you tell anyone:

- [ ] Sign up (individual) → confirm email → land on `/home`
- [ ] Fill basics + 1 experience + 1 education + 1 skill
- [ ] `/templates` → tap a swatch → **Preview** renders → **Download** works
- [ ] Open the PDF — fonts, layout, colours all correct
- [ ] Sign up a second account as a **company** → fill basics + about + 1 project
       → download a company profile
- [ ] Request verification on a claim → confirm the email arrives (if Resend set)
       → mark it verified in `/admin` → badge appears on profile + PDF
- [ ] Open your public profile `/u/<id>` in a private window → check visibility

If every box ticks, you're ready to share the link.

---

## 10. Ongoing

- **Feed**: visit `/admin/feed` → **Refresh feed** periodically (or set a Vercel
  Cron hitting `/api/admin/refresh-feed`) and approve items.
- **Verification requests**: watch `VERIFICATION_INBOX_EMAIL`; resolve in `/admin`.
- **Analytics**: Vercel → your project → **Analytics** + **Speed Insights** tabs.
- **Rotate secrets** if the service-role key or DB password was ever shared.
