// Copies the PDF.js worker into /public so it ships as a static asset.
//
// Why: importing the worker via `new URL(..., import.meta.url)` makes
// webpack emit it through Terser, which rejects the .mjs (import.meta in
// what it treats as non-module code). Serving it from /public sidesteps
// the bundler entirely. Runs on postinstall, so Vercel builds get it too;
// the copy is gitignored.

import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const pkg = dirname(require.resolve("pdfjs-dist/package.json"));
const src = join(pkg, "legacy", "build", "pdf.worker.min.mjs");
const dst = join(process.cwd(), "public", "pdf.worker.min.mjs");

mkdirSync(dirname(dst), { recursive: true });
copyFileSync(src, dst);
console.log("[copy-pdf-worker] →", dst);
