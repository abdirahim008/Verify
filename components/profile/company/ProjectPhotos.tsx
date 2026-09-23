"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { downscaleImage } from "@/lib/resizeImage";
import { addProjectMedia, updateProjectMediaCaption, deleteProjectMedia } from "@/lib/actions/company";

// Up to 4 project photos with captions. Resizes client-side (photos, so JPEG),
// uploads to the public profile-media bucket, and persists URL + caption via
// server actions. Renders the existing photos as an editable grid.
//
// Site photos come straight off phones: HEIC from iPhones, 48-megapixel
// 15 MB JPEGs, sideways EXIF orientation. So: accept any image/* (a HEIC
// that the browser can't decode gets a specific message rather than a
// silent reject), allow up to 30 MB before the resize, and decode via
// createImageBitmap (lib/resizeImage) rather than a FileReader→<img>→canvas
// chain, which stalled on very large files and ignored orientation.

interface Media { id: string; url: string; caption: string | null }
const MAX_BYTES = 30 * 1024 * 1024;
const BUCKET = "profile-media";
const MAX = 4;
const BOX_W = 1400, BOX_H = 1050;

function isHeic(file: File): boolean {
  return /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
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
    if (!file.type.startsWith("image/") && !isHeic(file)) { setError("That doesn't look like an image — use a JPEG, PNG, WebP or HEIC photo."); return; }
    if (file.size > MAX_BYTES) { setError("File too large — max 30 MB."); return; }
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase isn't configured.");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to upload.");
      let blob: Blob;
      try {
        blob = await downscaleImage(file, { maxW: BOX_W, maxH: BOX_H, format: "jpeg", quality: 0.85 });
      } catch (e) {
        // Chrome/Android can't decode HEIC at all; Safari can. Say so
        // instead of a generic failure.
        if (isHeic(file)) throw new Error("This browser can't read HEIC photos — on your phone, change the camera format to 'Most compatible' or share the photo as JPEG, then try again.");
        throw new Error(`Couldn't read that image (${e instanceof Error ? e.message : "decode failed"}). Try a JPEG or PNG.`);
      }
      const key = crypto.randomUUID?.() ?? String(Date.now());
      const path = `${user.id}/projects/${projectId}/${key}.jpg`;
      // Unique key per upload → the file never changes; cache for a year.
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, { upsert: true, contentType: "image/jpeg", cacheControl: "31536000" });
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
          <input ref={fileRef} type="file" accept="image/*,.heic,.heif" className="sr-only"
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
