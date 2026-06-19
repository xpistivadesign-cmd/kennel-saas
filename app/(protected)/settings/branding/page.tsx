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

  // Kliensoldalról érkező strukturált paraméterek kicsomagolása biztonságos fallback értékekkel
  const theme_mode = String(formData.get("theme_mode") || "dark");
  const preset_palette = String(formData.get("preset_palette") || "midnight");
  const ui_style = String(formData.get("ui_style") || "glass");
  const ui_radius = String(formData.get("ui_radius") || "medium");
  const ui_animation = String(formData.get("ui_animation") || "normal");
  const ui_density = String(formData.get("ui_density") || "balanced");

  const primary_color = String(formData.get("primary_color") || "#7D39EB");
  const accent_color = String(formData.get("accent_color") || "#C6FF33");
  const bg_color = String(formData.get("bg_color") || "#000000");
  const card_color = String(formData.get("card_color") || "#090A0F");
  
  const kennel_name = String(formData.get("kennel_name") || "Saját Kennel");

  const payload = {
    user_id: user.id,
    theme_mode,
    preset_palette,
    ui_style,
    ui_radius,
    ui_animation,
    ui_density,
    bg_color,
    primary_color,
    accent_color,
    card_color,
    kennel_name,
    updated_at: new Date().toISOString(),
  };

  // Megnézzük, létezik-e már sor az adott felhasználónak
  const { data: existing } = await supabase
    .from("branding_settings")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("branding_settings").update(payload).eq("user_id", user.id);
    if (error) console.error("Supabase Update Error:", error);
  } else {
    const { error } = await supabase.from("branding_settings").insert(payload);
    if (error) console.error("Supabase Insert Error:", error);
  }

  // Frissítjük az App Shell-t, hogy a layout azonnal újraolvassa az új tokeneket
  revalidatePath("/", "layout");
}

export default async function BrandingPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: settings } = await supabase
    .from("branding_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Ha még nincs semmi az adatbázisban, ezekkel a gyári típusokkal töltjük fel a klienst
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
    ui_density: settings?.ui_density || "balanced",
    kennel_name: settings?.kennel_name || "Saját Kennel",
    owner_name: settings?.owner_name || "",
    kennel_address: settings?.kennel_address || "",
    tax_number: settings?.tax_number || ""
  };

  return (
    <BrandingClient 
      settings={defaultSettings} 
      saveBrandingAction={saveBrandingAction} 
    />
  );
}
