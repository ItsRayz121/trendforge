import { NextResponse } from "next/server";
import { checkKeywords } from "@/app/api/alerts/route";

export const dynamic = "force-dynamic";

// Called daily by Vercel Cron (Hobby plan limit)
// Upgrade to Pro for hourly: "schedule": "0 * * * *"
export async function GET() {
  console.log("[cron] Running keyword alert check at", new Date().toISOString());
  return checkKeywords();
}
