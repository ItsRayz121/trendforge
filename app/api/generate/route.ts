import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/ai";
import { getAIConfig } from "@/lib/ai-client";
import { createClient } from "@/lib/supabase-server";
import type { GenerateRequest } from "@/lib/types";

/** Pull a string field from an object, trying multiple key spellings */
function extractField(obj: any, ...keys: string[]): string {
  for (const key of keys) {
    if (typeof obj?.[key] === "string" && obj[key].trim()) return obj[key];
  }
  return "";
}

/** Drill into nested objects to find the actual content object */
function unwrapParsed(parsed: any): any {
  if (!parsed || typeof parsed !== "object") return {};
  // If it already has a "content" string field, use it directly
  if (typeof parsed.content === "string") return parsed;
  // Otherwise look one level deep (e.g. { instagram_post: { content, hashtags, cta } })
  for (const key of Object.keys(parsed)) {
    const val = parsed[key];
    if (val && typeof val === "object" && typeof val.content === "string") {
      return val;
    }
  }
  return parsed;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();

    if (!body.topic || !body.platforms || body.platforms.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: topic and platforms" },
        { status: 400 }
      );
    }

    const customApiKey = req.headers.get("x-custom-api-key");
    const customModel = req.headers.get("x-ai-model");
    const customBaseUrl = req.headers.get("x-base-url");

    // Use custom headers if provided, else use best available provider (DeepSeek > Gemini)
    const aiConfig = getAIConfig();
    const apiKey = customApiKey || aiConfig.apiKey;
    const baseUrl = customBaseUrl || aiConfig.baseUrl;
    const model = customModel || aiConfig.model;

    if (apiKey) {
      const outputs = await Promise.all(
        body.platforms.map(async (platform) => {
          const platformRules: Record<string, string> = {
            twitter: "Max 280 characters total. 1-3 hashtags only. Punchy and concise.",
            instagram: "Max 2200 chars. 5-10 hashtags. Use emojis naturally.",
            facebook: "Conversational tone. 3-5 hashtags. Can be longer.",
            telegram: "Detailed, markdown supported. No char limit.",
            linkedin: "Professional tone. Max 3000 chars. 3-5 hashtags.",
          };

          const response = await fetch(`${baseUrl}/chat/completions`, {
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
              model,
              messages: [
                {
                  role: "system",
                  content:
                    "You are a professional social media content creator. Always respond with valid JSON only — no markdown, no explanation, no code fences. The JSON must have exactly these fields: content (string), hashtags (array of strings), cta (string).",
                },
                {
                  role: "user",
                  content: `Write a ${body.tone || "professional"} ${platform} post about: "${body.topic}"
Target audience: ${body.country || "Global"} — ${body.niche || "General"}
Platform rule: ${platformRules[platform] || ""}
${body.customPrompt ? `Extra instructions: ${body.customPrompt}` : ""}

Respond with this JSON and nothing else:
{
  "content": "<the post text>",
  "hashtags": ["#tag1", "#tag2"],
  "cta": "<call to action sentence>"
}`,
                },
              ],
              max_tokens: 2000,
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API error ${response.status}: ${errText}`);
          }

          const data = await response.json();
          let raw: string = data.choices?.[0]?.message?.content || "{}";

          // Strip markdown code fences if the model added them
          raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

          let parsed: any = {};
          try {
            parsed = JSON.parse(raw);
          } catch {
            // Try extracting JSON object from within the text
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try { parsed = JSON.parse(jsonMatch[0]); } catch { /* ignore */ }
            }
            if (!parsed.content) {
              // Last resort: pull content with regex
              const contentMatch = raw.match(/"content"\s*:\s*"([\s\S]*?)(?<!\\)"/);
              parsed = {
                content: contentMatch?.[1]?.replace(/\\n/g, "\n") || raw.slice(0, 1000),
                hashtags: [],
                cta: "",
              };
            }
          }

          // Unwrap nested structures (some models nest inside a platform key)
          parsed = unwrapParsed(parsed);

          const content = extractField(parsed, "content", "text", "post", "body");
          const hashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags : [];
          const cta = extractField(parsed, "cta", "call_to_action", "callToAction");

          // If AI returned empty content, log the raw response for debugging
          if (!content) {
            console.warn(`[generate] Empty content for ${platform}. Raw response:`, raw.slice(0, 500));
          }

          return {
            platform,
            content,
            hashtags,
            cta,
            charCount: content.length,
          };
        })
      );

      // If all outputs came back empty, fall through to mock generation
      const anyContent = outputs.some((o) => o.content.trim().length > 0);
      if (!anyContent) {
        console.warn("[generate] All AI outputs empty — falling back to mock");
        const mock = await generateContent(body);
        return NextResponse.json(mock);
      }

      // Log to Supabase (fire-and-forget)
      const sbClient = createClient();
      void sbClient.from("content_generations").insert({
        topic: body.topic,
        platforms: body.platforms,
        generated_at: new Date().toISOString(),
      });

      return NextResponse.json({
        outputs,
        generatedAt: new Date().toISOString(),
        topic: body.topic,
      });
    }

    // Fall back to mock generation
    const result = await generateContent(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
