import "server-only";
import { inflateRawSync } from "node:zlib";
import { itemsToText, tidyText } from "@/lib/pdf-lines";

// Plain text out of an uploaded CV or company profile, for the AI import. PDF via
// pdfjs-dist (already a dependency, for the template previews); DOCX by
// reading word/document.xml straight out of the zip, so no new dependency.
// Scanned / image-only PDFs have no text layer and come back near-empty —
// the caller tells the member to paste their details instead.

// Vercel rejects request bodies over 4.5 MB, so bigger PDFs are read in the
// browser (lib/pdf-text-browser.ts) and only their text is sent.
export const MAX_CV_BYTES = 4 * 1024 * 1024;

export type CvKind = "pdf" | "docx";

export function cvKind(name: string, type: string, head: Uint8Array): CvKind | null {
  if (head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46) return "pdf"; // %PDF
  if (head[0] === 0x50 && head[1] === 0x4b && (/\.docx$/i.test(name) || type.includes("wordprocessingml"))) return "docx";
  return null;
}

/** maxPages: 8 for a CV, 20 for a company profile. */
export async function extractCvText(bytes: Uint8Array, kind: CvKind, maxPages = 8): Promise<string> {
  return tidyText(kind === "pdf" ? await pdfText(bytes, maxPages) : docxText(bytes));
}

async function pdfText(bytes: Uint8Array, maxPages: number): Promise<string> {
  // The legacy build runs in Node without a DOM. pdf.js would otherwise load
  // its worker from a path computed at runtime, which Vercel's file tracing
  // can't see; importing it here bundles it and lets pdf.js run it in-process.
  const g = globalThis as { pdfjsWorker?: unknown; DOMMatrix?: unknown };
  // pdf.js creates a DOMMatrix when it loads. In Node it borrows one from the
  // optional native @napi-rs/canvas, which Vercel doesn't deploy, so loading
  // failed there ("DOMMatrix is not defined"). Text extraction never draws,
  // so a plain 2D matrix is all it needs.
  g.DOMMatrix ??= Matrix2D;
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  g.pdfjsWorker ??= await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  const task = pdfjs.getDocument({ data: bytes, useSystemFonts: false });
  const doc = await task.promise;
  const pages: string[] = [];
  for (let n = 1; n <= Math.min(doc.numPages, maxPages); n++) {
    const page = await doc.getPage(n);
    pages.push(itemsToText((await page.getTextContent()).items));
  }
  await task.destroy();
  return pages.join("\n\n");
}

// The 2D affine subset of DOMMatrix ([a b c d e f]) that pdf.js touches.
class Matrix2D {
  a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  constructor(init?: ArrayLike<number>) {
    if (init && init.length >= 6) [this.a, this.b, this.c, this.d, this.e, this.f] = Array.from(init);
  }
  private set(m: number[]) { [this.a, this.b, this.c, this.d, this.e, this.f] = m; return this; }
  private static mul(p: Matrix2D, q: { a: number; b: number; c: number; d: number; e: number; f: number }) {
    return [
      p.a * q.a + p.c * q.b, p.b * q.a + p.d * q.b,
      p.a * q.c + p.c * q.d, p.b * q.c + p.d * q.d,
      p.a * q.e + p.c * q.f + p.e, p.b * q.e + p.d * q.f + p.f,
    ];
  }
  multiplySelf(o: Matrix2D) { return this.set(Matrix2D.mul(this, o)); }
  preMultiplySelf(o: Matrix2D) { return this.set(Matrix2D.mul(o, this)); }
  translateSelf(x = 0, y = 0) { return this.multiplySelf(new Matrix2D([1, 0, 0, 1, x, y])); }
  scaleSelf(sx = 1, sy = sx) { return this.multiplySelf(new Matrix2D([sx, 0, 0, sy, 0, 0])); }
  invertSelf() {
    const det = this.a * this.d - this.b * this.c;
    if (!det) return this.set([NaN, NaN, NaN, NaN, NaN, NaN]);
    return this.set([
      this.d / det, -this.b / det, -this.c / det, this.a / det,
      (this.c * this.f - this.d * this.e) / det, (this.b * this.e - this.a * this.f) / det,
    ]);
  }
  multiply(o: Matrix2D) { return new Matrix2D([this.a, this.b, this.c, this.d, this.e, this.f]).multiplySelf(o); }
  translate(x?: number, y?: number) { return new Matrix2D([this.a, this.b, this.c, this.d, this.e, this.f]).translateSelf(x, y); }
  scale(sx?: number, sy?: number) { return new Matrix2D([this.a, this.b, this.c, this.d, this.e, this.f]).scaleSelf(sx, sy); }
  inverse() { return new Matrix2D([this.a, this.b, this.c, this.d, this.e, this.f]).invertSelf(); }
}

// Minimal zip reader: find word/document.xml via the central directory and
// inflate it. DOCX entries are stored or deflated, never anything else.
function docxText(buf: Uint8Array): string {
  const b = Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 66000); i--) {
    if (b.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("Not a valid Word file.");
  const count = b.readUInt16LE(eocd + 10);
  let p = b.readUInt32LE(eocd + 16);
  for (let i = 0; i < count && p + 46 <= b.length; i++) {
    if (b.readUInt32LE(p) !== 0x02014b50) break;
    const method = b.readUInt16LE(p + 10), csize = b.readUInt32LE(p + 20);
    const nlen = b.readUInt16LE(p + 28), xlen = b.readUInt16LE(p + 30), clen = b.readUInt16LE(p + 32);
    const local = b.readUInt32LE(p + 42);
    const name = b.toString("utf8", p + 46, p + 46 + nlen);
    if (name === "word/document.xml") {
      const ln = b.readUInt16LE(local + 26), lx = b.readUInt16LE(local + 28);
      const start = local + 30 + ln + lx;
      const data = b.subarray(start, start + csize);
      const xml = (method === 0 ? data : inflateRawSync(data, { maxOutputLength: 20 * 1024 * 1024 })).toString("utf8");
      return docxXmlToText(xml);
    }
    p += 46 + nlen + xlen + clen;
  }
  throw new Error("Couldn't find the text in this Word file.");
}

function docxXmlToText(xml: string): string {
  return xml
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:br[^>]*\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&amp;/g, "&");
}
