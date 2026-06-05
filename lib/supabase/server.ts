import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";

export function createServerSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // 🔥 Next 16 fix: handle Promise OR sync
          const store = cookies() as any;

          if (typeof store.then === "function") {
            // build-time / turbopack safety
            return [];
          }

          return store.getAll();
        },

        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[]
        ) {
          try {
            const store = cookies() as any;

            if (typeof store.then === "function") return;

            cookiesToSet.forEach(({ name, value, options }) => {
              store.set(name, value, options);
            });
          } catch {
            // edge / build fallback
          }
        },
      },
    }
  );
}

// backward compat
export const createClient = createServerSupabase;
