// Link-spam detection for profile text.
//
// The attack this stops (Sept 2026): bots sign up with a keyword phrase as
// the name ("Roofing Contractors Marana"), a bare URL as the headline, and
// SEO boilerplate as the summary — pure backlink farming, nothing to do
// with the sector. Pure module (no "server-only"): the zod schemas import it
// so the same rule runs in the browser form and the server action.

// Absolute URLs, www., or bare domains with a plausible TLD. Bare-domain
// matching is what catches "kimcrawfordmd.com" typed without a scheme.
const LINK_RE =
  /(https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(com|net|org|io|co|info|biz|xyz|site|online|shop|store|app|me|uk|ke|so|et|ng|top|club|live|solutions|kitchen|agency|services)\b/i;

// Phrasing that only appears in SEO filler, never in a real bio.
const BOILERPLATE_RE =
  /\b(look no further|near me|you'?ve come to the right place|top-notch|we (deliver|provide|offer) (top|expert|reliable|luxurious))\b/i;

export function containsLink(s: string | null | undefined): boolean {
  return !!s && LINK_RE.test(s);
}

export const NO_LINKS_MSG = "Links aren't allowed here — put your website in the website field.";
/** zod refine helper: passes when the value has no link. */
export function noLinks(v: string | null | undefined): boolean {
  return !containsLink(v);
}

export interface SpamInput {
  name: string;
  headline?: string | null;
  summary?: string | null;
  /** Experiences + education + skills + certs (or projects etc. for firms). */
  contentCount: number;
}

// High-precision only. Rule A alone catches most of the wave; B and C need
// an otherwise-empty profile so a real consultant who pastes a portfolio
// link in their summary is never caught.
export function spamVerdict(i: SpamInput): { spam: boolean; reason: string } {
  if (containsLink(i.name)) return { spam: true, reason: "link in name" };
  if (containsLink(i.headline)) return { spam: true, reason: "link in headline" };
  if (i.contentCount === 0) {
    if (containsLink(i.summary)) return { spam: true, reason: "link in summary, empty profile" };
    if (i.summary && BOILERPLATE_RE.test(i.summary)) return { spam: true, reason: "SEO boilerplate, empty profile" };
  }
  return { spam: false, reason: "" };
}
