"use client";

// Last-resort boundary used when the root layout itself errors (Next
// docs: app/global-error.tsx). Renders its own <html> and <body>.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif", padding: 40, color: "#1c1c1c" }}>
        <h1 style={{ fontSize: 28, fontWeight: 500 }}>Something broke.</h1>
        <p style={{ marginTop: 8, color: "#5e6166" }}>The whole page failed to load. Try refreshing the browser.</p>
        {error.digest && <p style={{ marginTop: 4, fontSize: 12, color: "#8d9197" }}>Error id: {error.digest}</p>}
        <button onClick={reset} style={{ marginTop: 16, padding: "8px 16px", borderRadius: 6, border: "1px solid #1c1c1c", background: "#1c1c1c", color: "#fff", cursor: "pointer" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
