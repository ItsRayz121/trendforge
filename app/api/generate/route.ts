import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/ai";
import type { GenerateRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();

    if (!body.topic || !body.platforms || body.platforms.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: topic and platforms" },
        { status: 400 }
      );
    }

    // Check for custom key from client headers first, then env
    const customApiKey = req.headers.get("x-custom-api-key");
    const customModel = req.headers.get("x-ai-model");
    const apiKey = customApiKey || process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = customModel || process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (apiKey && apiKey !== "your_openai_api_key_here") {
      // OpenRouter/OpenAI generation
      const outputs = await Promise.all(
        body.platforms.map(async (platform) => {
          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
              ...(baseUrl.includes("openrouter") && { "HTTP-Referer": "http://localhost:3000" }),
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "system",
                  content: `You are a professional social media content creator. Generate platform-optimized content in JSON format.`,
                },
                {
                  role: "user",
                  content: `Create a ${body.tone} ${platform} post about "${body.topic}" for ${body.country} ${body.niche} audience.
Return JSON: { "content": "...", "hashtags": ["#tag1", "#tag2"], "cta": "...", "charCount": 0 }
Platform rules:
- twitter: max 280 chars, 1-3 hashtags
- instagram: max 2200 chars, 5-10 hashtags, emojis
- facebook: conversational, 3-5 hashtags
- telegram: detailed, markdown supported
- linkedin: professional tone, max 3000 chars, 3-5 hashtags${body.customPrompt ? `\n\nAdditional instructions: ${body.customPrompt}` : ""}`,
                },
              ],
              response_format: { type: "json_object" },
              max_tokens: 2000,
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API error ${response.status}: ${errText}`);
          }
          const data = await response.json();
          const raw = data.choices?.[0]?.message?.content || "{}";
          let parsed: any = {};
          try {
            parsed = JSON.parse(raw);
          } catch {
            // Gemini sometimes returns truncated JSON — extract what we can
            const contentMatch = raw.match(/"content"\s*:\s*"([\s\S]*?)(?:"|$)/);
            parsed = { content: contentMatch?.[1] || raw.slice(0, 500), hashtags: [], cta: "" };
          }
          return { platform, ...parsed, charCount: parsed.content?.length || 0 };
        })
      );

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
