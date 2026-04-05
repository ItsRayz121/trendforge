"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label, FormGroup } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { TopicOptimizationModal } from "./topic-optimization-modal";
import { TemplateManager, type Template } from "./template-manager";
import { countries } from "@/data/countries";
import { niches } from "@/data/niches";
import { platforms } from "@/data/platforms";
import { tones, ctaStyles, languages } from "@/data/tones";
import type { GenerateRequest, Platform } from "@/lib/types";
import { Wand2, Sparkles, ChevronDown, Settings2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicFormProps {
  onGenerate: (req: GenerateRequest) => Promise<void>;
  loading: boolean;
  initialTopic?: string;
  initialPlatforms?: Platform[];
}

export function TopicForm({ onGenerate, loading, initialTopic, initialPlatforms }: TopicFormProps) {
  const [topic, setTopic] = useState(initialTopic || "");
  const [country, setCountry] = useState<string[]>(["US"]);
  const [niche, setNiche] = useState<string[]>(["tech"]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(initialPlatforms || ["instagram", "twitter"]);
  const [tone, setTone] = useState<any>("professional");
  const [ctaStyle, setCtaStyle] = useState("comment");
  const [language, setLanguage] = useState("en");
  const [trendKeyword, setTrendKeyword] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  // Modal states
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<Partial<Record<Platform, Template | null>>>({});
  const [activeTemplatePlatform, setActiveTemplatePlatform] = useState<Platform | null>(null);
  const [tempTopic, setTempTopic] = useState("");

  // Load settings on mount
  useEffect(() => {
    const stored = localStorage.getItem("trendforge_settings");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.defaultCountry) setCountry(parsed.defaultCountry);
      if (parsed.defaultNiche) setNiche(parsed.defaultNiche);
      if (parsed.defaultPlatforms) setSelectedPlatforms(parsed.defaultPlatforms);
      if (parsed.defaultTone) setTone(parsed.defaultTone);
      if (parsed.defaultLanguage) setLanguage(parsed.defaultLanguage);
    }
  }, []);

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      // Show optimization modal when topic comes from trending
      setTempTopic(initialTopic);
      setShowOptimizationModal(true);
    }
  }, [initialTopic]);

  useEffect(() => {
    if (initialPlatforms) setSelectedPlatforms(initialPlatforms);
  }, [initialPlatforms]);

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleTopicSubmit = () => {
    if (!topic.trim() || selectedPlatforms.length === 0) return;
    setTempTopic(topic);
    setShowOptimizationModal(true);
  };

  const handleOptimizedProceed = async (finalTopic: string, isOptimized: boolean) => {
    setShowOptimizationModal(false);
    setTopic(finalTopic);

    // Build custom prompt from templates
    let templatePrompt = "";
    selectedPlatforms.forEach((platform) => {
      const template = selectedTemplates[platform];
      if (template) {
        templatePrompt += `\n\nFor ${platform}: ${template.prompt}`;
      }
    });

    const finalPrompt = customPrompt + templatePrompt;

    await onGenerate({
      topic: finalTopic,
      country: country[0] || "US",
      niche: niche[0] || "tech",
      platforms: selectedPlatforms,
      tone,
      ctaStyle,
      language,
      trendKeyword: trendKeyword || undefined,
      customPrompt: finalPrompt || undefined,
    });
  };

  const handleTemplateSelect = (platform: Platform, template: Template) => {
    setSelectedTemplates((prev) => ({
      ...prev,
      [platform]: prev[platform]?.id === template.id ? null : template,
    }));
  };

  const countryOptions = countries.map((c) => ({ value: c.code, label: `${c.flag} ${c.name}` }));
  const nicheOptions = niches.map((n) => ({ value: n.id, label: `${n.icon} ${n.label}` }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleTopicSubmit(); }} className="space-y-5">
      {/* Topic */}
      <FormGroup>
        <Label required>Topic / Idea</Label>
        <Textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Bitcoin hits $120K — how this affects everyday investors"
          className="min-h-[80px]"
          required
        />
      </FormGroup>

      {/* Trending keyword */}
      <FormGroup>
        <Label>Trending Keyword (optional)</Label>
        <Input
          value={trendKeyword}
          onChange={(e) => setTrendKeyword(e.target.value)}
          placeholder="e.g. #Bitcoin2025, AI Tools, etc."
        />
      </FormGroup>

      {/* Multi-select Country + Niche */}
      <div className="space-y-3">
        <FormGroup>
          <Label required>Countries</Label>
          <MultiSelect
            options={countryOptions}
            value={country}
            onChange={setCountry}
            placeholder="Select countries..."
          />
        </FormGroup>
        <FormGroup>
          <Label required>Niches</Label>
          <MultiSelect
            options={nicheOptions}
            value={niche}
            onChange={setNiche}
            placeholder="Select niches..."
          />
        </FormGroup>
      </div>

      {/* Row: Tone + Language */}
      <div className="grid grid-cols-2 gap-3">
        <FormGroup>
          <Label required>Tone</Label>
          <Select value={tone} onChange={(e) => setTone(e.target.value)}>
            {tones.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.label}
              </option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup>
          <Label>Language</Label>
          <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </Select>
        </FormGroup>
      </div>

      {/* CTA Style */}
      <FormGroup>
        <Label>Call-to-Action Style</Label>
        <Select value={ctaStyle} onChange={(e) => setCtaStyle(e.target.value)}>
          {ctaStyles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label} — "{c.example}"
            </option>
          ))}
        </Select>
      </FormGroup>

      {/* Platform selection */}
      <div>
        <Label required>Output Platforms</Label>
        <div className="grid grid-cols-2 gap-2 mt-1.5">
          {platforms.map((p) => {
            const selected = selectedPlatforms.includes(p.id);
            const colorMap: Record<string, string> = {
              sky: "border-sky-500/30 bg-sky-500/10 text-sky-400",
              pink: "border-pink-500/30 bg-pink-500/10 text-pink-400",
              blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
              cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
            };
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePlatform(p.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200",
                  selected
                    ? colorMap[p.color] || "border-violet-500/30 bg-violet-500/10 text-violet-400"
                    : "border-surface-400 bg-surface-700 text-slate-500 hover:text-slate-300"
                )}
              >
                <span className="text-base">{p.icon}</span>
                <span className="text-xs">{p.label}</span>
                {selected && (
                  <span className="ml-auto text-[10px] opacity-60">✓</span>
                )}
              </button>
            );
          })}
        </div>
        {selectedPlatforms.length === 0 && (
          <p className="text-xs text-red-400 mt-1.5">Select at least one platform</p>
        )}
      </div>

      {/* Platform Templates — tab layout */}
      <div className="border border-surface-600 rounded-xl overflow-hidden">
        {/* Header */}
        <button
          type="button"
          onClick={() => {
            const next = !showTemplateManager;
            setShowTemplateManager(next);
            if (next && !activeTemplatePlatform && selectedPlatforms.length > 0) {
              setActiveTemplatePlatform(selectedPlatforms[0]);
            }
          }}
          className="w-full px-4 py-3 flex items-center justify-between bg-surface-800 hover:bg-surface-750 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
              <Settings2 className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-200">Platform Templates</p>
              <p className="text-[10px] text-slate-500">
                {Object.values(selectedTemplates).filter(Boolean).length > 0
                  ? `${Object.values(selectedTemplates).filter(Boolean).length} template${Object.values(selectedTemplates).filter(Boolean).length > 1 ? "s" : ""} active`
                  : "Customize AI output per platform"}
              </p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showTemplateManager ? "rotate-180" : ""}`} />
        </button>

        {showTemplateManager && selectedPlatforms.length > 0 && (
          <div className="border-t border-surface-600">
            {/* Platform tabs */}
            <div className="flex overflow-x-auto border-b border-surface-600 bg-surface-900/50">
              {selectedPlatforms.map((platform) => {
                const p = platforms.find((x) => x.id === platform);
                const hasTemplate = !!selectedTemplates[platform];
                const isActive = activeTemplatePlatform === platform;
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => setActiveTemplatePlatform(platform)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all duration-200 flex-shrink-0",
                      isActive
                        ? "border-violet-500 text-violet-300 bg-violet-500/5"
                        : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-surface-700"
                    )}
                  >
                    <span className="text-base leading-none">{p?.icon}</span>
                    <span>{p?.label}</span>
                    {hasTemplate && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active platform template panel */}
            {activeTemplatePlatform && (
              <div className="p-4">
                {/* Active template badge */}
                {selectedTemplates[activeTemplatePlatform] && (
                  <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/25">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      <span className="text-xs font-medium text-violet-300">
                        Active: {selectedTemplates[activeTemplatePlatform]?.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTemplateSelect(activeTemplatePlatform, selectedTemplates[activeTemplatePlatform]!)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <TemplateManager
                  selectedPlatform={activeTemplatePlatform}
                  onSelectTemplate={(template) => handleTemplateSelect(activeTemplatePlatform, template)}
                  currentTemplate={selectedTemplates[activeTemplatePlatform]}
                />
              </div>
            )}
          </div>
        )}

        {showTemplateManager && selectedPlatforms.length === 0 && (
          <div className="p-6 text-center border-t border-surface-600">
            <p className="text-xs text-slate-500">Select at least one platform above to manage templates.</p>
          </div>
        )}
      </div>

      {/* Custom prompt */}
      <FormGroup>
        <Label>Additional Instructions</Label>
        <Textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Add extra instructions, tone guidance, or specific requirements..."
          className="min-h-[80px] text-xs"
        />
        <p className="text-[11px] text-slate-600 mt-1">
          These instructions will be combined with platform templates.
        </p>
      </FormGroup>

      {/* Submit */}
      <Button
        type="button"
        onClick={handleTopicSubmit}
        loading={loading}
        disabled={!topic.trim() || selectedPlatforms.length === 0}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>Generating content...</>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Generate Content
            <Sparkles className="w-3.5 h-3.5 opacity-60" />
          </>
        )}
      </Button>

      {/* Topic Optimization Modal */}
      {showOptimizationModal && (
        <TopicOptimizationModal
          originalTopic={tempTopic}
          onClose={() => setShowOptimizationModal(false)}
          onProceed={handleOptimizedProceed}
          loading={loading}
        />
      )}
    </form>
  );
}
