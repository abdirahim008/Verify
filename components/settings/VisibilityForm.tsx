"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { cn } from "@/lib/cn";
import {
  VISIBILITY_LABELS, type VisibilityLevel,
  type SectionDef,
} from "@/lib/visibility";
import { saveVisibility } from "@/lib/actions/visibility";

const LEVELS: VisibilityLevel[] = ["public", "registered_only", "private"];

export function VisibilityForm({
  sections, initial,
}: { sections: SectionDef[]; initial: Record<string, VisibilityLevel> }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const dirty = LEVELS.some((_) => false) || JSON.stringify(values) !== JSON.stringify(initial);

  function setLevel(key: string, level: VisibilityLevel) {
    setValues((v) => ({ ...v, [key]: level }));
    setSavedAt(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await saveVisibility({ section_visibility: values });
        setSavedAt(Date.now());
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save");
      }
    });
  }

  return (
    <form onSubmit={submit}>
      <ul className="space-y-3">
        {sections.map((s) => (
          <li key={s.key} className="card border border-border bg-paper">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-serif text-[18px] tracking-tightish">{s.label}</p>
                <p className="text-[13px] text-muted mt-0.5">{s.description}</p>
                {s.alwaysPrivate && (
                  <p className="mt-1 text-[12px] text-muted">🔒 Locked private — third-party protection.</p>
                )}
                {s.cap === "registered_only" && !s.alwaysPrivate && (
                  <p className="mt-1 text-[12px] text-muted">🔒 Cannot be set public.</p>
                )}
              </div>
              <fieldset className="flex flex-wrap gap-1 rounded-full bg-cream border border-border p-1" aria-label={`${s.label} visibility`}>
                {LEVELS.map((level) => {
                  const disabled = s.alwaysPrivate || (s.cap === "registered_only" && level === "public");
                  const selected = values[s.key] === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      disabled={disabled}
                      onClick={() => setLevel(s.key, level)}
                      className={cn(
                        "rounded-full px-3 py-1 text-[12.5px] font-medium transition",
                        selected ? "bg-ink text-paper" : "text-ink-soft hover:text-ink",
                        disabled && "opacity-40 cursor-not-allowed",
                      )}
                    >
                      {VISIBILITY_LABELS[level]}
                    </button>
                  );
                })}
              </fieldset>
            </div>
          </li>
        ))}
      </ul>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" kind="primary" size="md" disabled={pending || !dirty}>
          {pending ? "Saving..." : "Save visibility"}
        </Button>
        {savedAt && !pending && (
          <span className="text-[12.5px] text-verified">Saved</span>
        )}
      </div>
    </form>
  );
}
