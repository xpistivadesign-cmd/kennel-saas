"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveBrandingAction(formData: FormData) {
  const supabase = createServerSupabase();
  
  // 1. Felhasználó azonosítása
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Nem azonosított felhasználó!");
  }

  // 2. Alapadatok kiszedése a FormData-ból
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

  // 3. Logó fájl feltöltésének intelligens kezelése
  const logoFile = formData.get("logo_file") as File | null;
  if (logoFile && logoFile.size > 0 && logoFile.name !== "undefined") {
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
    }
  }

  // 4. Upsert (Mentés vagy Frissítés) az adatbázisba
  const { error: upsertError } = await supabase
    .from("branding_settings")
    .upsert({
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
    }, { onConflict: "user_id" });

  if (upsertError) {
    console.error("Adatbázis mentési hiba:", upsertError);
    throw new Error(`Mentési hiba: ${upsertError.message}`);
  }

  // 5. 🚨 CRITICAL: Gyorsítótár ürítése, hogy a Layout azonnal újraolvassa az új színeket!
  revalidatePath("/", "layout");
}
