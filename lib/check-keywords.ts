import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { searchWebJson } from "@/lib/perplexity";

interface ArticleHit {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

export async function checkKeywords() {
  try {
    const { data: keywords } = await supabase.from("keyword_alerts").select("*");
    if (!keywords || keywords.length === 0) {
      return NextResponse.json({ checked: 0, newHits: 0 });
    }

    let newHits = 0;

    for (const kw of keywords) {
      try {
        const articles = await findArticlesForKeyword(kw.keyword);

        for (const article of articles) {
          const { count } = await supabase
            .from("alert_hits")
            .select("id", { count: "exact", head: true })
            .eq("keyword", kw.keyword)
            .eq("headline", article.title);

          if ((count ?? 0) === 0) {
            await supabase.from("alert_hits").insert({
              keyword: kw.keyword,
              headline: article.title,
              source: article.source,
              url: article.url,
              matched_at: article.publishedAt,
              read: false,
            });
            newHits++;
          }
        }
      } catch (kwErr) {
        console.warn(`Failed to check keyword "${kw.keyword}":`, kwErr);
      }
    }

    return NextResponse.json({ checked: keywords.length, newHits });
  } catch (err) {
    console.error("checkKeywords error:", err);
    return NextResponse.json({ error: "Check failed" }, { status: 500 });
  }
}

async function findArticlesForKeyword(keyword: string): Promise<ArticleHit[]> {
  // ── 1. Perplexity Sonar — real-time web search ────────────────────────────
  const prompt = `Search the web RIGHT NOW for the latest news and discussions about "${keyword}". Find up to 5 recent articles, posts, or news items published today or in the last 24 hours.

Return ONLY valid JSON:
{
  "articles": [
    {
      "title": "Exact headline or title",
      "source": "Publication or platform name",
      "url": "Direct URL (real URL)",
      "publishedAt": "ISO 8601 datetime"
    }
  ]
}

Only include items published within the last 24 hours. If nothing recent exists, return an empty articles array.`;

  const result = await searchWebJson<{ articles: ArticleHit[] }>(prompt, { maxTokens: 800 });

  if (result?.articles && Array.isArray(result.articles) && result.articles.length > 0) {
    return result.articles
      .filter((a) => a.title && a.title.length > 5)
      .map((a) => ({
        title: String(a.title).slice(0, 300),
        source: String(a.source || "Web"),
        url: String(a.url || "#"),
        publishedAt: a.publishedAt || new Date().toISOString(),
      }))
      .slice(0, 5);
  }

  // ── 2. GNews fallback ─────────────────────────────────────────────────────
  const gnewsKey = process.env.GNEWS_API_KEY;
  if (gnewsKey && gnewsKey !== "your_gnews_api_key_here") {
    try {
      const params = new URLSearchParams({ apikey: gnewsKey, lang: "en", max: "5", q: keyword });
      const res = await fetch(`https://gnews.io/api/v4/search?${params}`, {
        next: { revalidate: 0 },
      });
      if (res.ok) {
        const data = await res.json();
        return (data.articles || []).map((a: any) => ({
          title: a.title,
          source: a.source?.name || "Unknown",
          url: a.url || "#",
          publishedAt: a.publishedAt || new Date().toISOString(),
        }));
      }
    } catch {}
  }

  return [];
}
