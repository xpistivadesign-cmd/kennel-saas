"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveBrandingAction(formData: FormData) {
  try {
    const supabase = createServerSupabase();
    
    // 1. Felhasználó lekérése
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Felhasználó lekérési hiba:", userError);
      return;
    }

    // 2. Adatok biztonságos kinyerése string konverzióval
    const kennel_name = formData.get("kennel_name")?.toString() || "Saját Kennel";
    const theme_mode = formData.get("theme_mode")?.toString() || "dark";
    const preset_palette = formData.get("preset_palette")?.toString() || "midnight";
    const primary_color = formData.get("primary_color")?.toString() || "#7D39EB";
    const accent_color = formData.get("accent_color")?.toString() || "#C6FF33";
    const bg_color = formData.get("bg_color")?.toString() || "#000000";
    const card_color = formData.get("card_color")?.toString() || "#090A0F";
    const ui_style = formData.get("ui_style")?.toString() || "glass";
    const ui_radius = formData.get("ui_radius")?.toString() || "medium";
    const ui_animation = formData.get("ui_animation")?.toString() || "normal";
    const ui_font = formData.get("ui_font")?.toString() || "inter";
    
    const owner_name = formData.get("owner_name")?.toString() || "";
    const kennel_address = formData.get("kennel_address")?.toString() || "";
    const tax_number = formData.get("tax_number")?.toString() || "";

    let logo_url = formData.get("current_logo_url")?.toString() || null;
    if (logo_url === "") logo_url = null;

    // 3. Fájlkezelés tiszta levédése
    try {
      const logoFile = formData.get("logo_file");
      if (logoFile && logoFile instanceof File && logoFile.size > 0 && logoFile.name && logoFile.name !== "undefined") {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("logos")
          .upload(fileName, logoFile, { cacheControl: "3600", upsert: true });

        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from("logos")
            .getPublicUrl(fileName);
          logo_url = publicUrl;
        } else {
          console.error("Storage feltöltési hiba, de a mentés folytatódik:", uploadError);
        }
      }
    } catch (fileErr) {
      console.error("Fájlkezelési kivétel elkapva:", fileErr);
    }

    // 4. Mentési teher (payload) összeállítása
    const payload = {
      user_id: user.id,
      kennel_name,
      theme_mode,
      preset_palette,
      primary_color,
      accent_color,
      bg_color,
      card_color,
      ui_style,
      ui_radius,
      ui_animation,
      ui_font,
      owner_name,
      kennel_address,
      tax_number,
      logo_url,
      updated_at: new Date().toISOString(),
    };

    // 5. Biztonsági ellenőrzés: Megnézzük, létezik-e a sor, hogy elkerüljük az RLS Upsert tiltásokat
    const { data: existingRow } = await supabase
      .from("branding_settings")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingRow) {
      const { error: updateError } = await supabase
        .from("branding_settings")
        .update(payload)
        .eq("user_id", user.id);
      
      if (updateError) {
        console.error("Supabase UPDATE hiba:", updateError);
        // Ha valamilyen új oszlop hiányzik a Supabase tábládból, egy szűkített mentéssel próbálkozunk fallbackként
        await supabase.from("branding_settings").update({ kennel_name, theme_mode, preset_palette, updated_at: new Date().toISOString() }).eq("user_id", user.id);
      }
    } else {
      const { error: insertError } = await supabase
        .from("branding_settings")
        .insert(payload);
        
      if (insertError) {
        console.error("Supabase INSERT hiba:", insertError);
        await supabase.from("branding_settings").insert({ user_id: user.id, kennel_name, theme_mode, preset_palette });
      }
    }

    // 6. Gyorsítótár frissítése
    revalidatePath("/", "layout");

  } catch (globalError) {
    console.error("Kritikus globális hiba az actionben:", globalError);
  }
}
