# CLAUDE.md — Verified Professional Profiles Platform (MVP)

> This file is the single source of truth for Claude Code on this project.
> Read it fully before writing any code. Follow the MVP scope exactly.
> When in doubt, prefer the simplest thing that ships, and ASK rather than assume.

---

## 1. What we are building (one paragraph)

A web app for the **East Africa / Somalia humanitarian and professional sector** where
**individuals** and **companies/organizations** build structured, LinkedIn-style profiles.
Any user can, with one click, generate an **elegant, professional PDF** — a CV for
individuals, a company profile for organizations — choosing from several templates.
Some profile claims (experience, projects, qualifications) can carry a **verified badge**.
In this MVP, verification is **manual/concierge** (done by an admin), and is offered as a
**paid premium** for companies that want their experience/projects verified to stand out.

The strategic point: the **free profile + free elegant PDF** is the hook that brings users in
with zero network required. The structured data they enter is the asset. Paid verification
is the premium trust layer on top.

---

## 2. MVP SCOPE — build ONLY these

1. **Auth & accounts** — email/password + magic link via Supabase Auth. Two account types:
   `individual` and `company`. User picks type at signup.
2. **Individual profile builder** — structured sections (see data model §5).
3. **Company profile builder** — structured sections (see data model §5).
4. **Elegant PDF generation** — "Download as CV" (individual) / "Download as Company Profile"
   (company). Multiple templates. This is the centerpiece — quality matters more than anything.
5. **Verified badges** — display only in this MVP. Set by an admin. Shown on profile AND on
   the generated PDF. Tied to specific claims (a specific experience/project/qualification),
   NOT a vague global "verified" status.
6. **Paid verification request flow** — a company can request verification of specific
   project/experience claims, see a price, and submit a request. Payment can be a STUB in v1
   (record the request + intended payment; do not integrate a live payment processor yet
   unless explicitly told to). An admin screen lets the admin mark claims verified.
7. **Minimal admin panel** — list verification requests, view submitted evidence, mark a
   claim verified/rejected with a note. Admin access gated by a role flag.
8. **Per-section privacy / visibility controls** — every profile section has a visibility
   level the user sets in Settings. Sensitive fields are private-by-default. See §10.
9. **Homepage activity + curated sector feed** — a logged-in homepage that feels alive via
   (a) the user's OWN activity/status and (b) a LEGITIMATE syndicated humanitarian feed
   (RSS/API with attribution). NO scraping/reposting of third-party content or images. See §11.

### Build the experience to reach the "WOW" fast
There must be a **minimum core** of fields (name, one experience, education, skills for
individuals; name, about, one project for companies) that unlocks PDF download quickly.
Then prompt the user to enrich the profile and request verification. Do NOT force a 40-field
form before any payoff.

---

## 3. EXPLICITLY OUT OF SCOPE (do NOT build in this MVP)

Do not build, scaffold, or stub these unless I explicitly ask later. Do not add fields or
tables for them "to be ready." Keep the codebase lean.

- ❌ Job postings
- ❌ Job applications / application forms
- ❌ Auto-shortlisting / candidate filtering / eligibility filters (gender/nationality/etc.)
- ❌ Employer self-serve verification (employers verifying others themselves) — verification
  is admin-only/manual in this MVP
- ❌ Messaging/chat between users
- ❌ Public search/browse of all profiles
- ❌ Live payment processor integration (stub the payment intent only)
- ❌ Mobile native apps
- ❌ AI/LLM features
- ❌ **Scraping / crawling / reposting third-party web content or images** for the homepage
  feed or anywhere else. The homepage feed uses ONLY legitimate syndicated sources
  (RSS/official APIs) with attribution, or admin-curated posts. See §11.

If you think one of these is needed, STOP and ask me first.

---

## 4. Tech stack & conventions

- **Framework:** Next.js (App Router, latest stable). TypeScript everywhere. React Server
  Components where sensible; client components only where interactivity requires it.
- **Backend / DB / Auth / Storage:** Supabase (Postgres + Auth + Storage + Row Level Security).
- **Hosting:** Vercel (frontend) + Supabase (managed backend). Keep deploy config simple.
- **Styling:** Tailwind CSS. Clean, modern, restrained. (See §6 design rules.)
- **PDF generation:** Use a server-side HTML/CSS → PDF approach so templates are real
  HTML/CSS we can make genuinely beautiful (recommend Puppeteer/Playwright in a Next.js
  route handler, OR React-PDF if it gives cleaner control — propose your choice and explain
  the tradeoff before committing). The PDF MUST: be A4, embed fonts, print clean, and handle
  variable-length data (someone with 12 experiences vs 2) without breaking layout.
- **Forms:** react-hook-form + zod validation.
- **State:** keep it simple; server components + minimal client state. No heavy state lib.
- **Env vars:** Supabase URL/anon key/service-role key in `.env.local`; never commit secrets.
  Document required env vars in a `.env.example`.

### Code conventions
- Strict TypeScript (`strict: true`). No `any` without a comment justifying it.
- Server-side data access goes through typed helpers; generate Supabase types.
- Enforce Row Level Security: users can only read/write their own profile data. Referee
  contact details and verification evidence are PRIVATE (never exposed to other users or
  in the public-facing API).
- Small, composable components. No giant files.
- Commit in logical chunks with clear messages.

---

## 5. Data model (structured = the whole point)

Everything is **structured** (own columns/rows), not free-text blobs, EXCEPT where noted.
Structured data is what lets us generate clean PDFs and verify specific claims later.

### Shared
- `profiles` — id (uuid, = auth user id), account_type (`individual` | `company`),
  created_at, is_admin (bool, default false), display settings.

### Individual
- `individual_details` — profile_id, full_name, headline/title, summary (free-text, short),
  location, phone, email (display-optional), languages (array), photo_url (optional).
- `experiences` — id, profile_id, organization, title, location, start_date, end_date
  (nullable = current), description (free-text), **verified** (bool, default false),
  verified_note (text, nullable), verified_at.
- `educations` — id, profile_id, institution, qualification_level
  (`high_school` | `diploma` | `degree` | `masters` | `phd` | `certificate`), field_of_study,
  start_year, end_year, **verified** (bool), verified_note, verified_at.
- `skills` — id, profile_id, name (encourage a suggested/controlled list with free-add).
- `certifications` — id, profile_id, name, issuer, year, **verified** (bool).
- `referees` — id, profile_id, **experience_id (nullable FK — referee is ATTACHED to the
  specific experience it vouches for where possible)**, name, position, organization,
  phone, email, relationship. **PRIVATE: never shown to other users or in public API.**

### Company / organization
- `company_details` — profile_id, company_name, logo_url, about (free-text), mission
  (free-text), vision (free-text), country, registration_number, registration_country,
  founded_year, website, sectors (array), core_services (array), contact info.
- `company_projects` — id, profile_id, project_name, client_name, sector, value (numeric,
  nullable), currency, year_start, year_end, scope (free-text), **verified** (bool),
  verified_note, verified_at. **(This is the table paid verification targets.)**
- `company_clients` — id, profile_id, client_name, display_public (bool, default false),
  note. (Privacy: not shown publicly unless display_public.)
- `company_team` — id, profile_id, person_name, role, reports_to (nullable self-FK, for a
  simple organogram), order_index. (Keep organogram SIMPLE — structured people + reporting
  lines that render to a tidy chart. Do NOT build a drag-and-drop chart editor.)
- `company_certifications` — id, profile_id, name, issuer, year, **verified** (bool).

### Verification
- `verification_requests` — id, profile_id, requested_by, target_type
  (`experience` | `education` | `project` | `certification`), target_id, status
  (`pending` | `verified` | `rejected`), price_amount, price_currency, payment_status
  (`unpaid` | `paid` | `waived` — STUB), evidence_urls (array, private), admin_note,
  created_at, resolved_at, resolved_by.
- Verification is **per-claim** (per experience/project/etc.), not per-account. The badge
  text on the PDF should reflect the SPECIFIC verified claim
  (e.g. "✓ Verified: 3 World Bank–funded road projects, 2021–2024").

> Provide a single SQL migration file creating all tables + RLS policies. Generate TS types.

---

## 6. Design rules (the PDF quality IS the product)

The generated PDF is the hook. If it looks like a generic auto-filled template, the whole
value proposition fails. Treat design as a first-class deliverable, not an afterthought.

- **A few genuinely excellent templates (3 max to start), not many mediocre ones.**
- Real typographic craft: deliberate font pairing, generous spacing, clear hierarchy,
  proper margins. Avoid the stiff "form-to-document" look.
- Must gracefully handle: very long organization names (common in Somali/NGO context),
  multi-line titles, users with many vs. few entries, missing optional sections.
- Verified badges render tastefully inline next to the verified claim.
- A4, embedded fonts, clean print, consistent across viewers.
- The app UI itself: clean, modern, fast, mobile-friendly (many users are on phones).
- Before building all templates, build ONE end-to-end (form → DB → PDF) and show it for
  review. Do not build 3 templates before the first is approved.

---

## 7. Build order (do this sequentially; check in after each milestone)

1. **Scaffold:** Next.js + TS + Tailwind + Supabase client. `.env.example`. Confirm it runs.
2. **DB:** migration for all tables in §5 + RLS policies. Generate TS types.
3. **Auth:** signup (choose individual/company) + login + protected routes + basic profile shell.
4. **Individual profile builder:** the structured sections, with "minimum core" fast path.
5. **ONE elegant CV template, end-to-end** (form data → server → A4 PDF download). **STOP &
   show me for review before proceeding.** A working visual + data target already exists — see
   §12. Match that quality; don't invent the design from scratch.
6. **Company profile builder** + ONE elegant company-profile PDF template. Stop & show me.
   Target is the prototype in §12 (`Company_Profile.pdf`).
7. **Additional templates** (up to 3 each) once the first is approved. The three CV prototypes
   in §12 (Editorial / Sidebar / Mono) are the intended set — port them faithfully.
8. **Verification:** request flow (per-claim, payment stub) + minimal admin panel to mark
   claims verified. Badges appear on profile + PDF.
9. **Privacy & visibility (§10):** per-section visibility settings + RLS/server enforcement.
   Note: sensitive-field defaults and referee/evidence privacy must already be respected from
   the DB milestone — this milestone adds the user-facing Settings controls and the three
   viewer contexts (owner / registered / public).
10. **Homepage (§11):** user activity/status panel + curated syndicated feed from approved
    RSS/API sources with attribution. No scraping.
11. **Polish:** mobile responsiveness, empty states, validation, error handling.

After each milestone: summarize what was built, how to run/test it, and what's next. Wait
for my go-ahead on the milestones marked "stop & show."

---

## 8. Operating instructions for Claude Code

- **Stay in MVP scope.** If a request or your own idea drifts toward §3 (out of scope), stop
  and ask before building it.
- **Ask before big decisions** (PDF library choice, any new dependency, schema changes).
  Explain tradeoffs briefly, recommend one, wait for confirmation.
- **Keep it lean.** No speculative abstractions, no "we might need this later" tables/fields.
- **Security first** on private data: referees, contact details, and verification evidence
  must be protected by RLS and never leak to other users or public endpoints.
- **Verification integrity:** the badge means a specific claim was checked. Never auto-set
  `verified = true` from user input; only an admin action sets it.
- Work in small, reviewable commits. Document setup steps in `README.md` as you go.
- When you finish a milestone, give me: (a) what changed, (b) how to run & verify it,
  (c) anything you're unsure about.

---

## 9. First task for this session

1. Confirm you've read and understood this file and restate the MVP scope in 3–4 lines.
2. Propose your **PDF generation approach** (Puppeteer/Playwright vs React-PDF) with a short
   tradeoff note and a recommendation. Wait for my choice.
3. Once I confirm the PDF approach, do **Milestone 1 (scaffold)** and tell me how to run it.

Do NOT skip ahead. Do NOT build profile forms or PDFs until scaffold + DB + auth are done
and I've chosen the PDF approach.

---

## 10. Privacy & visibility model (build from the start, do NOT retrofit)

Privacy is a first-class requirement, not a later add-on. We handle personal data of users
AND of third parties (referees), across jurisdictions including Kenya's Data Protection Act.
Default to the CLOSED/safe setting everywhere; let users opt to open up. Most users never
change defaults, so defaults ARE the privacy policy in practice.

### Three viewer contexts
A profile renders differently depending on who is viewing:
- **Owner** — sees everything + edit controls.
- **Registered user / logged-in viewer** — sees `public` + `registered_only` sections.
- **Public / logged-out / public link** — sees ONLY `public` sections.

The downloadable **PDF is separate**: the user explicitly chooses to share it, so it MAY
contain more than the public web profile. Keep "what's visible on the profile page" and
"what's in the generated PDF" as two distinct concerns.

### Per-section visibility levels
Each profile section has a visibility setting the user controls in **Settings**:
- `public` — anyone, including logged-out visitors
- `registered_only` — logged-in registered accounts only
- `private` — owner (and admin, for verification) only

Implement via a `section_visibility` table (or a JSON column on the profile) keyed by
section name, e.g. `{ summary: 'public', experiences: 'public', skills: 'public',
contact: 'registered_only', location: 'registered_only', referees: 'private' }`.

### Hard rules — NOT user-overridable (enforce in code + RLS)
- **Referee contact details (name/phone/email): ALWAYS private.** Referees are third parties
  who did not sign up. Never expose to other users or publicly. Reveal only to admin during
  verification, or to a specific employer with explicit per-instance consent (not in MVP).
- **Personal contact info (phone, email, precise location): default `registered_only` or
  `private`. NEVER default to `public`.**
- **Verification evidence (contracts, certificates, uploads): ALWAYS private, admin-only.**
- **Default visibility for new sensitive fields = the most closed sensible option.**

### Enforcement
- Enforce visibility at the **data layer (RLS + server queries)**, not just by hiding in the
  UI. A `registered_only`/`private` field must never be returned by a public API/query to an
  unauthorized viewer. Hiding in the frontend is NOT sufficient.
- Provide a clear Settings screen where the user sets visibility per section, with the
  safe defaults pre-selected.

---

## 11. Homepage feed — legitimate sources ONLY (NO scraping)

Goal: make the logged-in homepage feel alive and give users a reason to return — WITHOUT
copyright/scraping risk and WITHOUT undermining the platform's trust/credibility positioning.

### DO build
1. **User's own activity & status** (this is the main engagement driver — it's about THEM):
   - Profile completeness ("Your profile is 80% complete — add referees to reach 100%").
   - Verification status updates ("Your project verification was approved").
   - Light activity signals ("3 employers viewed your profile this week") — only if cheap to
     implement honestly; do NOT fabricate numbers.
   - Prompts to enrich profile / request verification.
2. **Curated / syndicated sector feed** from LEGITIMATE, redistributable sources:
   - Pull from official **RSS feeds / public APIs** intended for syndication (e.g.
     ReliefWeb and similar humanitarian information services, official agency feeds).
   - Show **title + short snippet + attribution + link back to the source.** Do NOT
     republish full articles. Do NOT copy/host third-party images without rights.
   - Always verify each source's terms permit redistribution; store source + attribution.
   - Prefer an **admin-curated/approved** layer over fully automatic posting, so a human
     prevents anything inaccurate, outdated, or insensitive landing on the front page.

### DO NOT build
- ❌ No web scrapers/crawlers that copy third-party content or images and repost them.
- ❌ No auto-posting of unverified/unattributed content.
- ❌ No hotlinking or rehosting of images you don't have rights to.

### Implementation note
A small server-side job (Next.js route handler / scheduled function) may FETCH from approved
RSS/API endpoints, normalize to a `feed_items` table (title, snippet, source_name,
source_url, published_at, optional approved flag), and the homepage renders from that table.
This is fetching from feeds that exist to be syndicated — NOT scraping. Keep attribution and
link-backs on every item.


---

## 12. Prototype PDF templates — the visual + data target (READ before Milestones 5–7)

Working, rendered prototype templates already exist and define the quality bar. Do NOT
design the PDFs from scratch — port these. They live in the `cv-templates/` folder
delivered alongside this spec:

- `CV_1_Editorial.pdf` — refined magazine/editorial style; serif (Fraunces display +
  Newsreader body); drop cap; warm ink-on-cream; single column.
- `CV_2_Sidebar.pdf` — dark teal two-column professional CV; Archivo + IBM Plex Sans.
- `CV_3_Mono.pdf` — minimalist/technical; Space Grotesk + IBM Plex Sans; timeline grid;
  single signal-orange accent.
- `Company_Profile.pdf` — bid-ready company profile; gradient cover, about/mission/vision
  cards, sectors, services, selected projects, clients, key personnel.
- `render_cv.py`, `render_company.py` — the exact HTML/CSS that produced the above
  (Python + WeasyPrint). Use as the source of truth for layout, spacing, type scale.
- `data.py` — the structured sample data. **This mirrors the §5 data model and shows
  exactly which fields feed each template, including the per-claim `verified` flags.**
  Use it to confirm the profile forms collect everything the templates need.

### Verified badge convention (important — this is the monetisation made visible)
The verified badge (green check + short note, e.g. "✓ Verified · UNICEF Somalia") renders
INLINE next to the SPECIFIC verified claim — a specific experience, education entry, or
project — NOT as a global profile badge. An unverified entry shows nothing. A verified CV
must visibly outclass an unverified one on the same page; that contrast is the reason users
pay for verification. Preserve this exactly.

### PDF approach implication
These prototypes were built with **WeasyPrint** (HTML/CSS → A4 PDF), which is a strong
option for this app: lighter and more predictable on Vercel than headless Chromium, with no
Chromium binary to manage. When proposing the PDF approach in §9, treat WeasyPrint as a
serious third candidate alongside Puppeteer/Playwright and React-PDF:
- **WeasyPrint** — print-oriented CSS, clean A4, easy font embedding, light deploy. Some
  modern fl/grid behaves slightly differently than a browser; templates may need minor
  layout tweaks if ported from these (which use some flex/grid).
- **Puppeteer/Playwright** — pixel-identical to browser rendering (best fidelity to these
  templates as-is) but needs `@sparticuz/chromium` to fit Vercel serverless limits.
- **React-PDF** — simplest deploy, least typographic/layout freedom.
Recommend one with reasoning and WAIT for my choice (per §9).

### Fonts
Fraunces, Newsreader, Archivo, IBM Plex Sans, Space Grotesk — all open-source, free to
self-host commercially. Self-host them (don't hotlink). If swapping any, confirm licensing.

