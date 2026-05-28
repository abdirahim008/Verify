import "server-only";

// Thin Resend wrapper. We isolate the provider here so the rest of the
// app talks in terms of "send a verification-request email" rather than
// HTTP/SMTP details. Swapping to another provider (Postmark, SES,
// Mailgun) means changing this file only.
//
// If RESEND_API_KEY or VERIFICATION_INBOX_EMAIL aren't set, sends become
// no-ops and we log a warning. The DB row is still written, so the admin
// panel queue stays accurate even without email — the email is purely
// notification.

const FROM = process.env.SAHAN_FROM_EMAIL || "Sahan <onboarding@resend.dev>";
const INBOX = process.env.VERIFICATION_INBOX_EMAIL || "";
const KEY = process.env.RESEND_API_KEY || "";

export interface VerificationEmailInput {
  requestId: string;
  requesterName: string;
  requesterAccountType: "individual" | "company" | null;
  requesterContactEmail: string | null;
  requesterContactPhone: string;
  targetTypeLabel: string;
  claimLabel: string;
  claimSublabel: string;
  priceAmount: number;
  priceCurrency: string;
  adminUrl: string;
}

export interface EmailSendResult {
  sent: boolean;
  reason?: string;
}

export async function sendVerificationRequestEmail(input: VerificationEmailInput): Promise<EmailSendResult> {
  if (!KEY || !INBOX) {
    console.warn(
      "[email] RESEND_API_KEY or VERIFICATION_INBOX_EMAIL not set — verification email skipped. " +
      "Request id:", input.requestId,
    );
    return { sent: false, reason: "not-configured" };
  }

  // Lazy import so build-time bundles for environments without the env
  // vars still tree-shake out the SDK if we ever import this from a
  // place that doesn't actually need email.
  const { Resend } = await import("resend");
  const resend = new Resend(KEY);

  const subject = `Verification request · ${input.requesterName} · ${input.targetTypeLabel}`;
  const { html, text } = renderEmail(input);

  try {
    await resend.emails.send({
      from: FROM,
      to: INBOX,
      subject,
      html,
      text,
      replyTo: input.requesterContactEmail || undefined,
    });
    return { sent: true };
  } catch (e) {
    console.error("[email] send failed:", e);
    return { sent: false, reason: e instanceof Error ? e.message : "send-failed" };
  }
}

function renderEmail(i: VerificationEmailInput): { html: string; text: string } {
  const price = `${i.priceCurrency} $${i.priceAmount}`;
  const acctRow = i.requesterAccountType ? `Account type: ${i.requesterAccountType}\n` : "";
  const emailRow = i.requesterContactEmail ? `Email: ${i.requesterContactEmail}\n` : "";

  const text = [
    "A new verification request came in through Sahan.",
    "",
    "REQUESTER",
    `Name: ${i.requesterName}`,
    acctRow.trim(),
    `Phone: ${i.requesterContactPhone}`,
    emailRow.trim(),
    "",
    "CLAIM UNDER REVIEW",
    `Type: ${i.targetTypeLabel}`,
    `Claim: ${i.claimLabel}`,
    i.claimSublabel ? `Detail: ${i.claimSublabel}` : "",
    "",
    "PAYMENT",
    `Amount: ${price}`,
    "The requester ticked the payment-acknowledgment checkbox.",
    "",
    "NEXT STEPS",
    `1. Call ${i.requesterContactPhone} with payment instructions.`,
    "2. Once payment is received, run the verification with the named employer/issuer.",
    `3. Mark the claim verified in the admin panel: ${i.adminUrl}`,
    "",
    `Request id: ${i.requestId}`,
  ].filter(Boolean).join("\n");

  const html = `
<!doctype html>
<html><body style="margin:0;padding:0;background:#f3f2ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1c1c1c;">
  <div style="max-width:560px;margin:32px auto;padding:32px;background:#ffffff;border:1px solid #e0e0e0;border-radius:10px;">
    <p style="margin:0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#0a5cad;font-weight:600;">Sahan &middot; new request</p>
    <h1 style="margin:8px 0 4px;font-family:Georgia,serif;font-size:28px;font-weight:500;letter-spacing:-0.02em;">${esc(i.requesterName)}</h1>
    <p style="margin:0;color:#5e6166;font-size:14px;">wants to verify their ${esc(i.targetTypeLabel.toLowerCase())} on Sahan.</p>

    <h2 style="margin:24px 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#5e6166;">Requester</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${row("Name", i.requesterName)}
      ${i.requesterAccountType ? row("Account type", i.requesterAccountType) : ""}
      ${row("Phone", `<a href="tel:${esc(i.requesterContactPhone)}" style="color:#0a5cad;text-decoration:none;">${esc(i.requesterContactPhone)}</a>`)}
      ${i.requesterContactEmail ? row("Email", `<a href="mailto:${esc(i.requesterContactEmail)}" style="color:#0a5cad;text-decoration:none;">${esc(i.requesterContactEmail)}</a>`) : ""}
    </table>

    <h2 style="margin:24px 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#5e6166;">Claim under review</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${row("Type", i.targetTypeLabel)}
      ${row("Claim", i.claimLabel)}
      ${i.claimSublabel ? row("Detail", i.claimSublabel) : ""}
    </table>

    <div style="margin:24px 0 0;padding:16px 18px;background:#f3f2ef;border:1px solid #e0e0e0;border-radius:8px;">
      <p style="margin:0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#0a5cad;font-weight:600;">Payment</p>
      <p style="margin:6px 0 0;font-family:Georgia,serif;font-size:22px;">${price}</p>
      <p style="margin:6px 0 0;font-size:13px;color:#3a3a3d;">The requester ticked the payment-acknowledgment checkbox.</p>
    </div>

    <h2 style="margin:24px 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#5e6166;">Next steps</h2>
    <ol style="margin:0 0 0 18px;padding:0;font-size:14px;line-height:1.6;color:#1c1c1c;">
      <li>Call <strong>${esc(i.requesterContactPhone)}</strong> with payment instructions.</li>
      <li>Once payment is received, run the verification with the named employer/issuer.</li>
      <li>Mark the claim verified in <a href="${esc(i.adminUrl)}" style="color:#0a5cad;">the admin panel</a>.</li>
    </ol>

    <p style="margin:32px 0 0;font-size:11px;color:#8d9197;font-family:ui-monospace,SFMono-Regular,monospace;">Request id: ${esc(i.requestId)}</p>
  </div>
</body></html>`.trim();

  return { html, text };
}

function row(k: string, v: string): string {
  return `<tr><td style="padding:6px 12px 6px 0;color:#5e6166;font-size:12px;letter-spacing:0.02em;width:120px;vertical-align:top;">${esc(k)}</td><td style="padding:6px 0;font-size:14px;color:#1c1c1c;">${v}</td></tr>`;
}

function esc(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[c]!);
}
