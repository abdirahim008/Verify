"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { createVerificationRequest } from "@/lib/actions/verification";
import {
  PRICING_BY_TARGET, type TargetType, TARGET_LABELS,
} from "@/lib/verification";

interface Props {
  open: boolean;
  onClose: () => void;
  target: {
    type: TargetType;
    id: string;
    label: string;       // human-readable: "Senior Health Coordinator · UNICEF Somalia"
    sublabel?: string;   // optional: dates / location
  };
}

// Verification request form. Manual / email-based payment flow:
//   1. Show price.
//   2. Collect contact phone.
//   3. Require explicit payment-acknowledgment checkbox.
//   4. Submit → DB row + email to Sahan inbox.
//   5. Sahan calls the user about payment, then runs verification.
// No file uploads in this flow — Sahan requests supporting docs by email
// later if needed.
export function RequestVerificationModal({ open, onClose, target }: Props) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [ack, setAck] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!open) return null;
  const price = PRICING_BY_TARGET[target.type];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = phone.trim();
    if (trimmed.length < 5) { setError("Enter a contact number we can reach you on."); return; }
    if (!ack) { setError("Tick the payment acknowledgment to continue."); return; }

    startTransition(async () => {
      try {
        const requestId = crypto.randomUUID();
        await createVerificationRequest({
          id: requestId,
          target_type: target.type,
          target_id: target.id,
          contact_phone: trimmed,
          accept_payment: true,
        });
        setDone(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't submit");
      }
    });
  }

  function closeAndRefresh() {
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal>
      <button aria-label="Close" onClick={done ? closeAndRefresh : onClose} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
      {/* `dvh` so the modal respects iOS Safari's collapsing toolbar.
          Falls back to `vh` on older browsers automatically. */}
      <div className="relative w-full sm:max-w-lg bg-paper rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] sm:max-h-[90dvh] overflow-y-auto">
        <header className="px-6 pt-6 pb-4 border-b border-border-soft">
          <p className="section-eyebrow text-sienna">Request verification &middot; {TARGET_LABELS[target.type]}</p>
          <h2 className="font-serif text-[22px] tracking-tightish mt-2">{target.label}</h2>
          {target.sublabel && <p className="text-[12.5px] text-muted mt-1">{target.sublabel}</p>}
        </header>

        {done ? (
          <div className="px-6 py-8 text-center">
            <div className="mx-auto w-10 h-10 rounded-full bg-verified-soft text-verified flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 11 11"><circle cx="5.5" cy="5.5" r="5.5" fill="currentColor"/><path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
            </div>
            <h3 className="font-serif text-[22px] tracking-tightish mt-3">Request received.</h3>
            <p className="mt-2 text-[14px] text-ink-soft max-w-sm mx-auto">
              We&apos;ve emailed our verification team. Someone will call <span className="font-medium text-ink">{phone}</span> within 2 business days to arrange payment, then start verification with the named employer.
            </p>
            <div className="mt-6">
              <Button kind="primary" size="md" onClick={closeAndRefresh}>Done</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 py-5 space-y-5">
            {/* Price card with explicit acknowledgment checkbox */}
            <div className="rounded-md bg-cream/70 border border-border-soft p-4">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted font-semibold">Verification fee</p>
                  <p className="font-serif text-[26px] mt-1">${price.amount} <span className="text-[13px] text-muted">{price.currency}</span></p>
                </div>
                <span className="text-[11px] uppercase tracking-[0.14em] text-sienna font-semibold">One-off</span>
              </div>
              <p className="text-[12.5px] text-ink-soft mt-2">{price.note}</p>

              <label className="mt-4 flex items-start gap-2.5 text-[13px] text-ink-soft cursor-pointer">
                <input
                  type="checkbox"
                  checked={ack}
                  onChange={(e) => { setAck(e.target.checked); setError(null); }}
                  disabled={pending}
                  className="mt-0.5 rounded border-border accent-sienna"
                />
                <span>
                  I acknowledge the <strong>{price.currency} ${price.amount}</strong> verification fee. I understand Sahan will contact me by phone to arrange payment <em>before</em> starting verification — no charge today.
                </span>
              </label>
            </div>

            {/* Contact phone */}
            <div>
              <label htmlFor="ve-phone" className="label">Contact phone</label>
              <input
                id="ve-phone"
                type="tel"
                inputMode="tel"
                placeholder="+252 61 555 0184"
                className="field"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(null); }}
                disabled={pending}
                required
                maxLength={40}
                autoComplete="tel"
              />
              <p className="helper">We&apos;ll call this number to arrange payment. Visible to admin only.</p>
            </div>

            {/* What happens next */}
            <div className="rounded-md border border-border-soft bg-cream/40 p-4">
              <p className="section-eyebrow">What happens next</p>
              <ol className="mt-2 space-y-1.5 text-[13px] text-ink-soft list-decimal pl-4">
                <li>We email our verification team with your request.</li>
                <li>Within 2 business days, we call you to arrange payment.</li>
                <li>Once paid, we contact the named employer/issuer to confirm the claim.</li>
                <li>The green verified badge appears on your profile + every CV/PDF you download.</li>
              </ol>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-soft">
              <Button type="button" kind="ghost" size="md" onClick={onClose} disabled={pending}>Cancel</Button>
              <Button type="submit" kind="sienna" size="md" disabled={pending}>
                {pending ? "Submitting..." : "Submit request"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
