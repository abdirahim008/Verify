"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { adminVerifyRequest, adminRejectRequest } from "@/lib/actions/verification";

// Two-button form for the admin: short note + Verify or Reject.
// Sienna note becomes the `verified_note` shown next to the badge on the
// PDF + profile, so it should be SHORT (e.g. "UNICEF Somalia", not a
// paragraph). Rejection notes can be longer — they're shown back to the
// requester only.
export function AdminResolveForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function go(action: "verify" | "reject") {
    setError(null);
    const trimmed = note.trim();
    if (action === "verify" && trimmed.length < 1) {
      setError("Add a short note for the badge (e.g. 'UNICEF Somalia')."); return;
    }
    if (action === "reject" && trimmed.length < 1) {
      setError("Explain why so the requester can fix it."); return;
    }
    startTransition(async () => {
      try {
        if (action === "verify") {
          await adminVerifyRequest({ request_id: requestId, verified_note: trimmed });
        } else {
          await adminRejectRequest({ request_id: requestId, admin_note: trimmed });
        }
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't resolve");
      }
    });
  }

  return (
    <div className="mt-3 space-y-3">
      <div>
        <label className="label" htmlFor="resolve-note">Note</label>
        <textarea
          id="resolve-note"
          className="field"
          rows={3}
          placeholder="On verify: short employer attribution shown on the badge (e.g. 'UNICEF Somalia'). On reject: a short reason."
          maxLength={500}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={pending}
        />
        <p className="helper">Visible on the PDF + profile when verifying. Visible to requester when rejecting.</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</div>
      )}

      <div className="flex flex-wrap gap-2 justify-end">
        <Button kind="danger" size="md" onClick={() => go("reject")} disabled={pending}>
          {pending ? "..." : "Mark rejected"}
        </Button>
        <Button kind="sienna" size="md" onClick={() => go("verify")} disabled={pending}>
          {pending ? "..." : "Mark verified"}
        </Button>
      </div>
    </div>
  );
}
