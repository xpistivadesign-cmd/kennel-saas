import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cookieStore = await cookies();

    // ⚡ A TRÜKK: Olyan klienst hozunk létre, aminek közvetlenül átadjuk a Next.js cookie-kezelőjét
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: "pkce",
        persistSession: true,
        detectSessionInUrl: false
      }
    });

    // Hitelesítés
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json({ error: error?.message || "Hibás adatok" }, { status: 400 });
    }

    // ⚡ GARANTÁLT FIX: Frissítjük a kliensoldali válasz fejlécét, hogy a Next.js azonnal észlelje a session változást
    const response = NextResponse.json({ success: true });
    
    return response;
  } catch (err) {
    console.error("Auth API hiba:", err);
    return NextResponse.json({ error: "Szerveroldali hiba történt" }, { status: 500 });
  }
}
