// Clean reset: runs supabase/reset.sql, then re-applies every migration in
// supabase/migrations/ in order. Each step is its own transaction.
//
// Usage (from repo root):
//   DB_URL="postgresql://..." node scripts/reset-and-migrate.mjs
//
// Drops + rebuilds the app schema. Does NOT delete auth.users.

import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { Client } from "pg";

const DB_URL = process.env.DB_URL;
if (!DB_URL) { console.error("DB_URL not set"); process.exit(1); }

const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

async function run(label, sql) {
  process.stdout.write(`→ ${label} ... `);
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("ok");
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    console.log("FAILED");
    console.error("  ", e.message);
    process.exit(2);
  }
}

try {
  await client.connect();
  console.log("Connected.");

  // 1. Reset.
  await run("reset.sql", readFileSync(resolve("supabase/reset.sql"), "utf8"));

  // 2. Re-apply all migrations in filename order.
  const dir = resolve("supabase/migrations");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    await run(f, readFileSync(join(dir, f), "utf8"));
  }

  console.log("\nSchema reset + rebuilt.");
} finally {
  await client.end();
}
