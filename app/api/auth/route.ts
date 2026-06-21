import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const cookieStore = await cookies();

    // 1️⃣ Létrehozzuk a kiinduló válasz objektumot
    const response = NextResponse.json({ success: true });

    // 2️⃣ Inicializáljuk a szerver klienst, ami KÖZVETLENÜL a válasz-objektumba írja a sütiket
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // 3️⃣ Beléptetés (a háttérben a setAll() automatikusan belepakolja a tokeneket a `response`-ba)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // ⚠️ FIX: Ha hiba van, akkor is a 'response' objektumot kell módosítani és visszaadni, 
      // különben a Next.js és a Supabase belső cookie-állapota szétesik!
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // 4️⃣ Minden sikeres, visszaadjuk a sütikkel telepakolt választ
    return response;

  } catch (e) {
    console.error("Auth hiba:", e);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
