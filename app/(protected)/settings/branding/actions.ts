"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveBrandingAction(formData: FormData) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const kennel_name = formData.get("kennel_name")?.toString() || "Saját Kennel";
    const theme_mode = formData.get("theme_mode")?.toString() || "dark";
    const preset_palette = formData.get("preset_palette")?.toString() || "midnight";
    const primary_color = formData.get("primary_color")?.toString() || "#7D39EB";
    const accent_color = formData.get("accent_color")?.toString() || "#C6FF33";
    const bg_color = formData.get("bg_color")?.toString() || "#000000";
    const card_color = formData.get("card_color")?.toString() || "#090A0F";
    
    // Új betűszín mezők elmentése
    const text_heading_color = formData.get("text_heading_color")?.toString() || "#FFFFFF";
    const text_body_color = formData.get("text_body_color")?.toString() || "#A1A1AA";

    const ui_style = formData.get("ui_style")?.toString() || "glass";
    const ui_radius = formData.get("ui_radius")?.toString() || "medium";
    const ui_animation = formData.get("ui_animation")?.toString() || "normal";
    const ui_font = formData.get("ui_font")?.toString() || "inter";
    
    const owner_name = formData.get("owner_name")?.toString() || "";

    const payload = {
      user_id: user.id,
      kennel_name,
      theme_mode,
      preset_palette,
      primary_color,
      accent_color,
      bg_color,
      card_color,
      text_heading_color,
      text_body_color,
      ui_style,
      ui_radius,
      ui_animation,
      ui_font,
      owner_name,
      updated_at: new Date().toISOString(),
    };

    await supabase.from("branding_settings").upsert(payload, { onConflict: "user_id" });
    revalidatePath("/", "layout");

  } catch (globalError) {
    console.error("Hiba az actionben:", globalError);
  }
}
