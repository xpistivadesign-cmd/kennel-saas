import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  // 🔥 FIX: force sync access (TS bug workaround)
  const cookieStore = cookies() as any;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // server component restriction (OK)
          }
        },
      },
    }
  );
}