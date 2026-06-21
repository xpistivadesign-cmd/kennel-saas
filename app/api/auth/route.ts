import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const cookieStore = await cookies();

    // 1️⃣ Létrehozzuk a kiinduló válasz objektumot
    const response = NextResponse.json({ success: true });

    // 2️⃣ Típusbiztos szerver kliens konfiguráció
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          // ⚡ FIX: Explicit típusdefiníció a cookiesToSet paraméternek, hogy a TS ne sírjon
          setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // 3️⃣ Autentikáció indítása
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // 4️⃣ Hiba kezelése sütik átmásolásával
    if (error) {
      return new NextResponse(
        JSON.stringify({ error: error.message }),
        { 
          status: 401, 
          headers: { 
            "Content-Type": "application/json",
            ...Object.fromEntries(response.headers.entries())
          } 
        }
      );
    }

    // 5️⃣ Sikeres válasz visszaküldése
    return response;

  } catch (e) {
    console.error("Auth API hiba:", e);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
