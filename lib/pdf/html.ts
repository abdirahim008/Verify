// The HTML document every PDF template is printed from. Shared by
// lib/pdf/render.tsx (live downloads) and scripts/render-thumbnails.mjs
// (template previews), so a preview is printed from exactly the same page.
// No server-only import: the thumbnail script loads this outside Next.

export const DEFAULT_FONTS =
  "https://fonts.googleapis.com/css2" +
  "?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;1,8..60,300;1,8..60,400" +
  "&family=IBM+Plex+Sans:wght@400;500;600" +
  "&display=swap";

export const RESET_CSS = `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
  text-rendering: optimizeLegibility;
  font-kerning: normal;
  font-variant-ligatures: common-ligatures;
}
@page { size: A4; margin: 0; }
`;

/** puppeteer page.pdf() options for every A4 template. */
export const PDF_OPTIONS = {
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
} as const;

export function pdfDocumentHtml(inner: string, options: { fonts?: string; pageTitle?: string } = {}): string {
  return `<!doctype html>
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
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[c]!);
}
