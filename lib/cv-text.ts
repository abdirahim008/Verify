import "server-only";
import { inflateRawSync } from "node:zlib";

// Plain text out of an uploaded CV, for the AI profile import. PDF via
// pdfjs-dist (already a dependency, for the template previews); DOCX by
// reading word/document.xml straight out of the zip, so no new dependency.
// Scanned / image-only PDFs have no text layer and come back near-empty —
// the caller tells the member to paste their details instead.

export const MAX_CV_BYTES = 5 * 1024 * 1024;

export type CvKind = "pdf" | "docx";

export function cvKind(name: string, type: string, head: Uint8Array): CvKind | null {
  if (head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46) return "pdf"; // %PDF
  if (head[0] === 0x50 && head[1] === 0x4b && (/\.docx$/i.test(name) || type.includes("wordprocessingml"))) return "docx";
  return null;
}

export async function extractCvText(bytes: Uint8Array, kind: CvKind): Promise<string> {
  const raw = kind === "pdf" ? await pdfText(bytes) : docxText(bytes);
  return raw.replace(/[ \t ]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

async function pdfText(bytes: Uint8Array): Promise<string> {
  // The legacy build runs in Node without a DOM. pdf.js would otherwise load
  // its worker from a path computed at runtime, which Vercel's file tracing
  // can't see; importing it here bundles it and lets pdf.js run it in-process.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const g = globalThis as { pdfjsWorker?: unknown };
  g.pdfjsWorker ??= await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  const task = pdfjs.getDocument({ data: bytes, useSystemFonts: false });
  const doc = await task.promise;
  const pages: string[] = [];
  for (let n = 1; n <= Math.min(doc.numPages, 8); n++) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    let line = "", lastY: number | null = null; const lines: string[] = [];
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 2) { lines.push(line); line = ""; }
      line += (line && !line.endsWith(" ") && !item.str.startsWith(" ") ? " " : "") + item.str;
      lastY = y;
      if (item.hasEOL) { lines.push(line); line = ""; lastY = null; }
    }
    if (line) lines.push(line);
    pages.push(lines.join("\n"));
  }
  await task.destroy();
  return pages.join("\n\n");
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
