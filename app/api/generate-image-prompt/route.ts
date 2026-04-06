import { NextRequest, NextResponse } from "next/server";
import type { ImageGenerateRequest, ImageGenerateResponse } from "@/lib/types";
import { buildImagePrompt } from "@/lib/utils";

export const dynamic = "force-dynamic";

const platformDimensions: Record<string, Record<string, string>> = {
  instagram: {
    square: "1080x1080px",
    portrait: "1080x1350px",
    landscape: "1080x566px",
    story: "1080x1920px",
  },
  twitter: {
    landscape: "1600x900px",
    square: "1080x1080px",
    banner: "1584x396px",
  },
  facebook: {
    landscape: "1200x630px",
    square: "1080x1080px",
    story: "1080x1920px",
    banner: "820x312px",
  },
  telegram: {
    landscape: "1280x720px",
    square: "1024x1024px",
    portrait: "720x1280px",
  },
};

export async function POST(req: NextRequest) {
  try {
    const body: ImageGenerateRequest = await req.json();
    const { topic, platform, imageType, ratio, visualStyle, targetAudience, campaignGoal, brandColors } = body;

    if (!topic || !platform) {
      return NextResponse.json({ error: "topic and platform are required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";
    const model = process.env.OPENAI_MODEL || "google/gemini-2.0-flash-001";

    const dimensions = platformDimensions[platform]?.[ratio] || "1080x1080px";

    if (!apiKey || apiKey === "your_openai_api_key_here") {
      return NextResponse.json(getBuiltInPrompt(body));
    }

    const styleGuides: Record<string, string> = {
      photorealistic: "ultra-realistic photography, DSLR quality, natural lighting, sharp focus, authentic atmosphere",
      illustration: "professional digital illustration, clean vector art, bold colors, Dribbble-quality design",
      minimalist: "minimalist design, white space, single accent color, geometric shapes, Swiss design principles",
      "3d-render": "photorealistic 3D render, soft studio lighting, depth of field, Cinema4D quality, subsurface scattering",
      cinematic: "cinematic photography, dramatic lighting, shallow depth of field, film grain, widescreen composition",
    };

    const prompt = `You are a professional AI image prompt engineer. Create an optimized image generation prompt for the following brief.

Platform: ${platform} ${imageType} (${dimensions})
Aspect Ratio: ${ratio}
Visual Style: ${visualStyle}
Topic/Subject: ${topic}
Target Audience: ${targetAudience || "general audience"}
Campaign Goal: ${campaignGoal || "brand awareness"}
${brandColors ? `Brand Colors: ${brandColors}` : ""}

Style Requirements: ${styleGuides[visualStyle] || styleGuides.photorealistic}

Return ONLY valid JSON:
{
  "prompt": "The complete, detailed image generation prompt optimized for ${visualStyle} style — include subject, environment, lighting, mood, colors, composition, and technical quality descriptors. Min 80 words.",
  "styleDirection": "2-3 sentences describing the visual direction and key aesthetic choices",
  "compositionGuide": "Specific composition advice for ${platform} ${imageType} at ${ratio} ratio",
  "platformNote": "One important technical note about optimizing this image for ${platform}",
  "negativePrompt": "Comma-separated list of things to avoid in the image generation"
}

The prompt must be rich, specific, and immediately usable in Midjourney, DALL-E 3, or Stable Diffusion.`;

    const aiRes = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(baseUrl.includes("openrouter") && {
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://trendforge-enlq.vercel.app",
          "X-Title": "TrendForge",
        }),
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      }),
    });

    if (!aiRes.ok) {
      console.warn("generate-image-prompt AI error:", aiRes.status);
      return NextResponse.json(getBuiltInPrompt(body));
    }

    const aiData = await aiRes.json();
    let raw = aiData.choices?.[0]?.message?.content || "{}";
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        try { parsed = JSON.parse(m[0]); } catch {}
      }
    }

    if (!parsed.prompt) {
      return NextResponse.json(getBuiltInPrompt(body));
    }

    const result: ImageGenerateResponse = {
      prompt: parsed.prompt,
      styleDirection: parsed.styleDirection || "",
      compositionGuide: parsed.compositionGuide || "",
      platformNote: parsed.platformNote || "",
      referenceLinks: getReferenceLinks(visualStyle),
      negativePrompt: parsed.negativePrompt || "blurry, watermark, text overlay, low quality, pixelated, distorted faces, ugly, amateur",
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("generate-image-prompt error:", err);
    return NextResponse.json({ error: "Failed to generate prompt" }, { status: 500 });
  }
}

function getBuiltInPrompt(req: ImageGenerateRequest): ImageGenerateResponse {
  const prompt = buildImagePrompt({
    topic: req.topic,
    platform: req.platform,
    imageType: req.imageType,
    ratio: req.ratio,
    visualStyle: req.visualStyle,
    targetAudience: req.targetAudience,
    campaignGoal: req.campaignGoal,
  });

  const styleGuide: Record<string, string> = {
    photorealistic: "Natural lighting, sharp focus, authentic composition, Canon 5D quality",
    illustration: "Clean vector shapes, flat design, bold colors, Dribbble-quality illustration",
    minimalist: "White space, single accent color, geometric shapes, Swiss design principles",
    "3d-render": "Soft lighting, depth of field, subsurface scattering, Cinema4D render quality",
    cinematic: "Dramatic lighting, shallow DOF, film grain, aspect ratio 2.35:1 composition",
  };

  return {
    prompt,
    styleDirection: styleGuide[req.visualStyle] || "Professional, high-quality, brand-safe imagery with strong visual hierarchy",
    compositionGuide: `For ${req.platform} ${req.imageType} (${req.ratio}): Place key visual in center-thirds, ensure text-safe zones on edges, use contrasting colors for readability`,
    platformNote: getPlatformImageNote(req.platform, req.ratio),
    referenceLinks: getReferenceLinks(req.visualStyle),
    negativePrompt: "blurry, watermark, text overlay, low quality, pixelated, distorted faces, ugly, amateur, oversaturated",
  };
}

function getPlatformImageNote(platform: string, ratio: string): string {
  const notes: Record<string, string> = {
    instagram: `Instagram ${ratio}: Keep important content in the center 80% of the frame. Avoid text too close to edges as they get cropped on feed preview.`,
    twitter: `Twitter Card: Ensure the most important visual element is centered. Twitter crops images to 16:9 in timeline.`,
    facebook: `Facebook ${ratio}: High contrast images perform 40% better on Facebook. Avoid more than 20% text coverage for better organic reach.`,
    telegram: `Telegram: Full image quality is preserved. Take advantage of the full resolution without compression concerns.`,
    linkedin: `LinkedIn: Professional, clean imagery performs best. Avoid overly promotional visuals — thought leadership aesthetics drive engagement.`,
  };
  return notes[platform] || "Ensure high resolution (300 DPI minimum) for best display quality";
}

function getReferenceLinks(visualStyle: string): { label: string; url: string }[] {
  const links: Record<string, { label: string; url: string }[]> = {
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
  return links[visualStyle] || links.photorealistic;
}
