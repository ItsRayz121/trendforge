"use client";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select, Label, FormGroup, Textarea } from "@/components/ui/input";
import { platforms } from "@/data/platforms";
import { getBestPostingTimes, getPlatformBg, formatDate } from "@/lib/utils";
import type { Platform, ScheduledPost } from "@/lib/types";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Timer,
  Edit3,
} from "lucide-react";

const initialPosts: ScheduledPost[] = [
  {
    id: "1",
    content: "Bitcoin just hit $120K and here's what you NEED to know before the week starts 🧵\n\nThread on why this cycle is different...",
    platform: "twitter",
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    status: "scheduled",
    topic: "Bitcoin ATH Analysis",
  },
  {
    id: "2",
    content: "The AI tools reshaping content creation in 2025 ✨\n\nI tested 12 tools so you don't have to. Here's my honest breakdown...",
    platform: "instagram",
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    status: "scheduled",
    topic: "AI Tools Review",
  },
  {
    id: "3",
    content: "📌 IMPORTANT UPDATE\n\nThe halal food market just crossed $2.5 trillion globally. Here's what this means for brands targeting Muslim consumers...",
    platform: "telegram",
    scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "published",
    topic: "Halal Market Report",
  },
  {
    id: "4",
    content: "Remote work in 2025 — the real numbers that nobody is talking about.\n\nOffice vacancy: 20% globally. Suburban home sales: up 35%.",
    platform: "facebook",
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 10).toISOString(),
    status: "draft",
    topic: "Remote Work Trends",
  },
];

const platformIcons: Record<Platform, string> = {
  telegram: "✈️",
  instagram: "📸",
  facebook: "👥",
  twitter: "🐦",
  linkedin: "💼",
};

const platformLabels: Record<Platform, string> = {
  telegram: "Telegram",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
};

const statusConfig = {
  scheduled: { label: "Scheduled", variant: "info" as const, icon: Timer },
  published: { label: "Published", variant: "success" as const, icon: CheckCircle2 },
  draft: { label: "Draft", variant: "default" as const, icon: Edit3 },
  failed: { label: "Failed", variant: "danger" as const, icon: AlertCircle },
};

function formatScheduledTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isPast = date < now;

  if (isPast) return "Published " + date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const diff = date.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (hours === 0) return `In ${minutes}m`;
  if (hours < 24) return `In ${hours}h ${minutes}m`;
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function SchedulerPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>(initialPosts);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("instagram");
  const [newContent, setNewContent] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const handleAddPost = () => {
    if (!newContent.trim() || !scheduledAt) return;
    const post: ScheduledPost = {
      id: Date.now().toString(),
      content: newContent,
      platform: selectedPlatform,
      scheduledAt: new Date(scheduledAt).toISOString(),
      status: "scheduled",
      topic: newTopic || "Custom Post",
    };
    setPosts((prev) => [post, ...prev]);
    setNewContent("");
    setNewTopic("");
    setScheduledAt("");
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredPosts =
    filterStatus === "all" ? posts : posts.filter((p) => p.status === filterStatus);

  const bestTimes = getBestPostingTimes(selectedPlatform);

  return (
    <AppShell title="Content Scheduler" subtitle="Plan and manage your content calendar">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(["scheduled", "published", "draft", "failed"] as const).map((status) => {
            const count = posts.filter((p) => p.status === status).length;
            const config = statusConfig[status];
            const Icon = config.icon;
            return (
              <Card key={status}>
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 flex-shrink-0 ${
                    status === "scheduled" ? "text-blue-400" :
                    status === "published" ? "text-green-400" :
                    status === "draft" ? "text-slate-400" : "text-red-400"
                  }`} />
                  <div>
                    <p className="text-2xl font-bold text-slate-100">{count}</p>
                    <p className="text-xs text-slate-500 capitalize">{status}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Left: Add new + Best times */}
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-violet-400" />
                    Schedule Post
                  </div>
                </CardTitle>
                <Button
                  variant={showForm ? "ghost" : "primary"}
                  size="sm"
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? "Cancel" : "Add New"}
                </Button>
              </CardHeader>
              {showForm && (
                <CardContent>
                  <div className="space-y-4">
                    <FormGroup>
                      <Label required>Topic</Label>
                      <Input
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        placeholder="e.g. Bitcoin ATH Analysis"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label required>Content</Label>
                      <Textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Write or paste your post content..."
                        className="min-h-[100px]"
                      />
                    </FormGroup>
                    <div>
                      <Label required>Platform</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1.5">
                        {platforms.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedPlatform(p.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                              selectedPlatform === p.id
                                ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
                                : "border-surface-400 bg-surface-700 text-slate-500"
                            }`}
                          >
                            <span>{p.icon}</span>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <FormGroup>
                      <Label required>Schedule Date & Time</Label>
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="w-full rounded-lg border border-surface-400 bg-surface-700 px-3 py-2 text-sm text-slate-200 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                      />
                    </FormGroup>
                    <Button
                      onClick={handleAddPost}
                      disabled={!newContent.trim() || !scheduledAt}
                      className="w-full"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Post
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Best posting times */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    Best Posting Times
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platforms.map((p) => (
                    <div key={p.id}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm">{p.icon}</span>
                        <span className="text-xs font-medium text-slate-300">{p.label}</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {getBestPostingTimes(p.id).map((time) => (
                          <span
                            key={time}
                            className="text-[11px] px-2 py-1 rounded-md bg-surface-700 border border-surface-500 text-slate-400"
                          >
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Posts list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200">Content Queue</h2>
              <div className="flex gap-2">
                {["all", "scheduled", "draft", "published"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                      filterStatus === s
                        ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No posts found</p>
                </div>
              )}
              {filteredPosts.map((post) => {
                const config = statusConfig[post.status];
                const StatusIcon = config.icon;
                return (
                  <Card key={post.id} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-2xl">{platformIcons[post.platform]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-xs font-semibold text-slate-200">{post.topic}</p>
                          <Badge variant={config.variant}>
                            <StatusIcon className="w-2.5 h-2.5" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatScheduledTime(post.scheduledAt)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full border ${getPlatformBg(post.platform)}`}
                          >
                            {platformLabels[post.platform]}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
