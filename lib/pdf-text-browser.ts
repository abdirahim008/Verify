// Text out of a PDF in the member's browser, for files too big to upload
// to the server (Vercel caps request bodies at 4.5 MB; designed company
// profiles are often 5–20 MB of images). Only the text is then sent to
// /api/ai/profile-draft. Same pdf.js setup as the template previews.

import { itemsToText, tidyText } from "@/lib/pdf-lines";

export async function pdfTextInBrowser(file: File, maxPages: number): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  try {
    const doc = await task.promise;
    const pages: string[] = [];
    for (let n = 1; n <= Math.min(doc.numPages, maxPages); n++) {
      const page = await doc.getPage(n);
      pages.push(itemsToText((await page.getTextContent()).items));
    }
    return tidyText(pages.join("\n\n"));
  } finally {
    await task.destroy();
  }
}
