import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: settings } = await supabase.from("branding_settings").select("*").eq("user_id", user.id).maybeSingle();
    // ⚡ KUTYÁK LISTÁJÁNAK KIEGÉSZÍTÉSE: Lekérjük az aktív törzskönyvezett kutyákat
    const { data: dogs } = await supabase.from("dogs").select("id, name").eq("user_id", user.id);

    return NextResponse.json({ 
      settings: settings || {}, 
      dogs: dogs || [] 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
