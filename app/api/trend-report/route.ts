import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const CACHE_HOURS = 6; // re-use cached report within 6 hours

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const niche = searchParams.get("niche") || "tech";
    const country = searchParams.get("country") || "US";

    // Check cache
    const cacheAfter = new Date(Date.now() - CACHE_HOURS * 60 * 60 * 1000).toISOString();
    const { data: cached } = await supabase
      .from("trend_reports")
      .select("*")
      .eq("niche", niche)
      .eq("country", country)
      .gte("generated_at", cacheAfter)
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      return NextResponse.json({ ...cached.report, cached: true, generatedAt: cached.generated_at });
    }

    // Fetch latest headlines for this niche
    let headlines: string[] = [];
    const gnewsKey = process.env.GNEWS_API_KEY;

    if (gnewsKey && gnewsKey !== "your_gnews_api_key_here") {
      const params = new URLSearchParams({
        apikey: gnewsKey,
        lang: "en",
        max: "10",
        topic: niche.toLowerCase(),
        country: country.toLowerCase(),
      });
      const res = await fetch(`https://gnews.io/api/v4/top-headlines?${params}`, {
        next: { revalidate: 0 },
      });
      if (res.ok) {
        const data = await res.json();
        headlines = (data.articles || []).map((a: any) => a.title).filter(Boolean);
      }
    }

    // Use demo headlines if no GNews
    if (headlines.length === 0) {
      headlines = getDemoHeadlines(niche);
    }

    // Generate AI report
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";
    const model = process.env.OPENAI_MODEL || "google/gemini-2.0-flash-001";

    if (!apiKey || apiKey === "your_openai_api_key_here") {
      const demo = getDemoReport(niche, country);
      return NextResponse.json({ ...demo, cached: false, generatedAt: new Date().toISOString() });
    }

    const prompt = `You are a social media strategy expert. Analyze these trending headlines for the "${niche}" niche in ${country} and generate a comprehensive weekly trend report.

Headlines:
${headlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Return ONLY valid JSON in this exact format:
{
  "topTopics": [
    { "title": "Topic name", "summary": "2 sentence summary", "relevance": 85, "contentAngle": "Specific angle for creators" }
  ],
  "contentFormats": [
    { "format": "Short Video", "reason": "Why this format works now", "platforms": ["instagram", "twitter"], "boost": "+42% engagement" }
  ],
  "postingTimes": [
    { "platform": "instagram", "bestTimes": ["9am", "6pm"], "bestDays": ["Tuesday", "Thursday"], "tip": "Quick tip" }
  ],
  "trendingHashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "weeklyInsight": "One paragraph summary of the overall trend landscape this week",
  "audienceMood": "curious|inspired|concerned|excited|nostalgic",
  "hotContentType": "Educational|Entertainment|News|Inspirational|Controversial"
}

Return exactly 5 topTopics, 4 contentFormats, 4 postingTimes entries, and 8 hashtags.`;

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
        max_tokens: 2000,
      }),
    });

    if (!aiRes.ok) {
      const demo = getDemoReport(niche, country);
      return NextResponse.json({ ...demo, cached: false, generatedAt: new Date().toISOString() });
    }

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content || "{}";
    let report: any = {};
    try {
      report = JSON.parse(raw);
    } catch {
      report = getDemoReport(niche, country);
    }

    // Cache to Supabase
    await supabase.from("trend_reports").insert({
      niche,
      country,
      report,
      generated_at: new Date().toISOString(),
    });

    return NextResponse.json({ ...report, cached: false, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("trend-report error:", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}

function getDemoHeadlines(niche: string): string[] {
  const map: Record<string, string[]> = {
    tech: [
      "AI agents are replacing junior developers at major tech firms",
      "OpenAI launches GPT-5 with real-time internet access",
      "Apple Vision Pro 2 rumored for Q3 release",
      "Cybersecurity breaches hit record high in Q1 2026",
      "Quantum computing startup raises $500M Series B",
    ],
    business: [
      "Remote work policies divide Fortune 500 companies",
      "Inflation eases as Fed signals rate cuts ahead",
      "Small businesses outperform large corporations in Q1 growth",
      "Startup ecosystem sees record VC funding in Southeast Asia",
      "Gen Z entrepreneurs reshaping traditional industries",
    ],
    health: [
      "New GLP-1 drug shows 30% weight loss in trials",
      "Mental health apps see 200% surge in downloads",
      "WHO warns of next pandemic threat from bird flu",
      "Intermittent fasting linked to heart health improvements",
      "Sleep science revolution: 8 hours myth debunked",
    ],
    entertainment: [
      "Streaming wars intensify as Netflix loses subscribers",
      "AI-generated music tops charts for first time",
      "Gaming industry revenue surpasses film and music combined",
      "Short-form video dominates 2026 content consumption",
      "Virtual concerts attract 50M viewers worldwide",
    ],
  };
  return map[niche] || map.tech;
}

function getDemoReport(niche: string, country: string) {
  return {
    topTopics: [
      { title: "AI Productivity Tools", summary: "AI tools are transforming daily workflows across industries. Content creators who explain these tools gain massive audiences.", relevance: 92, contentAngle: "Show a before/after workflow comparison using AI tools" },
      { title: "Economic Uncertainty & Side Hustles", summary: "Rising interest in passive income and side businesses. Audiences are hungry for actionable financial advice.", relevance: 87, contentAngle: "Share a realistic 30-day side hustle income breakdown" },
      { title: "Mental Health & Burnout", summary: "Workplace burnout is at an all-time high. Authentic vulnerability content performs 3x better than polished advice.", relevance: 84, contentAngle: "A day in my life managing stress as a creator" },
      { title: "Sustainability & Green Tech", summary: "Gen Z audiences increasingly filter brands by sustainability. Educational eco-content builds long-term loyalty.", relevance: 79, contentAngle: "5 small swaps that actually reduce your carbon footprint" },
      { title: "Creator Economy Growth", summary: "More people are monetizing content than ever. How-to and behind-the-scenes content drives high saves.", relevance: 75, contentAngle: "How I made my first $1000 from content creation" },
    ],
    contentFormats: [
      { format: "Short-form Video (15–30s)", reason: "Algorithm heavily favors quick, punchy videos with strong hooks in the first 2 seconds.", platforms: ["instagram", "twitter"], boost: "+68% reach" },
      { format: "Carousel / Slideshow", reason: "Carousels generate 3x more saves than single images. Educational listicles perform best.", platforms: ["instagram", "linkedin"], boost: "+3x saves" },
      { format: "Thread / Long-form Text", reason: "Deep-dive threads build authority and get shared by niche communities.", platforms: ["twitter", "linkedin"], boost: "+45% followers" },
      { format: "Poll + Opinion Post", reason: "Interactive content triggers comments which boost algorithmic distribution.", platforms: ["twitter", "facebook"], boost: "+2x comments" },
    ],
    postingTimes: [
      { platform: "instagram", bestTimes: ["8–10am", "6–8pm"], bestDays: ["Tuesday", "Wednesday", "Friday"], tip: "Post Reels on weekday evenings for maximum reach" },
      { platform: "twitter", bestTimes: ["7–9am", "12–1pm"], bestDays: ["Monday", "Wednesday", "Thursday"], tip: "News-style content performs best during morning commute hours" },
      { platform: "linkedin", bestTimes: ["7–8am", "5–6pm"], bestDays: ["Tuesday", "Thursday"], tip: "Professional audiences engage most before and after work hours" },
      { platform: "facebook", bestTimes: ["1–3pm", "7–9pm"], bestDays: ["Wednesday", "Sunday"], tip: "Weekend evenings see high engagement from 35+ demographics" },
    ],
    trendingHashtags: [`#${niche}`, "#trending2026", "#contentcreator", "#viral", "#growthhacking", "#socialmedia", "#aitools", "#digitalmarketing"],
    weeklyInsight: `This week in ${niche}, audiences are gravitating toward authentic, educational content that provides immediate value. Short-form video continues to dominate discovery, while long-form text builds deeper community engagement. The most successful creators are combining trending topics with personal stories to drive higher save rates and shares.`,
    audienceMood: "curious",
    hotContentType: "Educational",
  };
}
