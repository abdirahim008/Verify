// pdf.js text items → plain lines. Shared by the server (lib/cv-text.ts)
// and the browser (lib/pdf-text-browser.ts) so an uploaded file reads the
// same wherever it's extracted. Pure: no pdf.js import here.

interface TextItem { str: string; transform: number[]; width: number; hasEOL?: boolean }

export function itemsToText(items: readonly unknown[]): string {
  let line = "", lastY: number | null = null, lastEnd = 0; const lines: string[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== "object" || !("str" in raw)) continue;
    const item = raw as TextItem;
    const [sa, sb, , , x, y] = item.transform;
    if (lastY !== null && Math.abs(y - lastY) > 2) { lines.push(line); line = ""; }
    // Space only where there's a visible gap: PDFs often split one word or
    // an email address into several pieces that touch.
    const gap = x - lastEnd > 0.2 * (Math.hypot(sa, sb) || 10);
    line += (line && gap && !line.endsWith(" ") && !item.str.startsWith(" ") ? " " : "") + item.str;
    lastY = y; lastEnd = x + item.width;
    if (item.hasEOL) { lines.push(line); line = ""; lastY = null; }
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

export function tidyText(raw: string): string {
  return raw.replace(/[ \t ]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
