// Where to send someone after they sign in. `next` arrives in the URL, so it
// is only honoured when it is a path on this site: "/cover-letter?job=…" yes,
// "https://elsewhere.example" or "//elsewhere.example" no.
export function safeNextPath(next: string | null | undefined): string {
  return next && /^\/(?![/\\])/.test(next) ? next : "/home";
}
