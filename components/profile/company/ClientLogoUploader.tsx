"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Per-client logo uploader. Resizes the chosen image CLIENT-SIDE to fit a fixed
// box (so every client logo is normalised to the same scale, and we never push
// a huge file), exports PNG to preserve transparency, uploads to the public
// profile-media bucket, and hands the public URL back via onChange. The form
// owns the value and persists it with the client row on submit.

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_BYTES = 5 * 1024 * 1024;
const BUCKET = "profile-media";
// Logos are normalised to fit inside this box (contain, aspect preserved).
const BOX_W = 400;
const BOX_H = 200;

async function resizeToPng(file: File): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error("Couldn't read the file"));
    fr.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Couldn't load the image"));
    i.src = dataUrl;
  });
  const scale = Math.min(BOX_W / img.width, BOX_H / img.height, 1);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't process the image"))), "image/png"),
  );
}

export function ClientLogoUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File) {
    setError(null);
    if (!ACCEPT.includes(file.type)) { setError("Use PNG, JPEG, WebP, GIF or SVG."); return; }
    if (file.size > MAX_BYTES) { setError("File too large — max 5 MB."); return; }
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase isn't configured.");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to upload.");
      // SVGs are already scalable; raster types get resized to the box.
      const blob = file.type === "image/svg+xml" ? file : await resizeToPng(file);
      const ext = file.type === "image/svg+xml" ? "svg" : "png";
      const key = (crypto.randomUUID?.() ?? String(Date.now()));
      const path = `${user.id}/client-logos/${key}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, {
        upsert: true, contentType: blob.type || (ext === "svg" ? "image/svg+xml" : "image/png"), cacheControl: "3600",
      });
      if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(`${pub.publicUrl}?v=${Date.now()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't upload");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-[120px] h-[60px] shrink-0 rounded-md border border-border bg-cream flex items-center justify-center overflow-hidden">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="max-w-full max-h-full object-contain" />
        ) : (
          <span className="text-muted text-[10px] uppercase tracking-[0.14em] font-semibold">Logo</span>
        )}
      </div>
      <div className="min-w-0">
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT.join(",")}
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); e.currentTarget.value = ""; }}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" kind="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? "Uploading…" : value ? "Replace logo" : "Upload logo"}
          </Button>
          {value && (
            <Button type="button" kind="ghost" size="sm" onClick={() => onChange("")} disabled={busy} className="text-red-700 hover:bg-red-50">
              Remove
            </Button>
          )}
        </div>
        <p className="text-[11px] text-muted mt-1.5">Resized to fit {BOX_W}×{BOX_H}. Transparent PNG looks best. Optional — name shows if no logo.</p>
        {error && <p className="text-[12px] text-red-700 mt-1">{error}</p>}
      </div>
    </div>
  );
}
