/**
 * Perplexity Sonar via OpenRouter — real-time web search
 * Uses the same OPENAI_API_KEY and OPENAI_BASE_URL as the rest of the app.
 * Perplexity models actively search the live web before responding.
 */

const SEARCH_MODEL = "perplexity/sonar";

interface PerplexityOptions {
  systemPrompt?: string;
  maxTokens?: number;
}

/**
 * Send a prompt to Perplexity Sonar and get a response with live web data.
 * Returns the raw text content from the model.
 */
export async function searchWeb(
  prompt: string,
  options: PerplexityOptions = {}
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";

  if (!apiKey || apiKey === "your_openai_api_key_here") return null;

  const messages: { role: string; content: string }[] = [];

  if (options.systemPrompt) {
    messages.push({ role: "system", content: options.systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(baseUrl.includes("openrouter") && {
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://trendforge-enlq.vercel.app",
          "X-Title": "TrendForge",
        }),
      },
      body: JSON.stringify({
        model: SEARCH_MODEL,
        messages,
        max_tokens: options.maxTokens || 2000,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.warn(`[Perplexity] API error ${res.status}:`, err.slice(0, 200));
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn("[Perplexity] Request failed:", err);
    return null;
  }
}

/**
 * Search the web and parse JSON from the response.
 * Handles markdown code fences and partial JSON extraction.
 */
export async function searchWebJson<T>(
  prompt: string,
  options: PerplexityOptions = {}
): Promise<T | null> {
  const raw = await searchWeb(prompt, options);
  if (!raw) return null;

  // Strip markdown fences
  let cleaned = raw.replace(/^```(?:json)?\s*/im, "").replace(/\s*```$/im, "").trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Try to extract a JSON object from within the text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]) as T; } catch {}
    }
    // Try JSON array
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      try { return JSON.parse(arrMatch[0]) as T; } catch {}
    }
    console.warn("[Perplexity] Failed to parse JSON from response:", cleaned.slice(0, 300));
    return null;
  }
}
