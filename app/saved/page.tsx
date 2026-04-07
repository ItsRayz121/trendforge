"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { copyToClipboard, timeAgo } from "@/lib/utils";
import type { Platform } from "@/lib/types";
import toast from "react-hot-toast";
import {
  Bookmark,
  Search,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Wand2,
} from "lucide-react";
import Link from "next/link";

interface SavedItem {
  id: string;
  topic: string;
  platform: Platform;
  content: string;
  hashtags: string[];
  cta: string;
  char_count: number;
  generated_at: string;
  saved_at: string;
}

const platformIcons: Record<string, string> = {
  telegram: "✈️",
  instagram: "📸",
  facebook: "👥",
  twitter: "🐦",
  linkedin: "💼",
};

const platformLabels: Record<string, string> = {
  telegram: "Telegram",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
};

const platformColors: Record<string, string> = {
  twitter: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  instagram: "border-pink-500/30 bg-pink-500/10 text-pink-400",
  facebook: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  telegram: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  linkedin: "border-blue-400/30 bg-blue-400/10 text-blue-300",
};

export default function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/save-content");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to load saved content");
        return;
      }
      const data = await res.json();
      setItems(data);
    } catch {
      toast.error("Network error — could not load saved content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/save-content?id=${id}`, { method: "DELETE" });
    setDeleting(null);
  };

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = items.filter((item) => {
    const matchQuery =
      !query ||
      item.topic.toLowerCase().includes(query.toLowerCase()) ||
      item.content.toLowerCase().includes(query.toLowerCase());
    const matchPlatform = filterPlatform === "all" || item.platform === filterPlatform;
    return matchQuery && matchPlatform;
  });

  const platforms = Array.from(new Set(items.map((i) => i.platform)));

  return (
    <AppShell title="Saved Content" subtitle="Your content library">
      <div className="space-y-5">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by topic or content..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-400 bg-surface-700 text-sm text-slate-200 placeholder-slate-500 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex gap-1 flex-wrap">
              {["all", ...platforms].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                    filterPlatform === p
                      ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                      : "text-slate-500 hover:text-slate-300 border border-transparent"
                  }`}
                >
                  {p === "all" ? "All" : platformIcons[p] + " " + (platformLabels[p] || p)}
                </button>
              ))}
            </div>
            <button
              onClick={loadItems}
              className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{items.length} saved items</span>
          {query || filterPlatform !== "all" ? (
            <span className="text-violet-400">{filtered.length} shown</span>
          ) : null}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-surface-500 bg-surface-800 p-5">
                <div className="shimmer h-4 w-2/3 rounded mb-3" />
                <div className="shimmer h-3 w-full rounded mb-2" />
                <div className="shimmer h-3 w-4/5 rounded mb-4" />
                <div className="shimmer h-8 w-full rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">
              {items.length === 0
                ? "No saved content yet"
                : "No content matches your filters"}
            </p>
            <p className="text-xs text-slate-600 mt-1 mb-4">
              {items.length === 0
                ? "Generate content in the Studio and click Save"
                : "Try adjusting your search or filter"}
            </p>
            {items.length === 0 && (
              <Link href="/studio">
                <Button variant="primary" size="sm">
                  <Wand2 className="w-4 h-4" />
                  Go to Studio
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <Card key={item.id} className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base flex-shrink-0">{platformIcons[item.platform] || "📄"}</span>
                    <p className="text-xs font-semibold text-slate-200 truncate">{item.topic}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${platformColors[item.platform] || "border-surface-400 bg-surface-700 text-slate-400"}`}>
                    {platformLabels[item.platform] || item.platform}
                  </span>
                </div>

                {/* Content preview */}
                <div className="bg-surface-700 border border-surface-500 rounded-lg p-3">
                  <p className="text-xs text-slate-300 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>

                {/* Hashtags */}
                {item.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.hashtags.slice(0, 5).map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 font-mono">
                        {tag}
                      </span>
                    ))}
                    {item.hashtags.length > 5 && (
                      <span className="text-[10px] text-slate-600">+{item.hashtags.length - 5} more</span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-surface-600">
                  <span className="text-[10px] text-slate-600">{timeAgo(item.saved_at)}</span>
                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(`${item.content}\n\n${item.hashtags?.join(" ") || ""}`, item.id)}
                    >
                      {copied === item.id ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copied === item.id ? "Copied" : "Copy"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
