import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BrandingClient from "./BrandingClient";
import { saveBrandingAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function BrandingPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: settings } = await supabase
    .from("branding_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // ⚡ IDOMÍTÁS: Minden kötelező tulajdonság hiánytalan átadása a TypeScript elvárások szerint
  const defaultSettings = {
    theme_mode: settings?.theme_mode || "dark",
    preset_palette: settings?.preset_palette || "midnight",
    primary_color: settings?.primary_color || "#7D39EB",
    accent_color: settings?.accent_color || "#C6FF33",
    bg_color: settings?.bg_color || "#000000",
    card_color: settings?.card_color || "#090A0F",
    text_heading_color: settings?.text_heading_color || "#FFFFFF",
    text_body_color: settings?.text_body_color || "#A1A1AA",
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
