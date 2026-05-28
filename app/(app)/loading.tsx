// Default loading state for any auth-gated page. The skeleton mirrors the
// section-card rhythm so the layout doesn't jump when content streams in.
export default function AppLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-40 bg-border-soft rounded mb-3" />
      <div className="h-12 w-72 bg-border-soft rounded mb-2" />
      <div className="h-4 w-96 max-w-full bg-border-soft rounded mb-8" />
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card">
              <div className="h-4 w-24 bg-border-soft rounded mb-3" />
              <div className="h-6 w-52 bg-border-soft rounded mb-2" />
              <div className="h-3 w-full bg-border-soft rounded" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="card h-32" />
          <div className="card h-32" />
        </div>
      </div>
    </div>
  );
}
