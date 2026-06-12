// Removes tables that don't belong to Sahan — leftovers from a different
// project's SQL that was pasted into this Supabase project by mistake.
//
// Strategy: enumerate every BASE TABLE in `public`, subtract Sahan's known
// set, drop the remainder with CASCADE. Then report (not auto-drop) any
// leftover enums/functions so we can eyeball them before removing.
//
//   DB_URL="postgresql://..." node scripts/drop-foreign-tables.mjs          (dry run)
//   DB_URL="..." node scripts/drop-foreign-tables.mjs --apply               (executes)

import { Client } from "pg";

const APPLY = process.argv.includes("--apply");
const DB_URL = process.env.DB_URL;
if (!DB_URL) { console.error("DB_URL not set"); process.exit(1); }

// The canonical Sahan schema (migrations 0001–0004). Anything else in
// public is foreign and gets dropped.
const SAHAN_TABLES = new Set([
  "profiles", "individual_details", "experiences", "educations", "skills",
  "certifications", "referees", "company_details", "company_projects",
  "company_clients", "company_team", "company_certifications",
  "verification_requests", "feed_items",
]);

const SAHAN_TYPES = new Set([
  "account_type", "visibility_level", "qualification_level",
  "verification_target_type", "verification_status", "payment_status",
]);

const SAHAN_FUNCTIONS = new Set([
  "handle_new_user", "is_admin", "touch_updated_at", "_owner_only_policies",
]);

const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

// Foreign tables
const { rows: tables } = await client.query(
  "select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by table_name",
);
const foreignTables = tables.map((r) => r.table_name).filter((t) => !SAHAN_TABLES.has(t));

// Foreign enums
const { rows: types } = await client.query(`
  select t.typname from pg_type t
  join pg_namespace n on n.oid = t.typnamespace
  where n.nspname='public' and t.typtype='e' order by t.typname`);
const foreignTypes = types.map((r) => r.typname).filter((t) => !SAHAN_TYPES.has(t));

// Foreign functions
const { rows: funcs } = await client.query(`
  select p.proname from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname='public' order by p.proname`);
const foreignFuncs = [...new Set(funcs.map((r) => r.proname))].filter((f) => !SAHAN_FUNCTIONS.has(f));

console.log(`Foreign TABLES (${foreignTables.length}):`);
foreignTables.forEach((t) => console.log("  " + t));
console.log(`\nForeign ENUMS (${foreignTypes.length}):`);
foreignTypes.forEach((t) => console.log("  " + t));
console.log(`\nForeign FUNCTIONS (${foreignFuncs.length}):`);
foreignFuncs.forEach((f) => console.log("  " + f));

if (!APPLY) {
  console.log("\n(dry run — re-run with --apply to drop the above)");
  await client.end();
  process.exit(0);
}

console.log("\nDropping...");
try {
  await client.query("BEGIN");
  for (const t of foreignTables) {
    await client.query(`drop table if exists public.${quoteIdent(t)} cascade`);
  }
  for (const t of foreignTypes) {
    await client.query(`drop type if exists public.${quoteIdent(t)} cascade`);
  }
  // Resolve every overload's full signature, then drop each directly.
  const { rows: sigs } = await client.query(`
    select p.oid::regprocedure::text as sig, p.proname
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname='public'`);
  const foreignSet = new Set(foreignFuncs);
  for (const { sig, proname } of sigs) {
    if (foreignSet.has(proname)) {
      await client.query(`drop function if exists ${sig} cascade`);
    }
  }
  await client.query("COMMIT");
  console.log("Done.");
} catch (e) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("FAILED:", e.message);
  process.exit(2);
}
await client.end();

function quoteIdent(s) { return '"' + String(s).replace(/"/g, '""') + '"'; }
