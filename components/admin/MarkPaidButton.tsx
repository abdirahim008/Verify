"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { adminMarkPaid } from "@/lib/actions/verification";

// Admin button that flips payment_status to 'paid' without verifying
// the claim yet. Used in the gap between receiving payment and finishing
// the actual employer-confirmation step.
export function MarkPaidButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      kind="quiet" size="sm" disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
            await adminMarkPaid({ request_id: requestId });
            router.refresh();
          } catch (e) {
            alert(e instanceof Error ? e.message : "Couldn't update");
          }
        });
      }}
    >
      {pending ? "..." : "Mark paid"}
    </Button>
  );
}
