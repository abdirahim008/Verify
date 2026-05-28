import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

// Approved syndicated sources for the homepage feed (CLAUDE.md §11).
// Each source MUST publish a syndication endpoint we have a legitimate
// reason to consume — RSS/JSON APIs intended for redistribution. Nothing
// here scrapes HTML or rehosts third-party content/images.

interface Normalized {
  title: string;
  snippet: string | null;
  source_name: string;
  source_url: string;
  published_at: string | null;
  tag: string | null;
}

// ── ReliefWeb (https://reliefweb.int/help/api) ─────────────────────
// Their public API exists for syndication. We pull Somalia-tagged
// reports — title, short body, attribution, link. No images.
async function fetchReliefWeb(): Promise<Normalized[]> {
  const url = new URL("https://api.reliefweb.int/v1/reports");
  url.searchParams.set("appname", "sahan");
  url.searchParams.set("limit", "20");
  url.searchParams.set("sort[]", "date.created:desc");
  url.searchParams.set("fields[include][]", "title");
  url.searchParams.set("fields[include][]", "body");
  url.searchParams.set("fields[include][]", "url");
  url.searchParams.set("fields[include][]", "date.created");
  url.searchParams.set("fields[include][]", "source.name");
  url.searchParams.set("fields[include][]", "primary_country.name");
  // Filter to Horn of Africa countries — Somalia first, then neighbours.
  url.searchParams.set("filter[field]", "primary_country.iso3");
  url.searchParams.set("filter[value][]", "SOM");
  url.searchParams.append("filter[value][]", "ETH");
  url.searchParams.append("filter[value][]", "KEN");

  const res = await fetch(url.toString(), {
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`ReliefWeb fetch failed: ${res.status}`);
  const json = await res.json();

  type Item = { fields?: {
    title?: string;
    body?: string;
    url?: string;
    date?: { created?: string };
    source?: Array<{ name?: string }>;
    primary_country?: { name?: string };
  } };
  const items: Item[] = json?.data ?? [];

  const out: Normalized[] = [];
  for (const it of items) {
    const f = it.fields;
    if (!f?.title || !f.url) continue;
    out.push({
      title: f.title,
      snippet: snippetFromBody(f.body),
      source_name: f.source?.[0]?.name || "ReliefWeb",
      source_url: f.url,
      published_at: f.date?.created || null,
      tag: f.primary_country?.name || null,
    });
  }
  return out;
}

function snippetFromBody(body: string | undefined): string | null {
  if (!body) return null;
  // ReliefWeb body is markdown-ish. Strip simple markdown / HTML; cap to
  // ~240 chars. We deliberately keep it short — we link to the source
  // for the full article rather than rehosting it.
  const stripped = body
    .replace(/<[^>]+>/g, " ")           // any HTML
    .replace(/[!#*_>`~\[\]()]/g, "")     // markdown markers
    .replace(/\s+/g, " ")
    .trim();
  if (!stripped) return null;
  return stripped.length > 240 ? stripped.slice(0, 237).trim() + "…" : stripped;
}

// Top-level refresh: fetch from every approved source, dedupe by
// source_url, upsert into feed_items with approved=false. An admin
// approves before items appear on the public feed (§11).
export async function refreshFeed(): Promise<{ fetched: number; inserted: number }> {
  const svc = createSupabaseServiceClient();
  if (!svc) throw new Error("Service-role client not configured.");

  const items: Normalized[] = [];
  try { items.push(...await fetchReliefWeb()); }
  catch (e) { console.error("[feed] reliefweb:", e); /* keep going if a source fails */ }

  if (items.length === 0) return { fetched: 0, inserted: 0 };

  // Look up which source_urls already exist so we only insert new ones.
  // (Cheaper than relying on a unique-constraint upsert + always-touching
  // updated_at, and means an admin's manual approval/edits aren't blown
  // away on the next refresh.)
  const urls = items.map((i) => i.source_url);
  const { data: existing } = await svc.from("feed_items").select("source_url").in("source_url", urls);
  const seen = new Set((existing ?? []).map((r) => r.source_url));
  const fresh = items.filter((i) => !seen.has(i.source_url));

  if (fresh.length === 0) return { fetched: items.length, inserted: 0 };

  const { error } = await svc.from("feed_items").insert(
    fresh.map((i) => ({
      title: i.title, snippet: i.snippet, source_name: i.source_name,
      source_url: i.source_url, published_at: i.published_at, tag: i.tag,
      approved: false,
    })),
  );
  if (error) throw new Error(error.message);
  return { fetched: items.length, inserted: fresh.length };
}
