import type { Trend, TrendAnalysis } from "./types";
import { demoTrends } from "@/data/demo-topics";

export async function fetchTrends(params?: {
  country?: string;
  category?: string;
  query?: string;
  limit?: number;
  breakingOnly?: boolean;
}): Promise<Trend[]> {
  // Simulate API delay
  await new Promise((r) => setTimeout(r, 800));

  let trends = [...demoTrends];

  // Generate additional trends if limit is high
  if (params?.limit && params.limit > trends.length) {
    const additionalCount = Math.min(params.limit - trends.length, 400);
    for (let i = 0; i < additionalCount; i++) {
      const baseTrend = demoTrends[i % demoTrends.length];
      trends.push({
        ...baseTrend,
        id: `generated-${i}`,
        title: `${baseTrend.title} ${["Update", "News", "Trend", "Alert", "Report"][i % 5]} ${i + 1}`,
        virality: Math.floor(Math.random() * 40) + 50, // 50-90 range
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  if (params?.breakingOnly) {
    trends = trends.filter((t) => t.virality >= 75);
  }

  if (params?.country && params.country !== "all") {
    trends = trends.filter(
      (t) => t.country === params.country || Math.random() > 0.3
    );
  }

  if (params?.query) {
    const q = params.query.toLowerCase();
    trends = trends.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }

  if (params?.category && params.category !== "all") {
    trends = trends.filter(
      (t) => t.category.toLowerCase() === params.category!.toLowerCase()
    );
  }

  // Apply limit
  const limit = params?.limit || trends.length;
  return trends.sort((a, b) => b.virality - a.virality).slice(0, limit);
}

export async function analyzeTrend(trendId: string): Promise<TrendAnalysis> {
  await new Promise((r) => setTimeout(r, 1000));

  const trend = demoTrends.find((t) => t.id === trendId);
  if (!trend) throw new Error("Trend not found");

  const analysisMap: Record<string, TrendAnalysis> = {
    "1": {
      trend,
      whyTrending:
        "AI tools have crossed the mainstream adoption threshold. Major platforms launched new AI features in the past 2 weeks, and creator communities are buzzing. The fear of being left behind is driving massive engagement.",
      viralityScore: 94,
      audienceRelevance:
        "Extremely high for content creators, marketers, and business owners. This affects anyone trying to grow online.",
      contentAngles: trend.contentAngles,
      bestPlatforms: ["twitter", "instagram", "telegram"],
      postingWindow: "Post within the next 6 hours for maximum virality",
      sampleHook:
        "I replaced my entire content team with AI tools for 30 days. Here's the honest truth 👀",
    },
    "7": {
      trend,
      whyTrending:
        "Bitcoin breaking its previous ATH triggers a massive FOMO wave. Major financial news outlets are covering it, institutional announcements are coming daily, and retail interest is spiking on Google Trends.",
      viralityScore: 97,
      audienceRelevance:
        "Universal — affects anyone with savings, investments, or interest in the future of money.",
      contentAngles: trend.contentAngles,
      bestPlatforms: ["twitter", "telegram"],
      postingWindow: "Post NOW — peak virality window for crypto news is 2-4 hours",
      sampleHook:
        "Bitcoin hit $120K and most people still don't understand what's actually happening 🧵",
    },
  };

  return (
    analysisMap[trendId] || {
      trend,
      whyTrending: `${trend.title} is trending because it directly impacts daily life for millions of people. The combination of mainstream media coverage and social sharing is creating a compounding viral effect.`,
      viralityScore: trend.virality,
      audienceRelevance:
        "High relevance for your niche audience — this topic connects emotionally with key pain points and aspirations.",
      contentAngles: trend.contentAngles,
      bestPlatforms: trend.platforms,
      postingWindow:
        "Optimal posting window: next 12 hours while the conversation is active",
      sampleHook: `Here's the thing about ${trend.title.split(" ").slice(0, 4).join(" ")} that nobody is talking about 👀`,
    }
  );
}

export const trendCategories = [
  "All",
  "Technology",
  "Finance",
  "Health",
  "Marketing",
  "E-Commerce",
  "Real Estate",
  "Automotive",
  "Food",
  "Education",
];
