import { NextRequest, NextResponse } from "next/server";
import type { Trend, TrendAnalysis } from "@/lib/types";
import { searchWeb } from "@/lib/perplexity";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const trend: Trend = await req.json();
    if (!trend?.title) {
      return NextResponse.json({ error: "trend is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";
    const model = process.env.OPENAI_MODEL || "google/gemini-2.0-flash-001";

    if (!apiKey || apiKey === "your_openai_api_key_here") {
      return NextResponse.json(getFallbackAnalysis(trend));
    }

    // Enrich with real-time web context via Perplexity
    let liveContext = "";
    const webContext = await searchWeb(
      `Search the web for the latest news, discussions, and social media reactions about "${trend.title}" from the last 24-48 hours. Summarize in 3-4 sentences what people are saying and why it's getting attention right now.`,
      { maxTokens: 300 }
    );
    if (webContext) {
      liveContext = `\n\nLive web context (searched right now):\n${webContext}`;
    }

    const prompt = `You are a viral content strategist and social media expert. Analyze this trending topic and provide deep, actionable insights for content creators.

Trend: "${trend.title}"
Summary: ${trend.summary || "N/A"}
Category: ${trend.category}
Country: ${trend.country}
Published: ${trend.publishedAt}${liveContext}

Return ONLY valid JSON with this exact structure:
{
  "whyTrending": "2-3 sentence explanation of exactly why this is trending right now — reference specific events, cultural moments, or data points",
  "viralityScore": 85,
  "audienceRelevance": "Who cares about this and why — be specific about demographics and pain points",
  "contentAngles": [
    "Specific angle 1 — actionable headline idea",
    "Specific angle 2 — actionable headline idea",
    "Specific angle 3 — actionable headline idea",
    "Specific angle 4 — actionable headline idea"
  ],
  "bestPlatforms": ["twitter", "instagram"],
  "postingWindow": "Specific time recommendation with urgency level",
  "sampleHook": "One powerful opening line that would stop the scroll",
  "keyInsight": "The one non-obvious thing most creators will miss about this trend"
}

viralityScore must be a number 1-100. bestPlatforms must only contain values from: twitter, instagram, facebook, telegram, linkedin. contentAngles must have exactly 4 items. Be specific and actionable, not generic.`;

    const aiRes = await fetch(`${baseUrl}/chat/completions`, {
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
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      }),
    });

    if (!aiRes.ok) {
      console.warn("analyze-trend AI error:", aiRes.status);
      return NextResponse.json(getFallbackAnalysis(trend));
    }

    const aiData = await aiRes.json();
    let raw = aiData.choices?.[0]?.message?.content || "{}";
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        try { parsed = JSON.parse(m[0]); } catch {}
      }
    }

    if (!parsed.whyTrending) {
      return NextResponse.json(getFallbackAnalysis(trend));
    }

    const analysis: TrendAnalysis = {
      trend,
      whyTrending: parsed.whyTrending,
      viralityScore: typeof parsed.viralityScore === "number" ? parsed.viralityScore : trend.virality,
      audienceRelevance: parsed.audienceRelevance || "",
      contentAngles: Array.isArray(parsed.contentAngles) ? parsed.contentAngles : trend.contentAngles,
      bestPlatforms: Array.isArray(parsed.bestPlatforms) ? parsed.bestPlatforms : trend.platforms,
      postingWindow: parsed.postingWindow || "Post within the next 12 hours",
      sampleHook: parsed.sampleHook || `Here's what nobody is saying about ${trend.title}`,
    };

    return NextResponse.json(analysis);
  } catch (err) {
    console.error("analyze-trend error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

function getFallbackAnalysis(trend: Trend): TrendAnalysis {
  return {
    trend,
    whyTrending: `${trend.title} is gaining traction because it directly impacts audiences in ${trend.country}. The combination of media coverage and social sharing is creating a compounding viral effect that's driving engagement across platforms.`,
    viralityScore: trend.virality,
    audienceRelevance: `High relevance for ${trend.category} audiences — this topic connects with key pain points and aspirations of your target demographic.`,
    contentAngles: trend.contentAngles?.length
      ? trend.contentAngles
      : [
          `Breaking down ${trend.title} — what it means for you`,
          `The truth about ${trend.title} nobody is telling you`,
          `How to use ${trend.title} to your advantage right now`,
          `${trend.title}: My honest take after diving deep`,
        ],
    bestPlatforms: trend.platforms || ["twitter", "instagram"],
    postingWindow: "Post within the next 12 hours while the conversation is active",
    sampleHook: `Here's what nobody is talking about with ${trend.title.split(" ").slice(0, 5).join(" ")} 👀`,
  };
}
