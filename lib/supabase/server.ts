import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";

type CookieSetItem = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export function createServerSupabase() {
  const cookieStore = cookies() as any;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const store = await cookieStore;
          return store.getAll();
        },

        async setAll(cookiesToSet: CookieSetItem[]) {
          const store = await cookieStore;

          cookiesToSet.forEach(({ name, value, options }) => {
            store.set(name, value, options);
          });
        },
      },
    }
  );
}

export const createClient = createServerSupabase;
