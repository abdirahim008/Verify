import "server-only";
import { existsSync } from "node:fs";
import type { Browser } from "puppeteer-core";

// Lazy import of puppeteer-core/chromium-min — they're large and we only
// need them inside the PDF route handler. Top-level imports would balloon
// the cold-start of every route that touches `lib/`.

let cachedBrowser: Browser | null = null;
// Reuse the browser across invocations during local dev to avoid the ~2s
// chromium spin-up on every download. In serverless (Vercel) the function
// instance dies between requests, so caching is automatic-ish.

export async function getBrowser(): Promise<Browser> {
  if (cachedBrowser && cachedBrowser.connected) return cachedBrowser;

  // serverless / Vercel uses the bundled chromium-min binary, fetched once
  // from CHROMIUM_REMOTE_EXEC_PATH and cached on the lambda's /tmp.
  const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isServerless) {
    const remote = process.env.CHROMIUM_REMOTE_EXEC_PATH;
    if (!remote) {
      throw new Error("CHROMIUM_REMOTE_EXEC_PATH is required in serverless environments.");
    }
    const chromium = (await import("@sparticuz/chromium-min")).default;
    const puppeteer = (await import("puppeteer-core")).default;
    // Disable the GPU/graphics stack. On Vercel's Hobby plan a function gets
    // ~1024 MB; Chromium with graphics mode on can spike past that and get
    // OOM-killed mid-render, which reaches the user as an aborted download
    // ("site wasn't available") rather than a clean error. We only rasterise
    // static HTML to a PDF, so we never need it.
    chromium.setGraphicsMode = false;
    cachedBrowser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(remote),
      headless: chromium.headless,
    });
    return cachedBrowser!;
  }

  // Local dev — find an installed Chrome / Edge.
  const puppeteer = (await import("puppeteer-core")).default;
  const localPath = process.env.PUPPETEER_EXECUTABLE_PATH || findLocalChrome();
  if (!localPath) {
    throw new Error(
      "No Chrome found. Install Chrome (or Edge) or set PUPPETEER_EXECUTABLE_PATH in .env.local.",
    );
  }
  cachedBrowser = await puppeteer.launch({
    executablePath: localPath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  return cachedBrowser!;
}

function findLocalChrome(): string | null {
  const candidates = [
    // Windows
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    // macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    // Linux
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/microsoft-edge",
  ];
  for (const c of candidates) {
    try { if (existsSync(c)) return c; } catch { /* ignore */ }
  }
  return null;
}
