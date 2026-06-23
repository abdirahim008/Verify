import "server-only";
import { norm } from "./sectors";

// Live jobs from SomKenJobs (somkenjobs.com/feed) — a WordPress RSS 2.0
// feed. Each <item> carries <title>, <link>, <pubDate>, two <category> tags
// (a location and a sector), and a <description> (CDATA HTML) that opens
// with "Organization: … Location: … Sector: …" and usually a deadline.
//
// Dependency-free parser: the format is small and stable, and pulling an XML
// lib in just for this isn't worth the bundle. Network/parse failures return
// [] so /home degrades to an empty state rather than erroring.

const FEED_URL = "https://somkenjobs.com/feed/";
const REVALIDATE_SECONDS = 1800; // 30 min — jobs don't change minute-to-minute.

export interface JobItem {
  title: string;
  link: string;
  org: string | null;
  location: string | null;
  sector: string | null;
  categories: string[];      // every <category> tag, verbatim
  postedAt: string | null;   // ISO
  deadline: string | null;   // free-text as printed in the listing ("Jul, 09")
  deadlineISO: string | null; // resolved to a date (year inferred from posting)
}

export async function fetchJobs(max = 40): Promise<JobItem[]> {
  let xml: string;
  try {
    const res = await fetch(FEED_URL, {
      headers: { "User-Agent": "SahanProfiles/1.0 (+https://sahanprofiles.com)", Accept: "application/rss+xml, application/xml, text/xml" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    xml = await res.text();
  } catch {
    return [];
  }
  try {
    return parseFeed(xml).slice(0, max);
  } catch {
    return [];
  }
}

// ── matching ──
export interface MatchedJobs {
  items: JobItem[];
  /** true when the user has career categories and we filtered by them. */
  personalised: boolean;
  /** link of the single strongest match, if any (gets the "TOP MATCH" badge). */
  topMatchLink: string | null;
}

export function selectJobs(jobs: JobItem[], userCategories: string[], limit = 4): MatchedJobs {
  const wanted = new Set(userCategories.map(norm).filter(Boolean));
  if (wanted.size === 0) {
    return { items: jobs.slice(0, limit), personalised: false, topMatchLink: null };
  }
  const scored = jobs
    .map((j) => ({ job: j, score: jobScore(j, wanted) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || posted(b.job) - posted(a.job));
  return {
    items: scored.slice(0, limit).map((s) => s.job),
    personalised: true,
    topMatchLink: scored[0]?.job.link ?? null,
  };
}

function jobScore(job: JobItem, wanted: Set<string>): number {
  const tags = new Set<string>();
  job.categories.forEach((c) => tags.add(norm(c)));
  if (job.sector) tags.add(norm(job.sector));
  let n = 0;
  wanted.forEach((w) => { if (tags.has(w)) n += 1; });
  return n;
}

function posted(j: JobItem): number {
  return j.postedAt ? Date.parse(j.postedAt) : 0;
}

// ── parsing ──
function parseFeed(xml: string): JobItem[] {
  const items: JobItem[] = [];
  const itemRe = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml))) {
    const block = m[1];
    const title = decode(tag(block, "title"));
    const link = decode(tag(block, "link"));
    if (!title || !link) continue;
    const description = tag(block, "description");
    const categories = allTags(block, "category").map(decode).filter(Boolean);
    const pub = tag(block, "pubDate");
    const postedAt = pub ? toIso(pub) : null;
    const dl = parseDeadline(description, postedAt);
    items.push({
      title,
      link,
      org: field(description, "Organization"),
      location: field(description, "Location"),
      sector: field(description, "Sector"),
      categories,
      postedAt,
      deadline: dl.text,
      deadlineISO: dl.iso,
    });
  }
  return items;
}

// First <tag>…</tag> inner text, CDATA unwrapped, trimmed.
function tag(block: string, name: string): string {
  const re = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, "i");
  const hit = re.exec(block);
  return hit ? stripCdata(hit[1]).trim() : "";
}
function allTags(block: string, name: string): string[] {
  const re = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) out.push(stripCdata(m[1]).trim());
  return out;
}
function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

// Pull "Label:</strong> value<br/>" out of the listing's description HTML.
function field(html: string, label: string): string | null {
  const re = new RegExp(`${label}\\s*:?\\s*<\\/strong>\\s*([^<]+)`, "i");
  const hit = re.exec(html);
  const v = hit ? decode(hit[1]).trim() : "";
  return v || null;
}

// Deadlines live in the listing's prose, not a structured field, in a few
// phrasings: "apply before the Jul, 09 deadline", "before Jul, 07", "closes
// on Jul, 09". Always "<Mon>, DD" with no year. We pull the raw text and
// resolve it to a date (inferring the year from the posting date).
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DATE = String.raw`(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?,?\s*\d{1,2}(?:,?\s*\d{4})?`;

function parseDeadline(html: string, postedAtIso: string | null): { text: string | null; iso: string | null } {
  const text = decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
  const patterns = [
    new RegExp(`before\\s+(?:the\\s+)?(${DATE})\\s+deadline`, "i"),
    new RegExp(`(?:closes?|closing(?: date)?|deadline)(?:\\s+(?:on|is|date))?:?\\s+(?:the\\s+)?(${DATE})`, "i"),
    new RegExp(`(?:open|available|accepted)\\s+until\\s+(?:the\\s+)?(${DATE})`, "i"),
    new RegExp(`(?:apply|submit[^.]{0,40}?)\\s+(?:by|before)\\s+(?:the\\s+)?(${DATE})`, "i"),
    new RegExp(`(?:before|until)\\s+(?:the\\s+)?(${DATE})`, "i"),
    new RegExp(`(${DATE})\\s+deadline`, "i"),
  ];
  let raw: string | null = null;
  for (const re of patterns) { const m = re.exec(text); if (m) { raw = m[1].trim(); break; } }
  if (!raw) return { text: null, iso: null };
  return { text: raw, iso: toDeadlineIso(raw, postedAtIso) };
}

function toDeadlineIso(raw: string, postedAtIso: string | null): string | null {
  const m = /([A-Za-z]{3,9})\.?,?\s*(\d{1,2})(?:,?\s*(\d{4}))?/.exec(raw);
  if (!m) return null;
  const mon = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
  const day = Number(m[2]);
  if (mon < 0 || day < 1 || day > 31) return null;
  const fallbackYear = postedAtIso ? new Date(postedAtIso).getUTCFullYear() : new Date().getUTCFullYear();
  let year = m[3] ? Number(m[3]) : fallbackYear;
  // No explicit year: if the date lands clearly before the posting date, it
  // rolls into the next year (posted late Dec, closes early Jan).
  if (!m[3] && postedAtIso && Date.UTC(year, mon, day) < Date.parse(postedAtIso) - 2 * 86_400_000) {
    year += 1;
  }
  const d = new Date(Date.UTC(year, mon, day));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function toIso(rfc: string): string | null {
  const t = Date.parse(rfc);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}
