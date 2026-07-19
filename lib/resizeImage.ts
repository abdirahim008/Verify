// Client-side image downscaling for uploads. Big camera photos (3–8 MB) made
// uploads slow and every later page load slower; nothing in the app displays
// larger than ~1400px, so we resize in the browser before the bytes ever
// leave the device.
//
// - Preserves aspect ratio (contain within maxW×maxH; never upscales).
// - "png" output keeps transparency (logos); "jpeg" is for photos.
// - Re-encoding via canvas also strips EXIF and bakes in orientation, so
//   phone photos stop rendering sideways.

export interface DownscaleOptions {
  maxW: number;
  maxH: number;
  format: "png" | "jpeg";
  /** JPEG quality 0–1 (ignored for png). Default 0.85. */
  quality?: number;
}

export async function downscaleImage(file: File, opts: DownscaleOptions): Promise<Blob> {
  const { maxW, maxH, format, quality = 0.85 } = opts;
  const bitmap = await loadBitmap(file);
  try {
    const scale = Math.min(maxW / bitmap.width, maxH / bitmap.height, 1);
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.drawImage(bitmap, 0, 0, w, h);

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Couldn't process the image"))),
        format === "png" ? "image/png" : "image/jpeg",
        format === "jpeg" ? quality : undefined,
      ),
    );
    // A PNG re-encode of an already-optimised small file can come out larger
    // than the original. If we didn't shrink dimensions and only grew bytes,
    // keep the original.
    if (scale === 1 && blob.size >= file.size) return file;
    return blob;
  } finally {
    if ("close" in bitmap) (bitmap as ImageBitmap).close();
  }
}

// createImageBitmap honours EXIF orientation and decodes off the main
// thread; fall back to an <img> for older browsers.
async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch { /* fall through */ }
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error("Couldn't read the file"));
    fr.readAsDataURL(file);
  });
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Couldn't load the image"));
    i.src = dataUrl;
  });
}
