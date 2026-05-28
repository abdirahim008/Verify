// One-off migration runner. Reads supabase/migrations/*.sql in order and
// applies them to Postgres. Connection string is passed via DB_URL env var
// so the password never lands on disk in this script.
//
// Usage (from repo root):
//   DB_URL="postgresql://..." node scripts/apply-migrations.mjs
//
// Tries each migration in its own transaction. Stops on first failure.

import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { Client } from "pg";

const DB_URL = process.env.DB_URL;
if (!DB_URL) {
  console.error("DB_URL not set");
  process.exit(1);
}

const dir = resolve("supabase/migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
console.log(`Found ${files.length} migration(s):`, files.join(", "));

const client = new Client({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  console.log("Connecting...");
  await client.connect();
  console.log("Connected.");

  for (const f of files) {
    const sql = readFileSync(join(dir, f), "utf8");
    process.stdout.write(`→ ${f} ... `);
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
  console.log("All migrations applied.");
} finally {
  await client.end();
}
