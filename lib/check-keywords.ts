import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function checkKeywords() {
  try {
    const { data: keywords } = await supabase.from("keyword_alerts").select("*");
    if (!keywords || keywords.length === 0) {
      return NextResponse.json({ checked: 0, newHits: 0 });
    }

    const gnewsKey = process.env.GNEWS_API_KEY;
    let newHits = 0;

    for (const kw of keywords) {
      try {
        let articles: any[] = [];

        if (gnewsKey && gnewsKey !== "your_gnews_api_key_here") {
          const params = new URLSearchParams({
            apikey: gnewsKey,
            lang: "en",
            max: "5",
            q: kw.keyword,
          });
          const res = await fetch(`https://gnews.io/api/v4/search?${params}`, {
            next: { revalidate: 0 },
          });
          if (res.ok) {
            const data = await res.json();
            articles = data.articles || [];
          }
        } else {
          if (Math.random() > 0.6) {
            articles = [{
              title: `[Demo] Breaking: ${kw.keyword} trends worldwide`,
              source: { name: "Demo Source" },
              url: "#",
              publishedAt: new Date().toISOString(),
            }];
          }
        }

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
              source: article.source?.name || "Unknown",
              url: article.url || "#",
              matched_at: article.publishedAt || new Date().toISOString(),
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
