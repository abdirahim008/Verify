import Link from "next/link";
import { notFound } from "next/navigation";
import { loadAdminRequestDetail } from "@/lib/verification-data";
import { TARGET_LABELS } from "@/lib/verification";
import { AdminResolveForm } from "@/components/admin/AdminResolveForm";
import { EvidenceList } from "@/components/admin/EvidenceList";
import { MarkPaidButton } from "@/components/admin/MarkPaidButton";

export const metadata = { title: "Admin · request" };

export default async function AdminRequestDetailPage({ params }: { params: { id: string } }) {
  const detail = await loadAdminRequestDetail(params.id);
  if (!detail) notFound();
  const { request: r, requester, requesterAuthEmail, target } = detail;

  return (
    <div className="max-w-3xl">
      <Link href="/admin" className="text-[12.5px] text-muted hover:text-ink">← Back to queue</Link>

      <header className="mt-3">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="section-eyebrow text-sienna">{TARGET_LABELS[r.target_type]} request</p>
          <StatusPill status={r.status} />
          <PaymentPill payment={r.payment_status} />
        </div>
        <h1 className="font-serif text-[28px] sm:text-[34px] tracking-[-0.02em] mt-2">{requester?.display_name || "(no name)"}</h1>
        <p className="mt-1 text-[13px] text-muted">
          {requester?.account_type} &middot; submitted {new Date(r.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </header>

      <section className="mt-6 card">
        <p className="section-eyebrow text-sienna">Contact the requester</p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-[140px_1fr] text-[14px]">
          {r.contact_phone && (
            <>
              <dt className="text-muted text-[12px] uppercase tracking-[0.08em] font-medium">Phone (preferred)</dt>
              <dd className="text-ink"><a href={`tel:${r.contact_phone}`} className="text-sienna font-medium hover:underline">{r.contact_phone}</a></dd>
            </>
          )}
          {requesterAuthEmail && (
            <>
              <dt className="text-muted text-[12px] uppercase tracking-[0.08em] font-medium">Email</dt>
              <dd><a href={`mailto:${requesterAuthEmail}`} className="text-sienna hover:underline">{requesterAuthEmail}</a></dd>
            </>
          )}
          {!r.contact_phone && !requesterAuthEmail && (
            <dd className="text-muted">No contact info captured — open the requester&apos;s profile.</dd>
          )}
        </dl>
        <p className="mt-3 text-[12.5px] text-muted">
          Step 1: call to arrange payment. Step 2: contact the named employer/issuer. Step 3: mark verified below.
        </p>
      </section>

      <section className="mt-6 card">
        <p className="section-eyebrow">The claim under review</p>
        <ClaimSummary targetType={r.target_type} target={target as Record<string, unknown> | null} />
      </section>

      <section className="mt-6 card">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <p className="section-eyebrow">Payment</p>
          {r.status === "pending" && r.payment_status !== "paid" && (
            <MarkPaidButton requestId={r.id} />
          )}
        </div>
        <p className="mt-2 text-[14px] text-ink-soft">
          {r.price_currency || "USD"} ${r.price_amount ?? 0} &middot; status: <strong className="text-ink">{r.payment_status}</strong>
        </p>
        <p className="mt-1 text-[12px] text-muted">
          Manual workflow: the user ticked the acknowledgment. Once they pay out-of-band, click <em>Mark paid</em>. Marking the request verified also flips this to <em>paid</em> automatically.
        </p>
      </section>

      {/* Legacy evidence section — only render if the request actually has
          files in storage. New requests have none. */}
      {r.evidence_urls.length > 0 && (
        <section className="mt-6 card">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="section-eyebrow">Evidence ({r.evidence_urls.length})</p>
            <p className="text-[11.5px] text-muted">Signed URLs expire after 5 minutes.</p>
          </div>
          <EvidenceList paths={r.evidence_urls} />
        </section>
      )}

      {r.status === "pending" ? (
        <section className="mt-6 card">
          <p className="section-eyebrow text-sienna">Resolve</p>
          <AdminResolveForm requestId={r.id} />
        </section>
      ) : (
        <section className="mt-6 card">
          <p className="section-eyebrow">Resolution</p>
          <p className="mt-2 text-[13.5px] text-ink-soft">
            <strong>{r.status === "verified" ? "Verified" : "Rejected"}</strong> on {r.resolved_at ? new Date(r.resolved_at).toLocaleString() : "—"}.
          </p>
          {r.admin_note && (
            <p className="mt-3 rounded-md bg-cream/60 border border-border-soft p-3 text-[13px] text-ink-soft">
              <span className="font-medium text-ink">Note: </span>{r.admin_note}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function ClaimSummary({ targetType, target }: { targetType: string; target: Record<string, unknown> | null }) {
  if (!target) return <p className="mt-2 text-[13px] text-muted">Claim row not found — it may have been deleted.</p>;
  const t = target as Record<string, string | number | null>;

  switch (targetType) {
    case "experience":
      return (
        <dl className="mt-2 grid gap-2 text-[13.5px] sm:grid-cols-[140px_1fr]">
          <Row k="Title" v={t.title as string} />
          <Row k="Organisation" v={t.organization as string} />
          <Row k="Location" v={t.location as string} />
          <Row k="Dates" v={`${t.start_date ?? "?"} – ${t.end_date ?? "Present"}`} />
          {t.description && <Row k="Description" v={t.description as string} />}
        </dl>
      );
    case "education":
      return (
        <dl className="mt-2 grid gap-2 text-[13.5px] sm:grid-cols-[140px_1fr]">
          <Row k="Institution" v={t.institution as string} />
          <Row k="Qualification" v={t.qualification_level as string} />
          <Row k="Field" v={t.field_of_study as string} />
          <Row k="Years" v={`${t.start_year ?? ""} – ${t.end_year ?? ""}`} />
        </dl>
      );
    case "project":
      return (
        <dl className="mt-2 grid gap-2 text-[13.5px] sm:grid-cols-[140px_1fr]">
          <Row k="Project" v={t.project_name as string} />
          <Row k="Client" v={t.client_name as string} />
          <Row k="Sector" v={t.sector as string} />
          <Row k="Value" v={t.value_amount != null ? `${t.currency ?? "USD"} ${t.value_amount}` : ""} />
          <Row k="Years" v={`${t.year_start ?? ""} – ${t.year_end ?? ""}`} />
          {t.scope && <Row k="Scope" v={t.scope as string} />}
        </dl>
      );
    case "certification":
      return (
        <dl className="mt-2 grid gap-2 text-[13.5px] sm:grid-cols-[140px_1fr]">
          <Row k="Name" v={t.name as string} />
          <Row k="Issuer" v={t.issuer as string} />
          <Row k="Year" v={t.year as number} />
        </dl>
      );
    default:
      return null;
  }
}

function Row({ k, v }: { k: string; v: string | number | null | undefined }) {
  if (!v) return null;
  return (
    <>
      <dt className="text-muted text-[12px] uppercase tracking-[0.08em] font-medium">{k}</dt>
      <dd className="text-ink whitespace-pre-wrap">{v}</dd>
    </>
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

function PaymentPill({ payment }: { payment: "unpaid" | "paid" | "waived" }) {
  const styles = {
    unpaid: "bg-amber-50 border border-amber-200 text-amber-800",
    paid:   "bg-verified-soft text-verified",
    waived: "bg-cream border border-border text-muted",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.1em] ${styles[payment]}`}>
      Payment: {payment}
    </span>
  );
}
