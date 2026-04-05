import { checkKeywords } from "@/lib/check-keywords";

export const dynamic = "force-dynamic";

export async function GET() {
  console.log("[cron] Running keyword alert check at", new Date().toISOString());
  return checkKeywords();
}
