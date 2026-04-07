import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// SerpAPI Google Search scraper
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "search"; // search, trends, news, images
    const location = searchParams.get("location") || "United States";
    const hl = searchParams.get("hl") || "en";
    const gl = searchParams.get("gl") || "us";

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERP_API_KEY;

    if (!apiKey || apiKey === "your_serp_api_key_here") {
      // Fallback to mock data
      return NextResponse.json({
        results: generateMockResults(query, type),
        query,
        type,
        source: "mock",
      });
    }

    let params: Record<string, string> = {
      api_key: apiKey,
      q: query,
      location,
      hl,
      gl,
    };

    // Adjust params based on search type
    if (type === "trends") {
      params.engine = "google_trends";
      params.data_type = "TIMESERIES";
    } else if (type === "news") {
      params.tbm = "nws";
      params.num = "10";
    } else if (type === "images") {
      params.tbm = "isch";
      params.num = "10";
    } else {
      params.num = "10";
    }

    const searchParamsString = new URLSearchParams(params).toString();
    const response = await fetch(
      `https://serpapi.com/search?${searchParamsString}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status}`);
    }

    const data = await response.json();

    // Parse results based on type
    let results: any;

    if (type === "trends") {
      results = parseTrendsData(data);
    } else if (type === "news") {
      results = parseNewsResults(data.news_results || []);
    } else if (type === "images") {
      results = parseImageResults(data.images_results || []);
    } else {
      results = parseSearchResults(data);
    }

    return NextResponse.json({
      results,
      query,
      type,
      source: "serpapi",
      totalResults: data.search_information?.total_results || "0",
    });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

function parseSearchResults(data: any) {
  const organic = data.organic_results || [];
  const related = data.related_questions || [];
  const peopleAlsoAsk = data.people_also_ask || [];

  return {
    organic: organic.map((r: any) => ({
      title: r.title,
      link: r.link,
      snippet: r.snippet,
      displayedUrl: r.displayed_url || r.link,
      position: r.position,
    })),
    relatedQuestions: related.map((q: any) => ({
      question: q.question,
      snippet: q.snippet,
      link: q.link,
    })),
    peopleAlsoAsk: peopleAlsoAsk.map((q: any) => ({
      question: q.question,
      answer: q.answer,
    })),
    featuredSnippet: data.answer_box
      ? {
          title: data.answer_box.title,
          snippet: data.answer_box.snippet,
          link: data.answer_box.link,
        }
      : null,
  };
}

function parseNewsResults(news: any[]) {
  return news.map((n: any) => ({
    title: n.title,
    link: n.link,
    source: n.source,
    date: n.date,
    snippet: n.snippet,
    thumbnail: n.thumbnail,
  }));
}

function parseImageResults(images: any[]) {
  return images.map((img: any) => ({
    title: img.title,
    link: img.link,
    original: img.original,
    thumbnail: img.thumbnail,
    source: img.source,
  }));
}

function parseTrendsData(data: any) {
  const timeline = data.interest_over_time?.timeline_data || [];
  const relatedTopics = data.related_topics?.topic_list || [];
  const relatedQueries = data.related_queries?.query_list || [];

  return {
    timeline: timeline.map((t: any) => ({
      date: t.date,
      value: t.values?.[0]?.value || 0,
    })),
    relatedTopics: relatedTopics.slice(0, 10).map((t: any) => ({
      topic: t.topic,
      value: t.value,
      type: t.type,
    })),
    relatedQueries: relatedQueries.slice(0, 10).map((q: any) => ({
      query: q.query,
      value: q.value,
    })),
    avgSearchVolume: data.interest_over_time?.average || 0,
  };
}

function generateMockResults(query: string, type: string) {
  if (type === "trends") {
    return {
      timeline: Array.from({ length: 12 }, (_, i) => ({
        date: `${2024 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`,
        value: Math.floor(Math.random() * 100) + 20,
      })),
      relatedTopics: [
        { topic: `${query} tools`, value: "Breakout", type: "Topic" },
        { topic: `${query} strategy`, value: "+150%", type: "Topic" },
        { topic: `best ${query}`, value: "+80%", type: "Query" },
      ],
      relatedQueries: [
        { query: `how to use ${query}`, value: "100" },
        { query: `${query} tutorial`, value: "85" },
        { query: `${query} for beginners`, value: "70" },
      ],
      avgSearchVolume: 12500,
    };
  }

  if (type === "news") {
    return [
      {
        title: `Latest developments in ${query} - What you need to know`,
        link: "https://example.com/news/1",
        source: "TechCrunch",
        date: "2 hours ago",
        snippet: `Comprehensive coverage of ${query} and its impact on the industry...`,
      },
      {
        title: `${query} trends to watch in 2024`,
        link: "https://example.com/news/2",
        source: "Forbes",
        date: "5 hours ago",
        snippet: `Experts predict major shifts in ${query} over the coming months...`,
      },
      {
        title: `How ${query} is changing the landscape`,
        link: "https://example.com/news/3",
        source: "Reuters",
        date: "1 day ago",
        snippet: `An in-depth analysis of ${query} and emerging patterns...`,
      },
    ];
  }

  if (type === "images") {
    return Array.from({ length: 8 }, (_, i) => ({
      title: `${query} image ${i + 1}`,
      link: `https://example.com/image/${i}`,
      original: `https://via.placeholder.com/600x400?text=${encodeURIComponent(query)}+${i + 1}`,
      thumbnail: `https://via.placeholder.com/150x100?text=${i + 1}`,
      source: "Example Images",
    }));
  }

  // Default search
  return {
    organic: [
      {
        title: `Complete Guide to ${query} - 2024`,
        link: "https://example.com/guide",
        snippet: `Everything you need to know about ${query}. Tips, strategies, and best practices for success...`,
        displayedUrl: "example.com/guide",
        position: 1,
      },
      {
        title: `${query} - Wikipedia`,
        link: "https://en.wikipedia.org/wiki",
        snippet: `${query} refers to various concepts and practices in the modern digital landscape...`,
        displayedUrl: "en.wikipedia.org/wiki",
        position: 2,
      },
      {
        title: `Top 10 ${query} Tools Compared`,
        link: "https://example.com/tools",
        snippet: `We tested and ranked the best ${query} tools available today...`,
        displayedUrl: "example.com/tools",
        position: 3,
      },
    ],
    relatedQuestions: [
      { question: `What is ${query}?`, snippet: `A comprehensive overview...`, link: "#" },
      { question: `How does ${query} work?`, snippet: `The mechanics behind...`, link: "#" },
      { question: `Why is ${query} important?`, snippet: `Understanding the impact...`, link: "#" },
    ],
    peopleAlsoAsk: [
      { question: `What are the benefits of ${query}?`, answer: "Numerous benefits include..." },
      { question: `How to get started with ${query}?`, answer: "Begin by following these steps..." },
    ],
    featuredSnippet: {
      title: `${query} Explained`,
      snippet: `${query} is a trending topic that encompasses various strategies and techniques...`,
      link: "https://example.com",
    },
  };
}
