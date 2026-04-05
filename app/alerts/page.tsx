"use client";
import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bell, BellOff, Plus, Trash2, RefreshCw, CheckCheck,
  ExternalLink, Clock, Zap, Search, AlertCircle,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface Keyword {
  id: string;
  keyword: string;
  created_at: string;
}

interface AlertHit {
  id: string;
  keyword: string;
  headline: string;
  source: string;
  url: string;
  matched_at: string;
  read: boolean;
}

export default function AlertsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [hits, setHits] = useState<AlertHit[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newKeyword, setNewKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterKeyword, setFilterKeyword] = useState("all");
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      if (!res.ok) throw new Error("Failed to load alerts");
      const data = await res.json();
      setKeywords(data.keywords || []);
      setHits(data.hits || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    if ("Notification" in window) {
      setNotifEnabled(Notification.permission === "granted");
    }
    const lc = localStorage.getItem("trendforge_alerts_last_checked");
    if (lc) setLastChecked(lc);

    // Auto-check every 30 minutes while tab is open
    const interval = setInterval(() => handleCheckNow(true), 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifEnabled(perm === "granted");
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: newKeyword.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add");
      setKeywords((prev) => [...prev, data.keyword]);
      setNewKeyword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
      setKeywords((prev) => prev.filter((k) => k.id !== id));
    } catch {
      setError("Failed to delete keyword");
    }
  };

  const handleCheckNow = async (silent = false) => {
    if (!silent) setChecking(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check" }),
      });
      const data = await res.json();
      const now = new Date().toISOString();
      localStorage.setItem("trendforge_alerts_last_checked", now);
      setLastChecked(now);
      await fetchData();
      if (data.newHits > 0 && notifEnabled && "Notification" in window) {
        new Notification("TrendForge Alert", {
          body: `${data.newHits} new keyword match${data.newHits > 1 ? "es" : ""} found!`,
        });
      }
    } catch (err: any) {
      if (!silent) setError(err.message || "Check failed");
    } finally {
      if (!silent) setChecking(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/alerts?markRead=true", { method: "DELETE" });
      setHits((prev) => prev.map((h) => ({ ...h, read: true })));
      setUnreadCount(0);
    } catch {
      setError("Failed to mark read");
    }
  };

  const filteredHits = filterKeyword === "all"
    ? hits
    : hits.filter((h) => h.keyword === filterKeyword);

  const keywordColors = [
    "text-violet-400 bg-violet-500/10 border-violet-500/20",
    "text-blue-400 bg-blue-500/10 border-blue-500/20",
    "text-green-400 bg-green-500/10 border-green-500/20",
    "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    "text-pink-400 bg-pink-500/10 border-pink-500/20",
  ];
  const keywordColorMap: Record<string, string> = {};
  keywords.forEach((k, i) => { keywordColorMap[k.keyword] = keywordColors[i % keywordColors.length]; });

  return (
    <AppShell title="Keyword Alerts" subtitle="Get notified when your keywords appear in trending news">
      <div className="max-w-4xl space-y-6">

        {/* Status bar */}
        <div className="flex flex-wrap items-center gap-3">
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-xs text-red-400 font-medium">{unreadCount} new alert{unreadCount > 1 ? "s" : ""}</span>
            </div>
          )}
          {lastChecked && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              Last checked {timeAgo(lastChecked)}
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            {!notifEnabled ? (
              <Button variant="ghost" size="sm" onClick={handleEnableNotifications}>
                <BellOff className="w-3.5 h-3.5" />
                Enable Notifications
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-green-400">
                <Bell className="w-3.5 h-3.5" />
                Notifications on
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCheckNow(false)}
              loading={checking}
              disabled={keywords.length === 0}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Check Now
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 sm:gap-6">
          {/* Left: Keyword Manager */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Tracked Keywords
                  </div>
                </CardTitle>
                <span className="text-[11px] text-slate-500">{keywords.length}/5 used</span>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {keywords.length < 5 && (
                    <div className="flex gap-2">
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="e.g. bitcoin, AI, climate..."
                        onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                        className="text-sm"
                      />
                      <Button
                        onClick={handleAddKeyword}
                        loading={adding}
                        disabled={!newKeyword.trim() || adding}
                        size="sm"
                        className="shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {keywords.length >= 5 && (
                    <div className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-400">
                      Maximum 5 keywords. Delete one to add more.
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    {loading ? (
                      [...Array(2)].map((_, i) => (
                        <div key={i} className="h-10 rounded-lg bg-surface-700 animate-pulse" />
                      ))
                    ) : keywords.length === 0 ? (
                      <div className="text-center py-6 text-sm text-slate-500">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No keywords yet. Add up to 5.
                      </div>
                    ) : (
                      keywords.map((kw) => {
                        const colorClass = keywordColorMap[kw.keyword] || keywordColors[0];
                        const hitCount = hits.filter((h) => h.keyword === kw.keyword).length;
                        const unread = hits.filter((h) => h.keyword === kw.keyword && !h.read).length;
                        return (
                          <div key={kw.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface-700 border border-surface-500">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colorClass}`}>
                                #{kw.keyword}
                              </span>
                              {hitCount > 0 && (
                                <span className="text-[10px] text-slate-500">{hitCount} hit{hitCount > 1 ? "s" : ""}</span>
                              )}
                              {unread > 0 && (
                                <span className="text-[10px] bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                  {unread}
                                </span>
                              )}
                            </div>
                            <button onClick={() => handleDelete(kw.id)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3 text-xs text-slate-500">
                  <div className="flex items-start gap-2">
                    <RefreshCw className="w-3.5 h-3.5 mt-0.5 text-violet-400 shrink-0" />
                    Auto-checks every 30 min while this tab is open.
                  </div>
                  <div className="flex items-start gap-2">
                    <Bell className="w-3.5 h-3.5 mt-0.5 text-violet-400 shrink-0" />
                    Enable browser notifications to get alerted even when you switch tabs.
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 mt-0.5 text-violet-400 shrink-0" />
                    Server auto-checks daily at 8am UTC. Upgrade to Pro for hourly.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Alerts Feed */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-red-400" />
                  Alerts Feed
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </CardTitle>
              {hits.length > 0 && unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-green-400 transition-colors">
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </CardHeader>
            <CardContent>
              {keywords.length > 1 && hits.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <button
                    onClick={() => setFilterKeyword("all")}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      filterKeyword === "all" ? "bg-violet-500/20 border-violet-500/40 text-violet-400" : "border-surface-400 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    All
                  </button>
                  {keywords.map((kw) => (
                    <button
                      key={kw.id}
                      onClick={() => setFilterKeyword(kw.keyword)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        filterKeyword === kw.keyword ? keywordColorMap[kw.keyword] || keywordColors[0] : "border-surface-400 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      #{kw.keyword}
                    </button>
                  ))}
                </div>
              )}

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-lg bg-surface-700 animate-pulse" />)}
                </div>
              ) : filteredHits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-surface-700 border border-surface-500 flex items-center justify-center mb-4">
                    <Bell className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-400 mb-1">
                    {keywords.length === 0 ? "Add keywords to start tracking" : "No alerts yet"}
                  </p>
                  <p className="text-xs text-slate-600 max-w-xs">
                    {keywords.length === 0
                      ? "Add up to 5 keywords on the left to get notified when they appear in the news."
                      : "Click \"Check Now\" to scan for your keywords in today's headlines."}
                  </p>
                  {keywords.length > 0 && (
                    <Button variant="secondary" size="sm" className="mt-4" onClick={() => handleCheckNow(false)} loading={checking}>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Check Now
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHits.map((hit) => {
                    const colorClass = keywordColorMap[hit.keyword] || keywordColors[0];
                    return (
                      <div
                        key={hit.id}
                        className={`p-4 rounded-xl border transition-all ${
                          !hit.read ? "bg-violet-500/5 border-violet-500/20" : "bg-surface-700 border-surface-500"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${colorClass}`}>
                                #{hit.keyword}
                              </span>
                              {!hit.read && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                              <span className="text-[10px] text-slate-500 ml-auto">{timeAgo(hit.matched_at)}</span>
                            </div>
                            <p className="text-sm text-slate-200 leading-snug">{hit.headline}</p>
                            <p className="text-[11px] text-slate-500 mt-1">{hit.source}</p>
                          </div>
                          {hit.url && hit.url !== "#" && (
                            <a href={hit.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-slate-500 hover:text-violet-400 transition-colors mt-1">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
