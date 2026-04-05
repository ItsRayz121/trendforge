"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select, Label, FormGroup } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { niches } from "@/data/niches";
import { countries } from "@/data/countries";
import {
  Bell,
  Plus,
  Trash2,
  TrendingUp,
  Zap,
  Globe,
  Pencil,
  Check,
  X,
} from "lucide-react";

interface Alert {
  id: string;
  keyword: string;
  niche: string;
  country: string;
  virality: number;
  active: boolean;
  lastTriggered?: string;
  hits: number;
}

const initialAlerts: Alert[] = [
  {
    id: "1",
    keyword: "Bitcoin",
    niche: "finance",
    country: "US",
    virality: 80,
    active: true,
    lastTriggered: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    hits: 12,
  },
  {
    id: "2",
    keyword: "AI Tools",
    niche: "tech",
    country: "US",
    virality: 70,
    active: true,
    lastTriggered: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    hits: 8,
  },
  {
    id: "3",
    keyword: "Halal Food",
    niche: "food",
    country: "AE",
    virality: 60,
    active: false,
    hits: 3,
  },
  {
    id: "4",
    keyword: "Remote Work",
    niche: "business",
    country: "GB",
    virality: 75,
    active: true,
    lastTriggered: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    hits: 5,
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      const stored = localStorage.getItem("trendforge_alerts");
      return stored ? JSON.parse(stored) : initialAlerts;
    } catch {
      return initialAlerts;
    }
  });
  const [showForm, setShowForm] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [niche, setNiche] = useState("tech");
  const [country, setCountry] = useState("US");
  const [virality, setVirality] = useState(70);

  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Alert>>({});

  // Hits drawer state
  const [hitsDrawerId, setHitsDrawerId] = useState<string | null>(null);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem("trendforge_alerts", JSON.stringify(alerts));
  }, [alerts]);

  const handleAdd = () => {
    if (!keyword.trim()) return;
    const newAlert: Alert = {
      id: Date.now().toString(),
      keyword,
      niche,
      country,
      virality,
      active: true,
      hits: 0,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setKeyword("");
    setShowForm(false);
  };

  const handleToggle = (id: string, val: boolean) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, active: val } : a)));
  };

  const handleDelete = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const startEdit = (alert: Alert) => {
    setEditingId(alert.id);
    setEditDraft({ keyword: alert.keyword, niche: alert.niche, country: alert.country, virality: alert.virality });
  };

  const saveEdit = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, ...editDraft } : a)));
    setEditingId(null);
    setEditDraft({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  function timeAgo(str: string) {
    const diff = Date.now() - new Date(str).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    if (mins < 60) return `${mins}m ago`;
    return `${hours}h ago`;
  }

  function getMockHits(alert: Alert) {
    const sources = ["TechCrunch", "Forbes", "BBC News", "Reuters", "Al Jazeera", "CoinDesk"];
    return Array.from({ length: 3 }, (_, i) => ({
      time: `${(i + 1) * 2 + i}h ago`,
      source: sources[i % sources.length],
      headline: `"${alert.keyword}" trending — ${sources[i % sources.length]} coverage spike`,
    }));
  }

  return (
    <AppShell title="Trend Alerts" subtitle="Get notified when your keywords go viral">
      <div className="space-y-6">
        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="success">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {alerts.filter((a) => a.active).length} Active Alerts
            </Badge>
            <Badge variant="default">
              {alerts.reduce((sum, a) => sum + a.hits, 0)} Total Hits
            </Badge>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4" />
            New Alert
          </Button>
        </div>

        {/* Add alert form */}
        {showForm && (
          <Card className="border-violet-500/20">
            <CardHeader>
              <CardTitle>Create Keyword Alert</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormGroup>
                  <Label required>Keyword</Label>
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g. Bitcoin, AI, Metaverse"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Niche</Label>
                  <Select value={niche} onChange={(e) => setNiche(e.target.value)}>
                    {niches.map((n) => (
                      <option key={n.id} value={n.id}>{n.icon} {n.label}</option>
                    ))}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Country</Label>
                  <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                    <option value="all">🌍 All Countries</option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Min. Virality Score</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={40}
                      max={95}
                      step={5}
                      value={virality}
                      onChange={(e) => setVirality(Number(e.target.value))}
                      className="flex-1 accent-violet-500"
                    />
                    <span className="text-sm font-bold text-violet-400 w-8">{virality}</span>
                  </div>
                </FormGroup>
              </div>
              <div className="mt-4">
                <Button onClick={handleAdd} disabled={!keyword.trim()}>
                  <Bell className="w-4 h-4" />
                  Create Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts list */}
        <div className="space-y-3">
          {alerts.length === 0 && (
            <div className="text-center py-16">
              <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No alerts yet</p>
              <p className="text-xs text-slate-600 mt-1">Create alerts to track your keywords</p>
            </div>
          )}
          {alerts.map((alert) => {
            const nicheData = niches.find((n) => n.id === alert.niche);
            const countryData = countries.find((c) => c.code === alert.country);
            const isEditing = editingId === alert.id;

            return (
              <div key={alert.id} className="relative">
                <Card className={alert.active ? "" : "opacity-60"}>
                  <div className="flex items-center gap-4">
                    {/* Keyword / edit area */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
                          <FormGroup>
                            <Label>Keyword</Label>
                            <Input
                              value={editDraft.keyword ?? ""}
                              onChange={(e) => setEditDraft((d) => ({ ...d, keyword: e.target.value }))}
                            />
                          </FormGroup>
                          <FormGroup>
                            <Label>Niche</Label>
                            <Select
                              value={editDraft.niche ?? "tech"}
                              onChange={(e) => setEditDraft((d) => ({ ...d, niche: e.target.value }))}
                            >
                              {niches.map((n) => (
                                <option key={n.id} value={n.id}>{n.icon} {n.label}</option>
                              ))}
                            </Select>
                          </FormGroup>
                          <FormGroup>
                            <Label>Country</Label>
                            <Select
                              value={editDraft.country ?? "US"}
                              onChange={(e) => setEditDraft((d) => ({ ...d, country: e.target.value }))}
                            >
                              <option value="all">🌍 All Countries</option>
                              {countries.map((c) => (
                                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                              ))}
                            </Select>
                          </FormGroup>
                          <FormGroup>
                            <Label>Min. Virality</Label>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={40}
                                max={95}
                                step={5}
                                value={editDraft.virality ?? 70}
                                onChange={(e) => setEditDraft((d) => ({ ...d, virality: Number(e.target.value) }))}
                                className="flex-1 accent-violet-500"
                              />
                              <span className="text-sm font-bold text-violet-400 w-8">{editDraft.virality ?? 70}</span>
                            </div>
                          </FormGroup>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-sm font-semibold text-slate-200">{alert.keyword}</h3>
                            {alert.active && alert.lastTriggered && (
                              <Badge variant="success">
                                <Zap className="w-2.5 h-2.5" />
                                Triggered {timeAgo(alert.lastTriggered)}
                              </Badge>
                            )}
                            {!alert.active && <Badge variant="default">Paused</Badge>}
                          </div>
                          <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <span>{nicheData?.icon}</span>
                              {nicheData?.label || alert.niche}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {countryData ? `${countryData.flag} ${countryData.name}` : "All Countries"}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Min {alert.virality}% virality
                            </span>
                            <button
                              onClick={() => setHitsDrawerId(hitsDrawerId === alert.id ? null : alert.id)}
                              className="text-violet-400 font-medium hover:text-violet-300 underline-offset-2 hover:underline transition-colors"
                            >
                              {alert.hits} hits
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(alert.id)}
                            className="p-1.5 rounded-md text-green-400 hover:bg-green-500/10 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded-md text-slate-500 hover:bg-surface-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(alert)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-surface-600 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <Switch
                            checked={alert.active}
                            onCheckedChange={(val) => handleToggle(alert.id, val)}
                          />
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(alert.id)}>
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Hits drawer */}
                {hitsDrawerId === alert.id && (
                  <div className="mt-1 rounded-lg border border-violet-500/20 bg-surface-800 p-3 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-violet-400">Recent Matches</p>
                      <button
                        onClick={() => setHitsDrawerId(null)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {getMockHits(alert).map((hit, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-slate-600 shrink-0 w-10">{hit.time}</span>
                        <span className="text-violet-400 shrink-0">{hit.source}</span>
                        <span className="text-slate-400 line-clamp-1">{hit.headline}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info card */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent>
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-200 mb-1">How Trend Alerts Work</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  TrendForge continuously monitors news sources and social signals for your keywords. When a
                  topic surpasses your minimum virality threshold, you'll receive an instant notification
                  so you can create content while the trend is still hot. Connect a real GNews API key in
                  Settings to enable live monitoring.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
