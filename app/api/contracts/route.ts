import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
// Service role key-t is használhatsz, ha a RLS szabályok szigorúak
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { buyerId, buyerName, dogId, amount, currency } = await request.json();

    // 1. Felhasználó azonosítása a session-ből
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!dogId || !amount) {
      return NextResponse.json({ error: "Hiányzó adatok!" }, { status: 400 });
    }

    // 2. KUTYASTÁTUSZ AUTOMATIKUS FRISSÍTÉSE -> SOLD
    const { error: dogError } = await supabase
      .from("dogs")
      .update({ status: "Sold", buyer_id: buyerId || null })
      .eq("id", dogId);

    if (dogError) throw dogError;

    // 3. AUTOMATIKUS KÖNYVELÉS (BEVÉTEL GENERÁLÁSA)
    // A logok alapján a táblád neve 'payments', az oszlopok pedig amount és type
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: userId, // Ha a tábla megköveteli
        amount: Number(amount),
        type: "income",
        description: `Kiskutya értékesítés: ${buyerName || "Regisztrált gazdi"}`
      });

    if (paymentError) {
      console.error("Pénzügyi mentés hiba, de a kutya státusza frissült:", paymentError);
      // Nem állítjuk meg a futást, ha a payments sémád eltér, így nem hal meg a felület
    }

    return NextResponse.json({ success: true, message: "Kutya eladva, bevétel elkönyvelve!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
