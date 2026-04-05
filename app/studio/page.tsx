"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { TopicForm } from "@/components/topic-form";
import { OutputTabs } from "@/components/output-tabs";
import { LiveFeed } from "@/components/live-feed";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { GenerateRequest, GenerateResponse, Trend, Platform } from "@/lib/types";
import { Wand2, TrendingUp, Lightbulb, History, X } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface GenerationHistoryItem {
  id: string;
  topic: string;
  generatedAt: string;
  response: GenerateResponse;
}

function StudioContent() {
  const searchParams = useSearchParams();
  const urlTopic = searchParams.get("topic") ?? "";
  const urlHook = searchParams.get("hook") ?? "";
  const urlPlatforms = searchParams.get("platforms");
  const initialTopic = urlHook || urlTopic;
  const initialPlatforms = urlPlatforms ? urlPlatforms.split(",") as Platform[] : undefined;

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<GenerateResponse | null>(null);
  const [lastRequest, setLastRequest] = useState<GenerateRequest | null>(null);
  const [history, setHistory] = useState<GenerationHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem("trendforge_gen_history");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleGenerate = async (req: GenerateRequest) => {
    setLoading(true);
    setLastRequest(req);
    try {
      const saved = JSON.parse(localStorage.getItem("trendforge_settings") || "{}");
      const customKey = saved.openaiKey || "";
      const savedModel = saved.aiProvider === "custom" ? (saved.customModel || "") : (saved.openaiModel || "");
      // Use providerBaseUrl (new) or fall back to customBaseUrl (old field name)
      const savedBaseUrl = saved.providerBaseUrl || saved.customBaseUrl || "";

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(customKey && { "x-custom-api-key": customKey }),
          ...(savedModel && { "x-ai-model": savedModel }),
          ...(savedBaseUrl && { "x-base-url": savedBaseUrl }),
        },
        body: JSON.stringify(req),
      });

      if (!res.ok) throw new Error("Generation failed");
      const result: GenerateResponse = await res.json();
      setResponse(result);

      const newItem: GenerationHistoryItem = {
        id: Date.now().toString(),
        topic: req.topic,
        generatedAt: result.generatedAt,
        response: result,
      };
      setHistory((prev) => {
        const updated = [newItem, ...prev].slice(0, 5);
        localStorage.setItem("trendforge_gen_history", JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrendSelect = (_trend: Trend) => {
    // Navigation handled via URL params in LiveFeed
  };

  const handleRegenerate = async (req?: GenerateRequest) => {
    if (req) {
      await handleGenerate(req);
    } else if (lastRequest) {
      await handleGenerate({
        ...lastRequest,
        customPrompt: `${lastRequest.customPrompt || ""}\n\nRegenerate with a fresh angle and different approach.`,
      });
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("trendforge_gen_history");
  };

  const handleSave = async (platform: string, content: string, hashtags: string[], cta: string) => {
    if (!lastRequest) return;
    const res = await fetch("/api/save-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: lastRequest.topic,
        platform,
        content,
        hashtags,
        cta,
        char_count: content.length,
        generated_at: response?.generatedAt,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Save failed");
    }
  };

  const tips = [
    "Add a trending keyword to boost relevance",
    "Select multiple platforms for cross-posting",
    "Use 'Question' CTA for 3x more comments",
    "Educational tone gets 40% more saves on Instagram",
    "Twitter performs best with 1-3 hashtags",
  ];

  return (
    <AppShell
      title="Content Studio"
      subtitle="AI-powered content generator for all platforms"
    >
      <div className="grid lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr] gap-6">
        {/* Left: Form */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-violet-400" />
                  Content Generator
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TopicForm
                onGenerate={handleGenerate}
                loading={loading}
                initialTopic={initialTopic}
                initialPlatforms={initialPlatforms}
              />
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  Pro Tips
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="text-violet-400 mt-0.5">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Generation history */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-400" />
                    Recent Generations
                  </div>
                </CardTitle>
                <button
                  onClick={clearHistory}
                  className="text-[11px] text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setResponse(item.response)}
                      className="w-full text-left px-3 py-2.5 rounded-lg bg-surface-700 border border-surface-500 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
                    >
                      <p className="text-xs font-medium text-slate-200 line-clamp-1">{item.topic}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{timeAgo(item.generatedAt)}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Output + Trends */}
        <div className="space-y-5">
          {/* Output */}
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  Generated Output
                  {response && (
                    <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5 font-normal">
                      Ready
                    </span>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OutputTabs
                response={response}
                onRegenerate={handleRegenerate}
                originalRequest={lastRequest}
                onSave={handleSave}
              />
            </CardContent>
          </Card>

          {/* Trending topics to spark ideas */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Trending Topics — Click to Use
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 mb-3">
                Click any trend to use it as your content topic
              </p>
              <LiveFeed compact limit={6} onSelectTrend={handleTrendSelect} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-sm">Loading studio...</div>}>
      <StudioContent />
    </Suspense>
  );
}
