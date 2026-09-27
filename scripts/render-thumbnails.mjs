// Renders every CV and company-profile template with the demo profile
// (lib/pdf/demo.ts) and writes preview images to public/templates/.
//
//   node scripts/render-thumbnails.mjs            # all templates
//   node scripts/render-thumbnails.mjs cv grid    # just some
//
// Re-run after changing a template or the demo data, then commit the images
// and components/templates/previews.generated.ts.
//
// Each template is printed exactly like a real download: same components
// and fonts (lib/pdf/templates.ts), same HTML shell and print options
// (lib/pdf/html.ts), default colour theme. The PDF is then rasterised with
// PDF.js, so the images show real page breaks and page margins.
//
// Needs a local Chrome or Edge (set CHROME_PATH to override).

import { createRequire } from "node:module";
import Module from "node:module";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const ts = require("typescript");
const puppeteer = require("puppeteer-core");

const THUMB_WIDTH = 480;   // card image (shown ~240px wide, 2x for sharp screens)
const PAGE_WIDTH = 1100;   // zoom view, per page
const MAX_PAGES = 3;
const OUT = path.join(root, "public", "templates");

// ── Load the app's TS/TSX modules outside Next ──────────────────────────
// Transpile on require, resolve "@/…" to the repo root, stub "server-only".
const stub = path.join(os.tmpdir(), "sahan-server-only-stub.js");
fs.writeFileSync(stub, "module.exports = {};");
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request === "server-only") return stub;
  if (request.startsWith("@/")) request = path.join(root, request.slice(2));
  return origResolve.call(this, request, ...rest);
};
for (const ext of [".ts", ".tsx"]) {
  require.extensions[ext] = (module, filename) => {
    const src = fs.readFileSync(filename, "utf8");
    const out = ts.transpileModule(src, {
      fileName: filename,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
      },
    });
    module._compile(out.outputText, filename);
  };
}

const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { CV_RENDER, COMPANY_RENDER } = require(path.join(root, "lib/pdf/templates.ts"));
const { pdfDocumentHtml, PDF_OPTIONS } = require(path.join(root, "lib/pdf/html.ts"));
const { resolveThemeOverrides } = require(path.join(root, "lib/pdf/themes.ts"));
const { demoCV, demoCompany } = require(path.join(root, "lib/pdf/demo.ts"));

// ── Which templates ─────────────────────────────────────────────────────
const [onlyKind, ...onlyIds] = process.argv.slice(2);
const jobs = [
  ...Object.entries(CV_RENDER).map(([id, t]) => ({ kind: "cv", id, t, data: demoCV() })),
  ...Object.entries(COMPANY_RENDER).map(([id, t]) => ({ kind: "company", id, t, data: demoCompany() })),
].filter((j) => (!onlyKind || j.kind === onlyKind) && (!onlyIds.length || onlyIds.includes(j.id)));

// ── A tiny local server for PDF.js and the PDFs being rasterised ─────────
const pdfjsDir = path.join(root, "node_modules/pdfjs-dist/build");
const pdfs = new Map();
const viewer = `<!doctype html><html><body style="margin:0;background:#fff">
<canvas id="c"></canvas>
<script type="module">
  import * as pdfjs from "/pdfjs/pdf.min.mjs";
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
  const docs = {};
  window.renderPage = async (key, n, width) => {
    const doc = docs[key] ??= await pdfjs.getDocument({ url: location.origin + "/pdf/" + key }).promise;
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale: width / base.width });
    const c = document.getElementById("c");
    c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: ctx, viewport: vp, canvas: c }).promise;
    return { pages: doc.numPages, w: c.width, h: c.height };
  };
  window.ready = true;
</script></body></html>`;
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  if (url === "/") { res.setHeader("content-type", "text/html"); return res.end(viewer); }
  if (url.startsWith("/pdfjs/")) {
    const f = path.join(pdfjsDir, path.basename(url));
    if (fs.existsSync(f)) { res.setHeader("content-type", "text/javascript"); return res.end(fs.readFileSync(f)); }
  }
  if (url.startsWith("/pdf/") && pdfs.has(url.slice(5))) {
    res.setHeader("content-type", "application/pdf"); return res.end(pdfs.get(url.slice(5)));
  }
  res.statusCode = 404; res.end();
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

// ── Render ──────────────────────────────────────────────────────────────
const chrome = process.env.CHROME_PATH || [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].find((p) => fs.existsSync(p));
if (!chrome) throw new Error("No Chrome/Edge found; set CHROME_PATH.");

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const view = await browser.newPage();
await view.setViewport({ width: PAGE_WIDTH, height: 1600, deviceScaleFactor: 1 });
await view.goto(base + "/");
await view.waitForFunction("window.ready === true");

const manifestPath = path.join(root, "components/templates/previews.generated.ts");
const manifest = { cv: {}, company: {} };
const prev = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, "utf8").match(/PREVIEW_MANIFEST = (\{[\s\S]*?\}) as const/) : null;
if (prev) Object.assign(manifest, JSON.parse(prev[1]).pages ?? {});

for (const { kind, id, t, data } of jobs) {
  const started = Date.now();
  const theme = resolveThemeOverrides(kind, id, null);
  const html = pdfDocumentHtml(renderToStaticMarkup(React.createElement(t.component, { data, theme })), {
    fonts: t.fonts, pageTitle: `${t.name} preview`,
  });
  // A fresh tab per template, like each live download. Same bounded waits
  // as lib/pdf/render.tsx, but warn if fonts didn't finish so a preview is
  // never silently printed in fallback fonts.
  const printer = await browser.newPage();
  await printer.setContent(html, { waitUntil: "networkidle0", timeout: 30000 }).catch(() => {});
  const fontsOk = await Promise.race([
    printer.evaluate(() => document.fonts.ready.then(() => document.fonts.status === "loaded")),
    new Promise((r) => setTimeout(() => r(false), 10000)),
  ]);
  if (!fontsOk) console.warn(`  ! ${kind}/${id}: fonts not fully loaded, re-run this template`);
  const pdf = await printer.pdf({ ...PDF_OPTIONS, margin: { ...PDF_OPTIONS.margin } });
  await printer.close();
  const key = `${kind}-${id}.pdf`;
  pdfs.set(key, Buffer.from(pdf));

  fs.mkdirSync(path.join(OUT, kind), { recursive: true });
  const canvas = await view.$("#c");
  const shot = async (n, width, file) => {
    const info = await view.evaluate((k, n, w) => window.renderPage(k, n, w), key, n, width);
    await view.setViewport({ width: Math.max(info.w, 100), height: info.h, deviceScaleFactor: 1 });
    await canvas.screenshot({ path: path.join(OUT, kind, file), type: "webp", quality: 82 });
    return info.pages;
  };
  const pages = await shot(1, THUMB_WIDTH, `${id}.webp`);
  const count = Math.min(pages, MAX_PAGES);
  for (let n = 1; n <= count; n++) await shot(n, PAGE_WIDTH, `${id}-${n}.webp`);
  // Drop zoom pages left over from a longer earlier render.
  for (let n = count + 1; n <= MAX_PAGES; n++) fs.rmSync(path.join(OUT, kind, `${id}-${n}.webp`), { force: true });

  manifest[kind][id] = count;
  console.log(`${kind}/${id}: ${pages} page(s), ${count} rendered in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

await browser.close();
server.close();

// Page counts + a version stamp the UI appends to image URLs, so browsers
// fetch fresh images after a re-render.
fs.writeFileSync(manifestPath, `// Generated by scripts/render-thumbnails.mjs. Do not edit by hand.
export const PREVIEW_MANIFEST = ${JSON.stringify({ version: Date.now().toString(36), pages: manifest }, null, 2)} as const;
`);
console.log("Wrote", path.relative(root, manifestPath));
