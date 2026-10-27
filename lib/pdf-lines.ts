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
    const str = unspaceLetters(item.str);
    line += (line && gap && !line.endsWith(" ") && !str.startsWith(" ") ? " " : "") + str;
    lastY = y; lastEnd = x + item.width;
    if (item.hasEOL) { lines.push(line); line = ""; lastY = null; }
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

// Letter-spaced text (tracked headings and names in designed CVs) comes out
// of pdf.js with a space between every letter: "S E N I O R", "C O N T A C T".
// Close those up. Each spaced-out word usually arrives as its own piece, so
// the gap check above still puts the spaces back between words; inside one
// piece, a run of 2+ spaces marks a word break. Kerning can glue a pair
// together ("E D U C AT I O N"), so two-letter pieces are allowed as long
// as at least three in four are single letters, over four or more pieces:
// "A B", "J. K. Smith" and "I am in it" stay as they are.
export function unspaceLetters(s: string): string {
  return s
    .split(/( {2,})/)
    .map((seg) => {
      const parts = seg.split(" ");
      if (parts.length < 4 || parts.some((p) => p.length === 0 || p.length > 2)) return seg;
      return parts.filter((p) => p.length === 1).length / parts.length >= 0.75 ? parts.join("") : seg;
    })
    .join("");
}

export function tidyText(raw: string): string {
  return raw.replace(/[ \t ]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
