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
  const ui_style = String(formData.get("ui_style") || "neon");
  const ui_radius = String(formData.get("ui_radius") || "medium");
  const ui_animation = String(formData.get("ui_animation") || "normal");
  const ui_density = String(formData.get("ui_density") || "balanced");

  const bg_color = String(formData.get("bg_color"));
  const primary_color = String(formData.get("primary_color"));
  const accent_color = String(formData.get("accent_color"));
  const card_color = String(formData.get("card_color"));
  
  const kennel_name = String(formData.get("kennel_name") || "Saját Kennel");
  const owner_name = String(formData.get("owner_name") || "");
  const kennel_address = String(formData.get("kennel_address") || "");
  const tax_number = String(formData.get("tax_number") || "");

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
    owner_name,
    kennel_address,
    tax_number,
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
    theme_mode: "dark",
    preset_palette: "midnight",
    ui_style: "neon",
    ui_radius: "medium",
    ui_animation: "normal",
    ui_density: "balanced",
    bg_color: "#000000",
    primary_color: "#7D39EB",
    accent_color: "#C6FF33",
    card_color: "#090A0F",
    kennel_name: "Saját Kennel",
    owner_name: "",
    kennel_address: "",
    tax_number: ""
  };

  return <BrandingClient settings={defaultSettings} saveBrandingAction={saveBrandingAction} />;
}
