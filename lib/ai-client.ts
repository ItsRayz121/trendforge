/**
 * Shared AI client — uses Gemini 2.0 Flash via OpenRouter for all generation/reasoning.
 * Perplexity Sonar (real-time search) is handled separately in lib/perplexity.ts.
 */

export interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  provider: "openrouter" | "none";
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICallOptions {
  messages: AIMessage[];
  maxTokens?: number;
  jsonMode?: boolean;
}

/** Get the active AI provider config */
export function getAIConfig(): AIConfig {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (openaiKey && openaiKey !== "your_openai_api_key_here") {
    return {
      apiKey: openaiKey,
      baseUrl: (process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, ""),
      model: process.env.OPENAI_MODEL || "google/gemini-2.0-flash-001",
      provider: "openrouter",
    };
  }

  return { apiKey: "", baseUrl: "", model: "", provider: "none" };
}

/** Check if any AI provider is configured */
export function hasAIProvider(): boolean {
  const config = getAIConfig();
  return config.provider !== "none";
}

/**
 * Call the AI with messages and get raw text back.
 * Returns null if no provider is configured or the call fails.
 */
export async function callAI(options: AICallOptions): Promise<string | null> {
  const config = getAIConfig();
  if (config.provider === "none") return null;

  const { messages, maxTokens = 2000, jsonMode = false } = options;

  const body: Record<string, any> = {
    model: config.model,
    messages,
    max_tokens: maxTokens,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  try {
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://trendforge-enlq.vercel.app",
        "X-Title": "TrendForge",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`[ai-client] ${config.provider} error ${res.status}:`, errText.slice(0, 200));
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn(`[ai-client] ${config.provider} request failed:`, err);
    return null;
  }
}

/**
 * Call AI and parse the response as JSON.
 * Handles markdown fences and partial extraction.
 */
export async function callAIJson<T>(options: AICallOptions): Promise<T | null> {
  const raw = await callAI({ ...options, jsonMode: true });
  if (!raw) return null;

  let cleaned = raw.replace(/^```(?:json)?\s*/im, "").replace(/\s*```$/im, "").trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try { return JSON.parse(objMatch[0]) as T; } catch {}
    }
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      try { return JSON.parse(arrMatch[0]) as T; } catch {}
    }
    console.warn("[ai-client] Failed to parse JSON:", cleaned.slice(0, 300));
    return null;
  }
}
