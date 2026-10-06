// pdfjs-dist ships no typings for its worker entry; lib/cv-text.ts only
// hands the module object to pdf.js (globalThis.pdfjsWorker).
declare module "pdfjs-dist/legacy/build/pdf.worker.mjs" {
  export const WorkerMessageHandler: unknown;
}
