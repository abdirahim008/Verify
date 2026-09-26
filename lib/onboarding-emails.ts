import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { loadOnboardingProgress, type OnboardingProgress } from "@/lib/onboarding";
import { SITE } from "@/lib/seo";

// Onboarding emails to members: a welcome when they first land in the
// builder, then reminders on day 1 and day 4 while their download is still
// locked (sent by /api/cron/onboarding-emails). Every email is recorded in
// public.email_log, so each member gets each email at most once, and every
// email carries a one-click unsubscribe.
//
// Setup (Vercel env): RESEND_API_KEY, and SAHAN_MEMBERS_FROM_EMAIL (or
// SAHAN_FROM_EMAIL) on a domain verified in Resend, e.g.
// "Sahan <hello@sahanprofiles.com>". Until then every send is a logged no-op.

export type OnboardingKind = "welcome" | "reminder_1" | "reminder_2";

const KEY = process.env.RESEND_API_KEY || "";
const FROM = process.env.SAHAN_MEMBERS_FROM_EMAIL || process.env.SAHAN_FROM_EMAIL || "";
const REPLY_TO = process.env.SAHAN_REPLY_TO_EMAIL || "";

export function emailsConfigured(): { ok: true } | { ok: false; reason: string } {
  if (!KEY) return { ok: false, reason: "RESEND_API_KEY is not set" };
  // Resend's shared test sender only delivers to the account owner.
  if (!FROM || /@resend\.dev>?$/i.test(FROM.trim())) {
    return { ok: false, reason: "sender must be an address on your own domain verified in Resend" };
  }
  return { ok: true };
}

// ── Unsubscribe links ───────────────────────────────────────────────────
function tokenSecret() {
  return process.env.EMAIL_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}
function unsubscribeToken(profileId: string) {
  return createHmac("sha256", tokenSecret()).update(`unsubscribe:${profileId}`).digest("base64url").slice(0, 32);
}
export function verifyUnsubscribeToken(profileId: string, token: string) {
  if (!tokenSecret() || !profileId || !token) return false;
  const a = Buffer.from(unsubscribeToken(profileId));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
function unsubscribeUrl(profileId: string) {
  return `${SITE.url}/api/email/unsubscribe?u=${profileId}&t=${unsubscribeToken(profileId)}`;
}

// ── Send ────────────────────────────────────────────────────────────────
export interface SendResult { sent: boolean; reason?: string }

export async function sendOnboardingEmail(profileId: string, kind: OnboardingKind): Promise<SendResult> {
  const cfg = emailsConfigured();
  if (!cfg.ok) {
    console.warn(`[onboarding-email] ${kind} skipped: ${cfg.reason}`);
    return { sent: false, reason: cfg.reason };
  }
  const svc = createSupabaseServiceClient();
  if (!svc) return { sent: false, reason: "SUPABASE_SERVICE_ROLE_KEY is not set" };

  const { data: prof } = await svc
    .from("profiles").select("account_type, display_name, blocked, email_opt_out")
    .eq("id", profileId).maybeSingle();
  if (!prof) return { sent: false, reason: "no profile" };
  if (prof.blocked) return { sent: false, reason: "blocked" };
  if (prof.email_opt_out) return { sent: false, reason: "unsubscribed" };

  const { data: auth } = await svc.auth.admin.getUserById(profileId);
  const to = auth?.user?.email;
  if (!to || !auth?.user?.email_confirmed_at) return { sent: false, reason: "no confirmed email" };

  const progress = await loadOnboardingProgress(profileId, prof.account_type, svc);
  // Reminders exist to unlock the download; once it's unlocked, stop.
  if (kind !== "welcome" && progress.minCore) return { sent: false, reason: "already unlocked" };

  // Claim the (member, email) slot before sending, so two overlapping runs
  // can't both send. Released again if the send fails.
  const { error: claimErr } = await svc.from("email_log").insert({ profile_id: profileId, kind });
  if (claimErr) return { sent: false, reason: claimErr.code === "23505" ? "already sent" : claimErr.message };

  const unsub = unsubscribeUrl(profileId);
  const msg = compose(kind, progress, prof.display_name ?? "", unsub);
  try {
    const { Resend } = await import("resend");
    const { error } = await new Resend(KEY).emails.send({
      from: FROM,
      to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      replyTo: REPLY_TO || undefined,
      headers: {
        "List-Unsubscribe": `<${unsub}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    if (error) throw new Error(error.message);
    return { sent: true };
  } catch (e) {
    await svc.from("email_log").delete().eq("profile_id", profileId).eq("kind", kind);
    const reason = e instanceof Error ? e.message : "send failed";
    console.error(`[onboarding-email] ${kind} to ${profileId} failed:`, reason);
    return { sent: false, reason };
  }
}

// ── Content ─────────────────────────────────────────────────────────────
interface Message { subject: string; html: string; text: string }

function compose(kind: OnboardingKind, p: OnboardingProgress, displayName: string, unsub: string): Message {
  const isCompany = p.kind === "company";
  const name = displayName.trim();
  const first = isCompany ? name : name.split(/\s+/)[0] ?? "";
  const hi = first ? `Hi ${first},` : "Hi,";
  const required = p.steps.filter((s) => s.required);
  const left = required.filter((s) => !s.done).length;
  const cta = `${SITE.url}/profile${p.next ? `#sec-${p.next.id}` : ""}`;
  const noun = p.noun;                                    // "CV" | "company profile"
  const reward = isCompany
    ? "a polished company profile PDF you can attach to any bid, and a public page you can send to clients"
    : "a professional CV in 8 templates, and your own profile link to send to employers";

  let subject: string;
  let paras: string[];
  let button: string;
  let showSteps = true;

  if (kind === "welcome") {
    subject = `Welcome to Sahan${first ? `, ${first}` : ""}`;
    paras = [
      hi,
      `Thanks for joining Sahan. Your ${noun} unlocks after ${required.length} short steps:`,
    ];
    button = isCompany ? "Build my company profile" : "Build my CV";
  } else if (kind === "reminder_1") {
    subject = p.started
      ? `${first ? `${first}, your` : "Your"} ${noun} is ${p.percent}% done`
      : `${first ? `${first}, your` : "Your"} ${noun} is waiting`;
    paras = [
      hi,
      `You're ${left} short step${left === 1 ? "" : "s"} away from downloading your ${noun}.`
        + (p.next ? ` Next up: ${lowerFirst(p.next.label)}.` : ""),
    ];
    button = `Continue my ${noun}`;
  } else {
    subject = `Finish your ${noun} in about 10 minutes`;
    showSteps = false;
    paras = [
      hi,
      `Your Sahan ${noun} is still locked. Finishing it gets you ${reward}.`,
      p.next ? `The next step is to ${lowerFirst(p.next.label)}. It only takes a few minutes.` : "",
      "This is the last reminder we'll send about it.",
    ].filter(Boolean);
    button = `Finish my ${noun}`;
  }

  const outro = kind === "welcome"
    ? `Most people finish in about 10 minutes. Then you get ${reward}.`
    : "";

  // Plain text first; the HTML mirrors it.
  const text = [
    ...paras,
    ...(showSteps ? required.map((s) => `${s.done ? "[x]" : "[ ]"} ${s.label}`) : []),
    outro,
    `${button}: ${cta}`,
    "",
    "The Sahan team",
    SITE.url.replace(/^https?:\/\//, ""),
    "",
    `You're receiving this because you created a Sahan account. Unsubscribe: ${unsub}`,
  ].filter((l) => l !== undefined).join("\n");

  const stepsHtml = showSteps
    ? `<table role="presentation" style="margin:4px 0 18px;border-collapse:collapse;">${required.map((s) => `
        <tr><td style="padding:5px 10px 5px 0;vertical-align:top;">${s.done
          ? `<span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#067a5e;color:#fff;font-size:12px;line-height:18px;text-align:center;">&#10003;</span>`
          : `<span style="display:inline-block;width:16px;height:16px;border-radius:50%;border:1.5px solid #c9c4ba;"></span>`}</td>
        <td style="padding:5px 0;font-size:15px;color:${s.done ? "#8d9197" : "#1c1c1c"};${s.done ? "text-decoration:line-through;" : ""}">${esc(s.label)}</td></tr>`).join("")}
      </table>`
    : "";

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f3f2ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1c1c1c;">
  <div style="max-width:540px;margin:28px auto;padding:30px 28px;background:#ffffff;border:1px solid #e0e0e0;border-radius:12px;">
    <p style="margin:0 0 18px;font-family:Georgia,serif;font-size:20px;letter-spacing:-0.01em;">Sahan</p>
    ${paras.map((t) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;">${esc(t)}</p>`).join("")}
    ${stepsHtml}
    ${outro ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;">${esc(outro)}</p>` : ""}
    <p style="margin:6px 0 26px;"><a href="${esc(cta)}" style="display:inline-block;background:#0a5cad;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:8px;">${esc(button)} &rarr;</a></p>
    <p style="margin:0;font-size:14px;color:#3a3a3d;">The Sahan team</p>
  </div>
  <p style="max-width:540px;margin:0 auto 28px;padding:0 28px;font-size:11.5px;line-height:1.5;color:#8d9197;">
    You're receiving this because you created a Sahan account.
    <a href="${esc(unsub)}" style="color:#8d9197;">Unsubscribe</a>
  </p>
</body></html>`;

  return { subject, html, text };
}

function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function esc(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[c]!);
}

// Exported for local previews only.
export const __composeForPreview = compose;
