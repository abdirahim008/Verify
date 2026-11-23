import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { fetchJobs, selectJobs, type JobItem } from "@/lib/jobs/feed";
import { emailsConfigured, memberEmailEnv, unsubscribeUrl } from "@/lib/onboarding-emails";
import { SITE } from "@/lib/seo";

// Weekly job alert: every Sunday (/api/cron/job-alerts, with a catch-up run
// on Monday) each individual
// member gets the week's new jobs from the SomKenJobs feed, matched to their
// career interests when they've picked some, each with a link that opens the
// cover-letter helper on that job.
//
// Who gets it: individual accounts that are not blocked, have not
// unsubscribed, have a confirmed email, joined more than a week ago (the
// first week belongs to the onboarding reminders) and signed in within the
// last 90 days. That last rule is what stops the email going out for ever to
// people who have left; mailing them only earns spam reports.
//
// No new tables: email_log (migration 0012) records one row per member per
// week under kind "jobs_<that week's Sunday>", so a re-run can never send
// twice, and
// the unsubscribe link sets the same profiles.email_opt_out as every other
// member email.

const DAY = 86_400_000;
/** Jobs posted in the last week (plus slack for the cron's start time). */
const FRESH_MS = 7.5 * DAY;
const ACTIVE_MS = 90 * DAY;
const ONBOARDING_MS = 7 * DAY;
const MAX_JOBS = 6;
/** Emails per request to Resend's batch endpoint (it takes up to 100).
 *  Smaller batches lose less when one is refused, e.g. on a plan's daily
 *  sending limit: the refused batch is retried by the next run. */
const BATCH = 50;

export const JOB_ALERT_KIND_PREFIX = "jobs_";

/** The alert week `d` belongs to, named by its Sunday: "2026-11-22". Weeks
 *  run Sunday to Saturday, so Monday's catch-up run (vercel.json) shares
 *  Sunday's key and only reaches members that run missed. */
export function alertWeek(d: Date): string {
  const sunday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - d.getUTCDay()));
  return sunday.toISOString().slice(0, 10);
}

/** Posted this week and still open. */
export function freshJobs(jobs: JobItem[], now: number): JobItem[] {
  return jobs.filter((j) => {
    if (!j.postedAt || now - Date.parse(j.postedAt) > FRESH_MS) return false;
    // A deadline is a date; the job stays open through that day.
    return !j.deadlineISO || Date.parse(j.deadlineISO) + DAY > now;
  });
}

interface Picks { jobs: JobItem[]; matched: number; personalised: boolean }

/** The member's matches first, topped up with the week's other new jobs. */
export function pickJobs(fresh: JobItem[], categories: string[]): Picks {
  const sel = selectJobs(fresh, categories, MAX_JOBS);
  if (!sel.personalised) return { jobs: sel.items, matched: 0, personalised: false };
  const seen = new Set(sel.items.map((j) => j.link));
  const rest = fresh.filter((j) => !seen.has(j.link)).slice(0, MAX_JOBS - sel.items.length);
  return { jobs: [...sel.items, ...rest], matched: sel.items.length, personalised: true };
}

// ── Content ─────────────────────────────────────────────────────────────
interface Message { subject: string; html: string; text: string }

export function composeJobAlert(displayName: string, picks: Picks, unsub: string): Message {
  const first = displayName.trim().split(/\s+/)[0] ?? "";
  const hi = first ? `Hi ${first},` : "Hi,";
  const n = picks.jobs.length;
  const plural = (k: number) => (k === 1 ? "job" : "jobs");

  const subject = picks.matched > 0
    ? `${picks.matched} new ${plural(picks.matched)} in your field this week`
    : `${n} new ${plural(n)} this week`;
  const intro = picks.matched > 0
    ? (picks.matched === n
        ? `${n === 1 ? "This job was" : `These ${n} jobs were`} posted this week and ${n === 1 ? "matches" : "match"} your career interests.`
        : `${n} jobs were posted this week. The first ${picks.matched === 1 ? "one matches" : `${picks.matched} match`} your career interests.`)
    : picks.personalised
      ? `Nothing new in your sectors this week. Here ${n === 1 ? "is the latest job" : `are the ${n} latest jobs`} from other fields.`
      : `Here ${n === 1 ? "is a job" : `are ${n} jobs`} posted this week.`;
  const helper = "Found one you like? Sahan can draft a cover letter for it from your profile.";
  const nudge = picks.personalised ? "" : "Want jobs matched to your field? Pick your career interests on your profile.";

  const letterUrl = (j: JobItem) => `${SITE.url}/cover-letter?job=${encodeURIComponent(j.link)}`;
  const meta = (j: JobItem) => [j.org, j.location, j.deadline ? `closes ${j.deadline}` : ""].filter(Boolean).join(" · ");

  const text = [
    hi, "", intro, helper, "",
    ...picks.jobs.flatMap((j) => [j.title, meta(j), `View: ${j.link}`, `Write a cover letter: ${letterUrl(j)}`, ""]),
    `See all jobs: ${SITE.url}/home`,
    ...(nudge ? ["", `${nudge} ${SITE.url}/profile`] : []),
    "", "The Sahan team", SITE.url.replace(/^https?:\/\//, ""), "",
    `You're receiving this weekly email because you have a Sahan account. Unsubscribe: ${unsub}`,
  ].join("\n");

  const jobsHtml = picks.jobs.map((j) => `
    <tr><td style="padding:14px 0;border-top:1px solid #ececec;">
      <a href="${esc(j.link)}" style="font-family:Georgia,serif;font-size:17px;line-height:1.35;color:#1c1c1c;text-decoration:none;">${esc(j.title)}</a>
      ${meta(j) ? `<div style="margin-top:4px;font-size:13px;line-height:1.5;color:#5e6166;">${esc(meta(j))}</div>` : ""}
      <div style="margin-top:8px;font-size:13.5px;">
        <a href="${esc(letterUrl(j))}" style="color:#0a5cad;font-weight:600;text-decoration:none;">Write a cover letter &rarr;</a>
        <span style="color:#c9c4ba;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="${esc(j.link)}" style="color:#5e6166;text-decoration:none;">View job</a>
      </div>
    </td></tr>`).join("");

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f3f2ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1c1c1c;">
  <div style="max-width:540px;margin:28px auto;padding:30px 28px;background:#ffffff;border:1px solid #e0e0e0;border-radius:12px;">
    <p style="margin:0 0 18px;font-family:Georgia,serif;font-size:20px;letter-spacing:-0.01em;">Sahan</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">${esc(hi)}</p>
    <p style="margin:0 0 6px;font-size:15px;line-height:1.6;">${esc(intro)}</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">${esc(helper)}</p>
    <table role="presentation" style="width:100%;border-collapse:collapse;border-bottom:1px solid #ececec;">${jobsHtml}
    </table>
    <p style="margin:22px 0 22px;"><a href="${esc(SITE.url)}/home" style="display:inline-block;background:#0a5cad;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:8px;">See all jobs &rarr;</a></p>
    ${nudge ? `<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#3a3a3d;">${esc(nudge)} <a href="${esc(SITE.url)}/profile" style="color:#0a5cad;">Choose interests</a></p>` : ""}
    <p style="margin:0;font-size:14px;color:#3a3a3d;">The Sahan team</p>
  </div>
  <p style="max-width:540px;margin:0 auto 28px;padding:0 28px;font-size:11.5px;line-height:1.5;color:#8d9197;">
    You're receiving this weekly email because you have a Sahan account.
    <a href="${esc(unsub)}" style="color:#8d9197;">Unsubscribe</a>
  </p>
</body></html>`;

  return { subject, html, text };
}

function esc(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[c]!);
}

function envelope(to: string, msg: Message, unsub: string) {
  const { from, replyTo } = memberEmailEnv();
  return {
    from, to, subject: msg.subject, html: msg.html, text: msg.text,
    replyTo: replyTo || undefined,
    headers: { "List-Unsubscribe": `<${unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  };
}

// ── The weekly run ──────────────────────────────────────────────────────
type Svc = NonNullable<ReturnType<typeof createSupabaseServiceClient>>;

export interface JobAlertRun {
  week: string;
  newJobs: number;
  /** Individual members who could be emailed at all (not blocked or unsubscribed). */
  members: number;
  sent: number;
  /** Why members were left out, by reason. */
  skipped: Record<string, number>;
  dryRun: boolean;
  /** Set when the run stopped early or a batch failed. */
  note?: string;
  /** A batch could not be claimed or sent; the route answers 500. */
  failed?: boolean;
}

interface Member { id: string; display_name: string | null; career_categories: string[] | null }

/** PostgREST returns at most 1000 rows per request; page through them. */
async function selectAll<T>(page: (from: number, to: number) => PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await page(from, from + 999);
    if (error) throw new Error(error.message);
    const rows = (data as T[] | null) ?? [];
    out.push(...rows);
    if (rows.length < 1000) return out;
  }
}

async function authUsers(svc: Svc) {
  const byId = new Map<string, { email: string; confirmed: boolean; lastSeen: number }>();
  for (let page = 1; ; page++) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(error.message);
    for (const u of data.users) {
      byId.set(u.id, {
        email: u.email ?? "",
        confirmed: !!u.email_confirmed_at,
        lastSeen: Date.parse(u.last_sign_in_at ?? u.created_at),
      });
    }
    if (data.users.length < 1000) return byId;
  }
}

/** `deadline` (ms epoch) stops new batches so the route ends inside its time limit. */
export async function runJobAlerts(opts: { dryRun?: boolean; deadline?: number } = {}): Promise<JobAlertRun> {
  const now = Date.now();
  const week = alertWeek(new Date(now));
  const kind = `${JOB_ALERT_KIND_PREFIX}${week}`;
  const run: JobAlertRun = { week, newJobs: 0, members: 0, sent: 0, skipped: {}, dryRun: !!opts.dryRun };
  const skip = (why: string) => { run.skipped[why] = (run.skipped[why] ?? 0) + 1; };

  const cfg = emailsConfigured();
  if (!cfg.ok) return { ...run, note: cfg.reason };
  const svc = createSupabaseServiceClient();
  if (!svc) return { ...run, note: "SUPABASE_SERVICE_ROLE_KEY is not set" };

  const fresh = freshJobs(await fetchJobs(60), now);
  run.newJobs = fresh.length;
  if (fresh.length === 0) return { ...run, note: "no new jobs this week" };

  const [members, users, already] = await Promise.all([
    selectAll<Member>((from, to) => svc.from("profiles")
      .select("id, display_name, career_categories")
      .eq("account_type", "individual").eq("blocked", false).eq("email_opt_out", false)
      .lte("created_at", new Date(now - ONBOARDING_MS).toISOString())
      .order("id").range(from, to)),
    authUsers(svc),
    selectAll<{ profile_id: string }>((from, to) => svc.from("email_log")
      .select("profile_id").eq("kind", kind).order("profile_id").range(from, to)),
  ]);
  run.members = members.length;
  const sentAlready = new Set(already.map((r) => r.profile_id));

  const queue: Array<{ id: string; to: string; msg: Message; unsub: string }> = [];
  for (const m of members) {
    if (sentAlready.has(m.id)) { skip("already sent this week"); continue; }
    const u = users.get(m.id);
    if (!u?.email || !u.confirmed) { skip("no confirmed email"); continue; }
    if (now - u.lastSeen > ACTIVE_MS) { skip("not signed in for 90 days"); continue; }
    const picks = pickJobs(fresh, m.career_categories ?? []);
    if (picks.jobs.length === 0) { skip("no jobs to show"); continue; }
    const unsub = unsubscribeUrl(m.id);
    queue.push({ id: m.id, to: u.email, msg: composeJobAlert(m.display_name ?? "", picks, unsub), unsub });
  }
  if (opts.dryRun) return { ...run, sent: queue.length };

  const { Resend } = await import("resend");
  const resend = new Resend(memberEmailEnv().key);
  for (let i = 0; i < queue.length; i += BATCH) {
    if (opts.deadline && Date.now() > opts.deadline) {
      run.note = `stopped for time with ${queue.length - i} left; run again to finish`;
      break;
    }
    const batch = queue.slice(i, i + BATCH);
    // Claim the (member, week) slots first so an overlapping run can't also
    // send; only the rows this run inserted come back.
    const { data: claimed, error: claimErr } = await svc.from("email_log")
      .upsert(batch.map((b) => ({ profile_id: b.id, kind })), { onConflict: "profile_id,kind", ignoreDuplicates: true })
      .select("profile_id");
    if (claimErr) { run.note = `email_log: ${claimErr.message}`; run.failed = true; break; }
    const mine = new Set(((claimed as Array<{ profile_id: string }> | null) ?? []).map((r) => r.profile_id));
    const sending = batch.filter((b) => mine.has(b.id));
    for (let k = sending.length; k < batch.length; k++) skip("already sent this week");
    if (sending.length === 0) continue;

    let failure = "";
    try {
      const { error } = await resend.batch.send(sending.map((b) => envelope(b.to, b.msg, b.unsub)));
      if (error) failure = error.message;
    } catch (e) {
      failure = e instanceof Error ? e.message : "send failed";
    }
    if (failure) {
      // Release the claims so the next run retries these members.
      await svc.from("email_log").delete().eq("kind", kind).in("profile_id", sending.map((b) => b.id));
      console.error(`[job-alerts] batch of ${sending.length} failed:`, failure);
      run.note = `a batch failed: ${failure}`;
      run.failed = true;
      break;
    }
    run.sent += sending.length;
    // Stay under Resend's default rate limit (2 requests/second).
    if (i + BATCH < queue.length) await new Promise((res) => setTimeout(res, 600));
  }
  return run;
}

/** Send this week's alert to one member now, for an admin to check it. Not
 *  logged, so it never uses up that member's weekly send. Falls back to the
 *  latest jobs when nothing was posted this week, so there is always
 *  something to look at. */
export async function sendJobAlertTest(profileId: string): Promise<{ sent: boolean; reason?: string; to?: string }> {
  const cfg = emailsConfigured();
  if (!cfg.ok) return { sent: false, reason: cfg.reason };
  const svc = createSupabaseServiceClient();
  if (!svc) return { sent: false, reason: "SUPABASE_SERVICE_ROLE_KEY is not set" };

  const [{ data: prof }, { data: auth }, jobs] = await Promise.all([
    svc.from("profiles").select("display_name, career_categories").eq("id", profileId).maybeSingle(),
    svc.auth.admin.getUserById(profileId),
    fetchJobs(60),
  ]);
  const to = auth?.user?.email;
  if (!to) return { sent: false, reason: "your account has no email address" };
  const fresh = freshJobs(jobs, Date.now());
  const picks = pickJobs(fresh.length ? fresh : jobs, (prof?.career_categories as string[] | null) ?? []);
  if (picks.jobs.length === 0) return { sent: false, reason: "the jobs feed is empty right now" };

  const unsub = unsubscribeUrl(profileId);
  const msg = composeJobAlert(prof?.display_name ?? "", picks, unsub);
  try {
    const { Resend } = await import("resend");
    const { error } = await new Resend(memberEmailEnv().key).emails.send(envelope(to, { ...msg, subject: `[Test] ${msg.subject}` }, unsub));
    if (error) throw new Error(error.message);
    return { sent: true, to };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : "send failed" };
  }
}

/** For the admin Metrics page: the most recent weekly run. */
export async function loadJobAlertStats(): Promise<{ lastWeek: string; lastCount: number } | null> {
  const svc = createSupabaseServiceClient();
  if (!svc) return null;
  const { data: latest } = await svc.from("email_log").select("kind")
    .like("kind", `${JOB_ALERT_KIND_PREFIX}%`).order("sent_at", { ascending: false }).limit(1).maybeSingle();
  if (!latest?.kind) return null;
  const { count } = await svc.from("email_log").select("profile_id", { count: "exact", head: true }).eq("kind", latest.kind);
  return { lastWeek: String(latest.kind).slice(JOB_ALERT_KIND_PREFIX.length), lastCount: count ?? 0 };
}
