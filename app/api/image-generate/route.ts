import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

async function getUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

// GET — fetch recent generated images from Supabase
export async function GET() {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ images: [] });

  try {
    const { data, error } = await supabase
      .from("generated_images")
      .select("topic, image_url, created_at")
      .eq("user_id", user.id)
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
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { prompt, ratio = "square", style = "", topic = "", saveOnly = false, imageUrl: existingUrl } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    // Save-only mode: just persist an already-generated image URL
    if (saveOnly && existingUrl) {
      await supabase.from("generated_images").insert({
        user_id: user.id,
        topic: topic || prompt.slice(0, 100),
        prompt,
        image_url: existingUrl,
        style: style || ratio,
      });
      return NextResponse.json({ saved: true });
    }

    const { width, height } = ratioToSize[ratio] ?? ratioToSize.square;

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&model=flux&seed=${Date.now()}`;

    // Save to Supabase
    await supabase.from("generated_images").insert({
      user_id: user.id,
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
