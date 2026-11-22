import "server-only";
import { lookup, type LookupAddress } from "node:dns";
import http from "node:http";
import https from "node:https";
import { BlockList, isIP, type LookupFunction } from "node:net";
import zlib from "node:zlib";
import { extractCvText } from "@/lib/cv-text";

// Reads ONE job advert from a link the member pasted, for the cover-letter
// helper (CLAUDE.md §3). The text goes to the AI and is then dropped: it is
// never stored, shown to anyone else or republished, which is what separates
// this from the scraping the project rules forbid.
//
// The server fetches a URL chosen by a member, so it must not be usable to
// reach private addresses (SSRF). The address check sits inside the socket's
// DNS lookup, so it applies to the address actually connected to, on every
// redirect hop — a hostname can't pass the check and then resolve elsewhere.

const UA = "SahanProfiles/1.0 (+https://sahanprofiles.com)";
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 4;
const TOTAL_TIMEOUT_MS = 9000;
/** Sent to the AI at most; about 3,000 tokens. */
export const JOB_TEXT_MAX = 12000;
/** Less than this is a login wall, a cookie banner or an empty app shell. */
export const JOB_TEXT_MIN = 200;

/** A failure with a message written for the member. */
export class JobPageError extends Error {}

const UNREADABLE = "We couldn't read that page. Copy the job advert and paste the text instead.";

const blocked = new BlockList();
for (const [net, bits] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16],
  ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15],
  ["224.0.0.0", 4], ["240.0.0.0", 4],
] as const) blocked.addSubnet(net, bits, "ipv4");
for (const [net, bits] of [
  ["::", 127], ["fc00::", 7], ["fe80::", 10], ["ff00::", 8], ["64:ff9b::", 96], ["2001:db8::", 32],
] as const) blocked.addSubnet(net, bits, "ipv6");

function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !blocked.check(address, "ipv4");
  if (family !== 6) return false;
  // IPv4-mapped (::ffff:10.0.0.1) is judged as the IPv4 address it carries.
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address);
  if (mapped) return !blocked.check(mapped[1], "ipv4");
  if (/^::ffff:/i.test(address)) return false;
  return !blocked.check(address, "ipv6");
}

const safeLookup = ((hostname: string, options: object, callback: (...args: unknown[]) => void) => {
  lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err);
    const ok = (addresses as LookupAddress[]).filter((a) => isPublicAddress(a.address));
    if (ok.length === 0) return callback(new Error("address not allowed"));
    if ((options as { all?: boolean }).all) callback(null, ok);
    else callback(null, ok[0].address, ok[0].family);
  });
}) as unknown as LookupFunction;

function parseJobUrl(raw: string): URL {
  let url: URL;
  try { url = new URL(raw.trim()); } catch { throw new JobPageError("That doesn't look like a web link. Paste the full link, starting with https://"); }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new JobPageError("Paste a web link that starts with https://");
  if (url.port || url.username || url.password) throw new JobPageError(UNREADABLE);
  // An IP literal skips DNS, so the lookup check never runs for it.
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host) && !isPublicAddress(host)) throw new JobPageError(UNREADABLE);
  return url;
}

interface Fetched { status: number; headers: http.IncomingHttpHeaders; body: Buffer }

function requestOnce(url: URL, deadline: number): Promise<Fetched> {
  return new Promise((resolve, reject) => {
    const left = deadline - Date.now();
    if (left <= 0) return reject(new Error("timeout"));
    const req = (url.protocol === "https:" ? https : http).request(url, {
      method: "GET",
      lookup: safeLookup,
      timeout: left,
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,text/plain;q=0.8",
        "Accept-Language": "en",
        "Accept-Encoding": "gzip, deflate, br",
      },
    }, (res) => {
      const status = res.statusCode ?? 0;
      // A redirect's body is never needed.
      if (status >= 300 && status < 400) { res.resume(); return resolve({ status, headers: res.headers, body: Buffer.alloc(0) }); }
      const encoding = String(res.headers["content-encoding"] ?? "").toLowerCase();
      const stream = encoding === "gzip" ? res.pipe(zlib.createGunzip())
        : encoding === "deflate" ? res.pipe(zlib.createInflate())
        : encoding === "br" ? res.pipe(zlib.createBrotliDecompress())
        : res;
      const chunks: Buffer[] = [];
      let size = 0;
      stream.on("data", (c: Buffer) => {
        size += c.length;
        // Enough of a long page to find the advert; stop instead of failing.
        if (size > MAX_BYTES) { req.destroy(); resolve({ status, headers: res.headers, body: Buffer.concat(chunks) }); return; }
        chunks.push(c);
      });
      stream.on("end", () => resolve({ status, headers: res.headers, body: Buffer.concat(chunks) }));
      stream.on("error", reject);
    });
    // `timeout` above only fires on an idle socket; this bounds a page that
    // keeps trickling bytes.
    const hard = setTimeout(() => req.destroy(new Error("timeout")), left);
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    req.on("close", () => clearTimeout(hard));
    req.end();
  });
}

/** The readable text of the job advert at `rawUrl`. Throws JobPageError. */
export async function readJobPage(rawUrl: string): Promise<{ text: string; host: string }> {
  let url = parseJobUrl(rawUrl);
  const deadline = Date.now() + TOTAL_TIMEOUT_MS;
  let res: Fetched | null = null;
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      res = await requestOnce(url, deadline);
      const location = res.headers.location;
      if (res.status < 300 || res.status >= 400 || !location) break;
      url = parseJobUrl(new URL(location, url).toString());
      res = null;
    }
  } catch (e) {
    if (e instanceof JobPageError) throw e;
    throw new JobPageError(e instanceof Error && e.message === "timeout"
      ? "That page took too long to open. Copy the job advert and paste the text instead."
      : UNREADABLE);
  }
  if (!res) throw new JobPageError(UNREADABLE);
  if (res.status === 401 || res.status === 403 || res.status === 429 || res.status === 999) {
    throw new JobPageError("That site doesn't let us open its pages (it may need a login). Copy the job advert and paste the text instead.");
  }
  if (res.status === 404 || res.status === 410) throw new JobPageError("That job page no longer exists. Check the link, or paste the advert text instead.");
  if (res.status < 200 || res.status >= 300) throw new JobPageError(UNREADABLE);

  const type = String(res.headers["content-type"] ?? "").toLowerCase();
  const isPdf = type.includes("application/pdf") || res.body.subarray(0, 4).toString("latin1") === "%PDF";
  let text: string;
  if (isPdf) {
    try { text = await extractCvText(new Uint8Array(res.body), "pdf", 8); } catch { throw new JobPageError(UNREADABLE); }
  } else if (type.includes("html") || type.includes("text/plain") || type === "") {
    const charset = /charset=["']?([\w-]+)/.exec(type)?.[1] ?? "utf-8";
    let decoded: string;
    try { decoded = new TextDecoder(charset).decode(res.body); } catch { decoded = new TextDecoder().decode(res.body); }
    text = type.includes("text/plain") ? decoded : jobTextFromHtml(decoded);
  } else {
    throw new JobPageError("That link isn't a web page or PDF. Copy the job advert and paste the text instead.");
  }

  text = text.trim();
  if (text.replace(/\s/g, "").length < JOB_TEXT_MIN) {
    throw new JobPageError("We couldn't find the job details on that page (some sites only show them after login). Copy the job advert and paste the text instead.");
  }
  return { text: text.slice(0, JOB_TEXT_MAX), host: url.hostname };
}

// ── HTML → text ─────────────────────────────────────────────────────────
// Dependency-free, like the RSS parser in lib/jobs/feed.ts: the AI only
// needs readable text, not a faithful DOM.

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " ", ndash: "–", mdash: "—",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", bull: "•", hellip: "…", middot: "·",
};
function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] !== "#") return ENTITIES[e.toLowerCase()] ?? m;
    const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    try { return Number.isFinite(code) ? String.fromCodePoint(code) : m; } catch { return m; }
  });
}

function stripTags(html: string): string {
  const text = html
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section|\/article|\/ul|\/ol|\/table)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(text)
    .replace(/[ \t\r\f\v ]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function dropBlocks(html: string, tags: string[]): string {
  let out = html;
  for (const t of tags) out = out.replace(new RegExp(`<${t}\\b[^>]*>[\\s\\S]*?<\\/${t}\\s*>`, "gi"), " ");
  return out;
}

const str = (v: unknown): string => (typeof v === "string" ? v : "");

/** schema.org JobPosting, which most job boards embed for search engines. */
function jobPostingText(html: string): string {
  const blocks = html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi);
  for (const b of blocks) {
    let data: unknown;
    try { data = JSON.parse(b[1]); } catch { continue; }
    const queue: unknown[] = [data];
    for (let i = 0; i < queue.length && i < 200; i++) {
      const node = queue[i];
      if (Array.isArray(node)) { queue.push(...node); continue; }
      if (!node || typeof node !== "object") continue;
      const o = node as Record<string, unknown>;
      if (Array.isArray(o["@graph"])) queue.push(...o["@graph"]);
      const type = o["@type"];
      if (type !== "JobPosting" && !(Array.isArray(type) && type.includes("JobPosting"))) continue;
      const org = o.hiringOrganization;
      const parts = [
        str(o.title) && `Job title: ${str(o.title)}`,
        org && typeof org === "object" && str((org as Record<string, unknown>).name) && `Organisation: ${str((org as Record<string, unknown>).name)}`,
        stripTags(str(o.description)),
        ...["responsibilities", "qualifications", "skills", "experienceRequirements", "educationRequirements"]
          .map((k) => str(o[k]) && `${k}: ${stripTags(str(o[k]))}`),
      ].filter(Boolean);
      return parts.join("\n\n");
    }
  }
  return "";
}

export function jobTextFromHtml(html: string): string {
  const structured = jobPostingText(html);
  if (structured.replace(/\s/g, "").length >= 400) return structured;

  const title = stripTags(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(html)?.[1] ?? "");
  let body = html.replace(/<!--[\s\S]*?-->/g, " ");
  body = dropBlocks(body, ["head", "script", "style", "noscript", "svg", "template", "iframe", "select"]);
  // The advert is normally the page's <main> or <article>; use it when it
  // carries real text, so menus and "related jobs" lists stay out.
  for (const tag of ["main", "article"]) {
    const inner = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*)<\\/${tag}\\s*>`, "i").exec(body)?.[1];
    if (inner && stripTags(inner).length >= 400) { body = inner; break; }
  }
  body = dropBlocks(body, ["nav", "footer", "header", "aside", "button"]);
  const text = stripTags(body);
  return title ? `Page title: ${title}\n\n${text}` : text;
}
