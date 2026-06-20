import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();

    // Token, White-Label és Profil adatok kinyerése fallback értékekkel
    const payload: any = {
      user_id: user.id,
      theme_mode: formData.get("theme_mode")?.toString() || "dark",
      preset_palette: formData.get("preset_palette")?.toString() || "midnight",
      primary_color: formData.get("primary_color")?.toString() || "#7D39EB",
      accent_color: formData.get("accent_color")?.toString() || "#C6FF33",
      bg_color: formData.get("bg_color")?.toString() || "#000000",
      surface_color: formData.get("surface_color")?.toString() || "#090A0F",
      text_color: formData.get("text_color")?.toString() || "#FFFFFF",
      border_color: formData.get("border_color")?.toString() || "rgba(255,255,255,0.08)",

      card_mode: formData.get("card_mode")?.toString() || "uniform",
      card_1: formData.get("card_1")?.toString() || "#7D39EB15",
      card_2: formData.get("card_2")?.toString() || "#C6FF3310",
      card_3: formData.get("card_3")?.toString() || "#7D39EB08",
      card_4: formData.get("card_4")?.toString() || "#C6FF3308",
      card_glow: Number(formData.get("card_glow") || 0),
      card_blur: Number(formData.get("card_blur") || 0),
      card_opacity: Number(formData.get("card_opacity") || 100),

      gradient_enabled: formData.get("gradient_enabled") === "true",
      gradient_type: formData.get("gradient_type")?.toString() || "linear",
      gradient_from: formData.get("gradient_from")?.toString() || "#7D39EB",
      gradient_to: formData.get("gradient_to")?.toString() || "#C6FF33",
      gradient_angle: Number(formData.get("gradient_angle") || 135),
      gradient_strength: Number(formData.get("gradient_strength") || 50),

      glass_enabled: formData.get("glass_enabled") === "true",
      glass_blur: Number(formData.get("glass_blur") || 18),
      glass_opacity: Number(formData.get("glass_opacity") || 20),
      glass_border_glow: Number(formData.get("glass_border_glow") || 0),
      glass_shadow: Number(formData.get("glass_shadow") || 15),

      font_family: formData.get("font_family")?.toString() || "inter",
      font_scale: Number(formData.get("font_scale") || 100),
      font_weight: Number(formData.get("font_weight") || 400),
      letter_spacing: Number(formData.get("letter_spacing") || 0),

      button_style: formData.get("button_style")?.toString() || "solid",
      button_radius: Number(formData.get("button_radius") || 12),
      button_glow: Number(formData.get("button_glow") || 0),

      sidebar_bg: formData.get("sidebar_bg")?.toString() || "rgba(255,255,255,0.02)",
      sidebar_active: formData.get("sidebar_active")?.toString() || "#7D39EB",
      sidebar_hover: formData.get("sidebar_hover")?.toString() || "rgba(255,255,255,0.04)",
      sidebar_width: Number(formData.get("sidebar_width") || 270),

      ui_radius: formData.get("ui_radius")?.toString() || "medium",
      ui_animation: formData.get("ui_animation")?.toString() || "normal",
      ui_style: formData.get("ui_style")?.toString() || "glass",
      
      custom_css: formData.get("custom_css")?.toString() || "",
      kennel_name: formData.get("kennel_name")?.toString() || "Saját Kennel",
      
      // ⚡ SZINKRONIZÁLT WHITE-LABEL MEZŐK: Nem száll el többé a szerver!
      owner_name: formData.get("owner_name")?.toString() || "",
      kennel_address: formData.get("kennel_address")?.toString() || "",
      tax_number: formData.get("tax_number")?.toString() || "",
      
      updated_at: new Date().toISOString()
    };

    // Meglévő logó megtartása fallbackként
    const currentLogoUrl = formData.get("current_logo_url")?.toString();
    if (currentLogoUrl) payload.logo_url = currentLogoUrl;

    // Logó mentése, ha van feltöltve új fájl
    const logoFile = formData.get("logo_file") as File | null;
    if (logoFile && logoFile.size > 0 && logoFile.name !== "undefined") {
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { data: uploadData } = await supabase.storage.from("logos").upload(fileName, logoFile, { upsert: true });
      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(fileName);
        payload.logo_url = publicUrl;
      }
    }

    const { error: upsertError } = await supabase.from("branding_settings").upsert(payload, { onConflict: "user_id" });
    if (upsertError) throw upsertError;
    
    // Cache ürítése a teljes layoutra vonatkozóan
    revalidatePath("/", "layout");
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Branding API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
