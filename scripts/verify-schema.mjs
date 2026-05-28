// Quick post-migration sanity check. Confirms key tables, policies, the
// signup trigger, and the storage bucket exist.
import { Client } from "pg";

const DB_URL = process.env.DB_URL;
if (!DB_URL) { console.error("DB_URL missing"); process.exit(1); }

const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

async function ck(label, sql, expect) {
  const { rows } = await client.query(sql);
  const got = rows[0]?.n ?? rows.length;
  const ok = expect ? expect(got, rows) : Number(got) > 0;
  console.log(`${ok ? "✓" : "✗"} ${label}: ${got}`);
  return ok;
}

let pass = true;
pass &&= await ck("tables in public schema",
  "select count(*)::int n from information_schema.tables where table_schema='public'");
pass &&= await ck("'profiles' exists",
  "select count(*)::int n from information_schema.tables where table_schema='public' and table_name='profiles'");
pass &&= await ck("'verification_requests' has contact_phone column",
  "select count(*)::int n from information_schema.columns where table_schema='public' and table_name='verification_requests' and column_name='contact_phone'");
pass &&= await ck("RLS enabled on profiles",
  "select count(*)::int n from pg_tables where schemaname='public' and tablename='profiles' and rowsecurity=true");
pass &&= await ck("signup trigger exists",
  "select count(*)::int n from pg_trigger where tgname='on_auth_user_created'");
pass &&= await ck("'verification-evidence' bucket exists",
  "select count(*)::int n from storage.buckets where id='verification-evidence'");
pass &&= await ck("policies on public schema",
  "select count(*)::int n from pg_policies where schemaname='public'");

console.log("\n" + (pass ? "OK — schema is in place." : "FAIL — review above."));
await client.end();
process.exit(pass ? 0 : 1);
