import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET — fetch recent generated images from Supabase
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("generated_images")
      .select("topic, image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    const images = (data || []).map((row: any) => ({
      imageUrl: row.image_url,
      topic: row.topic,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ images });
  } catch (err) {
    console.error("image-generate GET error:", err);
    return NextResponse.json({ images: [] });
  }
}

const ratioToSize: Record<string, { width: number; height: number }> = {
  square:    { width: 1024, height: 1024 },
  landscape: { width: 1280, height: 720  },
  portrait:  { width: 720,  height: 1280 },
  banner:    { width: 1584, height: 396  },
  story:     { width: 1080, height: 1920 },
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, ratio = "square", style = "", topic = "", saveOnly = false, imageUrl: existingUrl } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    // Save-only mode: just persist an already-generated image URL
    if (saveOnly && existingUrl) {
      await supabase.from("generated_images").insert({
        topic: topic || prompt.slice(0, 100),
        prompt,
        image_url: existingUrl,
        style: style || ratio,
      });
      return NextResponse.json({ saved: true });
    }

    const { width, height } = ratioToSize[ratio] ?? ratioToSize.square;

    // Pollinations URL is the image itself — no API call needed, just construct the URL
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&model=flux&seed=${Date.now()}`;

    // Save to Supabase
    await supabase.from("generated_images").insert({
      topic: topic || prompt.slice(0, 100),
      prompt,
      image_url: imageUrl,
      style: style || ratio,
    });

    return NextResponse.json({ imageUrl, width, height });
  } catch (err) {
    console.error("image-generate error:", err);
    return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
  }
}
