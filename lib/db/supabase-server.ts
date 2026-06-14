import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createSupabaseServer() {
  // Next.js 16 aszinkron cookie kezelés támogatása
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll();
        },
        async setAll(cookiesToSet) {
          try {
            const resolvedCookies = await cookieStore;
            cookiesToSet.forEach(({ name, value, options }) => {
              resolvedCookies.set(name, value, options);
            });
          } catch (error) {
            // Server Component-ek alatt a set-elést a Next.js middleware kezeli, itt elkapjuk ha hibára futna
          }
        },
      },
    }
  );
}
