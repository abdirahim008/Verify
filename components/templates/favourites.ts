"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

// Favourite templates, remembered per device in localStorage like the
// chosen colour theme (TemplateActions) — no schema, no network. Kept per
// kind so CV and company favourites don't mix.
//
// Read through useSyncExternalStore: a chooser that mounts on the client
// (the normal case — it renders nothing until opened) sees the saved list
// on its very first render, with no flash of the full grid; one rendered on
// the server hydrates from an empty list without a mismatch, then updates.

export type TemplateKind = "cv" | "company";

const key = (kind: TemplateKind) => `sahan-fav:${kind}`;
const CHANGE = "sahan-fav-change";

function readRaw(kind: TemplateKind): string {
  try { return localStorage.getItem(key(kind)) ?? "[]"; } catch { return "[]"; }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);   // other tabs
  window.addEventListener(CHANGE, onChange);      // this tab
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

function parse(raw: string, valid: readonly string[]): string[] {
  try {
    const ids: unknown = JSON.parse(raw);
    // Drop ids of templates that no longer exist.
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string" && valid.includes(id)) : [];
  } catch {
    return []; // corrupt value — start with none
  }
}

export function useFavouriteTemplates(kind: TemplateKind, valid: readonly string[]) {
  const raw = useSyncExternalStore(subscribe, () => readRaw(kind), () => "[]");
  const validKey = valid.join(",");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const favs = useMemo(() => parse(raw, valid), [raw, validKey]);

  const toggle = useCallback((id: string) => {
    const current = parse(readRaw(kind), valid);
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    try { localStorage.setItem(key(kind), JSON.stringify(next)); } catch { /* ignore */ }
    window.dispatchEvent(new Event(CHANGE));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, validKey]);

  return { favs, isFav: (id: string) => favs.includes(id), toggle };
}
