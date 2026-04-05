"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveFeed } from "@/components/live-feed";
import { analyzeTrend } from "@/lib/trends";
import { useGoogleTrends, useNewsSearch } from "@/hooks/useScrape";
import { getViralityColor, getViralityLabel, getPlatformBg } from "@/lib/utils";
import type { TrendAnalysis, Trend } from "@/lib/types";
import {
  BarChart3,
  Zap,
  Target,
  Clock,
  Lightbulb,
  TrendingUp,
  Users,
  Sparkles,
  ArrowRight,
  Search,
} from "lucide-react";
import Link from "next/link";
import { demoTrends } from "@/data/demo-topics";

const platformLabels: Record<string, string> = {
  telegram: "Telegram",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
};

interface HookItem {
  hook: string;
  score: number;
}

function generateHooks(analysis: TrendAnalysis): HookItem[] {
  const { sampleHook, viralityScore } = analysis;
  const base = sampleHook;
  const variance = [12, 7, -5, -10];
  const prefixes = [
    "Breaking:",
    "Unpopular opinion:",
    "Thread 🧵:",
    "Story time:",
  ];
  return prefixes.map((prefix, i) => ({
    hook: `${prefix} ${base}`,
    score: Math.min(99, Math.max(40, viralityScore + variance[i])),
  }));
}

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const trendId = searchParams.get("trend");

  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);

  const { getTrends, data: trendsData, loading: trendsLoading } = useGoogleTrends();
  const { searchNews, data: newsData } = useNewsSearch();

  useEffect(() => {
    if (trendId) {
      loadAnalysis(trendId);
    }
  }, [trendId]);

  const loadAnalysis = async (id: string) => {
    setLoading(true);
    try {
      const result = await analyzeTrend(id);
      setAnalysis(result);
      setSelectedTrend(result.trend);
      // Fire live data fetches in parallel
      getTrends(result.trend.title);
      searchNews(result.trend.title);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrendSelect = (trend: Trend) => {
    loadAnalysis(trend.id);
  };

  // Build enriched "why trending" from live news data
  const enrichedWhyTrending = (() => {
    if (!analysis) return "";
    if (newsData?.results && Array.isArray(newsData.results) && newsData.results.length > 0) {
      const headlines = newsData.results
        .slice(0, 2)
        .map((n: any) => n.title)
        .filter(Boolean)
        .join(". ");
      return headlines
        ? `Live signals: ${headlines}. ${analysis.whyTrending}`
        : analysis.whyTrending;
    }
    return analysis.whyTrending;
  })();

  const hooks = analysis ? generateHooks(analysis) : [];
  const relatedQueries = trendsData?.results?.relatedQueries as Array<{ query: string; value: string }> | undefined;

  return (
    <AppShell title="Trend Analysis" subtitle="Deep dive into what makes trends go viral">
      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar: trend list */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Select a Trend
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-3">
                Click any trend to analyze it
              </p>
              <div className="space-y-1">
                {demoTrends.map((trend) => (
                  <button
                    key={trend.id}
                    onClick={() => handleTrendSelect(trend)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors ${
                      selectedTrend?.id === trend.id
                        ? "bg-violet-500/10 border border-violet-500/20 text-violet-400"
                        : "text-slate-400 hover:bg-surface-700 hover:text-slate-200"
                    }`}
                  >
                    <p className="font-medium line-clamp-2 leading-snug">{trend.title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Zap className={`w-3 h-3 ${getViralityColor(trend.virality)}`} />
                      <span className={`text-[10px] ${getViralityColor(trend.virality)}`}>
                        {trend.virality}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main: Analysis */}
        <div className="space-y-5">
          {!analysis && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <BarChart3 className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-400">Select a trend to analyze</p>
              <p className="text-xs text-slate-600 mt-1">
                Choose any trending topic from the left panel
              </p>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-surface-500 bg-surface-800 p-5"
                >
                  <div className="shimmer h-4 w-1/3 rounded mb-3" />
                  <div className="shimmer h-3 w-full rounded mb-2" />
                  <div className="shimmer h-3 w-4/5 rounded" />
                </div>
              ))}
            </div>
          )}

          {analysis && !loading && (
            <>
              {/* Trend header */}
              <Card glow>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-slate-100 mb-1 leading-snug">
                      {analysis.trend.title}
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      {analysis.trend.summary}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="default">{analysis.trend.category}</Badge>
                      <Badge
                        variant={
                          analysis.viralityScore >= 80
                            ? "success"
                            : analysis.viralityScore >= 60
                            ? "warning"
                            : "default"
                        }
                      >
                        {getViralityLabel(analysis.viralityScore)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <div
                      className={`text-4xl font-bold ${getViralityColor(analysis.viralityScore)}`}
                    >
                      {analysis.viralityScore}
                    </div>
                    <div className="text-[10px] text-slate-600">Virality Score</div>
                  </div>
                </div>
              </Card>

              {/* Why trending - with sources */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      Why It's Trending
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">{enrichedWhyTrending}</p>
                  {/* Trend sources */}
                  {newsData?.results && newsData.results.length > 0 && (
                    <div className="border-t border-surface-600 pt-3">
                      <p className="text-xs text-slate-500 mb-2">Sources driving this trend:</p>
                      <div className="flex flex-wrap gap-2">
                        {newsData.results.slice(0, 5).map((n: any, i: number) => (
                          <a
                            key={i}
                            href={n.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-700 border border-surface-600 text-xs text-slate-400 hover:border-violet-500/30 hover:text-violet-400 transition-colors"
                          >
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                              {n.source}
                            </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* What People Are Searching */}
              {(trendsLoading || (relatedQueries && relatedQueries.length > 0)) && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-blue-400" />
                        What People Are Searching
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trendsLoading ? (
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="shimmer h-6 w-28 rounded-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {relatedQueries?.map((q, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300"
                          >
                            <Search className="w-2.5 h-2.5" />
                            {q.query}
                            {q.value && (
                              <span className="text-blue-500 font-medium">{q.value}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Audience Demographics + Posting Window */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        Target Audience
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                      {analysis.audienceRelevance}
                    </p>
                    {/* Demographics */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Age Groups</p>
                        <div className="flex gap-2 flex-wrap">
                          {["18-24", "25-34", "35-44", "45+"].map((age) => (
                            <span
                              key={age}
                              className="text-xs px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300"
                            >
                              {age}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Interests</p>
                        <div className="flex gap-2 flex-wrap">
                          {["Tech", "Finance", "News", "Social"].map((interest) => (
                            <span
                              key={interest}
                              className="text-xs px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-300"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Engagement Level</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-surface-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                              style={{ width: `${Math.min(analysis.viralityScore, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-blue-400">{analysis.viralityScore}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-400" />
                        Posting Window
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-orange-300 font-medium">{analysis.postingWindow}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {analysis.bestPlatforms.map((p) => (
                        <span
                          key={p}
                          className={`text-xs px-2 py-1 rounded-md border ${getPlatformBg(p)}`}
                        >
                          {platformLabels[p] || p}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-surface-600">
                      <p className="text-xs text-slate-500 mb-2">Best Posting Times</p>
                      <div className="grid grid-cols-2 gap-2">
                        {["9:00 AM", "12:00 PM", "3:00 PM", "7:00 PM"].map((time) => (
                          <div key={time} className="text-xs text-slate-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            {time}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Content angles - clickable with platform preselection */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-violet-400" />
                      Content Angles
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-500 mb-3">Click any angle to start creating content</p>
                  <div className="space-y-2.5">
                    {analysis.contentAngles.map((angle, i) => (
                      <Link
                        key={i}
                        href={`/studio?topic=${encodeURIComponent(angle)}&platforms=${analysis.bestPlatforms.join(",")}&niche=${analysis.trend.category}`}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-700 border border-surface-500 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 font-bold text-sm flex items-center justify-center">{i + 1}</span>
                          <span className="text-sm text-slate-300 group-hover:text-violet-300 transition-colors">{angle}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">Create →</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Multiple hooks with virality scores - clickable */}
              <Card className="border-violet-500/20 bg-violet-500/5">
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      AI-Suggested Hooks
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-500 mb-3">
                    Click any hook to start content creation. Estimated virality scores shown.
                  </p>
                  <div className="space-y-3">
                    {hooks.map((item, i) => {
                      const hookType = i === 0 ? "Clickbait" : i === 1 ? "Informative" : "Educational";
                      const typeColors = {
                        Clickbait: "text-red-400",
                        Informative: "text-blue-400",
                        Educational: "text-green-400",
                      };
                      return (
                        <Link
                          key={i}
                          href={`/studio?hook=${encodeURIComponent(item.hook)}&platforms=${analysis.bestPlatforms.join(",")}`}
                          className="flex items-start justify-between gap-3 p-3 rounded-lg bg-surface-800 border border-surface-600 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded bg-surface-700 ${typeColors[hookType]}`}>{hookType}</span>
                            </div>
                            <p className="text-sm text-violet-300 italic leading-relaxed group-hover:text-violet-200 transition-colors">
                              "{item.hook}"
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <span className={`text-xs font-bold ${getViralityColor(item.score)}`}>
                                {item.score}%
                              </span>
                              <p className="text-[10px] text-slate-600">virality</p>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                              <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-sm">Loading...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
