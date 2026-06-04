import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * 🔥 Backward compatible alias:
 * régi kódok ezt várják: createClient
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // server component safety fallback
          }
        },
      },
    }
  );
}

/**
 * ✅ új standard név
 */
export function createServerSupabase() {
  return createClient();
}
