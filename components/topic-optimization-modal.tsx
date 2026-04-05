"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowRight, X, Check, Edit3 } from "lucide-react";

interface TopicOptimizationModalProps {
  originalTopic: string;
  onClose: () => void;
  onProceed: (topic: string, optimized: boolean) => void;
  loading?: boolean;
}

// Mock SEO optimization - in production this would call the AI
function mockOptimizeTopic(topic: string): string {
  const seoPrefixes = [
    "Ultimate Guide to",
    "Everything You Need to Know About",
    "Why",
    "How to Master",
    "The Truth About",
    "X Tips for",
    "Breaking:",
  ];
  const seoSuffixes = [
    "in 2025",
    "- Complete Tutorial",
    "(Step-by-Step)",
    "That Will Change Everything",
  ];

  // Don't add prefix/suffix if already SEO-optimized
  if (seoPrefixes.some((p) => topic.includes(p))) return topic;

  const prefix = seoPrefixes[Math.floor(Math.random() * seoPrefixes.length)];
  const suffix = seoSuffixes[Math.floor(Math.random() * seoSuffixes.length)];

  return `${prefix} ${topic} ${suffix}`;
}

export function TopicOptimizationModal({
  originalTopic,
  onClose,
  onProceed,
  loading = false,
}: TopicOptimizationModalProps) {
  const [selectedOption, setSelectedOption] = useState<"original" | "optimized">("original");
  const [optimizedTopic, setOptimizedTopic] = useState(() => mockOptimizeTopic(originalTopic));
  const [isEditing, setIsEditing] = useState(false);
  const [editedTopic, setEditedTopic] = useState(optimizedTopic);

  const handleOptimize = () => {
    const newOptimized = mockOptimizeTopic(originalTopic);
    setOptimizedTopic(newOptimized);
    setEditedTopic(newOptimized);
    setSelectedOption("optimized");
  };

  const handleProceed = () => {
    const finalTopic = selectedOption === "original" ? originalTopic : editedTopic;
    onProceed(finalTopic, selectedOption === "optimized");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg p-6 border-violet-500/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="font-semibold text-slate-200">Topic Optimization</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-400 mb-6">
          Choose how you want to use this topic for content generation.
        </p>

        {/* Options */}
        <div className="space-y-4">
          {/* Original Option */}
          <button
            onClick={() => setSelectedOption("original")}
            className={`w-full p-4 rounded-xl border text-left transition-all ${
              selectedOption === "original"
                ? "bg-surface-700 border-violet-500/30 ring-2 ring-violet-500/20"
                : "bg-surface-800 border-surface-600 hover:border-surface-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedOption === "original" ? "border-violet-500 bg-violet-500" : "border-slate-500"
                }`}
              >
                {selectedOption === "original" && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-slate-200">Use Original Topic</p>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{originalTopic}</p>
              </div>
            </div>
          </button>

          {/* Optimized Option */}
          <button
            onClick={() => {
              setSelectedOption("optimized");
              if (optimizedTopic === originalTopic) {
                handleOptimize();
              }
            }}
            className={`w-full p-4 rounded-xl border text-left transition-all ${
              selectedOption === "optimized"
                ? "bg-surface-700 border-violet-500/30 ring-2 ring-violet-500/20"
                : "bg-surface-800 border-surface-600 hover:border-surface-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedOption === "optimized" ? "border-violet-500 bg-violet-500" : "border-slate-500"
                }`}
              >
                {selectedOption === "optimized" && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-slate-200">Generate SEO-Optimized Topic</p>
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Recommended</span>
                </div>
                {selectedOption === "optimized" ? (
                  <div className="mt-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editedTopic}
                          onChange={(e) => setEditedTopic(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm bg-surface-900 border border-violet-500/30 rounded text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(false);
                          }}
                          className="text-green-400 hover:text-green-300"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-violet-300 line-clamp-2">{editedTopic}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                          }}
                          className="text-slate-500 hover:text-slate-300 flex-shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">Click to generate an SEO-friendly version</p>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleProceed} loading={loading} className="flex-1">
            Proceed
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
