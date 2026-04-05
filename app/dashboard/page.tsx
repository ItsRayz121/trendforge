"use client";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveFeed } from "@/components/live-feed";
import { demoContentHistory } from "@/data/demo-topics";
import { getPlatformBg, timeAgo } from "@/lib/utils";
import type { Platform } from "@/lib/types";
import {
  TrendingUp,
  Wand2,
  ImageIcon,
  Calendar,
  ArrowRight,
  Zap,
  BarChart3,
  FileText,
} from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    label: "Generate Content",
    description: "Create AI posts for all platforms",
    icon: Wand2,
    href: "/studio",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    label: "View Trends",
    description: "See what's going viral now",
    icon: TrendingUp,
    href: "/trends",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
  {
    label: "Generate Image",
    description: "Create platform-specific prompts",
    icon: ImageIcon,
    href: "/image-generator",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
  },
  {
    label: "Schedule Post",
    description: "Plan your content calendar",
    icon: Calendar,
    href: "/scheduler",
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
  },
];

const platformLabels: Record<Platform, string> = {
  telegram: "Telegram",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
};

const platformIcons: Record<Platform, string> = {
  telegram: "✈️",
  instagram: "📸",
  facebook: "👥",
  twitter: "🐦",
  linkedin: "💼",
};

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" subtitle="Welcome back, Creator">
      <div className="space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Content Generated", value: "247", icon: FileText, trend: "+12 today" },
            { label: "Trends Tracked", value: "1,340", icon: TrendingUp, trend: "Live" },
            { label: "Platforms Active", value: "4", icon: Zap, trend: "All active" },
            { label: "AI Credits Left", value: "28", icon: BarChart3, trend: "72 used" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} glow>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
                    <p className="text-xs text-violet-400 mt-1">{stat.trend}</p>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-violet-400" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Card
                    hover
                    className="h-full flex flex-col gap-3 p-4"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center ${action.bg}`}
                    >
                      <Icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{action.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 mt-auto ${action.color}`} />
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Trending now */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Trending Now
                </div>
              </CardTitle>
              <Link href="/trends">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <LiveFeed compact limit={5} />
            </CardContent>
          </Card>

          {/* Recent content */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-400" />
                  Recent Content
                </div>
              </CardTitle>
              <Link href="/studio">
                <Button variant="ghost" size="sm">
                  Create new <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {demoContentHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-surface-700 border border-surface-500 hover:border-surface-400 transition-colors"
                  >
                    <span className="text-lg flex-shrink-0">{platformIcons[item.platform]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-300 truncate">{item.topic}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.preview}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="default">{platformLabels[item.platform]}</Badge>
                        <span className="text-[10px] text-slate-600">{timeAgo(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/studio">
                  <button className="w-full py-2.5 rounded-lg border border-dashed border-surface-400 text-xs text-slate-500 hover:text-slate-300 hover:border-surface-300 transition-colors mt-1">
                    + Create new content
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
