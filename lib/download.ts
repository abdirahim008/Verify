// Client-side file download that never saves an error as a file.
//
// A bare <a href download> saves whatever the server sends back. When a PDF
// route fails, it answers with a small JSON error, and the browser saved
// that as "classic.json". This fetches first, checks it really got the
// expected file type, and only then saves it; otherwise it returns a message
// the UI can show.

export type DownloadResult = { ok: true } | { ok: false; message: string };

export async function downloadFile(
  url: string,
  opts: { fallbackName: string; expect: RegExp },
): Promise<DownloadResult> {
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", credentials: "same-origin" });
  } catch {
    return { ok: false, message: "Network problem. Check your connection and try again." };
  }

  const type = res.headers.get("content-type") ?? "";
  if (!res.ok || !opts.expect.test(type)) {
    let message = "";
    if (type.includes("application/json")) {
      try { message = (await res.json())?.error ?? ""; } catch { /* unreadable body */ }
    }
    // Signed out: the API says 401, or the middleware redirects to /login.
    const toLogin = res.redirected && (() => { try { return new URL(res.url).pathname === "/login"; } catch { return false; } })();
    if (res.status === 401 || toLogin) message = "Your session has expired. Please sign in again, then download.";
    if (!message) {
      message = res.status === 504 || res.status >= 500
        ? "The file took too long to create. Please try again in a moment."
        : "Couldn't create the file. Please try again.";
    }
    return { ok: false, message };
  }

  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filenameFrom(res.headers.get("content-disposition")) || opts.fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoking straight away can cancel the save in Safari and Firefox.
  setTimeout(() => URL.revokeObjectURL(href), 60_000);
  return { ok: true };
}

/** The filename from a Content-Disposition header, preferring filename*. */
function filenameFrom(header: string | null): string {
  if (!header) return "";
  const star = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(header);
  if (star) { try { return decodeURIComponent(star[1].trim()); } catch { /* fall through */ } }
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : "";
}
