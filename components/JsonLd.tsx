// Drops one or more JSON-LD objects into the page as a script tag.
// Server component — no client JS. Pass any number of schema.org objects.
export function JsonLd({ data }: { data: object | object[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((b, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Schema objects are built server-side from our own data — safe.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }}
        />
      ))}
    </>
  );
}
