"use client";
import { useState } from "react";
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
  Settings,
  Key,
  Globe,
  Palette,
  Bell,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  Image,
  Bot,
  Sparkles,
} from "lucide-react";

interface SettingsState {
  openaiKey: string;
  gnewsKey: string;
  customApiKey: string;
  openaiModel: string;
  aiProvider: string;
  imageProvider: string;
  imageModel: string;
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

const defaultSettings: SettingsState = {
  openaiKey: "",
  gnewsKey: "",
  customApiKey: "",
  openaiModel: "google/gemini-2.0-flash-001",
  aiProvider: "openrouter",
  imageProvider: "",
  imageModel: "",
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
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const stored = localStorage.getItem("trendforge_settings");
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showGNews, setShowGNews] = useState(false);
  const [showCustomKey, setShowCustomKey] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const handleSave = async () => {
    localStorage.setItem("trendforge_settings", JSON.stringify(settings));
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const textModels = [
    { value: "google/gemini-2.0-flash-001", label: "Gemini 2.0 Flash (Fast, Cheap)", provider: "openrouter" },
    { value: "google/gemini-flash-1.5", label: "Gemini 1.5 Flash", provider: "openrouter" },
    { value: "google/gemini-pro", label: "Gemini Pro", provider: "openrouter" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },
    { value: "gpt-4o", label: "GPT-4o (High Quality)", provider: "openai" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo", provider: "openai" },
    { value: "claude-3-haiku", label: "Claude 3 Haiku", provider: "anthropic" },
    { value: "claude-3-sonnet", label: "Claude 3 Sonnet", provider: "anthropic" },
  ];

  const imageModels = [
    { value: "", label: "Default (Built-in)", provider: "default" },
    { value: "dall-e-3", label: "DALL-E 3", provider: "openai" },
    { value: "midjourney", label: "Midjourney", provider: "midjourney" },
    { value: "stable-diffusion-xl", label: "Stable Diffusion XL", provider: "stability" },
    { value: "leonardo", label: "Leonardo AI", provider: "leonardo" },
  ];

  const aiProviders = [
    { value: "openrouter", label: "OpenRouter (Recommended)" },
    { value: "openai", label: "OpenAI Direct" },
    { value: "anthropic", label: "Anthropic Claude" },
    { value: "custom", label: "Custom API" },
  ];

  const platformColorMap: Record<string, string> = {
    sky: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    pink: "border-pink-500/30 bg-pink-500/10 text-pink-400",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  };

  const countryOptions = countries.map(c => ({ value: c.code, label: `${c.flag} ${c.name}` }));
  const nicheOptions = niches.map(n => ({ value: n.id, label: `${n.icon} ${n.label}` }));

  return (
    <AppShell title="Settings" subtitle="Customize your TrendForge experience">
      <div className="max-w-3xl space-y-6">
        {/* AI Provider Settings */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-violet-400" />
                AI Provider Settings
              </div>
            </CardTitle>
            <Badge variant="warning">Customize your AI models</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {/* AI Provider Selection */}
              <FormGroup>
                <Label>AI Provider</Label>
                <Select
                  value={settings.aiProvider}
                  onChange={(e) => update("aiProvider", e.target.value)}
                >
                  {aiProviders.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Choose your preferred AI provider. Each provider requires its own API key.
                </p>
              </FormGroup>

              {/* Text Model Selection */}
              <FormGroup>
                <Label>Text Generation Model</Label>
                <Select
                  value={settings.openaiModel}
                  onChange={(e) => update("openaiModel", e.target.value)}
                >
                  {textModels.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Select the model for content generation. Gemini 2.0 Flash is fastest and cost-effective via OpenRouter.
                </p>
              </FormGroup>

              {/* API Key Input */}
              <FormGroup>
                <Label>API Key ({settings.aiProvider === "openrouter" ? "OpenRouter" : settings.aiProvider === "openai" ? "OpenAI" : settings.aiProvider === "anthropic" ? "Anthropic" : "Custom"})</Label>
                <div className="relative">
                  <Input
                    type={showOpenAI ? "text" : "password"}
                    value={settings.openaiKey}
                    onChange={(e) => update("openaiKey", e.target.value)}
                    placeholder={settings.aiProvider === "openrouter" ? "sk-or-v1-..." : "sk-..."}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenAI(!showOpenAI)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showOpenAI ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {settings.aiProvider === "openrouter"
                    ? "Enter your OpenRouter API key for access to Gemini, GPT, and Claude models."
                    : settings.aiProvider === "openai"
                    ? "Enter your OpenAI API key for direct GPT access."
                    : settings.aiProvider === "anthropic"
                    ? "Enter your Anthropic API key for Claude models."
                    : "Enter your custom API endpoint key."}
                  {" "}
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                    Get key →
                  </a>
                </p>
              </FormGroup>

              {/* GNews API Key */}
              <FormGroup>
                <Label>GNews API Key (for Trending)</Label>
                <div className="relative">
                  <Input
                    type={showGNews ? "text" : "password"}
                    value={settings.gnewsKey}
                    onChange={(e) => update("gnewsKey", e.target.value)}
                    placeholder="Your GNews API key"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGNews(!showGNews)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showGNews ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Required for live trend fetching. Leave empty to use demo data.{" "}
                  <a href="https://gnews.io" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                    Get key at gnews.io →
                  </a>
                </p>
              </FormGroup>
            </div>
          </CardContent>
        </Card>

        {/* Image Generation Settings */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4 text-pink-400" />
                Image Generation Settings
              </div>
            </CardTitle>
            <Badge variant="default">Optional</Badge>
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
                  <option value="">Default (Built-in)</option>
                  <option value="openai">OpenAI DALL-E</option>
                  <option value="stability">Stability AI</option>
                  <option value="midjourney">Midjourney</option>
                  <option value="leonardo">Leonardo AI</option>
                </Select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Select your preferred image generation provider. Leave empty to use default built-in generator.
                </p>
              </FormGroup>

              {settings.imageProvider && (
                <>
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
                    <Label>{settings.imageProvider === "openai" ? "OpenAI API Key" : settings.imageProvider === "stability" ? "Stability API Key" : settings.imageProvider === "midjourney" ? "Midjourney API Key" : "Leonardo API Key"}</Label>
                    <div className="relative">
                      <Input
                        type={showCustomKey ? "text" : "password"}
                        value={settings.customApiKey}
                        onChange={(e) => update("customApiKey", e.target.value)}
                        placeholder={`Your ${settings.imageProvider} API key`}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCustomKey(!showCustomKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showCustomKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      This key will be used for image generation requests only.
                    </p>
                  </FormGroup>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Defaults */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                Default Content Settings
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {/* Multi-select Country */}
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

              {/* Multi-select Niche */}
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

              {/* Default platforms */}
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

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                App Preferences
              </div>
            </CardTitle>
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

        {/* Save button */}
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
          {saved && (
            <p className="text-sm text-green-400">All changes saved successfully.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
