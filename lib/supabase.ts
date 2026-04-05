import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in Vercel."
      );
    }
    _client = createClient(url, key);
  }
  return _client;
}

// Proxy so all existing `supabase.from(...)` calls keep working unchanged
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string) {
    return getClient()[prop as keyof SupabaseClient];
  },
});
