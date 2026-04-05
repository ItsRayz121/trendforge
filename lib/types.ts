export type Platform = "telegram" | "instagram" | "facebook" | "twitter" | "linkedin";

export type Tone =
  | "professional"
  | "casual"
  | "humorous"
  | "inspirational"
  | "educational"
  | "promotional";

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface Niche {
  id: string;
  label: string;
  icon: string;
}

export interface PlatformConfig {
  id: Platform;
  label: string;
  icon: string;
  maxChars: number;
  imageRatios: ImageRatio[];
  color: string;
}

export interface ImageRatio {
  id: string;
  label: string;
  dimensions: string;
  icon: string;
}

export interface GenerateRequest {
  topic: string;
  country: string;
  niche: string;
  platforms: Platform[];
  tone: Tone;
  ctaStyle: string;
  language: string;
  includeTrend?: boolean;
  trendKeyword?: string;
  customPrompt?: string;
}

export interface PlatformOutput {
  platform: Platform;
  content: string;
  hashtags: string[];
  cta: string;
  charCount: number;
}

export interface GenerateResponse {
  outputs: PlatformOutput[];
  generatedAt: string;
  topic: string;
}

export interface Trend {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  category: string;
  country: string;
  virality: number;
  contentAngles: string[];
  platforms: Platform[];
  imageUrl?: string;
}

export interface TrendAnalysis {
  trend: Trend;
  whyTrending: string;
  viralityScore: number;
  audienceRelevance: string;
  contentAngles: string[];
  bestPlatforms: Platform[];
  postingWindow: string;
  sampleHook: string;
}

export interface ScheduledPost {
  id: string;
  content: string;
  platform: Platform;
  scheduledAt: string;
  status: "draft" | "scheduled" | "published" | "failed";
  topic: string;
}

export interface ImageGenerateRequest {
  platform: Platform;
  imageType: string;
  ratio: string;
  topic: string;
  visualStyle: string;
  targetAudience: string;
  campaignGoal: string;
  brandColors?: string;
}

export interface ImageGenerateResponse {
  prompt: string;
  styleDirection: string;
  compositionGuide: string;
  platformNote: string;
  referenceLinks: { label: string; url: string }[];
  negativePrompt: string;
}

export interface UserSettings {
  defaultCountry: string;
  defaultNiche: string;
  defaultTone: Tone;
  defaultPlatforms: Platform[];
  defaultLanguage: string;
  defaultCtaStyle: string;
  openaiApiKey: string;
  gnewsApiKey: string;
  autoFetchTrends: boolean;
  darkMode: boolean;
}
