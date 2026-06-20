import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: settings } = await supabase
      .from("branding_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: dogs } = await supabase
      .from("dogs")
      .select("id, name")
      .eq("user_id", user.id);

    return NextResponse.json({ 
      settings: settings || { kennel_name: "Saját Kennel", theme_mode: "dark" }, 
      dogs: dogs || [] 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
