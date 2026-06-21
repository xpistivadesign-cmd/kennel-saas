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

    // 3️⃣ Autentikáció indítása (a háttérben a setAll() automatikusan belepakolja a tokeneket a `response`-ba)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // 4️⃣ Hiba kezelése (Úgy módosítjuk az objektumot, hogy a sütik megmaradjanak a fejlécben!)
    if (error) {
      return new NextResponse(
        JSON.stringify({ error: error.message }),
        { 
          status: 401, 
          headers: { 
            "Content-Type": "application/json",
            ...Object.fromEntries(response.headers.entries()) // Átmásoljuk a sütiket tartalmazó headereket
          } 
        }
      );
    }

    // 5️⃣ Minden sikeres, visszaadjuk a sütikkel telepakolt választ
    return response;

  } catch (e) {
    console.error("Auth API hiba:", e);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
