"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { addProjectMedia, updateProjectMediaCaption, deleteProjectMedia } from "@/lib/actions/company";

// Up to 4 project photos with captions. Resizes client-side (photos, so JPEG),
// uploads to the public profile-media bucket, and persists URL + caption via
// server actions. Renders the existing photos as an editable grid.

interface Media { id: string; url: string; caption: string | null }
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 12 * 1024 * 1024;
const BUCKET = "profile-media";
const MAX = 4;
const BOX_W = 1400, BOX_H = 1050;

async function resizeToJpeg(file: File): Promise<Blob> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const fr = new FileReader(); fr.onload = () => res(fr.result as string); fr.onerror = () => rej(new Error("Couldn't read the file")); fr.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("Couldn't load the image")); i.src = dataUrl;
  });
  const scale = Math.min(BOX_W / img.width, BOX_H / img.height, 1);
  const w = Math.max(1, Math.round(img.width * scale)), h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas not supported");
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h);
  return new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Couldn't process the image"))), "image/jpeg", 0.85));
}

export function ProjectPhotos({ projectId, initial }: { projectId: string; initial: Media[] }) {
  const [items, setItems] = useState<Media[]>(initial);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handle(file: File) {
    setError(null);
    if (items.length >= MAX) { setError(`Up to ${MAX} photos.`); return; }
    if (!ACCEPT.includes(file.type)) { setError("Use JPEG, PNG or WebP."); return; }
    if (file.size > MAX_BYTES) { setError("File too large — max 12 MB."); return; }
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase isn't configured.");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to upload.");
      const blob = await resizeToJpeg(file);
      const key = crypto.randomUUID?.() ?? String(Date.now());
      const path = `${user.id}/projects/${projectId}/${key}.jpg`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, { upsert: true, contentType: "image/jpeg", cacheControl: "3600" });
      if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
      const url = `${supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
      const id = await addProjectMedia(projectId, { url, caption: "" });
      setItems((prev) => [...prev, { id, url, caption: "" }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't upload");
    } finally {
      setBusy(false);
    }
  }

  function remove(id: string) {
    const prev = items;
    setItems(items.filter((m) => m.id !== id));
    startTransition(async () => { try { await deleteProjectMedia(id); } catch { setItems(prev); } });
  }

  function saveCaption(id: string, caption: string) {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, caption } : m)));
    startTransition(async () => { try { await updateProjectMediaCaption(id, caption); } catch { /* keep local */ } });
  }

  return (
    <div>
      <p className="label">Project photos <span className="text-muted font-normal">({items.length}/{MAX})</span></p>
      <p className="helper mb-2">Up to 4 photos of the work, each with an optional caption. Shown in the gallery on your public profile.</p>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {items.map((m) => (
            <div key={m.id} className="rounded-[10px] border border-border bg-cream/40 overflow-hidden">
              <div className="relative aspect-[4/3] bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <button type="button" aria-label="Remove photo" onClick={() => remove(m.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink/70 text-paper text-[14px] leading-none hover:bg-ink">×</button>
              </div>
              <input
                className="field !rounded-none !border-0 !border-t border-border text-[12.5px] !py-2"
                placeholder="Caption (optional)"
                defaultValue={m.caption ?? ""}
                maxLength={200}
                onBlur={(e) => { if ((e.target.value.trim() || "") !== (m.caption ?? "")) saveCaption(m.id, e.target.value.trim()); }}
              />
            </div>
          ))}
        </div>
      )}

      {items.length < MAX && (
        <div className="mt-3">
          <input ref={fileRef} type="file" accept={ACCEPT.join(",")} className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); e.currentTarget.value = ""; }} />
          <Button type="button" kind="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? "Uploading…" : "+ Add photo"}
          </Button>
        </div>
      )}
      {error && <p className="text-[12px] text-red-700 mt-1.5">{error}</p>}
    </div>
  );
}
