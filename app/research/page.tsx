"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label, FormGroup } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { niches } from "@/data/niches";
import { countries } from "@/data/countries";
import { platforms } from "@/data/platforms";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Search, Clock, TrendingUp, Sparkles, ChevronRight,
  Users, BarChart3, Zap, Target, Hash, AlertCircle,
  ArrowRight, Eye, Calendar,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = "competitor" | "best-time" | "content-gap";

interface CompetitorResult {
  handle: string;
  platform: string;
  overview: string;
  postingFrequency: string;
  topTopics: { topic: string; percentage: number; description: string }[];
  contentTypes: { type: string; percentage: number; engagement: string }[];
  tone: string;
  audienceAge: string;
  engagementStyle: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  estimatedFollowers: string;
  growthTrend: string;
  keyTakeaway: string;
}

interface HeatmapSlot { day: string; hour: number; score: number; }
interface TopSlot { day: string; time: string; score: number; reason: string; }
interface BestTimeResult {
  platforms: Record<string, {
    heatmap: HeatmapSlot[];
    topSlots: TopSlot[];
    worstTimes: string[];
    insight: string;
  }>;
  generalInsights: string[];
  timezone: string;
  audiencePeakDays: string[];
}

interface ContentGap {
  topic: string;
  gapScore: number;
  demandLevel: string;
  competitionLevel: string;
  reason: string;
  contentAngle: string;
  suggestedFormats: string[];
  estimatedReach: string;
  urgency: string;
  hashtags: string[];
}
interface ContentGapResult {
  gaps: ContentGap[];
  marketInsight: string;
  quickWins: string[];
  longTermOpportunities: string[];
}

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ResearchPage() {
  const [tab, setTab] = useState<Tab>("competitor");

  const tabs = [
    { id: "competitor" as Tab, label: "Competitor Spy", icon: Eye, color: "text-blue-400" },
    { id: "best-time" as Tab, label: "Best Time", icon: Clock, color: "text-green-400" },
    { id: "content-gap" as Tab, label: "Content Gaps", icon: Target, color: "text-orange-400" },
  ];

  return (
    <AppShell title="Research Tools" subtitle="AI-powered competitive intelligence for smarter content">
      <div className="max-w-4xl space-y-6">
        {/* Tab switcher */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all",
                  tab === t.id
                    ? "bg-violet-600/15 border-violet-500/30 text-violet-400"
                    : "border-surface-400 bg-surface-700 text-slate-400 hover:text-slate-200 hover:bg-surface-600"
                )}
              >
                <Icon className={cn("w-4 h-4", tab === t.id ? "text-violet-400" : t.color)} />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "competitor" && <CompetitorSpy />}
        {tab === "best-time" && <BestTimeCalculator />}
        {tab === "content-gap" && <ContentGapFinder />}
      </div>
    </AppShell>
  );
}

// ── Tool 1: Competitor Spy ────────────────────────────────────────────────────
function CompetitorSpy() {
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompetitorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!handle.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/research/competitor-spy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, platform }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      setResult(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const growthColors: Record<string, string> = {
    growing: "text-green-400 bg-green-500/10 border-green-500/20",
    stable: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    declining: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              Competitor Content Spy
            </div>
          </CardTitle>
          <Badge variant="default">AI Analysis</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Label className="mb-1 block text-xs text-slate-400">Social Handle or Brand Name</Label>
              <Input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@garyvee, HubSpot, Elon Musk..."
                onKeyDown={(e) => e.key === "Enter" && analyze()}
              />
            </div>
            <div className="w-40">
              <Label className="mb-1 block text-xs text-slate-400">Platform</Label>
              <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
                ))}
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={analyze} loading={loading} disabled={!handle.trim()}>
                <Search className="w-4 h-4" />
                Analyze
              </Button>
            </div>
          </div>
          {error && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-surface-700 animate-pulse" />)}
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3 px-1">
            <div>
              <h2 className="text-lg font-bold text-slate-200">@{result.handle}</h2>
              <p className="text-xs text-slate-500">{result.estimatedFollowers} followers · {result.postingFrequency}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", growthColors[result.growthTrend] || growthColors.stable)}>
                {result.growthTrend === "growing" ? "↑ Growing" : result.growthTrend === "declining" ? "↓ Declining" : "→ Stable"}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full border border-surface-400 bg-surface-700 text-slate-400">
                {result.tone}
              </span>
            </div>
          </div>

          {/* Overview */}
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-4">
              <p className="text-sm text-slate-300 leading-relaxed">{result.overview}</p>
            </CardContent>
          </Card>

          {/* Topics + Content Types */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Top Topics</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.topTopics?.map((t, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-300 font-medium">{t.topic}</span>
                        <span className="text-xs text-slate-500">{t.percentage}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-600 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${t.percentage}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-600 mt-0.5">{t.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Content Types</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.contentTypes?.map((t, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-300 font-medium">{t.type}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium",
                            t.engagement === "Very High" ? "text-green-400 bg-green-500/10" :
                            t.engagement === "High" ? "text-blue-400 bg-blue-500/10" : "text-yellow-400 bg-yellow-500/10"
                          )}>{t.engagement}</span>
                          <span className="text-xs text-slate-500">{t.percentage}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-600 overflow-hidden">
                        <div className="h-full rounded-full bg-violet-500" style={{ width: `${t.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strengths + Gaps + Opportunities */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm text-green-400">Strengths</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.strengths?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-green-400 mt-0.5">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm text-red-400">Their Weaknesses</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.weaknesses?.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-red-400 mt-0.5">✗</span>{w}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm text-yellow-400">Your Opportunities</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.opportunities?.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-yellow-400 mt-0.5">→</span>{o}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Key Takeaway */}
          <Card className="border-violet-500/20">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Zap className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-violet-400 mb-1">Key Takeaway</p>
                  <p className="text-sm text-slate-300">{result.keyTakeaway}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Tool 2: Best Time Calculator ──────────────────────────────────────────────
function BestTimeCalculator() {
  const [niche, setNiche] = useState("tech");
  const [country, setCountry] = useState("US");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "twitter"]);
  const [activePlatform, setActivePlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BestTimeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("trendforge_settings") || "{}");
      if (saved.defaultNiche?.[0]) setNiche(saved.defaultNiche[0]);
      if (saved.defaultCountry?.[0]) setCountry(saved.defaultCountry[0]);
      if (saved.defaultPlatforms?.length) {
        setSelectedPlatforms(saved.defaultPlatforms);
        setActivePlatform(saved.defaultPlatforms[0]);
      }
    } catch {}
  }, []);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const calculate = async () => {
    if (!selectedPlatforms.length) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/research/best-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, country, platforms: selectedPlatforms }),
      });
      if (!res.ok) throw new Error("Calculation failed");
      const data = await res.json();
      setResult(data);
      setActivePlatform(selectedPlatforms[0]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getHeatScore = (day: string, hour: number, heatmap: HeatmapSlot[]) => {
    const slot = heatmap.find((h) => h.day === day && h.hour === hour);
    return slot?.score ?? 0;
  };

  const scoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500 text-white";
    if (score >= 80) return "bg-green-500/60 text-white";
    if (score >= 70) return "bg-yellow-500/60 text-white";
    if (score >= 1) return "bg-surface-500 text-slate-400";
    return "bg-surface-700 text-slate-700";
  };

  const currentData = result?.platforms?.[activePlatform];

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-400" />
              Best Time to Post Calculator
            </div>
          </CardTitle>
          <Badge variant="default">AI Analysis</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormGroup>
                <Label>Niche</Label>
                <Select value={niche} onChange={(e) => setNiche(e.target.value)}>
                  {niches.map((n) => <option key={n.id} value={n.id}>{n.icon} {n.label}</option>)}
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Country</Label>
                <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                  {countries.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </Select>
              </FormGroup>
            </div>
            <div>
              <Label className="mb-2 block">Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      selectedPlatforms.includes(p.id)
                        ? "border-green-500/30 bg-green-500/10 text-green-400"
                        : "border-surface-400 bg-surface-700 text-slate-500"
                    )}
                  >
                    <span>{p.icon}</span>{p.label}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={calculate} loading={loading} disabled={!selectedPlatforms.length}>
              <Sparkles className="w-4 h-4" />
              Calculate Best Times
            </Button>
          </div>
          {error && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />{error}
            </div>
          )}
        </CardContent>
      </Card>

      {loading && <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-surface-700 animate-pulse" />)}</div>}

      {result && !loading && (
        <div className="space-y-4">
          {/* General insights */}
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-green-400" />
                <span className="text-xs font-semibold text-green-400">Peak Days: {result.audiencePeakDays?.join(", ")}</span>
                <span className="ml-auto text-xs text-slate-500">{result.timezone}</span>
              </div>
              <div className="space-y-1.5">
                {result.generalInsights?.map((insight, i) => (
                  <p key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                    <span className="text-green-400 mt-0.5">→</span>{insight}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform tabs */}
          {selectedPlatforms.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {selectedPlatforms.map((p) => {
                const plat = platforms.find((pl) => pl.id === p);
                return (
                  <button
                    key={p}
                    onClick={() => setActivePlatform(p)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      activePlatform === p
                        ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
                        : "border-surface-400 bg-surface-700 text-slate-400"
                    )}
                  >
                    {plat?.icon} {plat?.label}
                  </button>
                );
              })}
            </div>
          )}

          {currentData && (
            <>
              {/* Heatmap */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Posting Heatmap — {activePlatform}</CardTitle>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="w-3 h-3 rounded bg-green-500 inline-block" /> Best
                    <span className="w-3 h-3 rounded bg-yellow-500/60 inline-block ml-2" /> Good
                    <span className="w-3 h-3 rounded bg-surface-500 inline-block ml-2" /> Average
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr>
                          <th className="text-left text-slate-600 pb-2 pr-2 font-normal w-10">Hour</th>
                          {DAYS_SHORT.map((d) => (
                            <th key={d} className="text-slate-500 pb-2 px-1 font-medium text-center">{d}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[7, 8, 9, 10, 12, 13, 17, 18, 19, 20, 21].map((hour) => (
                          <tr key={hour}>
                            <td className="text-slate-600 pr-2 py-0.5 text-right">{hour}:00</td>
                            {DAYS_FULL.map((day) => {
                              const score = getHeatScore(day, hour, currentData.heatmap);
                              return (
                                <td key={day} className="px-0.5 py-0.5">
                                  <div className={cn(
                                    "w-full h-6 rounded flex items-center justify-center font-bold transition-all",
                                    scoreColor(score)
                                  )}>
                                    {score > 0 ? score : ""}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Top slots */}
              <div className="grid md:grid-cols-3 gap-3">
                {currentData.topSlots?.map((slot, i) => (
                  <Card key={i} className={i === 0 ? "border-green-500/30 bg-green-500/5" : ""}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-200">#{i + 1} Best Slot</span>
                        <span className="text-xs font-bold text-green-400">{slot.score}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-100 mb-1">{slot.day} {slot.time}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{slot.reason}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Platform insight */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-300 leading-relaxed">{currentData.insight}</p>
                  </div>
                  {currentData.worstTimes?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-slate-600 mr-1">Avoid:</span>
                      {currentData.worstTimes.map((t, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">{t}</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tool 3: Content Gap Finder ─────────────────────────────────────────────────
function ContentGapFinder() {
  const [niche, setNiche] = useState("tech");
  const [country, setCountry] = useState("US");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentGapResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("trendforge_settings") || "{}");
      if (saved.defaultNiche?.[0]) setNiche(saved.defaultNiche[0]);
      if (saved.defaultCountry?.[0]) setCountry(saved.defaultCountry[0]);
    } catch {}
  }, []);

  const findGaps = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/research/content-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, country }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      setResult(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const urgencyColors: Record<string, string> = {
    "trending-now": "text-red-400 bg-red-500/10 border-red-500/20",
    emerging: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    evergreen: "text-green-400 bg-green-500/10 border-green-500/20",
  };

  const scoreBar = (score: number) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-surface-600 overflow-hidden">
        <div
          className={cn("h-full rounded-full", score >= 90 ? "bg-green-500" : score >= 80 ? "bg-blue-500" : "bg-violet-500")}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-bold text-slate-300 w-8">{score}</span>
    </div>
  );

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-400" />
              Content Gap Finder
            </div>
          </CardTitle>
          <Badge variant="default">AI + Live Trends</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <FormGroup className="flex-1 min-w-[140px]">
              <Label>Your Niche</Label>
              <Select value={niche} onChange={(e) => setNiche(e.target.value)}>
                {niches.map((n) => <option key={n.id} value={n.id}>{n.icon} {n.label}</option>)}
              </Select>
            </FormGroup>
            <FormGroup className="flex-1 min-w-[140px]">
              <Label>Target Market</Label>
              <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                {countries.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </Select>
            </FormGroup>
            <Button onClick={findGaps} loading={loading}>
              <TrendingUp className="w-4 h-4" />
              Find Gaps
            </Button>
          </div>
          {error && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />{error}
            </div>
          )}
        </CardContent>
      </Card>

      {loading && <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-surface-700 animate-pulse" />)}</div>}

      {result && !loading && (
        <div className="space-y-4">
          {/* Market insight */}
          <Card className="border-orange-500/20 bg-orange-500/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <BarChart3 className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed">{result.marketInsight}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick wins */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Card className="border-green-500/20">
              <CardHeader><CardTitle className="text-sm text-green-400">⚡ Post Today</CardTitle></CardHeader>
              <CardContent>
                {result.quickWins?.map((win, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                    <ArrowRight className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-300">{win}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-blue-500/20">
              <CardHeader><CardTitle className="text-sm text-blue-400">🎯 Long-term Plays</CardTitle></CardHeader>
              <CardContent>
                {result.longTermOpportunities?.map((opp, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-300">{opp}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Gap cards */}
          <div className="space-y-3">
            {result.gaps?.map((gap, i) => (
              <Card key={i} className={i === 0 ? "border-orange-500/30" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold text-slate-600">#{i + 1}</span>
                        <h3 className="text-sm font-semibold text-slate-200">{gap.topic}</h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium", urgencyColors[gap.urgency] || urgencyColors.evergreen)}>
                          {gap.urgency === "trending-now" ? "🔥 Trending Now" : gap.urgency === "emerging" ? "⬆ Emerging" : "♻ Evergreen"}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400">
                          Demand: {gap.demandLevel}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-green-500/20 bg-green-500/10 text-green-400">
                          Competition: {gap.competitionLevel}
                        </span>
                        <span className="text-[10px] text-slate-500">{gap.estimatedReach} reach</span>
                      </div>
                    </div>
                    <div className="w-20 shrink-0">
                      <p className="text-[10px] text-slate-500 mb-1 text-right">Gap Score</p>
                      {scoreBar(gap.gapScore)}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-2 leading-relaxed">{gap.reason}</p>

                  <div className="flex items-start gap-1.5 px-3 py-2 rounded-lg bg-violet-500/5 border border-violet-500/15 mb-3">
                    <Target className="w-3 h-3 text-violet-400 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-violet-300 leading-snug"><span className="font-semibold">Your angle: </span>{gap.contentAngle}</p>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex flex-wrap gap-1">
                      {gap.suggestedFormats?.map((f) => (
                        <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-600 text-slate-400">{f}</span>
                      ))}
                      {gap.hashtags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 font-mono">{tag}</span>
                      ))}
                    </div>
                    <Link
                      href={`/studio?topic=${encodeURIComponent(gap.contentAngle)}`}
                      className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Create content <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
