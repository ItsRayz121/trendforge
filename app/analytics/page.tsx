"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getViralityColor, getViralityLabel, getPlatformBg } from "@/lib/utils";
import type { TrendAnalysis, Trend } from "@/lib/types";
import toast from "react-hot-toast";
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
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

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
  const variance = [12, 7, -5, -10];
  const prefixes = ["Breaking:", "Unpopular opinion:", "Thread 🧵:", "Story time:"];
  return prefixes.map((prefix, i) => ({
    hook: `${prefix} ${sampleHook}`,
    score: Math.min(99, Math.max(40, viralityScore + variance[i])),
  }));
}

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const trendId = searchParams.get("trend");

  const [trends, setTrends] = useState<Trend[]>([]);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);

  // Load real trends on mount
  useEffect(() => {
    loadTrends();
  }, []);

  // If a trend ID was passed in URL, auto-analyze it
  useEffect(() => {
    if (trendId && trends.length > 0) {
      const match = trends.find((t) => t.id === trendId);
      if (match) handleTrendSelect(match);
    }
  }, [trendId, trends]);

  const loadTrends = async () => {
    setTrendsLoading(true);
    try {
      const res = await fetch("/api/trends?limit=20");
      if (!res.ok) throw new Error("Failed to load trends");
      const data = await res.json();
      setTrends(data.trends || []);
    } catch (err) {
      toast.error("Failed to load trends");
    } finally {
      setTrendsLoading(false);
    }
  };

  const loadAnalysis = async (trend: Trend) => {
    setLoading(true);
    setAnalysis(null);
    const toastId = toast.loading("Analyzing trend with AI...");
    try {
      const res = await fetch("/api/analyze-trend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trend),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const result: TrendAnalysis = await res.json();
      setAnalysis(result);
      toast.success("Analysis complete", { id: toastId });
    } catch (err) {
      toast.error("Analysis failed — please try again", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleTrendSelect = (trend: Trend) => {
    setSelectedTrend(trend);
    loadAnalysis(trend);
  };

  const hooks = analysis ? generateHooks(analysis) : [];

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
                  Live Trends
                </div>
              </CardTitle>
              <button
                onClick={loadTrends}
                disabled={trendsLoading}
                className="text-slate-500 hover:text-violet-400 transition-colors disabled:opacity-40"
                title="Refresh trends"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${trendsLoading ? "animate-spin" : ""}`} />
              </button>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-3">Click any trend to analyze it</p>
              <div className="space-y-1">
                {trendsLoading ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 rounded-lg bg-surface-700 animate-pulse" />
                  ))
                ) : trends.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No trends loaded</p>
                ) : (
                  trends.map((trend) => (
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
                        <span className="text-[10px] text-slate-600 ml-auto">{trend.category}</span>
                      </div>
                    </button>
                  ))
                )}
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
                <div key={i} className="rounded-xl border border-surface-500 bg-surface-800 p-5">
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
                      {analysis.trend.source && (
                        <a
                          href={analysis.trend.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-violet-400 hover:underline"
                        >
                          Source: {analysis.trend.source} ↗
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <div className={`text-4xl font-bold ${getViralityColor(analysis.viralityScore)}`}>
                      {analysis.viralityScore}
                    </div>
                    <div className="text-[10px] text-slate-600">Virality Score</div>
                  </div>
                </div>
              </Card>

              {/* Why trending */}
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
                  <p className="text-sm text-slate-300 leading-relaxed">{analysis.whyTrending}</p>
                </CardContent>
              </Card>

              {/* Key Insight */}
              {(analysis as any).keyInsight && (
                <Card className="border-yellow-500/20 bg-yellow-500/5">
                  <CardHeader>
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        Key Insight
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-yellow-200 leading-relaxed">{(analysis as any).keyInsight}</p>
                  </CardContent>
                </Card>
              )}

              {/* Audience + Posting Window */}
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
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-surface-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                          style={{ width: `${Math.min(analysis.viralityScore, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-blue-400">{analysis.viralityScore}%</span>
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
                        <span key={p} className={`text-xs px-2 py-1 rounded-md border ${getPlatformBg(p)}`}>
                          {platformLabels[p] || p}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Content angles */}
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
                          <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 font-bold text-sm flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-sm text-slate-300 group-hover:text-violet-300 transition-colors">
                            {angle}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Hooks */}
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
                    Click any hook to start content creation.
                  </p>
                  <div className="space-y-3">
                    {hooks.map((item, i) => {
                      const hookTypes = ["Clickbait", "Informative", "Educational", "Story"];
                      const typeColors = ["text-red-400", "text-blue-400", "text-green-400", "text-yellow-400"];
                      return (
                        <Link
                          key={i}
                          href={`/studio?hook=${encodeURIComponent(item.hook)}&platforms=${analysis.bestPlatforms.join(",")}`}
                          className="flex items-start justify-between gap-3 p-3 rounded-lg bg-surface-800 border border-surface-600 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group"
                        >
                          <div className="flex-1 min-w-0">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded bg-surface-700 ${typeColors[i]}`}>
                              {hookTypes[i]}
                            </span>
                            <p className="text-sm text-violet-300 italic leading-relaxed mt-1 group-hover:text-violet-200 transition-colors">
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
                              <ArrowRight className="w-4 h-4 text-violet-400" />
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
