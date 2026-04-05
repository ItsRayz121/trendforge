"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Label, FormGroup } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { niches } from "@/data/niches";
import { countries } from "@/data/countries";
import { timeAgo } from "@/lib/utils";
import {
  TrendingUp, RefreshCw, Clock, Sparkles, BarChart3,
  Hash, MessageSquare, Zap, ChevronRight, ExternalLink,
  Lightbulb, Target, Calendar,
} from "lucide-react";
import Link from "next/link";

interface TopTopic {
  title: string;
  summary: string;
  relevance: number;
  contentAngle: string;
}

interface ContentFormat {
  format: string;
  reason: string;
  platforms: string[];
  boost: string;
}

interface PostingTime {
  platform: string;
  bestTimes: string[];
  bestDays: string[];
  tip: string;
}

interface TrendReport {
  topTopics: TopTopic[];
  contentFormats: ContentFormat[];
  postingTimes: PostingTime[];
  trendingHashtags: string[];
  weeklyInsight: string;
  audienceMood: string;
  hotContentType: string;
  generatedAt: string;
  cached: boolean;
}

const platformEmojis: Record<string, string> = {
  instagram: "📸",
  twitter: "🐦",
  linkedin: "💼",
  facebook: "👥",
  telegram: "✈️",
};

const moodColors: Record<string, string> = {
  curious: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  inspired: "text-green-400 bg-green-500/10 border-green-500/20",
  concerned: "text-red-400 bg-red-500/10 border-red-500/20",
  excited: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  nostalgic: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

export default function TrendReportPage() {
  const [report, setReport] = useState<TrendReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [niche, setNiche] = useState("tech");
  const [country, setCountry] = useState("US");
  const [error, setError] = useState<string | null>(null);

  // Load last used niche/country from settings
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("trendforge_settings") || "{}");
      if (saved.defaultNiche?.[0]) setNiche(saved.defaultNiche[0]);
      if (saved.defaultCountry?.[0]) setCountry(saved.defaultCountry[0]);
    } catch {}
  }, []);

  const fetchReport = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ niche, country });
      if (forceRefresh) params.set("force", "1");
      const res = await fetch(`/api/trend-report?${params}`);
      if (!res.ok) throw new Error("Failed to generate report");
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const nicheLabel = niches.find((n) => n.id === niche);
  const countryLabel = countries.find((c) => c.code === country);

  return (
    <AppShell title="Niche Trend Report" subtitle="AI-powered weekly analysis for your content strategy">
      <div className="max-w-4xl space-y-6">

        {/* Controls */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex flex-wrap items-end gap-4">
              <FormGroup className="flex-1 min-w-[140px]">
                <Label>Niche</Label>
                <Select value={niche} onChange={(e) => setNiche(e.target.value)}>
                  {niches.map((n) => (
                    <option key={n.id} value={n.id}>{n.icon} {n.label}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup className="flex-1 min-w-[140px]">
                <Label>Country</Label>
                <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                  ))}
                </Select>
              </FormGroup>
              <Button onClick={() => fetchReport(false)} loading={loading} size="lg" className="shrink-0">
                <Sparkles className="w-4 h-4" />
                {loading ? "Generating..." : "Generate Report"}
              </Button>
              {report && (
                <Button variant="ghost" size="sm" onClick={() => fetchReport(true)} disabled={loading} className="shrink-0 text-slate-400">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !report && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-surface-700 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!report && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-700 border border-surface-500 flex items-center justify-center mb-4">
              <BarChart3 className="w-7 h-7 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1">No report generated yet</p>
            <p className="text-xs text-slate-600 max-w-sm">
              Select your niche and country above, then click Generate Report to get AI-powered insights for your content strategy.
            </p>
          </div>
        )}

        {/* Report content */}
        {report && !loading && (
          <>
            {/* Report header */}
            <div className="flex flex-wrap items-center gap-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{nicheLabel?.icon}</span>
                <span className="text-sm font-semibold text-slate-200">{nicheLabel?.label} Report</span>
                <span className="text-slate-600">·</span>
                <span className="text-sm text-slate-400">{countryLabel?.flag} {countryLabel?.name}</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {report.cached && (
                  <Badge variant="default">Cached</Badge>
                )}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  {timeAgo(report.generatedAt)}
                </div>
              </div>
            </div>

            {/* Weekly Insight */}
            <Card className="border-violet-500/20 bg-violet-500/5">
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Weekly Insight</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${moodColors[report.audienceMood] || moodColors.curious}`}>
                        Audience mood: {report.audienceMood}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 font-medium">
                        🔥 {report.hotContentType}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{report.weeklyInsight}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Topics */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Top 5 Trending Topics
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.topTopics?.map((topic, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-surface-700 border border-surface-500 hover:border-surface-400 transition-colors">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <span className="text-2xl font-black text-slate-600">#{i + 1}</span>
                        <div className="w-10 h-1.5 rounded-full bg-surface-500 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-green-500"
                            style={{ width: `${topic.relevance}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">{topic.relevance}%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-200 mb-1">{topic.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-2">{topic.summary}</p>
                        <div className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/5 border border-green-500/15">
                          <Target className="w-3 h-3 text-green-400 mt-0.5 shrink-0" />
                          <p className="text-[11px] text-green-400 leading-snug">{topic.contentAngle}</p>
                        </div>
                      </div>
                      <Link
                        href={`/studio?topic=${encodeURIComponent(topic.contentAngle)}`}
                        className="shrink-0 self-center p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-colors"
                        title="Generate content for this topic"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Formats + Posting Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Best Content Formats */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      Best Content Formats
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.contentFormats?.map((fmt, i) => (
                      <div key={i} className="p-3 rounded-lg bg-surface-700 border border-surface-500">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-slate-200">{fmt.format}</span>
                          <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5 font-medium">
                            {fmt.boost}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">{fmt.reason}</p>
                        <div className="flex flex-wrap gap-1">
                          {fmt.platforms?.map((p) => (
                            <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-600 text-slate-400">
                              {platformEmojis[p] || "📱"} {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Best Posting Times */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      Best Posting Times
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.postingTimes?.map((pt, i) => (
                      <div key={i} className="p-3 rounded-lg bg-surface-700 border border-surface-500">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">{platformEmojis[pt.platform] || "📱"}</span>
                          <span className="text-xs font-semibold text-slate-200 capitalize">{pt.platform}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {pt.bestTimes?.map((t) => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {pt.bestDays?.map((d) => (
                            <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-600 text-slate-400">{d}</span>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-500 italic">{pt.tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trending Hashtags */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-pink-400" />
                    Trending Hashtags This Week
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {report.trendingHashtags?.map((tag) => (
                    <Link
                      key={tag}
                      href={`/studio?topic=${encodeURIComponent(tag)}`}
                      className="text-sm px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/20 transition-colors font-mono"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-3">Click any hashtag to generate content around it in the Studio.</p>
              </CardContent>
            </Card>

            {/* Quick action */}
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-slate-500">Reports are cached for 6 hours to save API calls.</p>
              <Link href="/studio">
                <Button variant="secondary" size="sm">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Open Content Studio
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
