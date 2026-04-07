import { NextRequest, NextResponse } from "next/server";
import { searchWebJson } from "@/lib/perplexity";
import { fetchTrends } from "@/lib/trends";
import type { Trend } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || undefined;
    const category = searchParams.get("category") || undefined;
    const query = searchParams.get("q") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // ── 1. Perplexity Sonar — real-time live web search ──────────────────────
    const trends = await fetchWithPerplexity({ country, category, query, limit });
    if (trends && trends.length > 0) {
      return NextResponse.json({ trends, source: "live" });
    }

    // ── 2. GNews fallback ─────────────────────────────────────────────────────
    const gnewsKey = process.env.GNEWS_API_KEY;
    if (gnewsKey && gnewsKey !== "your_gnews_api_key_here") {
      const params = new URLSearchParams({
        apikey: gnewsKey,
        lang: "en",
        max: String(Math.min(limit, 10)),
        ...(query && { q: query }),
        ...(country && { country: country.toLowerCase() }),
        ...(category && { topic: category.toLowerCase() }),
      });

      const response = await fetch(
        `https://gnews.io/api/v4/top-headlines?${params}`,
        { cache: "no-store" }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.articles?.length) {
          const gnewsTrends: Trend[] = data.articles.map((article: any, i: number) => ({
            id: String(i + 1),
            title: article.title,
            summary: article.description || article.content?.slice(0, 200),
            source: article.source.name,
            sourceUrl: article.url,
            publishedAt: article.publishedAt,
            category: category || "General",
            country: country || "US",
            virality: Math.floor(Math.random() * 40) + 60,
            contentAngles: [
              `Breaking: ${article.title.split(" ").slice(0, 5).join(" ")}...`,
              `What this means for your ${category || "niche"}`,
              "My take on this trending story",
            ],
            platforms: ["twitter", "instagram", "telegram", "facebook"],
            imageUrl: article.image,
          }));
          return NextResponse.json({ trends: gnewsTrends, source: "gnews" });
        }
      }
    }

    // ── 3. Demo fallback ──────────────────────────────────────────────────────
    const demoTrends = await fetchTrends({ country, category, query, limit });
    return NextResponse.json({ trends: demoTrends, source: "demo" });

  } catch (error) {
    console.error("Trends error:", error);
    return NextResponse.json({ error: "Failed to fetch trends" }, { status: 500 });
  }
}

async function fetchWithPerplexity(params: {
  country?: string;
  category?: string;
  query?: string;
  limit: number;
}): Promise<Trend[] | null> {
  const { country, category, query, limit } = params;

  const countryLabel = country && country !== "all" ? country : "worldwide";
  const categoryLabel = category && category !== "all" ? category : "general";
  const topicContext = query ? `about "${query}"` : "";
  const count = Math.min(limit, 15);

  const prompt = `Search the web RIGHT NOW and find the ${count} most viral and trending topics ${topicContext} for ${categoryLabel} content creators targeting audiences in ${countryLabel}.

Focus on topics that are ACTIVELY trending TODAY — breaking news, viral discussions, cultural moments, emerging stories.

Return ONLY valid JSON with no explanation:
{
  "trends": [
    {
      "title": "Exact trending topic or headline",
      "summary": "2-3 sentence explanation of the trend, what's happening, and why it matters right now",
      "source": "Publication, platform, or source name",
      "sourceUrl": "Direct URL to the source (real URL)",
      "publishedAt": "ISO 8601 datetime (today's date)",
      "category": "${categoryLabel !== "general" ? categoryLabel : "Technology or Finance or Health or Marketing etc"}",
      "country": "${countryLabel !== "worldwide" ? countryLabel : "US"}",
      "virality": 85,
      "contentAngles": [
        "Content angle 1 — specific actionable idea for creators",
        "Content angle 2 — specific actionable idea for creators",
        "Content angle 3 — specific actionable idea for creators"
      ],
      "platforms": ["twitter", "instagram"]
    }
  ]
}

Rules:
- Return exactly ${count} trends
- virality is a number 1-100 based on how viral this actually is
- platforms only use: twitter, instagram, facebook, telegram, linkedin
- contentAngles must have exactly 3 items
- All trends must be REAL and currently trending (not made up)
- sourceUrl must be a real, valid URL`;

  try {
    const result = await searchWebJson<{ trends: any[] }>(prompt, { maxTokens: 3000 });
    if (!result?.trends || !Array.isArray(result.trends)) return null;

    const trends: Trend[] = result.trends
      .filter((t: any) => t.title && t.summary)
      .map((t: any, i: number) => ({
        id: `live-${Date.now()}-${i}`,
        title: String(t.title || "").slice(0, 200),
        summary: String(t.summary || "").slice(0, 500),
        source: String(t.source || "Web"),
        sourceUrl: String(t.sourceUrl || "#"),
        publishedAt: t.publishedAt || new Date().toISOString(),
        category: String(t.category || categoryLabel || "General"),
        country: String(t.country || countryLabel || "US"),
        virality: typeof t.virality === "number" ? Math.min(100, Math.max(1, t.virality)) : 70,
        contentAngles: Array.isArray(t.contentAngles) ? t.contentAngles.slice(0, 3) : [],
        platforms: Array.isArray(t.platforms) ? t.platforms : ["twitter", "instagram"],
        imageUrl: t.imageUrl || undefined,
      }));

    return trends.length > 0 ? trends : null;
  } catch (err) {
    console.warn("[trends] Perplexity fetch failed:", err);
    return null;
  }
}
