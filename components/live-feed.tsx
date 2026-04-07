"use client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Trend } from "@/lib/types";
import { timeAgo, getViralityColor, getViralityLabel } from "@/lib/utils";
import { TrendingUp, ExternalLink, Zap } from "lucide-react";

interface LiveFeedProps {
  compact?: boolean;
  limit?: number;
  onSelectTrend?: (trend: Trend) => void;
}

export function LiveFeed({ compact, limit = 5, onSelectTrend }: LiveFeedProps) {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/trends?limit=${limit}`)
      .then((r) => r.ok ? r.json() : { trends: [] })
      .then((data) => setTrends((data.trends ?? []).slice(0, limit)))
      .catch(() => setTrends([]))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-surface-500 bg-surface-700 p-4">
            <div className="shimmer h-4 w-3/4 rounded mb-2" />
            <div className="shimmer h-3 w-full rounded mb-1" />
            <div className="shimmer h-3 w-2/3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="text-center py-6">
        <TrendingUp className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-xs text-slate-500">No trends available right now</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {trends.map((trend, i) => (
          <button
            key={trend.id}
            onClick={() => onSelectTrend?.(trend)}
            className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-700 transition-colors text-left group"
          >
            <span className="text-xs font-bold text-slate-600 w-4 flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-300 group-hover:text-slate-100 truncate leading-snug">
                {trend.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-semibold ${getViralityColor(trend.virality)}`}>
                  {getViralityLabel(trend.virality)} {trend.virality}%
                </span>
                <span className="text-[10px] text-slate-600">{trend.category}</span>
              </div>
            </div>
            <TrendingUp className="w-3.5 h-3.5 text-slate-600 group-hover:text-violet-400 flex-shrink-0 mt-0.5 transition-colors" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trends.map((trend) => (
        <Card
          key={trend.id}
          hover
          onClick={() => onSelectTrend?.(trend)}
          className="cursor-pointer"
        >
          <div className="flex items-start gap-3">
            {trend.imageUrl && (
              <img
                src={trend.imageUrl}
                alt={trend.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0 hidden sm:block"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="text-sm font-semibold text-slate-200 leading-snug">
                  {trend.title}
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Zap className={`w-3 h-3 ${getViralityColor(trend.virality)}`} />
                  <span className={`text-xs font-bold ${getViralityColor(trend.virality)}`}>
                    {trend.virality}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-2 line-clamp-2">
                {trend.summary}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="default">{trend.category}</Badge>
                  <Badge variant="purple">{getViralityLabel(trend.virality)}</Badge>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-600">
                  <span>{trend.source}</span>
                  <span>·</span>
                  <span>{timeAgo(trend.publishedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
