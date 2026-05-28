"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";

// Error boundary for everything under (app). Catches uncaught render
// errors and gives the user a friendly retry instead of the raw Next
// error overlay. Logs to console (and Vercel runtime logs by extension)
// so we can correlate with reports.
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[app] error boundary:", error); }, [error]);
  return (
    <div className="max-w-xl mx-auto py-12">
      <p className="section-eyebrow text-red-700">Something went wrong</p>
      <h1 className="font-serif text-[32px] tracking-[-0.02em] mt-3">We couldn&apos;t load this page.</h1>
      <p className="mt-3 text-[14px] text-ink-soft">
        It&apos;s probably a transient issue. Try again — if it keeps happening, sign out and back in.
      </p>
      {error.digest && (
        <p className="mt-2 text-[12px] text-muted font-mono">Error id: {error.digest}</p>
      )}
      <div className="mt-6 flex gap-3">
        <Button kind="primary" size="md" onClick={reset}>Try again</Button>
        <Link href="/home"><Button kind="ghost" size="md">Back to home</Button></Link>
      </div>
    </div>
  );
}
