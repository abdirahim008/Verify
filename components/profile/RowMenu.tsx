"use client";

import { useState } from "react";

// Kebab (⋯) actions menu for a compact list row — Edit / Delete. Shared by
// the company builder's Services, Key personnel and Clients cards so they
// stay in sync. Closes on action or on an outside click (the fixed backdrop).
export function RowMenu({ onEdit, onDelete, pending }: { onEdit: () => void; onDelete: () => void; pending: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label="Actions"
        onClick={() => setOpen((o) => !o)}
        className="w-7 h-7 rounded-md text-muted hover:bg-cream/70 flex items-center justify-center text-[17px] leading-none"
      >
        ⋯
      </button>
      {open && (
        <>
          <button aria-hidden tabIndex={-1} onClick={() => setOpen(false)} className="fixed inset-0 z-10 cursor-default" />
          <div className="absolute right-0 top-8 z-20 w-28 rounded-lg border border-border bg-paper shadow-md py-1">
            <button type="button" onClick={() => { setOpen(false); onEdit(); }} className="block w-full text-left px-3 py-1.5 text-[13px] hover:bg-cream/70">Edit</button>
            <button type="button" disabled={pending} onClick={() => { setOpen(false); onDelete(); }} className="block w-full text-left px-3 py-1.5 text-[13px] text-red-700 hover:bg-red-50">{pending ? "Deleting…" : "Delete"}</button>
          </div>
        </>
      )}
    </div>
  );
}
