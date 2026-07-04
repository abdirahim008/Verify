// Central feature flags.
//
// `verification` — the per-claim verification feature (request flow, payment
// stub, admin review queue, inline verified/pending badges). It is fully built
// per CLAUDE.md §2.6 but hidden for the initial release: we're launching on the
// free hook (registration + elegant CVs / company profiles / business cards)
// and will switch verification back on once there's a user base to sell it to.
//
// This flag ONLY hides the UI surfaces and blocks the routes. The DB tables,
// RLS policies, server actions (lib/actions/verification.ts) and data helpers
// stay intact, so flipping this back to `true` restores the whole flow:
//   - TopNav "Verification" + "Admin" (queue) links
//   - /verification and /admin (+ /admin/[id]) routes
//   - "Request verification" buttons + verified/pending badges in the builder
//   - the "Verified claims/projects" cards in the completeness rails
//   - the business-card "Verified" badge
// The landing page marketing was rewritten (not flag-gated) to lead with the
// free product; revisit that copy when re-enabling.
export const FEATURES = {
  verification: false,
} as const;
