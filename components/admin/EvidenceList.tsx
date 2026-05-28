import { adminSignEvidence } from "@/lib/actions/verification";

// Server component: signs each evidence path on render. The list is small
// (max 5 per request) so doing one signed-url-per-path inline is fine. If
// it grows, swap to a single batched sign action.
export async function EvidenceList({ paths }: { paths: string[] }) {
  if (paths.length === 0) {
    return <p className="mt-2 text-[13px] text-muted">No evidence attached.</p>;
  }
  const signed = await Promise.all(paths.map(async (p) => ({ path: p, url: await adminSignEvidence(p) })));
  return (
    <ul className="mt-3 space-y-2">
      {signed.map(({ path, url }) => {
        const name = path.split("/").pop() ?? path;
        return (
          <li key={path} className="flex items-center justify-between gap-3 rounded-md border border-border bg-paper px-3 py-2 text-[13px]">
            <span className="truncate">{name}</span>
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-sienna font-medium hover:underline whitespace-nowrap">
                Open ↗
              </a>
            ) : (
              <span className="text-muted">unavailable</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
