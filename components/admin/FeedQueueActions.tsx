"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { adminApproveFeedItem, adminRejectFeedItem, adminRefreshFeed } from "@/lib/actions/feed";

// Two pieces of UI for the admin feed page: per-row Approve/Reject and
// a top-of-page Refresh trigger. Kept in one client file because they
// share the same loading-state idioms.

export function FeedQueueActions({ id, approved }: { id: string; approved: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function go(action: "approve" | "reject") {
    setError(null);
    startTransition(async () => {
      try {
        if (action === "approve") await adminApproveFeedItem({ id });
        else await adminRejectFeedItem({ id });
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't update");
      }
    });
  }

  return (
    <div className="shrink-0">
      {/* `md` size on these so finger-targets clear ~40px on touch. */}
      <div className="flex gap-2">
        {!approved && (
          <Button kind="sienna" size="md" onClick={() => go("approve")} disabled={pending}>
            {pending ? "..." : "Approve"}
          </Button>
        )}
        <Button kind="danger" size="md" onClick={() => go("reject")} disabled={pending}>
          {pending ? "..." : approved ? "Remove" : "Reject"}
        </Button>
      </div>
      {error && <p className="text-[12px] text-red-700 mt-1">{error}</p>}
    </div>
  );
}

export function RefreshFeedButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ fetched: number; inserted: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setError(null); setResult(null);
    startTransition(async () => {
      try {
        const out = await adminRefreshFeed();
        setResult(out);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't refresh");
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      {result && !pending && (
        <span className="text-[12.5px] text-verified">+{result.inserted} new ({result.fetched} fetched)</span>
      )}
      {error && <span className="text-[12.5px] text-red-700">{error}</span>}
      <Button kind="primary" size="md" onClick={refresh} disabled={pending}>
        {pending ? "Refreshing..." : "Refresh feed"}
      </Button>
    </div>
  );
}
