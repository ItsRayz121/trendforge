import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { niche, country } = await req.json();
    if (!niche) return NextResponse.json({ error: "niche is required" }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";
    const model = process.env.OPENAI_MODEL || "google/gemini-2.0-flash-001";

    // Fetch real-time trending topics for this niche via Perplexity
    let trendingHeadlines: string[] = [];
    const { searchWeb } = await import("@/lib/perplexity");
    const webTrends = await searchWeb(
      `Search the web RIGHT NOW for the top 10 trending topics and discussions in the "${niche}" niche in ${country || "worldwide"} today. List just the topic titles or headlines, one per line.`,
      { maxTokens: 400 }
    );
    if (webTrends) {
      trendingHeadlines = webTrends
        .split("\n")
        .map((l) => l.replace(/^[-*\d.)\s]+/, "").trim())
        .filter((l) => l.length > 10)
        .slice(0, 10);
    }

    const { callAIJson, hasAIProvider } = await import("@/lib/ai-client");

    if (!hasAIProvider()) {
      return NextResponse.json(getDemoGaps(niche, country));
    }

    const headlinesText = trendingHeadlines.length > 0
      ? `\nCurrently trending headlines in this niche:\n${trendingHeadlines.map((h, i) => `${i + 1}. ${h}`).join("\n")}`
      : "";

    const prompt = `You are a content strategist. Identify content gaps — topics that are TRENDING but UNDERSERVED by creators — in the "${niche}" niche for ${country || "global"} audiences.${headlinesText}

A content gap is a topic where:
- Audience demand is HIGH (people are searching/talking about it)
- Creator supply is LOW (few creators cover it well)
- It hasn't been over-saturated yet

Return ONLY valid JSON:
{
  "gaps": [
    {
      "topic": "Specific topic title",
      "gapScore": 87,
      "demandLevel": "High|Very High|Extreme",
      "competitionLevel": "Low|Very Low|Minimal",
      "reason": "Why this gap exists — what creators are missing",
      "contentAngle": "The specific angle that would win here",
      "suggestedFormats": ["Short Video", "Thread"],
      "estimatedReach": "50K-200K potential reach",
      "urgency": "evergreen|trending-now|emerging",
      "hashtags": ["#tag1", "#tag2", "#tag3"]
    }
  ],
  "marketInsight": "Overall paragraph about the content landscape gaps in this niche",
  "quickWins": ["Topic you could post TODAY", "Another quick win"],
  "longTermOpportunities": ["Big evergreen gap", "Another long-term opportunity"]
}

Return exactly 6 content gaps, ordered by gap score descending. Be highly specific — not generic.`;

    const result = await callAIJson<any>({
      messages: [{ role: "user", content: prompt }],
      maxTokens: 2000,
      jsonMode: true,
    });

    if (!result) return NextResponse.json(getDemoGaps(niche, country));
    return NextResponse.json(result);
  } catch (err) {
    console.error("content-gap error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

function getDemoGaps(niche: string, country: string) {
  return {
    gaps: [
      {
        topic: `${niche} for Complete Beginners — No Jargon`,
        gapScore: 94,
        demandLevel: "Very High",
        competitionLevel: "Very Low",
        reason: "Most creators assume baseline knowledge. Beginners get overwhelmed and can't find truly accessible content.",
        contentAngle: "Explain one concept per post as if talking to a 12-year-old. Zero assumed knowledge.",
        suggestedFormats: ["Short Video", "Carousel"],
        estimatedReach: "100K-500K",
        urgency: "evergreen",
        hashtags: [`#${niche}forbeginners`, "#learnfromscratch", "#simplifiedcontent"],
      },
      {
        topic: "What They Don't Tell You About Failing in This Niche",
        gapScore: 91,
        demandLevel: "Very High",
        competitionLevel: "Low",
        reason: "Success stories dominate. Honest failure content builds massive trust but creators avoid it for ego reasons.",
        contentAngle: "Share a real failure with exact numbers and specific lessons — no vague wisdom.",
        suggestedFormats: ["Thread", "Long-form Video"],
        estimatedReach: "50K-300K",
        urgency: "evergreen",
        hashtags: [`#${niche}truth`, "#failforward", "#honesttalk"],
      },
      {
        topic: `The ${country || "Local"} Perspective on ${niche}`,
        gapScore: 88,
        demandLevel: "High",
        competitionLevel: "Minimal",
        reason: "95% of content is US/UK centric. Local audiences desperately want regionally relevant advice.",
        contentAngle: `"Here's how ${niche} works differently in ${country || "our market"}" — specific local examples and regulations.`,
        suggestedFormats: ["Carousel", "Short Video"],
        estimatedReach: "30K-150K",
        urgency: "trending-now",
        hashtags: [`#${niche}${country || "local"}`, "#localcreators", "#regionaltips"],
      },
      {
        topic: "Behind the Numbers — Real Income/Results Breakdown",
        gapScore: 85,
        demandLevel: "High",
        competitionLevel: "Low",
        reason: "People share wins but rarely the real breakdown. Transparent income/results content gets viral saves.",
        contentAngle: "Month-by-month progression with real numbers, not just the end result.",
        suggestedFormats: ["Carousel", "Thread"],
        estimatedReach: "75K-400K",
        urgency: "evergreen",
        hashtags: ["#transparencypost", "#realnumbers", `#${niche}income`],
      },
      {
        topic: `Tools + AI Workflow for ${niche} in 2026`,
        gapScore: 82,
        demandLevel: "High",
        competitionLevel: "Low",
        reason: "AI tools are evolving fast. Most tutorials are outdated within months. Fresh, practical walkthroughs are scarce.",
        contentAngle: "My exact step-by-step workflow using 3 AI tools — with screen recordings and time savings shown.",
        suggestedFormats: ["Short Video", "Carousel"],
        estimatedReach: "40K-200K",
        urgency: "trending-now",
        hashtags: ["#aitools2026", `#${niche}workflow`, "#productivityhack"],
      },
      {
        topic: "Unpopular Opinions That Actually Work",
        gapScore: 78,
        demandLevel: "High",
        competitionLevel: "Very Low",
        reason: "Controversial but evidence-backed takes drive 3x more comments than agreeable content. Most creators play it safe.",
        contentAngle: `"Everyone in ${niche} is wrong about X — here's the data" — pick a widely held belief and debunk it with proof.`,
        suggestedFormats: ["Thread", "Short Video"],
        estimatedReach: "60K-350K",
        urgency: "evergreen",
        hashtags: ["#unpopularopinion", `#${niche}myths`, "#contrarian"],
      },
    ],
    marketInsight: `The ${niche} content space in ${country || "this market"} is heavily oversaturated with generic advice and aspirational success stories. The biggest gaps are in honest, beginner-friendly, and locally-relevant content. Creators who go deep on specifics — real numbers, regional context, and counterintuitive takes — consistently outperform those with larger audiences but generic content.`,
    quickWins: [
      `Post a "5 things nobody tells beginners about ${niche}" today — high search demand, low competition`,
      "Share your biggest ${niche} mistake with exact numbers — vulnerability content gets 3x normal saves",
    ],
    longTermOpportunities: [
      `Build a ${niche} beginner series — 30 posts, each explaining one concept. Becomes a searchable library.`,
      `Own the local ${country || "regional"} ${niche} space — almost nobody is doing country-specific content well`,
    ],
  };
}
