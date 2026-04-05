import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase
    .from("saved_content")
    .select("*")
    .order("saved_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { topic, platform, content, hashtags, cta, char_count, generated_at } = body;

  if (!topic || !platform || !content) {
    return NextResponse.json({ error: "topic, platform, and content are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("saved_content")
    .insert({
      topic,
      platform,
      content,
      hashtags: hashtags ?? [],
      cta: cta ?? "",
      char_count: char_count ?? content.length,
      generated_at: generated_at ?? new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase.from("saved_content").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
