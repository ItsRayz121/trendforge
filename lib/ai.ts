import type {
  GenerateRequest,
  GenerateResponse,
  PlatformOutput,
  Platform,
  ImageGenerateRequest,
  ImageGenerateResponse,
} from "./types";
import { getPlatformMaxChars, buildImagePrompt } from "./utils";

// Mock AI content generation - replace with real OpenAI calls when API key is set
export async function generateContent(
  req: GenerateRequest
): Promise<GenerateResponse> {
  // Simulate API delay
  await new Promise((r) => setTimeout(r, 1500));

  const outputs: PlatformOutput[] = req.platforms.map((platform) =>
    generateMockOutput(platform, req)
  );

  return {
    outputs,
    generatedAt: new Date().toISOString(),
    topic: req.topic,
  };
}

function generateMockOutput(
  platform: Platform,
  req: GenerateRequest
): PlatformOutput {
  const { topic, tone, niche, country, ctaStyle } = req;
  const maxChars = getPlatformMaxChars(platform);

  const hooks: Record<string, string> = {
    professional: `Here's what every ${niche} professional needs to know about ${topic}:`,
    casual: `Okay, let's talk about ${topic} — because this is actually huge 👀`,
    humorous: `Nobody is talking about ${topic} the right way... until now 😅`,
    inspirational: `${topic} changed everything. Here's the mindset shift you need ⚡`,
    educational: `${topic}: A complete breakdown you can actually understand 📖`,
    promotional: `🚨 STOP scrolling — ${topic} is the opportunity you've been waiting for!`,
  };

  const bodies: Record<Platform, string> = {
    instagram: `${hooks[tone] || hooks.professional}

${getBodyContent(topic, niche, country, tone)}

${getCTA(ctaStyle, platform)}`,

    twitter: `${hooks[tone] || hooks.professional}

${getTwitterBody(topic, niche, tone)}`,

    facebook: `${hooks[tone] || hooks.professional}

${getBodyContent(topic, niche, country, tone)}

${getLongFormExtra(topic, niche)}

${getCTA(ctaStyle, platform)}`,

    telegram: `📌 *${topic}*

${getBodyContent(topic, niche, country, tone)}

${getLongFormExtra(topic, niche)}

${getCTA(ctaStyle, platform)}`,

    linkedin: `${hooks[tone] || hooks.professional}

${getBodyContent(topic, niche, country, tone)}

${getLongFormExtra(topic, niche)}

💼 Professional Insight: This trend in ${niche} represents a significant opportunity for industry leaders and decision-makers in ${country}.

${getCTA(ctaStyle, platform)}`,
  };

  const content = bodies[platform];
  const hashtags = generateHashtags(topic, niche, platform);
  const cta = getCTA(ctaStyle, platform);

  return {
    platform,
    content: content.slice(0, maxChars),
    hashtags,
    cta,
    charCount: content.length,
  };
}

function getBodyContent(
  topic: string,
  niche: string,
  country: string,
  tone: string
): string {
  const points = [
    `✅ This is reshaping the entire ${niche} landscape in ${country}`,
    `✅ Early adopters are seeing incredible results with ${topic}`,
    `✅ Here's the strategy that top ${niche} creators are using`,
    `✅ You can start implementing this today — no budget required`,
  ];

  if (tone === "educational") {
    return `What you need to understand:\n\n${points.join("\n")}\n\nThe key insight? Most people are approaching ${topic} completely wrong.`;
  }

  if (tone === "professional") {
    return `Key findings from ${country}'s leading ${niche} experts:\n\n${points.join("\n")}\n\nThe data is clear: ${topic} is not optional anymore.`;
  }

  return `Here's what's happening with ${topic}:\n\n${points.join("\n")}\n\nThe ${niche} industry in ${country} will never be the same.`;
}

function getTwitterBody(topic: string, niche: string, tone: string): string {
  const threads = [
    `🧵 Thread on ${topic}:`,
    ``,
    `1/ The ${niche} world is changing fast`,
    ``,
    `2/ Here's what you're missing about ${topic}`,
    ``,
    `3/ The 3 strategies top creators use`,
    ``,
    `4/ How to position yourself now`,
  ];
  return threads.join("\n");
}

function getLongFormExtra(topic: string, niche: string): string {
  return `💡 Pro tip: The best ${niche} creators who've mastered ${topic} share one common trait — they act fast and iterate.

📊 Industry data shows that early movers in ${niche} see 5-10x better results than late adopters.`;
}

function getCTA(ctaStyle: string, platform: Platform): string {
  const ctas: Record<string, string> = {
    question: "What's your take on this? Drop it in the comments 👇",
    cta_link: "Full breakdown in the link in my bio →",
    comment: "Comment below — I read every single one 💬",
    share: "Share this with someone who needs to see it! 🔄",
    save: "Save this post — you'll want to refer back to it 📌",
    follow: "Follow for daily insights like this ✅",
    dm: "DM me 'INFO' and I'll send you the full guide 📩",
    shop: "Shop the collection — link in bio! 🛍️",
  };

  return ctas[ctaStyle] || ctas.comment;
}

function generateHashtags(
  topic: string,
  niche: string,
  platform: Platform
): string[] {
  const topicSlug = topic.toLowerCase().replace(/\s+/g, "");
  const nicheSlug = niche.toLowerCase().replace(/\s+/g, "");

  const base = [
    `#${topicSlug}`,
    `#${nicheSlug}`,
    "#contentcreator",
    "#socialmedia",
    "#trending",
  ];

  if (platform === "instagram") {
    return [...base, "#instagramcontent", "#reels", "#viral", "#explore", "#growyourbusiness"];
  }
  if (platform === "twitter") {
    return base.slice(0, 3);
  }
  return base;
}

// Image generation mock
export async function generateImagePrompt(
  req: ImageGenerateRequest
): Promise<ImageGenerateResponse> {
  await new Promise((r) => setTimeout(r, 1200));

  const prompt = buildImagePrompt({
    topic: req.topic,
    platform: req.platform,
    imageType: req.imageType,
    ratio: req.ratio,
    visualStyle: req.visualStyle,
    targetAudience: req.targetAudience,
    campaignGoal: req.campaignGoal,
  });

  const referenceLinks: Record<string, { label: string; url: string }[]> = {
    photorealistic: [
      { label: "Unsplash — Free stock photos", url: "https://unsplash.com" },
      { label: "Pexels — Professional imagery", url: "https://pexels.com" },
    ],
    illustration: [
      { label: "Undraw — Free illustrations", url: "https://undraw.co" },
      { label: "Storyset — Customizable scenes", url: "https://storyset.com" },
    ],
    minimalist: [
      { label: "The Noun Project — Icons", url: "https://thenounproject.com" },
      { label: "Flaticon — Free vector icons", url: "https://flaticon.com" },
    ],
    "3d-render": [
      { label: "Sketchfab — 3D models", url: "https://sketchfab.com" },
      { label: "TurboSquid — 3D assets", url: "https://turbosquid.com" },
    ],
    cinematic: [
      { label: "Artstation — Professional art", url: "https://artstation.com" },
      { label: "Behance — Design inspiration", url: "https://behance.net" },
    ],
  };

  const styleGuide: Record<string, string> = {
    photorealistic: "Natural lighting, sharp focus, authentic composition, Canon 5D quality",
    illustration: "Clean vector shapes, flat design, bold colors, Dribbble-quality illustration",
    minimalist: "White space, single accent color, geometric shapes, Swiss design principles",
    "3d-render": "Soft lighting, depth of field, subsurface scattering, cinema4D render quality",
    cinematic: "Dramatic lighting, shallow DOF, film grain, aspect ratio 2.35:1 composition",
  };

  return {
    prompt,
    styleDirection:
      styleGuide[req.visualStyle] ||
      "Professional, high-quality, brand-safe imagery with strong visual hierarchy",
    compositionGuide: `For ${req.platform} ${req.imageType} (${req.ratio}): Place key visual in center-thirds, ensure text-safe zones on edges, use contrasting colors for readability`,
    platformNote: getPlatformImageNote(req.platform, req.ratio),
    referenceLinks:
      referenceLinks[req.visualStyle] || referenceLinks.photorealistic,
    negativePrompt:
      "blurry, watermark, text overlay, low quality, pixelated, distorted faces, ugly, amateur, oversaturated",
  };
}

function getPlatformImageNote(platform: string, ratio: string): string {
  const notes: Record<string, string> = {
    instagram: `Instagram ${ratio}: Keep important content in the center 80% of the frame. Avoid text too close to edges as they get cropped on feed preview.`,
    twitter: `Twitter Card: Ensure the most important visual element is centered. Twitter crops images to 16:9 in timeline — design for the crop.`,
    facebook: `Facebook ${ratio}: High contrast images perform 40% better on Facebook. Avoid more than 20% text coverage for better organic reach.`,
    telegram: `Telegram: Full image quality is preserved. Take advantage of the full resolution and detail without compression concerns.`,
  };
  return notes[platform] || "Ensure high resolution (300 DPI minimum) for best display quality";
}
