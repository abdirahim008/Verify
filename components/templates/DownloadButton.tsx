"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@/components/Button";
import { cn } from "@/lib/cn";
import { downloadFile } from "@/lib/download";

// Download a generated PDF with feedback: "Preparing…" while the server
// renders it (a few seconds, longer on a cold start), and a readable message
// if it fails, instead of the browser saving the error as a .json file.
export function DownloadButton({
  href, fallbackName, label = "Download", kind = "primary", size = "md", className, wrapClassName,
}: {
  href: string;
  fallbackName: string;
  label?: string;
  kind?: ButtonProps["kind"];
  size?: ButtonProps["size"];
  className?: string;
  wrapClassName?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const r = await downloadFile(href, { fallbackName, expect: /application\/pdf/ });
    setBusy(false);
    if (!r.ok) setError(r.message);
  }

  return (
    <div className={cn("min-w-0", wrapClassName)}>
      <Button type="button" kind={kind} size={size} className={cn("w-full", className)} onClick={run} disabled={busy} aria-busy={busy}>
        {busy && <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden />}
        {busy ? "Preparing…" : label}
      </Button>
      {error && <p role="alert" className="mt-1.5 text-[12px] leading-snug text-red-700">{error}</p>}
    </div>
  );
}
