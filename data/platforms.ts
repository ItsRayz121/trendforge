import type { PlatformConfig, ImageRatio } from "@/lib/types";

export const imageRatios: Record<string, ImageRatio[]> = {
  instagram: [
    { id: "square", label: "Square Post", dimensions: "1080×1080", icon: "⬜" },
    { id: "portrait", label: "Portrait Post", dimensions: "1080×1350", icon: "📱" },
    { id: "story", label: "Story / Reel", dimensions: "1080×1920", icon: "📖" },
    { id: "landscape", label: "Landscape", dimensions: "1080×566", icon: "🖼️" },
  ],
  twitter: [
    { id: "landscape", label: "Twitter Card", dimensions: "1200×675", icon: "🖼️" },
    { id: "square", label: "Square", dimensions: "1200×1200", icon: "⬜" },
    { id: "banner", label: "Profile Banner", dimensions: "1500×500", icon: "🏳️" },
  ],
  facebook: [
    { id: "landscape", label: "Feed Post", dimensions: "1200×630", icon: "🖼️" },
    { id: "square", label: "Square Post", dimensions: "1080×1080", icon: "⬜" },
    { id: "story", label: "Story", dimensions: "1080×1920", icon: "📖" },
    { id: "cover", label: "Cover Photo", dimensions: "820×312", icon: "🏳️" },
    { id: "event", label: "Event Banner", dimensions: "1920×1005", icon: "📅" },
  ],
  telegram: [
    { id: "landscape", label: "Landscape", dimensions: "1280×720", icon: "🖼️" },
    { id: "square", label: "Square", dimensions: "1080×1080", icon: "⬜" },
    { id: "portrait", label: "Portrait", dimensions: "720×1280", icon: "📱" },
    { id: "banner", label: "Channel Banner", dimensions: "1280×360", icon: "🏳️" },
  ],
  linkedin: [
    { id: "landscape", label: "Feed Post", dimensions: "1200×627", icon: "🖼️" },
    { id: "square", label: "Square", dimensions: "1080×1080", icon: "⬜" },
    { id: "portrait", label: "Vertical", dimensions: "627×1200", icon: "📱" },
    { id: "banner", label: "Profile Banner", dimensions: "1584×396", icon: "🏳️" },
    { id: "article", label: "Article Cover", dimensions: "1200×644", icon: "📄" },
  ],
};

export const platforms: PlatformConfig[] = [
  {
    id: "telegram",
    label: "Telegram",
    icon: "✈️",
    maxChars: 4096,
    imageRatios: imageRatios.telegram,
    color: "sky",
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: "📸",
    maxChars: 2200,
    imageRatios: imageRatios.instagram,
    color: "pink",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: "👥",
    maxChars: 63206,
    imageRatios: imageRatios.facebook,
    color: "blue",
  },
  {
    id: "twitter",
    label: "Twitter / X",
    icon: "🐦",
    maxChars: 280,
    imageRatios: imageRatios.twitter,
    color: "cyan",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: "💼",
    maxChars: 3000,
    imageRatios: imageRatios.linkedin,
    color: "blue",
  },
];

export function getPlatformConfig(id: string): PlatformConfig | undefined {
  return platforms.find((p) => p.id === id);
}
