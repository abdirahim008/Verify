import "server-only";
import type { ReactElement } from "react";
import { getBrowser } from "./browser";

// Server-rendered React → HTML string → Chromium → PDF (A4).
// The template element is responsible for producing the FULL document
// markup (everything inside <body>) including any inline <style>. We wrap
// it in a minimal HTML shell with the fonts the templates use.
//
// Dynamic import for react-dom/server because Next's App Router compiler
// refuses static imports of it (it's banned in RSCs). The route handler
// that calls us runs on Node, so dynamic resolution is fine — and avoids
// hauling react-dom/server into any RSC bundle by accident.

export async function renderPdf(
  element: ReactElement,
  options: { fonts?: string; pageTitle?: string } = {},
): Promise<Buffer> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const inner = renderToStaticMarkup(element);
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(options.pageTitle ?? "CV")}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link href="${options.fonts ?? DEFAULT_FONTS}" rel="stylesheet" />
    <style>${RESET_CSS}</style>
  </head>
  <body>${inner}</body>
</html>`;

  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "networkidle0" });
    // Wait for fonts to load — networkidle0 is necessary but not always
    // sufficient if a `@font-face` swap is still pending.
    await page.evaluateHandle("document.fonts.ready");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}

const DEFAULT_FONTS =
  "https://fonts.googleapis.com/css2" +
  "?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;1,8..60,300;1,8..60,400" +
  "&family=IBM+Plex+Sans:wght@400;500;600" +
  "&display=swap";

const RESET_CSS = `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
@page { size: A4; margin: 0; }
`;

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[c]!);
}
