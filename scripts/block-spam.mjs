// Sweep every profile through lib/spam.ts and block the link-spam ones.
//
//   node scripts/block-spam.mjs          # dry run — prints what it would block
//   node scripts/block-spam.mjs --apply  # sets profiles.blocked = true
//
// Uses the SAME detector as the signup forms (transpiled from lib/spam.ts on
// the fly) so the sweep and the save-time guard can't drift apart. Needs
// migration 0011 for --apply; the dry run works regardless.

import { readFileSync } from "node:fs";
import ts from "typescript";

const APPLY = process.argv.includes("--apply");

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!BASE || !KEY) { console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local"); process.exit(1); }
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const get = async (path) => (await fetch(`${BASE}/rest/v1/${path}`, { headers: H })).json();

// Load the real detector.
const { outputText } = ts.transpileModule(readFileSync("lib/spam.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const mod = { exports: {} };
new Function("exports", "require", "module", outputText)(mod.exports, () => ({}), mod);
const { spamVerdict } = mod.exports;

const [profiles, ind, co] = await Promise.all([
  get("profiles?select=id,display_name,account_type,created_at"),
  get("individual_details?select=profile_id,full_name,headline,summary"),
  get("company_details?select=profile_id,company_name,tagline,about"),
]);
const contentTables = ["experiences", "educations", "skills", "certifications", "company_projects", "company_services", "company_team", "company_clients"];
const counts = new Map();
for (const t of contentTables) {
  for (const r of await get(`${t}?select=profile_id`)) counts.set(r.profile_id, (counts.get(r.profile_id) ?? 0) + 1);
}
const blockedRows = await get("profiles?select=id,blocked");
const haveColumn = Array.isArray(blockedRows);
const alreadyBlocked = new Set(haveColumn ? blockedRows.filter((r) => r.blocked).map((r) => r.id) : []);

const indBy = new Map(ind.map((r) => [r.profile_id, r]));
const coBy = new Map(co.map((r) => [r.profile_id, r]));

const hits = [];
for (const p of profiles) {
  const d = indBy.get(p.id), c = coBy.get(p.id);
  const input = p.account_type === "company"
    ? { name: c?.company_name || p.display_name || "", headline: c?.tagline, summary: c?.about, contentCount: counts.get(p.id) ?? 0 }
    : { name: d?.full_name || p.display_name || "", headline: d?.headline, summary: d?.summary, contentCount: counts.get(p.id) ?? 0 };
  const v = spamVerdict(input);
  if (v.spam) hits.push({ id: p.id, name: input.name, joined: String(p.created_at).slice(0, 10), reason: v.reason, already: alreadyBlocked.has(p.id) });
}

console.log(`${profiles.length} profiles scanned → ${hits.length} flagged as spam (${hits.filter((h) => h.already).length} already blocked)\n`);
for (const h of hits) console.log(`  ${h.already ? "✓" : "•"} ${h.name.slice(0, 48).padEnd(48)} ${h.joined}  ${h.reason}`);

if (!APPLY) { console.log("\nDry run. Re-run with --apply to block the unblocked ones."); process.exit(0); }
if (!haveColumn) { console.error("\nprofiles.blocked doesn't exist yet — run supabase/migrations/0011_blocked.sql first."); process.exit(1); }

let n = 0;
for (const h of hits.filter((x) => !x.already)) {
  const res = await fetch(`${BASE}/rest/v1/profiles?id=eq.${h.id}`, {
    method: "PATCH", headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ blocked: true, blocked_reason: `auto: ${h.reason}` }),
  });
  if (res.ok) n++; else console.error(`  failed for ${h.name}: ${res.status} ${await res.text()}`);
}
console.log(`\nBlocked ${n} profile(s).`);
