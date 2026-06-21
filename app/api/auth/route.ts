import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false } // Szerveroldalon ne tárolja lokálisan a belső state-et
    });

    // Hitelesítés a Supabase felé
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json({ error: error?.message || "Hibás adatok" }, { status: 400 });
    }

    const cookieStore = cookies();

    // ⚡ SZERVEROLDALI SÜTI BEÉGETÉS FIX: Manuálisan elmentjük a Next.js számára a Supabase session cookie-kat
    cookieStore.set("sb-access-token", data.session.access_token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: data.session.expires_in,
    });

    cookieStore.set("sb-refresh-token", data.session.refresh_token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 hét
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Auth API hiba:", err);
    return NextResponse.json({ error: "Szerveroldali hiba történt" }, { status: 500 });
  }
}
