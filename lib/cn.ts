// Tiny classnames helper. Tailwind utility merging is left to ordering
// discipline; if it becomes a real problem we'll bring in tailwind-merge.
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
