import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";

export function createServerSupabase() {
  // ⚠️ Next.js 16+: cookies() IS ASYNC (Promise)
  const cookieStorePromise = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const store = await cookieStorePromise;
          return store.getAll();
        },

        async setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[]
        ) {
          try {
            const store = await cookieStorePromise;

            cookiesToSet.forEach(({ name, value, options }) => {
              store.set(name, value, options);
            });
          } catch {
            // Edge / read-only fallback (Vercel safe)
          }
        },
      },
    }
  );
}

// 🔥 BACKWARD COMPAT (NE TÖRD EL)
export const createClient = createServerSupabase;
