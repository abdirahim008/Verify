import "server-only";

// DeepSeek chat completions (OpenAI-compatible API) in JSON output mode.
// Env: DEEPSEEK_API_KEY (required to enable the AI import), DEEPSEEK_MODEL
// (default "deepseek-flash" — DeepSeek V4.1-Flash; "deepseek-v4-pro" for
// the larger model), DEEPSEEK_BASE_URL (optional override, e.g. a proxy or a
// local mock in tests). Docs: https://api-docs.deepseek.com
//
// Both models think before answering by default, and the thinking counts
// against max_tokens; with a long CV it used the whole budget and the answer
// came back empty. Reading a profile out of text doesn't need it, so thinking
// is switched off (also faster and cheaper).

const BASE = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");

export function aiConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

export async function deepseekJson(system: string, user: string, opts: { maxTokens?: number; timeoutMs?: number } = {}): Promise<unknown> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("AI import isn't configured.");
  const body = JSON.stringify({
    model: process.env.DEEPSEEK_MODEL || "deepseek-flash",
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
    thinking: { type: "disabled" },
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: opts.maxTokens ?? 8000,
    stream: false,
  });

  // One deadline for the whole call, retry included, so it ends inside the
  // route's 60 s limit. It also covers reading the body: DeepSeek sends the
  // headers at once and keeps the connection open while it writes.
  const deadline = Date.now() + (opts.timeoutMs ?? 52000);
  // JSON mode can occasionally return empty content (documented); retry once.
  for (let attempt = 0; attempt < 2; attempt++) {
    const left = deadline - Date.now();
    if (left < 8000) break;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), left);
    let status = 0, raw = "";
    try {
      const res = await fetch(`${BASE}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body, signal: ctrl.signal,
      });
      status = res.status;
      raw = await res.text();
    } catch {
      if (attempt === 0 && !ctrl.signal.aborted) continue;
      throw new Error(ctrl.signal.aborted ? "The AI took too long. Please try again." : "Couldn't reach the AI service.");
    } finally {
      clearTimeout(timer);
    }
    if (status < 200 || status >= 300) {
      console.error(`[deepseek] ${status}: ${raw.slice(0, 300)}`);
      if (status >= 500 && attempt === 0) continue;
      throw new Error(status === 402 ? "The AI service is out of credit." : "The AI service returned an error.");
    }
    let json: { choices?: { message?: { content?: string }; finish_reason?: string }[] };
    try { json = JSON.parse(raw); } catch { console.error(`[deepseek] unreadable response: ${raw.slice(0, 200)}`); continue; }
    const choice = json.choices?.[0];
    const content = choice?.message?.content?.trim();
    if (!content) { console.error(`[deepseek] empty answer (finish_reason: ${choice?.finish_reason ?? "none"})`); continue; }
    try {
      return JSON.parse(content);
    } catch {
      console.error(`[deepseek] unparseable answer (finish_reason: ${choice?.finish_reason ?? "none"}, ${content.length} chars)`);
      if (attempt === 0) continue;
      throw new Error("The AI returned an unreadable answer. Please try again.");
    }
  }
  throw new Error("The AI returned an empty answer. Please try again.");
}
