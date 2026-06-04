import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createServerSupabase() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 🔥 FIX: Next 16 -> cookieStore may be async-like
        async getAll() {
          return (await cookieStore).getAll();
        },

        async setAll(cookiesToSet) {
          try {
            const store = await cookieStore;

            cookiesToSet.forEach(({ name, value, options }) => {
              store.set(name, value, options);
            });
          } catch {
            // server components / edge fallback
          }
        },
      },
    }
  );
}

// 🔥 BACKWARD COMPAT (NE BREAKELJEN SEMMI MÁS)
export const createClient = createServerSupabase;
