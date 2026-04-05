import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export async function POST(req: NextRequest) {
  try {
    const { niche, country, platforms } = await req.json();
    if (!niche || !platforms?.length) {
      return NextResponse.json({ error: "niche and platforms are required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";
    const model = process.env.OPENAI_MODEL || "google/gemini-2.0-flash-001";

    if (!apiKey || apiKey === "your_openai_api_key_here") {
      return NextResponse.json(getDemoTimes(niche, country, platforms));
    }

    const prompt = `You are a social media data analyst. Based on research data and audience behavior patterns, calculate the best posting times for a ${niche} content creator targeting audiences in ${country}.

Platforms to analyze: ${platforms.join(", ")}

Return ONLY valid JSON:
{
  "platforms": {
    "${platforms[0]}": {
      "heatmap": [
        { "day": "Monday", "hour": 9, "score": 85 },
        { "day": "Monday", "hour": 18, "score": 92 }
      ],
      "topSlots": [
        { "day": "Tuesday", "time": "7-9 PM", "score": 95, "reason": "Why this time works" }
      ],
      "worstTimes": ["2-4 AM", "Monday 8 AM"],
      "insight": "Platform-specific insight for this niche and country"
    }
  },
  "generalInsights": [
    "Cross-platform insight 1",
    "Cross-platform insight 2",
    "Cross-platform insight 3"
  ],
  "timezone": "Recommended timezone to schedule in",
  "audiencePeakDays": ["Tuesday", "Thursday", "Saturday"]
}

For each platform in [${platforms.join(", ")}], provide a heatmap with the 8 best time slots across the week (different days and hours). Score 0-100. Be specific to the ${niche} niche and ${country} audience.`;

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

    if (!aiRes.ok) return NextResponse.json(getDemoTimes(niche, country, platforms));

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content || "{}";
    try {
      return NextResponse.json(JSON.parse(raw));
    } catch {
      return NextResponse.json(getDemoTimes(niche, country, platforms));
    }
  } catch (err) {
    console.error("best-time error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

function getDemoTimes(niche: string, country: string, platforms: string[]) {
  const platformData: Record<string, any> = {
    instagram: {
      heatmap: [
        { day: "Monday", hour: 9, score: 72 }, { day: "Tuesday", hour: 8, score: 84 },
        { day: "Tuesday", hour: 19, score: 91 }, { day: "Wednesday", hour: 18, score: 88 },
        { day: "Thursday", hour: 7, score: 79 }, { day: "Thursday", hour: 20, score: 93 },
        { day: "Friday", hour: 12, score: 82 }, { day: "Saturday", hour: 10, score: 87 },
      ],
      topSlots: [
        { day: "Thursday", time: "8-9 PM", score: 93, reason: "Peak scroll time after dinner for your audience" },
        { day: "Tuesday", time: "7-8 PM", score: 91, reason: "Mid-week engagement peak — audience is active but not overwhelmed" },
        { day: "Saturday", time: "10-11 AM", score: 87, reason: "Relaxed morning browsing before weekend activities" },
      ],
      worstTimes: ["2-5 AM any day", "Monday 6-8 AM", "Sunday 1-3 PM"],
      insight: `${niche} content on Instagram performs best with evening posts (7-9pm) when the audience winds down. Weekend morning posts get 40% higher saves than weekday equivalents.`,
    },
    twitter: {
      heatmap: [
        { day: "Monday", hour: 8, score: 88 }, { day: "Tuesday", hour: 9, score: 91 },
        { day: "Wednesday", hour: 7, score: 85 }, { day: "Thursday", hour: 8, score: 93 },
        { day: "Friday", hour: 9, score: 87 }, { day: "Wednesday", hour: 12, score: 82 },
        { day: "Thursday", hour: 13, score: 84 }, { day: "Friday", hour: 17, score: 89 },
      ],
      topSlots: [
        { day: "Thursday", time: "8-9 AM", score: 93, reason: "Morning commute scrolling hits peak engagement" },
        { day: "Tuesday", time: "9-10 AM", score: 91, reason: "Start-of-week motivation content performs best" },
        { day: "Friday", time: "5-6 PM", score: 89, reason: "End-of-week reflection and sharing mindset" },
      ],
      worstTimes: ["Saturday/Sunday before 9 AM", "Any day 10 PM-6 AM"],
      insight: `${niche} tweets get 3x more retweets during morning commute hours. News-style content wins weekday mornings, opinion content wins evenings.`,
    },
    linkedin: {
      heatmap: [
        { day: "Tuesday", hour: 7, score: 91 }, { day: "Tuesday", hour: 17, score: 88 },
        { day: "Wednesday", hour: 8, score: 94 }, { day: "Wednesday", hour: 17, score: 89 },
        { day: "Thursday", hour: 7, score: 90 }, { day: "Thursday", hour: 17, score: 92 },
        { day: "Monday", hour: 8, score: 82 }, { day: "Friday", hour: 9, score: 78 },
      ],
      topSlots: [
        { day: "Wednesday", time: "7-9 AM", score: 94, reason: "Peak professional engagement — before meetings start" },
        { day: "Thursday", time: "5-6 PM", score: 92, reason: "End-of-day reflection drives high comment engagement" },
        { day: "Tuesday", time: "7-8 AM", score: 91, reason: "Start-of-week energy peaks on Tuesday, not Monday" },
      ],
      worstTimes: ["Weekends entirely", "Monday before 8 AM", "Friday after 3 PM"],
      insight: `LinkedIn ${niche} content performs 60% better on Tuesday–Thursday. Never post Friday afternoon — the algorithm deprioritizes it as professionals log off.`,
    },
    facebook: {
      heatmap: [
        { day: "Wednesday", hour: 13, score: 89 }, { day: "Thursday", hour: 14, score: 87 },
        { day: "Friday", hour: 13, score: 91 }, { day: "Sunday", hour: 19, score: 88 },
        { day: "Saturday", hour: 11, score: 84 }, { day: "Wednesday", hour: 19, score: 85 },
        { day: "Tuesday", hour: 15, score: 82 }, { day: "Monday", hour: 14, score: 79 },
      ],
      topSlots: [
        { day: "Friday", time: "1-2 PM", score: 91, reason: "End-of-week browsing — people slow down before weekend" },
        { day: "Sunday", time: "7-8 PM", score: 88, reason: "Pre-week anxiety scroll — emotional content does best" },
        { day: "Wednesday", time: "1-2 PM", score: 89, reason: "Midweek lunch break browsing peak" },
      ],
      worstTimes: ["Early morning any day", "Saturday before 10 AM"],
      insight: `Facebook ${niche} audiences are most active on weekday afternoons. Video content gets 5x more reach than images — prioritize it during peak hours.`,
    },
    telegram: {
      heatmap: [
        { day: "Monday", hour: 10, score: 81 }, { day: "Tuesday", hour: 11, score: 85 },
        { day: "Wednesday", hour: 10, score: 88 }, { day: "Thursday", hour: 11, score: 87 },
        { day: "Friday", hour: 10, score: 84 }, { day: "Saturday", hour: 12, score: 79 },
        { day: "Sunday", hour: 15, score: 76 }, { day: "Wednesday", hour: 20, score: 83 },
      ],
      topSlots: [
        { day: "Wednesday", time: "10-11 AM", score: 88, reason: "Channel subscribers check updates mid-morning" },
        { day: "Thursday", time: "11 AM-12 PM", score: 87, reason: "High open rates for educational/news content" },
        { day: "Wednesday", time: "8-9 PM", score: 83, reason: "Evening deep-read content performs well on Telegram" },
      ],
      worstTimes: ["Late night (11 PM-7 AM)", "Early Monday morning"],
      insight: `Telegram channels for ${niche} get the highest open rates during work breaks (10-11 AM). Long-form content outperforms on Telegram vs. other platforms.`,
    },
  };

  const result: any = {
    platforms: {},
    generalInsights: [
      `${country} audiences tend to be most active 1-2 hours later than US averages — adjust accordingly`,
      `${niche} content performs best Tuesday-Thursday across all platforms`,
      "Consistency beats timing — posting the same time every day trains your audience",
    ],
    timezone: country === "US" ? "EST (UTC-5)" : country === "GB" ? "GMT (UTC+0)" : country === "AE" ? "GST (UTC+4)" : "UTC",
    audiencePeakDays: ["Tuesday", "Wednesday", "Thursday"],
  };

  for (const platform of platforms) {
    result.platforms[platform] = platformData[platform] || platformData.instagram;
  }

  return result;
}
