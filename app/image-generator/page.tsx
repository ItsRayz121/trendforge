"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Label, FormGroup, Textarea } from "@/components/ui/input";
import { platforms, imageRatios } from "@/data/platforms";
import type { Platform, ImageGenerateRequest, ImageGenerateResponse } from "@/lib/types";
import toast from "react-hot-toast";
import {
  ImageIcon,
  Wand2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Info,
  Download,
  Bookmark,
  BookmarkCheck,
  Clock,
} from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const visualStyles = [
  { id: "photorealistic", label: "Photorealistic", icon: "📷" },
  { id: "illustration", label: "Illustration", icon: "🎨" },
  { id: "minimalist", label: "Minimalist", icon: "⬜" },
  { id: "3d-render", label: "3D Render", icon: "💎" },
  { id: "cinematic", label: "Cinematic", icon: "🎬" },
];

const imageTypes: Record<string, string[]> = {
  instagram: ["Post", "Story", "Reel Thumbnail", "Carousel Slide", "Ad Banner"],
  twitter: ["Twitter Card", "Profile Banner", "Quote Graphic", "Infographic"],
  facebook: ["Feed Post", "Story", "Cover Photo", "Ad Creative", "Event Banner"],
  telegram: ["Channel Post", "Banner", "Announcement Card", "Poll Graphic"],
};

const campaignGoals = [
  "Brand Awareness",
  "Lead Generation",
  "Product Promotion",
  "Community Engagement",
  "Educational Content",
  "Event Promotion",
  "Sale/Offer",
  "Motivational Content",
];

interface ImageHistoryItem {
  imageUrl: string;
  topic: string;
  createdAt: string;
}

export default function ImageGeneratorPage() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [imageType, setImageType] = useState("Post");
  const [ratio, setRatio] = useState("square");
  const [topic, setTopic] = useState("");
  const [visualStyle, setVisualStyle] = useState("photorealistic");
  const [targetAudience, setTargetAudience] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("Brand Awareness");
  const [brandColors, setBrandColors] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageGenerateResponse | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedToContent, setSavedToContent] = useState(false);
  const [savingToContent, setSavingToContent] = useState(false);
  const [saveContentError, setSaveContentError] = useState<string | null>(null);
  const [imageHistory, setImageHistory] = useState<ImageHistoryItem[]>([]);

  useEffect(() => {
    fetch("/api/image-generate")
      .then((r) => r.ok ? r.json() : { images: [] })
      .then((data) => { if (data?.images) setImageHistory(data.images); })
      .catch(() => {});
  }, []);

  const currentRatios = imageRatios[platform] || [];
  const currentImageTypes = imageTypes[platform] || [];

  const handlePlatformChange = (p: Platform) => {
    setPlatform(p);
    setImageType(imageTypes[p][0]);
    setRatio(imageRatios[p][0].id);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setGeneratedImageUrl(null);
    setSaved(false);
    setSavedToContent(false);
    const toastId = toast.loading("Generating AI prompt...");
    try {
      const req: ImageGenerateRequest = {
        platform,
        imageType,
        ratio,
        topic,
        visualStyle,
        targetAudience,
        campaignGoal,
        brandColors,
      };

      // Step 1: Generate the AI prompt
      const promptRes = await fetch("/api/generate-image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      if (!promptRes.ok) throw new Error("Prompt generation failed");
      const promptData: ImageGenerateResponse = await promptRes.json();
      setResult(promptData);
      toast.loading("Rendering image...", { id: toastId });

      // Step 2: Generate the real image via Pollinations
      setImageLoading(true);
      const imgRes = await fetch("/api/image-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptData.prompt, ratio, style: visualStyle, topic }),
      });
      if (imgRes.ok) {
        const { imageUrl } = await imgRes.json();
        setGeneratedImageUrl(imageUrl);
        setImageHistory((prev) => [{ imageUrl, topic, createdAt: new Date().toISOString() }, ...prev].slice(0, 5));
        toast.success("Image generated!", { id: toastId });
      } else {
        toast.error("Image render failed", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Generation failed", { id: toastId });
    } finally {
      setLoading(false);
      setImageLoading(false);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    await copyToClipboard(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveToSavedContent = async () => {
    if (!result) return;
    setSavingToContent(true);
    setSaveContentError(null);
    try {
      const res = await fetch("/api/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic || "Image Prompt",
          platform,
          content: generatedImageUrl
            ? `🖼️ AI Generated Image\n\nPrompt: ${result.prompt}\n\nImage: ${generatedImageUrl}`
            : `🖼️ AI Image Prompt\n\n${result.prompt}`,
          hashtags: [],
          cta: result.styleDirection || "",
          char_count: result.prompt.length,
          generated_at: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setSavedToContent(true);
        toast.success("Saved to Content!");
      } else {
        const err = await res.json().catch(() => ({}));
        const msg = err.error || "Save failed";
        setSaveContentError(msg);
        toast.error(msg);
        setTimeout(() => setSaveContentError(null), 4000);
      }
    } catch {
      setSaveContentError("Network error — try again");
      toast.error("Network error — try again");
      setTimeout(() => setSaveContentError(null), 4000);
    } finally {
      setSavingToContent(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!generatedImageUrl || !result) return;
    try {
      const res = await fetch("/api/image-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: result.prompt,
          ratio,
          style: visualStyle,
          topic,
          saveOnly: true,
          imageUrl: generatedImageUrl,
        }),
      });
      if (res.ok) {
        setSaved(true);
        toast.success("Image saved to library!");
      } else {
        toast.error("Save failed");
      }
    } catch {
      toast.error("Save failed — try again");
    }
  };

  return (
    <AppShell title="Image Generator" subtitle="Professional AI image prompts + real generated images">
      <div className="grid lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr] gap-6">
        {/* Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-pink-400" />
                  Image Setup
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                {/* Platform */}
                <div>
                  <Label required>Platform</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {platforms.map((p) => {
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
                          onClick={() => handlePlatformChange(p.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                            platform === p.id
                              ? colorMap[p.color]
                              : "border-surface-400 bg-surface-700 text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          <span>{p.icon}</span>
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Image type + Ratio */}
                <div className="grid grid-cols-2 gap-3">
                  <FormGroup>
                    <Label required>Image Type</Label>
                    <Select value={imageType} onChange={(e) => setImageType(e.target.value)}>
                      {currentImageTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label required>Aspect Ratio</Label>
                    <Select value={ratio} onChange={(e) => setRatio(e.target.value)}>
                      {currentRatios.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.icon} {r.label} ({r.dimensions})
                        </option>
                      ))}
                    </Select>
                  </FormGroup>
                </div>

                {/* Show selected ratio info */}
                {currentRatios.find((r) => r.id === ratio) && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-700 border border-surface-500">
                    <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <p className="text-[11px] text-slate-400">
                      Dimensions:{" "}
                      <strong className="text-slate-300">
                        {currentRatios.find((r) => r.id === ratio)?.dimensions}
                      </strong>{" "}
                      for {imageType}
                    </p>
                  </div>
                )}

                {/* Topic */}
                <FormGroup>
                  <Label required>Image Topic / Subject</Label>
                  <Textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. A motivated entrepreneur working on their laptop in a modern cafe at sunset"
                    className="min-h-[70px]"
                    required
                  />
                </FormGroup>

                {/* Visual Style */}
                <div>
                  <Label required>Visual Style</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {visualStyles.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setVisualStyle(s.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                          visualStyle === s.id
                            ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
                            : "border-surface-400 bg-surface-700 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        <span>{s.icon}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Audience + Campaign */}
                <div className="grid grid-cols-2 gap-3">
                  <FormGroup>
                    <Label>Target Audience</Label>
                    <Input
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. Young professionals"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Campaign Goal</Label>
                    <Select value={campaignGoal} onChange={(e) => setCampaignGoal(e.target.value)}>
                      {campaignGoals.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </Select>
                  </FormGroup>
                </div>

                {/* Brand colors */}
                <FormGroup>
                  <Label>Brand Colors (optional)</Label>
                  <Input
                    value={brandColors}
                    onChange={(e) => setBrandColors(e.target.value)}
                    placeholder="e.g. Deep purple #6d28d9, white, gold"
                  />
                </FormGroup>

                <Button type="submit" loading={loading} disabled={!topic.trim()} className="w-full" size="lg">
                  {loading ? "Generating..." : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate Image
                      <Sparkles className="w-3.5 h-3.5 opacity-60" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Image History */}
          {imageHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Recent Images
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {imageHistory.slice(0, 3).map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setGeneratedImageUrl(item.imageUrl)}
                      className="relative group rounded-lg overflow-hidden border border-surface-600 hover:border-violet-500/40 transition-all"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.topic}
                        className="w-full h-20 object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] text-white">View</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ImageIcon className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-400">Your generated image will appear here</p>
              <p className="text-xs text-slate-600 mt-1">Fill in the details and click Generate</p>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-surface-500 bg-surface-800 p-5">
                  <div className="shimmer h-4 w-1/3 rounded mb-3" />
                  <div className="shimmer h-3 w-full rounded mb-2" />
                  <div className="shimmer h-3 w-4/5 rounded" />
                </div>
              ))}
            </div>
          )}

          {result && !loading && (
            <>
              {/* Generated Image */}
              <Card glow>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-pink-400" />
                      Generated Image
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {generatedImageUrl && !imageLoading && (
                      <>
                        <a href={generatedImageUrl} download={`trendforge-${Date.now()}.jpg`} target="_blank" rel="noopener noreferrer">
                          <Button variant="secondary" size="sm">
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </Button>
                        </a>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleSaveToLibrary}
                          disabled={saved}
                        >
                          {saved ? (
                            <><BookmarkCheck className="w-3.5 h-3.5 text-green-400" /> Saved</>
                          ) : (
                            <><Bookmark className="w-3.5 h-3.5" /> Save Image</>
                          )}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleSaveToSavedContent}
                          disabled={savedToContent || savingToContent}
                          loading={savingToContent}
                        >
                          {savedToContent ? (
                            <><BookmarkCheck className="w-3.5 h-3.5 text-green-400" /> Saved!</>
                          ) : (
                            <><Bookmark className="w-3.5 h-3.5" /> Save to Content</>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {imageLoading && (
                    <div className="rounded-xl bg-surface-700 border border-surface-500 aspect-square flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Generating image with AI...</p>
                        <p className="text-[10px] text-slate-600 mt-1">This may take 10-30 seconds</p>
                      </div>
                    </div>
                  )}
                  {generatedImageUrl && !imageLoading && (
                    <div className="rounded-xl overflow-hidden border border-surface-500">
                      <img
                        src={generatedImageUrl}
                        alt={topic}
                        className="w-full object-cover"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Prompt card */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      AI Image Prompt
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopy(result.prompt, "prompt")}
                    >
                      {copied === "prompt" ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied === "prompt" ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSaveToSavedContent}
                      disabled={savedToContent || savingToContent}
                      loading={savingToContent}
                    >
                      {savedToContent ? (
                        <><BookmarkCheck className="w-3.5 h-3.5 text-green-400" /> Saved!</>
                      ) : (
                        <><Bookmark className="w-3.5 h-3.5" /> Save to Content</>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-surface-700 border border-surface-500 rounded-xl p-4">
                    <p className="text-sm text-slate-200 leading-relaxed font-mono">{result.prompt}</p>
                  </div>
                  {saveContentError && (
                    <p className="mt-2 text-xs text-red-400 px-1">{saveContentError}</p>
                  )}
                </CardContent>
              </Card>

              {/* Negative prompt */}
              <Card>
                <CardHeader>
                  <CardTitle>Negative Prompt</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(result.negativePrompt, "neg")}>
                    {copied === "neg" ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed">{result.negativePrompt}</p>
                </CardContent>
              </Card>

              {/* Style + Composition grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Style Direction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-300 leading-relaxed">{result.styleDirection}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Composition Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-300 leading-relaxed">{result.compositionGuide}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Platform note */}
              <Card className="border-sky-500/20 bg-sky-500/5">
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-sky-400" />
                      Platform Note
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-300 leading-relaxed">{result.platformNote}</p>
                </CardContent>
              </Card>

              {/* Use prompt in other tools */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-orange-400" />
                      Use Prompt in Other Tools
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Midjourney", url: "https://midjourney.com" },
                      { label: "DALL·E 3", url: "https://openai.com/dall-e-3" },
                      { label: "Stable Diffusion", url: "https://stability.ai" },
                      { label: "Adobe Firefly", url: "https://firefly.adobe.com" },
                      { label: "Leonardo AI", url: "https://leonardo.ai" },
                    ].map((tool) => (
                      <a
                        key={tool.label}
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-surface-700 border border-surface-500 text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all"
                      >
                        {tool.label} ↗
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
