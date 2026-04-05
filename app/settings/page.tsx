"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label, FormGroup } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import { countries } from "@/data/countries";
import { niches } from "@/data/niches";
import { platforms } from "@/data/platforms";
import { tones, languages } from "@/data/tones";
import type { Platform, Tone } from "@/lib/types";
import {
  Bot,
  Globe,
  Palette,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  Image,
  Sparkles,
  Rss,
  RotateCcw,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

interface SettingsState {
  openaiKey: string;
  gnewsKey: string;
  customApiKey: string;
  openaiModel: string;
  customModel: string;
  aiProvider: string;
  providerBaseUrl: string;
  imageProvider: string;
  imageModel: string;
  customImageBaseUrl: string;
  defaultCountry: string[];
  defaultNiche: string[];
  defaultTone: Tone;
  defaultPlatforms: Platform[];
  defaultLanguage: string;
  defaultCtaStyle: string;
  autoFetchTrends: boolean;
  emailAlerts: boolean;
  darkMode: boolean;
  compactMode: boolean;
}

const knownBaseUrls: Record<string, string> = {
  openrouter: "https://openrouter.ai/api/v1",
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  groq: "https://api.groq.com/openai/v1",
  together: "https://api.together.xyz/v1",
  custom: "",
};

const defaultSettings: SettingsState = {
  openaiKey: "",
  gnewsKey: "",
  customApiKey: "",
  openaiModel: "google/gemini-2.0-flash-001",
  customModel: "",
  aiProvider: "openrouter",
  providerBaseUrl: knownBaseUrls.openrouter,
  imageProvider: "",
  imageModel: "",
  customImageBaseUrl: "",
  defaultCountry: ["US"],
  defaultNiche: ["tech"],
  defaultTone: "professional",
  defaultPlatforms: ["instagram", "twitter"],
  defaultLanguage: "en",
  defaultCtaStyle: "comment",
  autoFetchTrends: true,
  emailAlerts: false,
  darkMode: true,
  compactMode: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showGNews, setShowGNews] = useState(false);
  const [showCustomKey, setShowCustomKey] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings: Supabase first, fallback to localStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("user_settings")
            .select("settings")
            .eq("user_id", user.id)
            .single();

          if (data?.settings) {
            const parsed = data.settings;
            if (!parsed.providerBaseUrl && parsed.customBaseUrl) {
              parsed.providerBaseUrl = parsed.customBaseUrl;
            }
            setSettings({ ...defaultSettings, ...parsed });
            localStorage.setItem("trendforge_settings", JSON.stringify(parsed));
            return;
          }
        }

        // Fallback: localStorage
        const stored = localStorage.getItem("trendforge_settings");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!parsed.providerBaseUrl && parsed.customBaseUrl) {
            parsed.providerBaseUrl = parsed.customBaseUrl;
          }
          setSettings({ ...defaultSettings, ...parsed });
        }
      } catch {
        const stored = localStorage.getItem("trendforge_settings");
        if (stored) {
          try { setSettings({ ...defaultSettings, ...JSON.parse(stored) }); } catch {}
        }
      }
    };
    loadSettings();
  }, []);

  const update = (key: keyof SettingsState, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const togglePlatform = (p: Platform) => {
    setSettings((prev) => ({
      ...prev,
      defaultPlatforms: prev.defaultPlatforms.includes(p)
        ? prev.defaultPlatforms.filter((x) => x !== p)
        : [...prev.defaultPlatforms, p],
    }));
  };

  const handleProviderChange = (provider: string) => {
    setSettings((prev) => ({
      ...prev,
      aiProvider: provider,
      providerBaseUrl: knownBaseUrls[provider] ?? "",
    }));
  };

  const handleSave = async () => {
    // Always save to localStorage
    localStorage.setItem("trendforge_settings", JSON.stringify(settings));

    // Also sync to Supabase if logged in
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("user_settings").upsert(
          { user_id: user.id, settings, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      }
    } catch {}

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetAll = () => {
    if (!confirm("Reset all settings to default? This will clear all API keys and preferences.")) return;
    setSettings(defaultSettings);
    localStorage.removeItem("trendforge_settings");
  };

  const textModels = [
    { value: "deepseek/deepseek-chat", label: "DeepSeek V3 (Fast, Recommended)" },
    { value: "google/gemini-2.0-flash-001", label: "Gemini 2.0 Flash" },
    { value: "google/gemini-flash-1.5", label: "Gemini 1.5 Flash" },
    { value: "google/gemini-pro", label: "Gemini Pro" },
    { value: "deepseek/deepseek-r1", label: "DeepSeek R1 (Reasoning)" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4o", label: "GPT-4o (High Quality)" },
    { value: "claude-3-haiku", label: "Claude 3 Haiku" },
    { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
    { value: "meta-llama/llama-3.1-70b-instruct", label: "Llama 3.1 70B" },
    { value: "mistralai/mixtral-8x7b-instruct", label: "Mixtral 8x7B" },
  ];

  const aiProviders = [
    { value: "openrouter", label: "OpenRouter (Recommended)" },
    { value: "openai", label: "OpenAI Direct" },
    { value: "anthropic", label: "Anthropic Claude" },
    { value: "groq", label: "Groq (Ultra Fast)" },
    { value: "together", label: "Together AI" },
    { value: "custom", label: "Custom / Self-Hosted" },
  ];

  const imageModels = [
    { value: "", label: "Default (Built-in)", provider: "default" },
    { value: "dall-e-3", label: "DALL-E 3", provider: "openai" },
    { value: "midjourney", label: "Midjourney", provider: "midjourney" },
    { value: "stable-diffusion-xl", label: "Stable Diffusion XL", provider: "stability" },
    { value: "leonardo", label: "Leonardo AI", provider: "leonardo" },
  ];

  const platformColorMap: Record<string, string> = {
    sky: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    pink: "border-pink-500/30 bg-pink-500/10 text-pink-400",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  };

  const countryOptions = countries.map(c => ({ value: c.code, label: `${c.flag} ${c.name}` }));
  const nicheOptions = niches.map(n => ({ value: n.id, label: `${n.icon} ${n.label}` }));

  const providerKeyPlaceholder = {
    openrouter: "sk-or-v1-...",
    openai: "sk-...",
    anthropic: "sk-ant-...",
    groq: "gsk_...",
    together: "...",
    custom: "your-api-key",
  }[settings.aiProvider] ?? "your-api-key";

  const providerKeyLink = {
    openrouter: "https://openrouter.ai/keys",
    openai: "https://platform.openai.com/api-keys",
    groq: "https://console.groq.com/keys",
    together: "https://api.together.xyz/settings/api-keys",
  }[settings.aiProvider];

  const isKnownProvider = settings.aiProvider !== "custom";
  const baseUrlIsDefault = settings.providerBaseUrl === knownBaseUrls[settings.aiProvider];

  return (
    <AppShell title="Settings" subtitle="Customize your TrendForge experience">
      <div className="max-w-3xl space-y-6">

        {/* ── AI Provider Settings ── */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-violet-400" />
                AI Provider Settings
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="warning">Required for generation</Badge>
              <button
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    openaiKey: "",
                    openaiModel: defaultSettings.openaiModel,
                    aiProvider: defaultSettings.aiProvider,
                    providerBaseUrl: defaultSettings.providerBaseUrl,
                    customModel: "",
                  }));
                }}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-400 transition-colors"
                title="Reset AI provider settings"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {/* Provider Selection */}
              <FormGroup>
                <Label>AI Provider</Label>
                <Select
                  value={settings.aiProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                >
                  {aiProviders.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Choose your preferred AI provider. Each provider requires its own API key.
                </p>
              </FormGroup>

              {/* Base URL — always visible, editable */}
              <FormGroup>
                <div className="flex items-center justify-between mb-1">
                  <Label>
                    Provider Base URL
                    {isKnownProvider && baseUrlIsDefault && (
                      <span className="ml-2 text-[10px] text-green-400 font-normal">(default)</span>
                    )}
                    {!baseUrlIsDefault && (
                      <span className="ml-2 text-[10px] text-yellow-400 font-normal">(customized)</span>
                    )}
                  </Label>
                  {!baseUrlIsDefault && isKnownProvider && (
                    <button
                      type="button"
                      onClick={() => update("providerBaseUrl", knownBaseUrls[settings.aiProvider] ?? "")}
                      className="text-[10px] text-slate-500 hover:text-violet-400 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore default
                    </button>
                  )}
                </div>
                <Input
                  value={settings.providerBaseUrl}
                  onChange={(e) => update("providerBaseUrl", e.target.value)}
                  placeholder={
                    settings.aiProvider === "custom"
                      ? "https://your-provider.com/v1"
                      : knownBaseUrls[settings.aiProvider] ?? "https://..."
                  }
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {settings.aiProvider === "custom"
                    ? "OpenAI-compatible endpoint (Ollama, LM Studio, vLLM, etc.)."
                    : "Pre-filled with the official endpoint. Edit only if you use a proxy or self-hosted mirror."}
                </p>
              </FormGroup>

              {/* API Key */}
              <FormGroup>
                <Label>
                  API Key ({aiProviders.find(p => p.value === settings.aiProvider)?.label ?? "Custom"})
                </Label>
                <div className="relative">
                  <Input
                    type={showOpenAI ? "text" : "password"}
                    value={settings.openaiKey}
                    onChange={(e) => update("openaiKey", e.target.value)}
                    placeholder={providerKeyPlaceholder}
                    className="pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {settings.openaiKey && (
                      <button
                        type="button"
                        onClick={() => update("openaiKey", "")}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Clear key"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowOpenAI(!showOpenAI)}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showOpenAI ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {settings.aiProvider === "openrouter"
                    ? "Access Gemini, GPT, DeepSeek, Claude and 100+ models via one key."
                    : settings.aiProvider === "openai" ? "Direct OpenAI API access."
                    : settings.aiProvider === "anthropic" ? "Anthropic Claude API key."
                    : settings.aiProvider === "groq" ? "Groq API key — ultra fast inference."
                    : settings.aiProvider === "together" ? "Together AI key for open-source models."
                    : "API key for your custom endpoint."}
                  {providerKeyLink && (
                    <>
                      {" "}
                      <a href={providerKeyLink} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                        Get key →
                      </a>
                    </>
                  )}
                </p>
              </FormGroup>

              {/* Text Model */}
              <FormGroup>
                <Label>Text Generation Model</Label>
                {settings.aiProvider === "custom" ? (
                  <>
                    <Input
                      value={settings.customModel}
                      onChange={(e) => update("customModel", e.target.value)}
                      placeholder="e.g. llama-3.1-70b, mistral-7b, gpt-4o..."
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Enter the exact model ID your provider accepts.
                    </p>
                  </>
                ) : (
                  <>
                    <Select
                      value={settings.openaiModel}
                      onChange={(e) => update("openaiModel", e.target.value)}
                    >
                      {textModels.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </Select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Gemini 2.0 Flash is fastest and most cost-effective via OpenRouter.
                    </p>
                  </>
                )}
              </FormGroup>
            </div>
          </CardContent>
        </Card>

        {/* ── Trending & News API ── */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Rss className="w-4 h-4 text-green-400" />
                Trending & News API
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="default">Optional</Badge>
              <button
                onClick={() => update("gnewsKey", "")}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-400 transition-colors"
                title="Clear GNews key"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <FormGroup>
              <Label>GNews API Key</Label>
              <div className="relative">
                <Input
                  type={showGNews ? "text" : "password"}
                  value={settings.gnewsKey}
                  onChange={(e) => update("gnewsKey", e.target.value)}
                  placeholder="Your GNews API key"
                  className="pr-16"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {settings.gnewsKey && (
                    <button
                      type="button"
                      onClick={() => update("gnewsKey", "")}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                      title="Clear key"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowGNews(!showGNews)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showGNews ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Required for live real-time trends. Leave empty to use built-in demo data.{" "}
                <a href="https://gnews.io" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                  Get free key at gnews.io →
                </a>
              </p>
            </FormGroup>
          </CardContent>
        </Card>

        {/* ── Image Generation Settings ── */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-pink-400" />
                Image Generation Settings
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="default">Optional</Badge>
              <button
                onClick={() => {
                  setSettings((prev) => ({
                    ...prev,
                    imageProvider: "",
                    imageModel: "",
                    customApiKey: "",
                    customImageBaseUrl: "",
                  }));
                }}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-400 transition-colors"
                title="Reset image settings"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <FormGroup>
                <Label>Image Provider</Label>
                <Select
                  value={settings.imageProvider}
                  onChange={(e) => {
                    update("imageProvider", e.target.value);
                    update("imageModel", e.target.value ? imageModels.find(m => m.provider === e.target.value)?.value || "" : "");
                  }}
                >
                  <option value="">Default (Built-in Pollinations)</option>
                  <option value="openai">OpenAI DALL-E</option>
                  <option value="stability">Stability AI</option>
                  <option value="midjourney">Midjourney</option>
                  <option value="leonardo">Leonardo AI</option>
                  <option value="custom">Custom / Self-Hosted</option>
                </Select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Leave empty to use free built-in image generation (no key needed).
                </p>
              </FormGroup>

              {settings.imageProvider && (
                <>
                  {/* Image Base URL */}
                  <FormGroup>
                    <Label>Image Provider Base URL</Label>
                    <Input
                      value={settings.customImageBaseUrl}
                      onChange={(e) => update("customImageBaseUrl", e.target.value)}
                      placeholder={
                        settings.imageProvider === "openai" ? "https://api.openai.com/v1"
                        : settings.imageProvider === "stability" ? "https://api.stability.ai"
                        : settings.imageProvider === "custom" ? "https://your-image-api.com/v1"
                        : "https://api.example.com/v1"
                      }
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      OpenAI-compatible image endpoint. Required for custom providers.
                    </p>
                  </FormGroup>

                  <FormGroup>
                    <Label>Image Model</Label>
                    <Select
                      value={settings.imageModel}
                      onChange={(e) => update("imageModel", e.target.value)}
                    >
                      {imageModels
                        .filter((m) => !m.provider || m.provider === settings.imageProvider || m.provider === "default")
                        .map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      {settings.imageProvider === "openai" ? "OpenAI API Key"
                        : settings.imageProvider === "stability" ? "Stability API Key"
                        : settings.imageProvider === "midjourney" ? "Midjourney API Key"
                        : settings.imageProvider === "custom" ? "Custom Image API Key"
                        : "Leonardo API Key"}
                    </Label>
                    <div className="relative">
                      <Input
                        type={showCustomKey ? "text" : "password"}
                        value={settings.customApiKey}
                        onChange={(e) => update("customApiKey", e.target.value)}
                        placeholder={`Your ${settings.imageProvider} API key`}
                        className="pr-16"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {settings.customApiKey && (
                          <button
                            type="button"
                            onClick={() => update("customApiKey", "")}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                            title="Clear key"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowCustomKey(!showCustomKey)}
                          className="text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showCustomKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Used only for image generation requests.
                    </p>
                  </FormGroup>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Content Defaults ── */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                Default Content Settings
              </div>
            </CardTitle>
            <button
              onClick={() => {
                setSettings((prev) => ({
                  ...prev,
                  defaultCountry: defaultSettings.defaultCountry,
                  defaultNiche: defaultSettings.defaultNiche,
                  defaultTone: defaultSettings.defaultTone,
                  defaultPlatforms: defaultSettings.defaultPlatforms,
                  defaultLanguage: defaultSettings.defaultLanguage,
                }));
              }}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-400 transition-colors"
              title="Reset content defaults"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <FormGroup>
                <Label>Default Countries (Multiple)</Label>
                <MultiSelect
                  options={countryOptions}
                  value={settings.defaultCountry}
                  onChange={(value) => update("defaultCountry", value)}
                  placeholder="Select countries..."
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Content will be generated with relevance to all selected countries.
                </p>
              </FormGroup>

              <FormGroup>
                <Label>Default Niches (Multiple)</Label>
                <MultiSelect
                  options={nicheOptions}
                  value={settings.defaultNiche}
                  onChange={(value) => update("defaultNiche", value)}
                  placeholder="Select niches..."
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Select multiple niches for broader content coverage.
                </p>
              </FormGroup>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormGroup>
                  <Label>Default Tone</Label>
                  <Select value={settings.defaultTone} onChange={(e) => update("defaultTone", e.target.value as Tone)}>
                    {tones.map((t) => (
                      <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                    ))}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Default Language</Label>
                  <Select value={settings.defaultLanguage} onChange={(e) => update("defaultLanguage", e.target.value)}>
                    {languages.map((l) => (
                      <option key={l.id} value={l.id}>{l.label}</option>
                    ))}
                  </Select>
                </FormGroup>
              </div>

              <div>
                <Label>Default Platforms</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
                  {platforms.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        settings.defaultPlatforms.includes(p.id)
                          ? platformColorMap[p.color] || "border-violet-500/30 bg-violet-500/10 text-violet-400"
                          : "border-surface-400 bg-surface-700 text-slate-500"
                      }`}
                    >
                      <span>{p.icon}</span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── App Preferences ── */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                App Preferences
              </div>
            </CardTitle>
            <button
              onClick={() => {
                setSettings((prev) => ({
                  ...prev,
                  autoFetchTrends: defaultSettings.autoFetchTrends,
                  emailAlerts: defaultSettings.emailAlerts,
                  darkMode: defaultSettings.darkMode,
                  compactMode: defaultSettings.compactMode,
                }));
              }}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-400 transition-colors"
              title="Reset preferences"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Switch
                checked={settings.autoFetchTrends}
                onCheckedChange={(val) => update("autoFetchTrends", val)}
                label="Auto-Fetch Trends"
                description="Automatically refresh trending topics every 15 minutes"
              />
              <Switch
                checked={settings.emailAlerts}
                onCheckedChange={(val) => update("emailAlerts", val)}
                label="Email Alerts"
                description="Receive email notifications when your keywords go viral"
              />
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(val) => update("darkMode", val)}
                label="Dark Mode"
                description="Use dark theme (recommended for night usage)"
              />
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(val) => update("compactMode", val)}
                label="Compact Mode"
                description="Reduce spacing for more content on screen"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Save / Reset All ── */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} size="lg">
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Settings Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={handleResetAll}
            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-surface-400"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All Settings
          </Button>
          {saved && (
            <p className="text-sm text-green-400">All changes saved successfully.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
