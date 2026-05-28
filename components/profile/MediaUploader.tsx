"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { cn } from "@/lib/cn";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Kind = "avatar" | "logo";

interface Props {
  kind: Kind;
  currentUrl: string | null;
  /** Server action that persists the URL (or null on remove). */
  onSave: (url: string | null) => Promise<void>;
}

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const BUCKET = "profile-media";

// Image uploader for the basics card on /profile. Talks directly to
// Supabase Storage (browser client) so the file bytes don't go through
// our Next server, then calls the small `onSave` action to persist the
// URL on the user's row.
//
// Public bucket → URLs are embeddable in CV / company PDFs without
// signed URLs. Cache busting via ?v=<timestamp> in the saved URL so
// the new image shows immediately after replace.
export function MediaUploader({ kind, currentUrl, onSave }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Local preview so the new image shows immediately while the URL
  // round-trips through the server action.
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const displayUrl = localPreview ?? currentUrl;
  const isAvatar = kind === "avatar";
  const shapeClass = isAvatar ? "rounded-full" : "rounded-lg";
  const labelText = isAvatar ? "Photo" : "Logo";
  const hint = isAvatar
    ? "Square crops cleanly. JPEG / PNG / WebP, up to 5 MB."
    : "Use a transparent PNG if you have one. Up to 5 MB.";

  async function handle(file: File) {
    setError(null);
    if (!ACCEPT.includes(file.type)) {
      setError("Use JPEG, PNG, WebP, or GIF."); return;
    }
    if (file.size > MAX_BYTES) {
      setError("File too large — max 5 MB."); return;
    }
    // Optimistic local preview while we upload + save.
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        if (!supabase) throw new Error("Supabase isn't configured.");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Sign in to upload.");

        const ext = (file.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const path = `${user.id}/${kind}.${ext}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: "3600",
        });
        if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        // Cache-busting query so the browser doesn't hold the stale image.
        const url = `${pub.publicUrl}?v=${Date.now()}`;
        await onSave(url);
        router.refresh();
      } catch (e) {
        setLocalPreview(null);
        setError(e instanceof Error ? e.message : "Couldn't save");
      } finally {
        // Release the blob URL once the real one's in.
        if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      }
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      try {
        setLocalPreview(null);
        await onSave(null);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't remove");
      }
    });
  }

  return (
    <div className="flex items-start gap-4">
      <div
        className={cn(
          "w-24 h-24 shrink-0 bg-cream border border-border overflow-hidden flex items-center justify-center",
          shapeClass,
        )}
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-muted text-[10.5px] uppercase tracking-[0.14em] font-semibold">
            {labelText}
          </span>
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
          <Button
            type="button" kind="secondary" size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={pending}
          >
            {pending ? "Uploading..." : displayUrl ? `Replace ${labelText.toLowerCase()}` : `Upload ${labelText.toLowerCase()}`}
          </Button>
          {displayUrl && (
            <Button
              type="button" kind="ghost" size="sm"
              onClick={remove} disabled={pending}
              className="text-red-700 hover:bg-red-50"
            >
              Remove
            </Button>
          )}
        </div>
        <p className="text-[11.5px] text-muted mt-2 max-w-xs">{hint}</p>
        {error && <p className="text-[12px] text-red-700 mt-1">{error}</p>}
      </div>
    </div>
  );
}
