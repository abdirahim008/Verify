// End-to-end PDF smoke test.
//
// 1. Seeds rich sample profile data for the FIRST auth user (only filling
//    sections that are empty — your real edits are never overwritten).
// 2. Mints a session for that user via the admin generateLink → verifyOtp
//    flow, then builds the @supabase/ssr cookie format by hand.
// 3. Downloads /api/cv/{editorial,sidebar,mono} from the running dev
//    server and checks: HTTP 200, %PDF magic, page count, and that the
//    intended display fonts actually embedded (their names appear in the
//    PDF font dictionaries — if Chromium fell back to system fonts they
//    won't).
//
// Usage:
//   DB_URL=postgresql://... node scripts/render-test.mjs
// Requires: dev server on localhost:3000, .env.local with Supabase keys.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { Client } from "pg";
import { createClient } from "@supabase/supabase-js";

const DB_URL = process.env.DB_URL;
if (!DB_URL) { console.error("DB_URL not set"); process.exit(1); }

// Pull Supabase keys from .env.local so the script works without exports.
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const SUPA_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const APP = "http://localhost:3000";
const REF = new URL(SUPA_URL).hostname.split(".")[0];

const pg = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
await pg.connect();

// ── 1. find user + seed sample data where empty ────────────────────
const { rows: users } = await pg.query("select id, email from auth.users order by created_at limit 1");
if (!users.length) { console.error("No auth users — sign up in the app first."); process.exit(1); }
const { id: uid, email } = users[0];
console.log(`User: ${email} (${uid})`);

await pg.query(`insert into public.profiles (id, account_type, display_name)
  values ($1,'individual','Ifrah Hassan Abdi') on conflict (id) do nothing`, [uid]);

const { rows: det } = await pg.query("select full_name from public.individual_details where profile_id=$1", [uid]);
if (!det.length || !det[0].full_name) {
  await pg.query(`insert into public.individual_details
    (profile_id, full_name, headline, summary, location, phone, email, languages)
    values ($1,'Ifrah Hassan Abdi','Senior Health Coordinator — Maternal & Child Health',
    'Public health practitioner with eleven years coordinating maternal, newborn and child health programmes across south-central Somalia. Designed and led the regional cold-chain expansion for Banadir under UNICEF, raising routine immunisation coverage from 41% to 73% in twenty-two months. Comfortable across donor lines and at home in the field.',
    'Mogadishu, Somalia','+252 61 555 0184','ifrah.abdi@example.so',
    array['Somali (native)','English (fluent)','Arabic (working)'])
    on conflict (profile_id) do update set
      full_name=excluded.full_name, headline=excluded.headline, summary=excluded.summary,
      location=excluded.location, phone=excluded.phone, email=excluded.email, languages=excluded.languages`, [uid]);
  console.log("Seeded basics.");
}

const { rows: expCount } = await pg.query("select count(*)::int n from public.experiences where profile_id=$1", [uid]);
if (expCount[0].n === 0) {
  await pg.query(`insert into public.experiences
    (profile_id, organization, title, location, start_date, end_date, description, verified, verified_note, verified_at) values
    ($1,'UNICEF Somalia','Senior Health Coordinator','Mogadishu','2021-03-01',null,
     'Lead a team of fourteen across Banadir, Lower Shabelle and Middle Shabelle. Designed the cold-chain expansion that brought routine immunisation to 64 previously unreached settlements. Manage a $4.3M annual portfolio across three donor lines.',
     true,'UNICEF Somalia',now()),
    ($1,'Save the Children International','MNCH Programme Manager','Baidoa','2017-08-01','2021-02-01',
     'Managed antenatal and obstetric-emergency programming across Bay region. Built the referral protocol now used by five MoH facilities; trained 96 community midwives.',
     true,'Save the Children',now()),
    ($1,'Somali Red Crescent Society','Field Health Officer','Galkayo','2014-06-01','2017-07-01',
     'Front-line clinical and outreach work during the 2017 drought response. Co-authored the SRCS rapid-assessment toolkit.',
     false,null,null)`, [uid]);
  console.log("Seeded experiences (2 verified).");
}

const { rows: eduCount } = await pg.query("select count(*)::int n from public.educations where profile_id=$1", [uid]);
if (eduCount[0].n === 0) {
  await pg.query(`insert into public.educations
    (profile_id, institution, qualification_level, field_of_study, start_year, end_year, verified, verified_note, verified_at) values
    ($1,'London School of Hygiene & Tropical Medicine','masters','Public Health for Development',2019,2020,true,'LSHTM Registry',now()),
    ($1,'Benadir University','degree','Nursing & Midwifery — first-class honours',2010,2014,false,null,null)`, [uid]);
  console.log("Seeded educations (1 verified).");
}

const { rows: skCount } = await pg.query("select count(*)::int n from public.skills where profile_id=$1", [uid]);
if (skCount[0].n === 0) {
  const skills = ["Programme design","Cold-chain logistics","Donor reporting (BHA, ECHO, FCDO)","KoboToolbox / DHIS2","Cluster coordination","Budget management","Field security"];
  for (const s of skills) await pg.query("insert into public.skills (profile_id, name) values ($1,$2)", [uid, s]);
  console.log("Seeded skills.");
}

const { rows: ctCount } = await pg.query("select count(*)::int n from public.certifications where profile_id=$1", [uid]);
if (ctCount[0].n === 0) {
  await pg.query(`insert into public.certifications (profile_id, name, issuer, year, verified, verified_note, verified_at) values
    ($1,'Humanitarian Logistics','Fritz Institute',2022,true,'Fritz Institute',now()),
    ($1,'PMD Pro Level 1','PM4NGOs',2020,false,null,null)`, [uid]);
  console.log("Seeded certifications (1 verified).");
}
await pg.end();

// ── 1b. dedicated COMPANY test account (created once, reused) ───────
// The company PDF routes require account_type='company', so we keep a
// separate synthetic user rather than flipping the real account's type.
const COMPANY_EMAIL = "render-test-company@sahan.dev";
const admin = createClient(SUPA_URL, SERVICE, { auth: { persistSession: false } });

const pg2 = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
await pg2.connect();
let { rows: cu } = await pg2.query("select id from auth.users where email=$1", [COMPANY_EMAIL]);
let companyUid;
if (!cu.length) {
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email: COMPANY_EMAIL,
    email_confirm: true,
    user_metadata: { account_type: "company", display_name: "Wadani Engineering Group" },
  });
  if (cErr) { console.error("createUser:", cErr.message); process.exit(1); }
  companyUid = created.user.id;
  console.log("Created company test user.");
} else {
  companyUid = cu[0].id;
}

const { rows: cdet } = await pg2.query("select company_name from public.company_details where profile_id=$1", [companyUid]);
if (!cdet.length || !cdet[0].company_name) {
  await pg2.query(`insert into public.company_details
    (profile_id, company_name, about, mission, vision, country, registration_number, founded_year, website, email, sectors, core_services)
    values ($1,'Wadani Engineering Group',
    'Wadani Engineering Group is a Somali civil-engineering and project-management firm founded in 2012. We deliver donor-funded infrastructure — roads, water, healthcare and education facilities — across south-central Somalia and the Federal Member States. Our staff are Somali engineers, surveyors and community-engagement specialists who live and work in the regions we serve.',
    'To build infrastructure that withstands the climate, the politics, and the next generation.',
    'A Horn of Africa where every region''s public infrastructure is built and maintained by its own people.',
    'Somalia','MOG-2012-04419',2012,'wadani-eg.so','info@wadani-eg.so',
    array['Roads & bridges','Water & sanitation','Health facilities','Education facilities','Renewable energy'],
    array['Design & feasibility studies','Construction supervision','Turnkey delivery','Climate-resilient retrofits'])
    on conflict (profile_id) do update set company_name=excluded.company_name, about=excluded.about,
      mission=excluded.mission, vision=excluded.vision, country=excluded.country,
      registration_number=excluded.registration_number, founded_year=excluded.founded_year,
      website=excluded.website, sectors=excluded.sectors, core_services=excluded.core_services`, [companyUid]);
  await pg2.query(`insert into public.company_projects
    (profile_id, project_name, client_name, sector, value_amount, currency, year_start, year_end, scope, verified, verified_note, verified_at) values
    ($1,'Banadir Rural Road Programme — Phase II','World Bank / FGS','Roads',8200000,'USD',2022,2024,
     'Rehabilitation of 47km of feeder roads connecting nine villages to the Afgooye corridor; community-employment model delivered 312 jobs.',true,'World Bank Mogadishu Office',now()),
    ($1,'Hirshabelle Health Posts (12 facilities)','UNICEF Somalia','Health',3600000,'USD',2021,2023,
     'Design and construction of twelve climate-resilient primary-health posts across Middle Shabelle and Hiran, including solar power and water-harvesting systems.',true,'UNICEF Somalia',now()),
    ($1,'Galmudug Boreholes (24 sites)','UNHCR','Water',2100000,'USD',2020,2022,
     'Solar-pumped boreholes serving displaced and host populations; full O&M handover to the Galmudug Ministry of Water.',false,null,null)`, [companyUid]);
  await pg2.query(`insert into public.company_clients (profile_id, client_name, display_public) values
    ($1,'World Bank',true),($1,'UNICEF',true),($1,'UNHCR',true),($1,'FCDO',true)`, [companyUid]);
  await pg2.query(`insert into public.company_team (profile_id, person_name, role) values
    ($1,'Eng. Abdirahman Yusuf','Managing Director'),
    ($1,'Eng. Hodan Mohamed','Director of Operations'),
    ($1,'Khadija Abdullahi','Head of Finance')`, [companyUid]);
  await pg2.query(`insert into public.company_certifications (profile_id, name, issuer, year, verified, verified_note, verified_at) values
    ($1,'ISO 9001:2015','Bureau Veritas',2023,true,'Bureau Veritas',now()),
    ($1,'FIDIC Member Firm','FIDIC',2021,false,null,null)`, [companyUid]);
  console.log("Seeded company profile.");
}
await pg2.end();

// ── 2. mint sessions ────────────────────────────────────────────────
async function mintCookie(userEmail) {
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({ type: "magiclink", email: userEmail });
  if (linkErr) { console.error("generateLink:", linkErr.message); process.exit(1); }
  const anon = createClient(SUPA_URL, ANON, { auth: { persistSession: false } });
  const { data: otpData, error: otpErr } = await anon.auth.verifyOtp({ type: "email", token_hash: linkData.properties.hashed_token });
  if (otpErr || !otpData.session) { console.error("verifyOtp:", otpErr?.message); process.exit(1); }
  // @supabase/ssr cookie format: "base64-" + base64url(JSON), chunked at
  // 3180 chars (sb-<ref>-auth-token.0, .1, ... when over the limit).
  const raw = "base64-" + Buffer.from(JSON.stringify(otpData.session)).toString("base64url");
  const CHUNK = 3180;
  const parts = [];
  if (raw.length <= CHUNK) parts.push(`sb-${REF}-auth-token=${raw}`);
  else for (let i = 0; i * CHUNK < raw.length; i++) parts.push(`sb-${REF}-auth-token.${i}=${raw.slice(i * CHUNK, (i + 1) * CHUNK)}`);
  return parts.join("; ");
}

const cookieHeader = await mintCookie(email);
const companyCookie = await mintCookie(COMPANY_EMAIL);
console.log("Sessions minted.");

// ── 3. render the three PDFs ────────────────────────────────────────
mkdirSync("test-output", { recursive: true });
// Names as they appear in embedded font dictionaries (Type 3 subsets use
// hyphenated family names; CID subsets use camel case).
const CHECK_FONTS = {
  editorial: ["Fraunces", "Newsreader"],
  sidebar: ["Archivo"],
  mono: ["Space-Grotesk", "IBMPlexMono"],
};
// Fonts that mean a glyph fell back to a SYSTEM font — fails the test
// because serverless chromium has no system fonts (would render tofu).
const BANNED_FONTS = ["Consolas", "CambriaMath", "SegoeUI", "ArialMT", "TimesNewRoman"];

let allOk = true;
async function renderAndCheck(path, outName, cookie, requiredFonts, minPages) {
  process.stdout.write(`→ ${path} ... `);
  const res = await fetch(`${APP}${path}`, { headers: { cookie } });
  if (!res.ok) {
    console.log(`HTTP ${res.status}`);
    console.error("  ", (await res.text()).slice(0, 300));
    allOk = false; return;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const isPdf = buf.subarray(0, 5).toString() === "%PDF-";
  const text = buf.toString("latin1");
  const pages = (text.match(/\/Type\s*\/Page[^s]/g) || []).length;
  const fonts = requiredFonts.map((f) => `${f}:${text.includes(f) ? "✓" : "✗"}`).join(" ");
  const banned = BANNED_FONTS.filter((f) => text.includes(f));
  const ok = isPdf && pages >= minPages && requiredFonts.every((f) => text.includes(f)) && banned.length === 0;
  if (!ok) allOk = false;
  // EBUSY = the previous artifact is open in a PDF viewer — skip the write,
  // the assertions above are what matter.
  try { writeFileSync(`test-output/${outName}.pdf`, buf); }
  catch { process.stdout.write("(viewer holds old file — write skipped) "); }
  console.log(`${ok ? "OK" : "PROBLEM"} — ${(buf.length / 1024).toFixed(0)}KB, ${pages} page(s), fonts: ${fonts}${banned.length ? `, system fallbacks: ${banned.join(",")}` : ""}`);
}

for (const t of ["editorial", "sidebar", "mono"]) {
  await renderAndCheck(`/api/cv/${t}`, `cv-${t}`, cookieHeader, CHECK_FONTS[t], 1);
}
// Company templates render 3 fixed pages each; all share Serif 4 + Public
// Sans (Type 3 subsets embed hyphenated family names).
for (const t of ["wadani", "annual", "minimal"]) {
  await renderAndCheck(`/api/company/${t}`, `company-${t}`, companyCookie, ["Source-Serif-4", "Public-Sans"], 3);
}

// Themed + preview spot-checks: a non-default palette per kind must
// render, and ?preview=1 must serve inline (for the iframe preview).
for (const [path, cookie] of [
  ["/api/cv/editorial?theme=forest&preview=1", cookieHeader],
  ["/api/company/annual?theme=burgundy&preview=1", companyCookie],
]) {
  process.stdout.write(`→ ${path} ... `);
  const res = await fetch(`${APP}${path}`, { headers: { cookie } });
  const buf = Buffer.from(await res.arrayBuffer());
  const disp = res.headers.get("content-disposition") || "";
  const ok = res.ok && buf.subarray(0, 5).toString() === "%PDF-" && disp.startsWith("inline");
  if (!ok) { allOk = false; console.log(`PROBLEM — HTTP ${res.status}, disposition: ${disp}`); }
  else console.log(`OK — themed, inline`);
}

console.log(allOk ? "\nAll templates rendered with intended fonts. PDFs in test-output/." : "\nSomething's off — see above.");
process.exit(allOk ? 0 : 1);
