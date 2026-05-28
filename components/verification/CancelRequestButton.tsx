"use client";

import { useTransition } from "react";
import { Button } from "@/components/Button";
import { cancelVerificationRequest } from "@/lib/actions/verification";

// User-facing cancel button on /verification rows. Confirms before deleting
// the request + best-effort cleans up uploaded evidence.
export function CancelRequestButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      kind="ghost" size="sm" disabled={pending} className="text-red-700 hover:bg-red-50"
      onClick={() => {
        if (!confirm("Cancel this verification request? Evidence files will be deleted.")) return;
        startTransition(async () => {
          try { await cancelVerificationRequest(id); }
          catch (e) { alert(e instanceof Error ? e.message : "Couldn't cancel"); }
        });
      }}
    >
      {pending ? "..." : "Cancel"}
    </Button>
  );
}
