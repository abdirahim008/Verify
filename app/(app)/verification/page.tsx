import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadOwnRequests, type VerificationRequestRow } from "@/lib/verification-data";
import { TARGET_LABELS } from "@/lib/verification";
import { FEATURES } from "@/lib/flags";
import { Button } from "@/components/Button";
import { CancelRequestButton } from "@/components/verification/CancelRequestButton";

export const metadata = { title: "Verification" };

export default async function VerificationPage() {
  // Feature hidden for this release (lib/flags.ts) — no public entry point.
  if (!FEATURES.verification) redirect("/home");
  const supabase = createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const requests = await loadOwnRequests(user.id);
  const pending = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status !== "pending");

  return (
    <div className="max-w-3xl">
      <p className="section-eyebrow text-sienna">Verification</p>
      <h1 className="font-serif text-[32px] sm:text-[40px] tracking-[-0.02em] mt-2">Your verification requests</h1>
      <p className="mt-2 text-[14.5px] text-ink-soft max-w-xl leading-relaxed">
        Request verification on a specific experience, education entry, project, or certification.
        Sahan contacts the employer or institution and a green badge appears on the claim once confirmed.
      </p>

      <div className="mt-6">
        <Link href="/profile">
          <Button kind="secondary" size="md">Go to your profile to request →</Button>
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="section-eyebrow">In progress &middot; {pending.length}</h2>
        <div className="mt-3 space-y-3">
          {pending.length === 0 && (
            <p className="text-[13.5px] text-muted">No requests in progress. Go to your profile and click <em>Request verification</em> on a claim.</p>
          )}
          {pending.map((r) => <RequestRow key={r.id} r={r} cancellable />)}
        </div>
      </section>

      {resolved.length > 0 && (
        <section className="mt-10">
          <h2 className="section-eyebrow">Resolved &middot; {resolved.length}</h2>
          <div className="mt-3 space-y-3">
            {resolved.map((r) => <RequestRow key={r.id} r={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function RequestRow({ r, cancellable }: { r: VerificationRequestRow; cancellable?: boolean }) {
  return (
    <article className="card border border-border bg-paper">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="section-eyebrow">{TARGET_LABELS[r.target_type]}</span>
            <StatusPill status={r.status} />
            {r.payment_status !== "paid" && (
              <span className="text-[10.5px] uppercase tracking-[0.14em] text-muted">Payment: {r.payment_status}</span>
            )}
          </div>
          <p className="text-[13.5px] text-ink-soft mt-2">
            Submitted {new Date(r.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
            {r.price_amount != null && (
              <> &middot; <span className="text-ink">{r.price_currency || "USD"} ${r.price_amount}</span></>
            )}
            {r.evidence_urls.length > 0 && <> &middot; {r.evidence_urls.length} file{r.evidence_urls.length === 1 ? "" : "s"}</>}
          </p>
          {r.admin_note && (
            <p className="mt-3 rounded-md bg-cream/60 border border-border-soft p-3 text-[13px] text-ink-soft">
              <span className="font-medium text-ink">Admin note: </span>{r.admin_note}
            </p>
          )}
        </div>
        {cancellable && (
          <div className="shrink-0"><CancelRequestButton id={r.id} /></div>
        )}
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: "pending" | "verified" | "rejected" }) {
  const styles = {
    pending:  "bg-cream border border-border text-muted",
    verified: "bg-verified-soft text-verified",
    rejected: "bg-red-50 border border-red-200 text-red-700",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.1em] ${styles[status]}`}>
      {status}
    </span>
  );
}
