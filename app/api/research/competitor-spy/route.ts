import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { handle, platform = "instagram" } = await req.json();
    if (!handle) return NextResponse.json({ error: "handle is required" }, { status: 400 });

    const cleanHandle = handle.replace(/^@/, "").trim();
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";
    const model = process.env.OPENAI_MODEL || "google/gemini-2.0-flash-001";

    // Fetch real-time context about this brand/handle via Perplexity
    let newsContext = "";
    const { searchWeb } = await import("@/lib/perplexity");
    const webInfo = await searchWeb(
      `Search the web for recent news, social media posts, and public information about "${cleanHandle}" on ${platform}. What are they known for? Any recent activity or news in the last 30 days? Summarize briefly.`,
      { maxTokens: 250 }
    );
    if (webInfo) newsContext = `\nReal-time web context about them: ${webInfo}`;

    if (!apiKey || apiKey === "your_openai_api_key_here") {
      return NextResponse.json(getDemoAnalysis(cleanHandle, platform));
    }

    const prompt = `You are a social media strategist. Analyze the content strategy of "${cleanHandle}" on ${platform}.${newsContext}

Return ONLY valid JSON:
{
  "handle": "${cleanHandle}",
  "platform": "${platform}",
  "overview": "2-3 sentence summary of their overall content strategy",
  "postingFrequency": "e.g. 1-2x daily, 3-4x per week",
  "topTopics": [
    { "topic": "Topic name", "percentage": 35, "description": "Brief description" }
  ],
  "contentTypes": [
    { "type": "Reels/Short Video", "percentage": 45, "engagement": "High" }
  ],
  "tone": "Professional & Educational",
  "audienceAge": "25-34",
  "engagementStyle": "Question-based CTAs, polls, controversial takes",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["gap 1", "gap 2"],
  "opportunities": ["What you could do differently to compete", "another opportunity"],
  "estimatedFollowers": "50K-500K",
  "growthTrend": "growing|stable|declining",
  "keyTakeaway": "One actionable insight for competing with them"
}

Return exactly 4 topTopics, 3 contentTypes, 3 strengths, 2 weaknesses, 2 opportunities. Be realistic and specific.`;

    const aiRes = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(baseUrl.includes("openrouter") && { "HTTP-Referer": "http://localhost:3000" }),
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      }),
    });

    if (!aiRes.ok) return NextResponse.json(getDemoAnalysis(cleanHandle, platform));

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content || "{}";
    try {
      return NextResponse.json(JSON.parse(raw));
    } catch {
      return NextResponse.json(getDemoAnalysis(cleanHandle, platform));
    }
  } catch (err) {
    console.error("competitor-spy error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

function getDemoAnalysis(handle: string, platform: string) {
  return {
    handle,
    platform,
    overview: `${handle} focuses on a mix of educational and entertaining content, consistently targeting a tech-savvy millennial audience. They build authority through data-backed posts and behind-the-scenes storytelling. Their engagement strategy centers on controversial opinions and relatable pain points.`,
    postingFrequency: "1-2x daily",
    topTopics: [
      { topic: "Industry News & Trends", percentage: 32, description: "Breaking down what's happening in the niche" },
      { topic: "How-to & Tutorials", percentage: 28, description: "Step-by-step educational content" },
      { topic: "Personal Stories", percentage: 22, description: "Behind-the-scenes and personal journey" },
      { topic: "Product/Tool Reviews", percentage: 18, description: "Honest reviews with affiliate potential" },
    ],
    contentTypes: [
      { type: "Short Video / Reels", percentage: 45, engagement: "Very High" },
      { type: "Carousels / Slideshows", percentage: 30, engagement: "High" },
      { type: "Single Image + Caption", percentage: 25, engagement: "Medium" },
    ],
    tone: "Conversational & Authoritative",
    audienceAge: "25-35",
    engagementStyle: "Ends posts with questions, uses polls regularly, responds to comments within 1hr",
    strengths: ["Consistent posting schedule builds habit", "Strong visual branding — instantly recognizable", "Excellent at simplifying complex topics"],
    weaknesses: ["Rarely covers emerging topics early", "Limited cross-platform presence"],
    opportunities: ["Create content they're not covering: beginner guides would fill a clear gap", "Post at 6-8pm when their audience is online but they don't post"],
    estimatedFollowers: "50K-200K",
    growthTrend: "growing",
    keyTakeaway: `${handle} wins on consistency and authority. Beat them by being faster to trending topics and more raw/authentic in your storytelling.`,
  };
}
