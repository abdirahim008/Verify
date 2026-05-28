// Probes the Supabase Session Pooler in each common region until one
// accepts the connection. Once we find the right region, the URL is
// printed and the migration runner can use it.
import { Client } from "pg";

const REF = "itgngxqqrxmighpwarhu";
const PASSWORD = process.env.DB_PASSWORD;
if (!PASSWORD) { console.error("DB_PASSWORD missing"); process.exit(1); }

const REGIONS = [
  // Africa / Europe (likeliest for an East-Africa user)
  "af-south-1", "eu-central-2", "eu-north-1", "eu-west-3", "me-south-1", "me-central-1",
  // Asia-Pacific
  "ap-northeast-1", "ap-northeast-2", "ap-east-1", "ap-southeast-3",
  // Americas
  "ca-central-1", "us-west-2",
];

for (const region of REGIONS) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const url = `postgresql://postgres.${REF}:${encodeURIComponent(PASSWORD)}@${host}:5432/postgres`;
  process.stdout.write(`trying ${region} ... `);
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, statement_timeout: 5000 });
  try {
    const t0 = Date.now();
    await Promise.race([
      client.connect(),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 6000)),
    ]);
    const r = await client.query("select current_database(), version()");
    const ms = Date.now() - t0;
    console.log(`OK (${ms}ms) — ${r.rows[0].current_database}`);
    console.log(`\nCONNECT URL:\n${url.replace(encodeURIComponent(PASSWORD), "***")}\n`);
    console.log(`REGION=${region}`);
    await client.end();
    process.exit(0);
  } catch (e) {
    console.log(`fail (${e.message})`);
    try { await client.end(); } catch {}
  }
}
console.error("no region accepted the connection");
process.exit(1);
