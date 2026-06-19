import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import BrandingClient from "./BrandingClient";

export const dynamic = "force-dynamic";

async function saveBrandingAction(formData: FormData) {
  "use server";
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const theme_mode = String(formData.get("theme_mode") || "preset");
  const preset_palette = String(formData.get("preset_palette") || "obsidian_platinum");
  const bg_color = String(formData.get("bg_color"));
  const accent_color = String(formData.get("accent_color"));
  
  // HÁROM KÜLÖNÁLLÓ BETŰSZÍN FORM ADAT
  const text_heading_color = String(formData.get("text_heading_color") || "#FFFFFF");
  const text_body_color = String(formData.get("text_body_color") || "#A1A1AA");
  const text_card_color = String(formData.get("text_card_color") || "#FFFFFF");

  const google_font_name = String(formData.get("google_font_name") || "Inter");
  const kennel_name = String(formData.get("kennel_name") || "Saját Kennel");
  const owner_name = String(formData.get("owner_name") || "");
  const kennel_address = String(formData.get("kennel_address") || "");
  const tax_number = String(formData.get("tax_number") || "");
  const icon_style = String(formData.get("icon_style") || "glass-box");

  let logo_url = String(formData.get("current_logo_url") || "");
  const logo_file = formData.get("logo_file") as File;

  if (logo_file && logo_file.size > 0 && logo_file.name !== "undefined") {
    const fileExt = logo_file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    try {
      const bytes = await logo_file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await supabase.storage.from("logos").upload(fileName, buffer, { contentType: logo_file.type, upsert: true });
      const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(fileName);
      logo_url = publicUrl;
    } catch (e) {
      console.error(e);
    }
  }

  const payload = {
    user_id: user.id,
    theme_mode,
    preset_palette,
    bg_color,
    accent_color,
    text_heading_color,
    text_body_color,
    text_card_color,
    google_font_name,
    logo_url: logo_url || null,
    kennel_name,
    owner_name,
    kennel_address,
    tax_number,
    icon_style,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase.from("branding_settings").select("id").eq("user_id", user.id).single();

  if (existing) {
    await supabase.from("branding_settings").update(payload).eq("user_id", user.id);
  } else {
    await supabase.from("branding_settings").insert(payload);
  }

  revalidatePath("/", "layout");
}

export default async function BrandingPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: settings } = await supabase.from("branding_settings").select("*").eq("user_id", user.id).single();

  const defaultSettings = settings || {
    theme_mode: "preset",
    preset_palette: "obsidian_platinum",
    bg_color: "#0A0B0F",
    accent_color: "#8B8D98",
    text_heading_color: "#E5E7EB",
    text_body_color: "#8B8D98",
    text_card_color: "#FFFFFF",
    google_font_name: "Inter",
    logo_url: null,
    kennel_name: "Saját Kennel",
    owner_name: "",
    kennel_address: "",
    tax_number: "",
    icon_style: "glass-box"
  };

  return <BrandingClient settings={defaultSettings} saveBrandingAction={saveBrandingAction} />;
}
