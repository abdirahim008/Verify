# Sahan

Verified professional profiles for the East Africa / Somalia humanitarian and professional sector. Build a structured profile (individual or company) and download an elegant A4 PDF; admin-verified badges sit inline next to specific claims.

See [`CLAUDE.md`](./CLAUDE.md) for the full spec — scope, data model, privacy rules, and milestone order.

## Stack

- **Next.js 14** (App Router) + TypeScript strict
- **Tailwind CSS 3**
- **Supabase** — Postgres, Auth, Storage, RLS
- **Vercel** for hosting; **Puppeteer + `@sparticuz/chromium-min`** for PDF generation (lands in Milestone 5)

## Local setup

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
# then fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# and SUPABASE_SERVICE_ROLE_KEY from your Supabase project settings.

# 3. Apply the database schema
# Open your Supabase project → SQL editor, paste the contents of
# supabase/migrations/0001_init.sql, and run it. Idempotent — safe to re-run.

# 4. Run dev
npm run dev
# → http://localhost:3000
```

If Supabase env vars are missing, the app degrades to a login redirect instead of crashing — the same defensive pattern used elsewhere. You can still see the landing page (`/`) without configuration.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next dev server on http://localhost:3000 |
| `npm run build` | Production build (also serves as type-check) |
| `npm run start` | Serve the production build |
| `npm run lint` | `next lint` |

## Project layout

```
app/
  page.tsx                  Public landing
  login/, signup/           Auth screens (password + magic link)
  auth/callback/route.ts    Email-confirmation + magic-link callback
  (app)/                    Auth-gated routes (layout enforces session)
    home/                   Logged-in homepage
    profile/                Profile builder (placeholder until Milestone 4)
    templates/              Template picker (Milestone 5+)
    verification/           Verification request flow (Milestone 8)
    settings/               Privacy & visibility (Milestone 9)
components/                 Shared UI primitives (Button, TopNav, VerifiedBadge…)
lib/
  supabase/                 client / server / route / middleware clients
  types.ts                  Domain types + placeholder Database type
  cn.ts                     classnames helper
middleware.ts               Route protection + session refresh
supabase/migrations/        SQL schema (apply in Supabase SQL editor)
verify/                     Original design references (jsx prototypes,
                            CLAUDE.md spec) — preserved, excluded from build
```

## Auth flow

1. `/signup` — user picks `individual` or `company`, enters name + email + password.
   Account type and display name are stashed in Supabase `user_metadata`.
2. A Postgres trigger (`handle_new_user`) creates the matching `public.profiles` row
   with safe-default `section_visibility` (private referees, registered-only contact, etc).
3. `/login` — password or magic-link. Magic links land at `/auth/callback`, which
   exchanges the code for a session cookie and redirects to `/home`.
4. `middleware.ts` refreshes the session on every request and bounces unauthenticated
   users away from `/home`, `/profile`, etc.

## Privacy (CLAUDE.md §10)

Enforced at the **DB layer**:

- `referees` rows are owner + admin only. No public read path exists.
- Per-claim `verified` flags can NOT be flipped by the row owner — only an admin
  (or service-role) update can set them. See the WITH CHECK clauses in the migration.
- `verification_requests.evidence_urls` is owner + admin only.
- `section_visibility` JSON defaults set sensitive sections to `registered_only` or
  `private` on profile creation.

## Milestones (from CLAUDE.md §7)

- [x] **1.** Scaffold (Next + TS + Tailwind + Supabase clients)
- [x] **2.** SQL migration + RLS
- [x] **3.** Auth shell (signup with type pick, login, protected routes)
- [ ] **4.** Individual profile builder
- [ ] **5.** First CV template end-to-end (PDF download) — **stop & show**
- [ ] **6.** Company profile builder + first company PDF — **stop & show**
- [ ] **7.** Additional templates (Editorial / Sidebar / Mono)
- [ ] **8.** Verification request + admin panel
- [ ] **9.** Per-section visibility UI in Settings
- [ ] **10.** Homepage feed (curated RSS, with attribution)
- [ ] **11.** Polish

## Deploy

- Push to GitHub.
- Connect the repo to Vercel.
- Add the env vars from `.env.example` in the Vercel project settings.
- Add `CHROMIUM_REMOTE_EXEC_PATH` once Milestone 5 wires up the PDF route.
