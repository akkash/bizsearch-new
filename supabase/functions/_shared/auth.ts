import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2";

export async function getAuthenticatedUser(req: Request): Promise<User | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    return null;
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }

  return user;
}

export function isInternalCaller(req: Request): boolean {
  const secret = Deno.env.get("EDGE_FUNCTION_SECRET");
  if (!secret) {
    console.error("EDGE_FUNCTION_SECRET is not configured");
    return false;
  }
  return req.headers.get("x-edge-function-secret") === secret;
}

export function createAnonClient(authHeader?: string | null): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  return createClient(supabaseUrl, anonKey, {
    global: authHeader ? { headers: { Authorization: authHeader } } : {} },
  });
}
