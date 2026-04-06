"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GenerateResponse, Platform, GenerateRequest } from "@/lib/types";
import { getPlatformBg, copyToClipboard } from "@/lib/utils";
import { Copy, Check, RefreshCw, History, ChevronDown, ChevronUp, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface GenerationHistoryItem {
  id: string;
  response: GenerateResponse;
  generatedAt: string;
  version: number;
}

interface OutputTabsProps {
  response: GenerateResponse | null;
  onRegenerate?: (req?: GenerateRequest) => Promise<void>;
  originalRequest?: GenerateRequest | null;
  onSave?: (platform: Platform, content: string, hashtags: string[], cta: string) => Promise<void>;
}

export function OutputTabs({ response, onRegenerate, originalRequest, onSave }: OutputTabsProps) {
  const [activeTab, setActiveTab] = useState<Platform | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [savedPlatforms, setSavedPlatforms] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Add response to history when it changes
  useEffect(() => {
    if (response) {
      setHistory((prev) => {
        const exists = prev.some((h) => h.id === response.generatedAt);
        if (exists) return prev;
        return [
          ...prev,
          {
            id: response.generatedAt,
            response,
            generatedAt: response.generatedAt,
            version: prev.length + 1,
          },
        ];
      });
    }
  }, [response]);

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-700 flex items-center justify-center mb-4 border border-surface-500">
          <span className="text-2xl">✨</span>
        </div>
        <p className="text-sm font-medium text-slate-400">Your content will appear here</p>
        <p className="text-xs text-slate-600 mt-1">Fill in the form and click Generate</p>
      </div>
    );
  }

  const currentPlatform = activeTab || response.outputs[0]?.platform;
  const currentOutput = response.outputs.find((o) => o.platform === currentPlatform);

  const handleRegenerate = async () => {
    if (!onRegenerate || !originalRequest) return;
    setIsRegenerating(true);
    try {
      await onRegenerate({
        ...originalRequest,
        customPrompt: `${originalRequest.customPrompt || ""}\n\nRegenerate with a fresh angle and different approach.`,
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const switchToVersion = (_item: GenerationHistoryItem) => {
    // This would need to be passed to parent component
    // For now, we'll store the current view state
  };

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = async (output: typeof currentOutput) => {
    if (!output) return;
    const tags = Array.isArray(output.hashtags) ? output.hashtags : [];
    const text = `${output.content}\n\n${tags.join(" ")}`;
    await handleCopy(text, "all");
  };

  const handleSave = async (output: typeof currentOutput) => {
    if (!output || !onSave || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(output.platform, output.content, output.hashtags, output.cta);
      setSavedPlatforms((prev) => [...prev, output.platform]);
      setTimeout(() => {
        setSavedPlatforms((prev) => prev.filter((p) => p !== output.platform));
      }, 3000);
    } catch (err: any) {
      setSaveError(err?.message || "Save failed — check Supabase setup");
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Generated for</p>
          <p className="text-sm font-medium text-slate-200 truncate max-w-[200px]">
            {response.topic}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs"
            >
              <History className="w-3.5 h-3.5" />
              {history.length} versions
              {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          )}
          {onRegenerate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              loading={isRegenerating}
              disabled={!originalRequest}
              title={!originalRequest ? "Cannot regenerate - original request not available" : "Generate new version"}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </Button>
          )}
        </div>
      </div>

      {/* History Panel */}
      {showHistory && history.length > 1 && (
        <div className="p-3 rounded-lg bg-surface-700 border border-surface-600">
          <p className="text-xs font-medium text-slate-400 mb-2">Previous Versions</p>
          <div className="space-y-1">
            {history.slice(0, -1).reverse().map((item) => (
              <button
                key={item.id}
                onClick={() => switchToVersion(item)}
                className="w-full text-left px-3 py-2 rounded-md bg-surface-800 hover:bg-surface-600 transition-colors text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Version {item.version}</span>
                  <span className="text-slate-500">{new Date(item.generatedAt).toLocaleTimeString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Platform tabs */}
      <div className="flex gap-2 flex-wrap">
        {response.outputs.map((output) => (
          <button
            key={output.platform}
            onClick={() => setActiveTab(output.platform)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200",
              currentPlatform === output.platform
                ? getPlatformBg(output.platform)
                : "border-surface-400 bg-surface-700 text-slate-500 hover:text-slate-300"
            )}
          >
            <span>{platformIcons[output.platform]}</span>
            <span>{platformLabels[output.platform]}</span>
          </button>
        ))}
      </div>

      {/* Content output */}
      {currentOutput && (
        <div className="space-y-3">
          {/* Main content */}
          <div className="relative group">
            <div className="bg-surface-700 border border-surface-500 rounded-xl p-4 min-h-[160px]">
              {currentOutput.content ? (
                <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                  {currentOutput.content}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center gap-2">
                  <p className="text-sm text-amber-400">AI returned no content for this platform.</p>
                  <p className="text-xs text-slate-500">Try regenerating or changing the topic.</p>
                </div>
              )}
            </div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
              <button
                onClick={() => handleCopy(currentOutput.content, "content")}
                className="p-1.5 rounded-lg bg-surface-600 border border-surface-400 text-slate-400 hover:text-slate-200 transition-colors"
                title="Copy content"
              >
                {copied === "content" ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              {onSave && (
                <button
                  onClick={() => handleSave(currentOutput)}
                  className="p-1.5 rounded-lg bg-surface-600 border border-surface-400 text-slate-400 hover:text-violet-400 transition-colors"
                  title="Save to library"
                  disabled={isSaving}
                >
                  {savedPlatforms.includes(currentOutput.platform) ? (
                    <BookmarkCheck className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Char count */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{currentOutput.charCount} characters</span>
            {currentOutput.charCount > 280 && currentPlatform === "twitter" && (
              <Badge variant="warning">Exceeds Twitter limit</Badge>
            )}
          </div>

          {/* Hashtags */}
          {(currentOutput.hashtags ?? []).length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Hashtags</p>
              <div className="flex flex-wrap gap-1.5">
                {(currentOutput.hashtags ?? []).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleCopy(tag, tag)}
                    className="text-xs px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-colors font-mono"
                  >
                    {copied === tag ? "✓" : tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-surface-700 border border-surface-500 rounded-lg p-3">
            <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
              Call to Action
            </p>
            <p className="text-sm text-slate-300">{currentOutput.cta || "—"}</p>
          </div>

          {/* Save error */}
          {saveError && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {saveError}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => handleCopyAll(currentOutput)}
            >
              {copied === "all" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy All
                </>
              )}
            </Button>
            {onSave && (
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => handleSave(currentOutput)}
                loading={isSaving}
                disabled={isSaving}
              >
                {savedPlatforms.includes(currentOutput.platform) ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-green-400" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    Save
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
