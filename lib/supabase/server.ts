import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const store = await cookieStore;
          return store.getAll();
        },

        async setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, any>;
          }[]
        ) {
          try {
            const store = await cookieStore;

            cookiesToSet.forEach(({ name, value, options }) => {
              store.set(name, value, options);
            });
          } catch {
            // ignore cookie errors in server context
          }
        },
      },
    }
  );
}
