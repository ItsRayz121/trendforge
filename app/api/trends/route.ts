import { NextRequest, NextResponse } from "next/server";
import { fetchTrends } from "@/lib/trends";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || undefined;
    const category = searchParams.get("category") || undefined;
    const query = searchParams.get("q") || undefined;

    const gnewsKey = process.env.GNEWS_API_KEY;

    if (gnewsKey && gnewsKey !== "your_gnews_api_key_here") {
      // Try GNews first
      const params = new URLSearchParams({
        apikey: gnewsKey,
        lang: "en",
        max: "10",
        ...(query && { q: query }),
        ...(country && { country: country.toLowerCase() }),
        ...(category && { topic: category.toLowerCase() }),
      });

      const response = await fetch(
        `https://gnews.io/api/v4/top-headlines?${params}`,
        { next: { revalidate: 900 } } // Cache 15 mins
      );

      if (response.ok) {
        const data = await response.json();
        if (!data.articles?.length) {
          console.warn("GNews returned no articles — quota may be exhausted");
        } else {
          const trends = data.articles.map((article: any, i: number) => ({
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
          return NextResponse.json({ trends, source: "live" });
        }
      } else {
        const errText = await response.text().catch(() => "");
        console.warn("GNews API error:", response.status, errText);
      }
    }

    // Fall back to demo data
    const trends = await fetchTrends({ country, category, query });
    return NextResponse.json({ trends, source: "demo" });
  } catch (error) {
    console.error("Trends error:", error);
    return NextResponse.json({ error: "Failed to fetch trends" }, { status: 500 });
  }
}
