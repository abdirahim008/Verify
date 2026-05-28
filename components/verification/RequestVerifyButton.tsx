"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { RequestVerificationModal } from "./RequestVerificationModal";
import { PendingBadge } from "@/components/PendingBadge";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import type { TargetType } from "@/lib/verification";

interface Props {
  verified: boolean;
  verifiedNote?: string | null;
  pending: boolean;
  target: { type: TargetType; id: string; label: string; sublabel?: string };
}

// Per-claim verification trigger. Renders one of three states based on the
// claim's current status:
//   verified → the green badge (interactive control is unnecessary)
//   pending  → a quiet "Pending review" marker
//   neither  → "Request verification" button that opens the modal
//
// Drops cleanly into any section card's header row.
export function RequestVerifyButton({ verified, verifiedNote, pending, target }: Props) {
  const [open, setOpen] = useState(false);
  if (verified) return <VerifiedBadge note={verifiedNote || undefined} />;
  if (pending) return <PendingBadge />;
  return (
    <>
      <Button kind="quiet" size="sm" onClick={() => setOpen(true)}>Request verification</Button>
      <RequestVerificationModal open={open} onClose={() => setOpen(false)} target={target} />
    </>
  );
}
