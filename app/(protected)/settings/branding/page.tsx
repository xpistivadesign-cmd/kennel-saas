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

  const theme_mode = String(formData.get("theme_mode") || "dark");
  const preset_palette = String(formData.get("preset_palette") || "midnight");
  const ui_style = String(formData.get("ui_style") || "glass");
  const ui_radius = String(formData.get("ui_radius") || "medium");
  const ui_animation = String(formData.get("ui_animation") || "normal");
  const ui_font = String(formData.get("ui_font") || "inter");

  const primary_color = String(formData.get("primary_color") || "#7D39EB");
  const accent_color = String(formData.get("accent_color") || "#C6FF33");
  const bg_color = String(formData.get("bg_color") || "#000000");
  const card_color = String(formData.get("card_color") || "#090A0F");
  
  const kennel_name = String(formData.get("kennel_name") || "Saját Kennel");
  const owner_name = String(formData.get("owner_name") || "");
  const kennel_address = String(formData.get("kennel_address") || "");
  const tax_number = String(formData.get("tax_number") || "");

  let logo_url = String(formData.get("current_logo_url") || "");
  const logo_file = formData.get("logo_file") as File;

  // Logó feltöltése a Supabase Storage-ba, ha érkezett új fájl
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
      console.error("Logo upload error:", e);
    }
  }

  const payload = {
    user_id: user.id,
    theme_mode,
    preset_palette,
    ui_style,
    ui_radius,
    ui_animation,
    ui_font,
    bg_color,
    primary_color,
    accent_color,
    card_color,
    kennel_name,
    owner_name,
    kennel_address,
    tax_number,
    logo_url: logo_url || null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase.from("branding_settings").select("id").eq("user_id", user.id).maybeSingle();

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

  const { data: settings } = await supabase.from("branding_settings").select("*").eq("user_id", user.id).maybeSingle();

  const defaultSettings = {
    theme_mode: settings?.theme_mode || "dark",
    preset_palette: settings?.preset_palette || "midnight",
    primary_color: settings?.primary_color || "#7D39EB",
    accent_color: settings?.accent_color || "#C6FF33",
    bg_color: settings?.bg_color || "#000000",
    card_color: settings?.card_color || "#090A0F",
    ui_style: settings?.ui_style || "glass",
    ui_radius: settings?.ui_radius || "medium",
    ui_animation: settings?.ui_animation || "normal",
    ui_font: settings?.ui_font || "inter",
    kennel_name: settings?.kennel_name || "Saját Kennel",
    owner_name: settings?.owner_name || "",
    kennel_address: settings?.kennel_address || "",
    tax_number: settings?.tax_number || "",
    logo_url: settings?.logo_url || null,
    ui_density: settings?.ui_density || "balanced"
  };

  return <BrandingClient settings={defaultSettings} saveBrandingAction={saveBrandingAction} />;
}
