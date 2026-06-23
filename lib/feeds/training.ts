import "server-only";

// Free / online training + scholarships from ReliefWeb's public training RSS
// (the JSON API now needs a registered appname; the RSS doesn't). The feed is
// global, so we keep only what's actually reachable from the Horn: online
// courses, East-Africa-based ones, or anything free / fully funded.

const FEED_URL = "https://reliefweb.int/training/rss.xml";
const REVALIDATE_SECONDS = 3600; // training changes slowly

const EAST_AFRICA = ["somalia", "somaliland", "kenya", "ethiopia", "sudan", "south sudan", "djibouti", "uganda", "tanzania", "world"];

export interface TrainingItem {
  title: string;
  link: string;
  org: string | null;
  country: string | null;
  online: boolean;
  startDate: string | null;
  cost: string | null;
  free: boolean;
}

export async function fetchTraining(max = 4): Promise<TrainingItem[]> {
  let xml: string;
  try {
    const res = await fetch(FEED_URL, {
      headers: { "User-Agent": "SahanProfiles/1.0 (+https://sahanprofiles.com)", Accept: "application/rss+xml, application/xml" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    xml = await res.text();
  } catch {
    return [];
  }
  try {
    return parse(xml).filter(relevant).slice(0, max);
  } catch {
    return [];
  }
}

function relevant(t: TrainingItem): boolean {
  return t.online || t.free || (t.country != null && EAST_AFRICA.includes(t.country.toLowerCase()));
}

function parse(xml: string): TrainingItem[] {
  const out: TrainingItem[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml))) {
    const block = m[1];
    const title = decode(tag(block, "title"));
    const link = decode(tag(block, "link"));
    if (!title || !link) continue;
    const cats = allTags(block, "category").map((c) => decode(c).toLowerCase());
    // ReliefWeb wraps the description in CDATA but the HTML inside is itself
    // entity-encoded (&lt;div&gt;…). Decode first so field() can stop at a
    // real "<" tag boundary instead of over-running to the end of the string.
    const desc = decode(tag(block, "description"));
    const cost = field(desc, "Cost");
    const free = /free|no cost|no fee|fully funded|scholarship/i.test(`${cost ?? ""} ${title}`);
    out.push({
      title,
      link,
      org: field(desc, "Organization"),
      country: field(desc, "Country"),
      online: cats.includes("online"),
      startDate: field(desc, "Start date"),
      cost,
      free,
    });
  }
  return out;
}

function tag(block: string, name: string): string {
  const re = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, "i");
  const hit = re.exec(block);
  return hit ? cdata(hit[1]).trim() : "";
}
function allTags(block: string, name: string): string[] {
  const re = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) out.push(cdata(m[1]).trim());
  return out;
}
function cdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}
// Labelled value inside the description HTML: "Country: Kenya</div>".
function field(html: string, label: string): string | null {
  const re = new RegExp(`${label}\\s*:\\s*([^<]+)`, "i");
  const hit = re.exec(html);
  const v = hit ? decode(hit[1]).trim() : "";
  return v || null;
}
function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;|&#8217;/g, "’").replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}
