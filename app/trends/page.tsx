"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/input";
import { fetchTrends, trendCategories } from "@/lib/trends";
import { getViralityColor, getViralityLabel, timeAgo } from "@/lib/utils";
import type { Trend } from "@/lib/types";
import { countries } from "@/data/countries";
import { ScrapeExplorer } from "@/components/scrape-explorer";
import {
  TrendingUp,
  Search,
  RefreshCw,
  ExternalLink,
  Zap,
  Globe,
  Wand2,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

type Timeframe = "24h" | "7d" | "30d" | "breaking";

const timeframeMs: Record<Exclude<Timeframe, "breaking">, number> = {
  "24h": 86400000,
  "7d": 604800000,
  "30d": 2592000000,
};

const timeframeLabels: Record<Timeframe, string> = {
  "24h": "24 Hours",
  "7d": "7 Days",
  "30d": "30 Days",
  "breaking": "🔥 Breaking",
};

export default function TrendsPage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeframe, setTimeframe] = useState<Timeframe>("7d");

  const loadTrends = async () => {
    setLoading(true);
    try {
      const data = await fetchTrends({
        country: selectedCountry !== "all" ? selectedCountry : undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        query: query || undefined,
        limit: timeframe === "breaking" ? 50 : 300,
        breakingOnly: timeframe === "breaking",
      });

      if (timeframe === "breaking") {
        // Show only high virality breaking news
        const breaking = data.filter((t) => t.virality >= 75);
        setTrends(breaking);
      } else {
        const threshold = timeframeMs[timeframe];
        const filtered = data.filter(
          (t) => Date.now() - new Date(t.publishedAt).getTime() <= threshold
        );
        setTrends(filtered.length > 0 ? filtered : data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrends();
  }, [selectedCountry, selectedCategory, timeframe]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTrends();
  };

  return (
    <AppShell title="Trending" subtitle="Live trends from around the world">
      <div className="space-y-5">
        {/* SerpAPI Explorer */}
        <ScrapeExplorer />

        {/* Timeframe tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-surface-800 border border-surface-600 w-fit">
          {(["breaking", "24h", "7d", "30d"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                timeframe === tf
                  ? tf === "breaking"
                    ? "bg-red-500/15 border border-red-500/30 text-red-400"
                    : "bg-violet-500/15 border border-violet-500/30 text-violet-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {timeframeLabels[tf]}
            </button>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search trends, keywords..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-400 bg-surface-700 text-sm text-slate-200 placeholder-slate-500 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                />
              </div>
              <Button type="submit" variant="primary" size="md">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </form>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-3 py-2 rounded-lg border border-surface-400 bg-surface-700 text-sm text-slate-200 focus:border-violet-500/50 focus:outline-none"
              >
                <option value="all">🌍 All Countries</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-lg border border-surface-400 bg-surface-700 text-sm text-slate-200 focus:border-violet-500/50 focus:outline-none"
              >
                {trendCategories.map((cat) => (
                  <option key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </option>
                ))}
              </select>
              <Button variant="secondary" size="icon" onClick={loadTrends}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-surface-500 bg-surface-800 p-5 space-y-3"
              >
                <div className="shimmer h-5 w-3/4 rounded" />
                <div className="shimmer h-3 w-full rounded" />
                <div className="shimmer h-3 w-2/3 rounded" />
                <div className="flex gap-2">
                  <div className="shimmer h-5 w-20 rounded-full" />
                  <div className="shimmer h-5 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : trends.length === 0 ? (
          <div className="text-center py-16">
            <TrendingUp className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No trends found for your filters</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setQuery(""); setSelectedCountry("all"); setSelectedCategory("all"); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {trends.length} trends found
              </p>
              <Badge variant="success">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live
              </Badge>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {trends.map((trend) => (
                <TrendCard key={trend.id} trend={trend} />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function TrendCard({ trend }: { trend: Trend }) {
  // Build create URL with platforms and niche params
  const createUrl = `/studio?topic=${encodeURIComponent(trend.title)}&platforms=${trend.platforms.join(",")}&niche=${trend.category}&country=${trend.country}`;
  const imageUrl = `/image-generator?topic=${encodeURIComponent(trend.title)}`;

  return (
    <Card hover className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        {trend.imageUrl && (
          <img
            src={trend.imageUrl}
            alt={trend.title}
            className="w-14 h-14 rounded-lg object-cover flex-shrink-0 hidden sm:block"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-200 leading-snug">{trend.title}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Zap className={`w-3 h-3 ${getViralityColor(trend.virality)}`} />
              <span className={`text-xs font-bold ${getViralityColor(trend.virality)}`}>
                {trend.virality}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{trend.summary}</p>
        </div>
      </div>

      {/* Content angles - clickable */}
      <div>
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Content Angles</p>
        <div className="space-y-1">
          {trend.contentAngles.slice(0, 3).map((angle, i) => (
            <Link
              key={i}
              href={`/studio?topic=${encodeURIComponent(angle)}&platforms=${trend.platforms.join(",")}`}
              className="flex items-start gap-2 text-xs text-slate-400 hover:text-violet-400 transition-colors group"
            >
              <span className="text-violet-400 flex-shrink-0 group-hover:translate-x-1 transition-transform">→</span>
              <span className="line-clamp-1">{angle}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-surface-600">
        <div className="flex items-center gap-2">
          <Badge variant="default">{trend.category}</Badge>
          <Badge
            variant={
              trend.virality >= 80 ? "success" : trend.virality >= 60 ? "warning" : "default"
            }
          >
            {getViralityLabel(trend.virality)}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <Link href={`/analytics?trend=${trend.id}`}>
            <Button variant="ghost" size="sm">
              <BarChart3 className="w-3.5 h-3.5" />
              Analyze
            </Button>
          </Link>
          <div className="relative group">
            <Link href={createUrl}>
              <Button variant="outline" size="sm">
                <Wand2 className="w-3.5 h-3.5" />
                Create
              </Button>
            </Link>
            {/* Dropdown for create options */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-surface-800 border border-surface-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <Link
                href={createUrl}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface-700 hover:text-violet-400 transition-colors rounded-t-lg"
              >
                <Wand2 className="w-3 h-3" />
                Content Studio
              </Link>
              <Link
                href={imageUrl}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface-700 hover:text-violet-400 transition-colors rounded-b-lg"
              >
                <ExternalLink className="w-3 h-3" />
                Image Generator
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-slate-600 -mt-2">
        <Globe className="w-3 h-3" />
        <span>{trend.source}</span>
        <span>·</span>
        <span>{timeAgo(trend.publishedAt)}</span>
        <a
          href={trend.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-violet-400 transition-colors ml-auto"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  );
}
