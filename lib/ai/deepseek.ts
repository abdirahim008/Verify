import "server-only";

// DeepSeek chat completions (OpenAI-compatible API) in JSON output mode.
// Env: DEEPSEEK_API_KEY (required to enable the AI import), DEEPSEEK_MODEL
// (default "deepseek-flash" — DeepSeek V4.1-Flash; "deepseek-v4-pro" for
// the larger model), DEEPSEEK_BASE_URL (optional override, e.g. a proxy or a
// local mock in tests). Docs: https://api-docs.deepseek.com

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
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: opts.maxTokens ?? 4000,
    stream: false,
  });

  // JSON mode can occasionally return empty content (documented); retry once.
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 45000);
    let res: Response;
    try {
      res = await fetch(`${BASE}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body, signal: ctrl.signal,
      });
    } catch (e) {
      clearTimeout(timer);
      if (attempt === 0) continue;
      throw new Error(e instanceof Error && e.name === "AbortError" ? "The AI took too long. Please try again." : "Couldn't reach the AI service.");
    }
    clearTimeout(timer);
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[deepseek] ${res.status}: ${detail.slice(0, 300)}`);
      if (res.status >= 500 && attempt === 0) continue;
      throw new Error(res.status === 402 ? "The AI service is out of credit." : "The AI service returned an error.");
    }
    const json = await res.json() as { choices?: { message?: { content?: string }; finish_reason?: string }[] };
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) continue;
    try {
      return JSON.parse(content);
    } catch {
      if (attempt === 0) continue;
      throw new Error("The AI returned an unreadable answer. Please try again.");
    }
  }
  throw new Error("The AI returned an empty answer. Please try again.");
}
