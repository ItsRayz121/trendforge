import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET — fetch keywords + recent hits
export async function GET() {
  try {
    const [keywordsRes, hitsRes] = await Promise.all([
      supabase.from("keyword_alerts").select("*").order("created_at", { ascending: true }),
      supabase.from("alert_hits").select("*").order("matched_at", { ascending: false }).limit(50),
    ]);

    return NextResponse.json({
      keywords: keywordsRes.data || [],
      hits: hitsRes.data || [],
      unreadCount: (hitsRes.data || []).filter((h: any) => !h.read).length,
    });
  } catch (err) {
    console.error("alerts GET error:", err);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

// POST — add keyword OR trigger a manual check
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Action: check keywords now
    if (body.action === "check") {
      return await checkKeywords();
    }

    // Action: add keyword
    if (!body.keyword || typeof body.keyword !== "string") {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    const keyword = body.keyword.trim().toLowerCase();

    // Check limit
    const { count } = await supabase
      .from("keyword_alerts")
      .select("id", { count: "exact", head: true });

    if ((count ?? 0) >= 5) {
      return NextResponse.json({ error: "Maximum 5 keywords allowed" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("keyword_alerts")
      .insert({ keyword })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ keyword: data });
  } catch (err: any) {
    console.error("alerts POST error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}

// DELETE — remove keyword by id, or mark hits as read
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const markRead = searchParams.get("markRead");

    if (markRead === "true") {
      await supabase.from("alert_hits").update({ read: true }).eq("read", false);
      return NextResponse.json({ ok: true });
    }

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await supabase.from("keyword_alerts").delete().eq("id", id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("alerts DELETE error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// ── Internal: check all keywords against GNews ──────────────────────────────
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
          // Demo fallback: simulate a hit sometimes
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
          // Check if we already stored this headline
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
