"use client";

import { useState, useTransition } from "react";
import { sendMeJobAlertTest } from "@/lib/actions/email-prefs";

// "Send me a test" for the weekly job alert, on /admin/metrics.
export function JobAlertTest() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  function send() {
    setResult(null);
    startTransition(async () => {
      try {
        const r = await sendMeJobAlertTest();
        setResult(r.sent ? { ok: true, text: `Sent to ${r.to}. Check your inbox.` } : { ok: false, text: `Not sent: ${r.reason}.` });
      } catch {
        setResult({ ok: false, text: "Not sent: something went wrong." });
      }
    });
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button
        type="button" onClick={send} disabled={pending}
        className="rounded-[7px] border border-ink px-4 py-2 min-h-[40px] text-[13.5px] font-medium hover:bg-ink hover:text-paper transition disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send me a test"}
      </button>
      {result && <span className={`text-[13px] ${result.ok ? "text-verified" : "text-red-700"}`} role="status">{result.text}</span>}
    </div>
  );
}
