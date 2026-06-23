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
  deadline: string | null;   // free-text as printed in the listing
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
    items.push({
      title,
      link,
      org: field(description, "Organization"),
      location: field(description, "Location"),
      sector: field(description, "Sector"),
      categories,
      postedAt: pub ? toIso(pub) : null,
      deadline: deadline(description),
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

// Deadline is printed inconsistently; try a labelled field first, then a
// loose "<Month> DD" near a deadline/closing keyword.
function deadline(html: string): string | null {
  const labelled = field(html, "Deadline") || field(html, "Closing date") || field(html, "Apply by");
  if (labelled) return labelled;
  const text = decode(html.replace(/<[^>]+>/g, " "));
  const loose = /(?:deadline|closing date|apply by|closes?)[:\s]*([A-Za-z]{3,9}\.?,?\s*\d{1,2}(?:,?\s*\d{4})?)/i.exec(text);
  return loose ? loose[1].trim() : null;
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
