import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // "recovery" for password reset

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Password reset flow → go to update password page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/auth/update-password`);
      }
      // Normal signup/login confirmation → go to dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Something went wrong
  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`);
}
