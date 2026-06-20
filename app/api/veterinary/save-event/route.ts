import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const dueDate = formData.get("due_date")?.toString();

    const { error } = await supabase.from("events").insert({
      user_id: user.id,
      title: "🐶 Várható ellési időpont (Alom)",
      event_type: "Vemhesség",
      date: dueDate,
      location: "Kennel"
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
