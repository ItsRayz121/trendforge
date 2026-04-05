import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkKeywords } from "@/lib/check-keywords";

export const dynamic = "force-dynamic";

// GET — fetch keywords + recent hits
export async function GET() {
  try {
    const [keywordsRes, hitsRes] = await Promise.all([
      supabase.from("keyword_alerts").select("*").order("created_at", { ascending: true }),
      supabase.from("alert_hits").select("*").order("matched_at", { ascending: false }).limit(50),
    ]);

    return NextResponse.json({
      keywords: keywordsRes.data || [],
      hits: hitsRes.data || [],
      unreadCount: (hitsRes.data || []).filter((h: any) => !h.read).length,
    });
  } catch (err) {
    console.error("alerts GET error:", err);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

// POST — add keyword OR trigger a manual check
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "check") {
      return await checkKeywords();
    }

    if (!body.keyword || typeof body.keyword !== "string") {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    const keyword = body.keyword.trim().toLowerCase();

    const { count } = await supabase
      .from("keyword_alerts")
      .select("id", { count: "exact", head: true });

    if ((count ?? 0) >= 5) {
      return NextResponse.json({ error: "Maximum 5 keywords allowed" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("keyword_alerts")
      .insert({ keyword })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ keyword: data });
  } catch (err: any) {
    console.error("alerts POST error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}

// DELETE — remove keyword by id, or mark hits as read
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const markRead = searchParams.get("markRead");

    if (markRead === "true") {
      await supabase.from("alert_hits").update({ read: true }).eq("read", false);
      return NextResponse.json({ ok: true });
    }

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await supabase.from("keyword_alerts").delete().eq("id", id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("alerts DELETE error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
