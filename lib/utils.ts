import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Platform, Tone, PlatformOutput } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function getPlatformColor(platform: Platform): string {
  const colors: Record<Platform, string> = {
    telegram: "text-sky-400",
    instagram: "text-pink-400",
    facebook: "text-blue-400",
    twitter: "text-cyan-400",
    linkedin: "text-blue-500",
  };
  return colors[platform] ?? "text-gray-400";
}

export function getPlatformBg(platform: Platform): string {
  const colors: Record<Platform, string> = {
    telegram: "bg-sky-500/10 border-sky-500/20 text-sky-400",
    instagram: "bg-pink-500/10 border-pink-500/20 text-pink-400",
    facebook: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    twitter: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    linkedin: "bg-blue-600/10 border-blue-600/20 text-blue-500",
  };
  return colors[platform] ?? "bg-gray-500/10 border-gray-500/20 text-gray-400";
}

export function getPlatformMaxChars(platform: Platform): number {
  const limits: Record<Platform, number> = {
    twitter: 280,
    telegram: 4096,
    instagram: 2200,
    facebook: 63206,
    linkedin: 3000,
  };
  return limits[platform] ?? 2000;
}

export function buildPrompt(params: {
  topic: string;
  platform: Platform;
  tone: Tone;
  niche: string;
  country: string;
  ctaStyle: string;
  language: string;
  trendKeyword?: string;
}): string {
  const { topic, platform, tone, niche, country, ctaStyle, trendKeyword } =
    params;
  const maxChars = getPlatformMaxChars(platform);

  return `You are a professional social media content creator specializing in ${niche} content for ${country} audiences.

Create a ${tone} ${platform} post about: "${topic}"
${trendKeyword ? `Incorporate the trending topic: "${trendKeyword}"` : ""}

Requirements:
- Platform: ${platform} (max ${maxChars} characters)
- Tone: ${tone}
- Niche: ${niche}
- Target Audience: ${country}
- CTA Style: ${ctaStyle}
- Include 3-5 relevant hashtags
- Make it platform-native (${platform}-optimized formatting)
- End with a strong call-to-action

Return JSON with: { content, hashtags, cta, charCount }`;
}

export function buildImagePrompt(params: {
  topic: string;
  platform: Platform;
  imageType: string;
  ratio: string;
  visualStyle: string;
  targetAudience: string;
  campaignGoal: string;
}): string {
  const { topic, platform, imageType, visualStyle, targetAudience, campaignGoal, ratio } = params;
  return `Professional ${visualStyle} ${imageType} for ${platform}, ${ratio} ratio.
Subject: ${topic}.
Target audience: ${targetAudience}.
Goal: ${campaignGoal}.
High quality, photorealistic, marketing-ready, vibrant colors, clean composition, professional lighting, brand-safe, social media optimized.`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function getViralityColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

export function getViralityLabel(score: number): string {
  if (score >= 80) return "Viral";
  if (score >= 60) return "Hot";
  if (score >= 40) return "Rising";
  return "Emerging";
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function getBestPostingTimes(platform: Platform): string[] {
  const times: Record<Platform, string[]> = {
    instagram: ["9:00 AM", "12:00 PM", "7:00 PM"],
    twitter: ["8:00 AM", "12:00 PM", "5:00 PM", "9:00 PM"],
    facebook: ["10:00 AM", "1:00 PM", "3:00 PM"],
    telegram: ["10:00 AM", "2:00 PM", "8:00 PM"],
    linkedin: ["8:00 AM", "12:00 PM", "5:00 PM"],
  };
  return times[platform] ?? ["12:00 PM"];
}
