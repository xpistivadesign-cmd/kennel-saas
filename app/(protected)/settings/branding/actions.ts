"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveBrandingAction(formData: FormData) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const payload = {
    user_id: user.id,
    theme_mode: formData.get("theme_mode")?.toString(),
    preset_palette: formData.get("preset_palette")?.toString(),
    primary_color: formData.get("primary_color")?.toString(),
    accent_color: formData.get("accent_color")?.toString(),
    bg_color: formData.get("bg_color")?.toString(),
    surface_color: formData.get("surface_color")?.toString(),
    text_color: formData.get("text_color")?.toString(),
    card_mode: formData.get("card_mode")?.toString(),
    card_glow: Number(formData.get("card_glow") || 0),
    card_blur: Number(formData.get("card_blur") || 0),
    card_opacity: Number(formData.get("card_opacity") || 100),
    gradient_enabled: formData.get("gradient_enabled") === "true",
    gradient_type: formData.get("gradient_type")?.toString(),
    gradient_angle: Number(formData.get("gradient_angle") || 135),
    glass_enabled: formData.get("glass_enabled") === "true",
    glass_blur: Number(formData.get("glass_blur") || 18),
    glass_opacity: Number(formData.get("glass_opacity") || 20),
    font_family: formData.get("font_family")?.toString(),
    font_scale: Number(formData.get("font_scale") || 100),
    custom_css: formData.get("custom_css")?.toString(),
    updated_at: new Date().toISOString()
  };

  await supabase.from("branding_settings").upsert(payload, { onConflict: "user_id" });
  revalidatePath("/", "layout");
}
