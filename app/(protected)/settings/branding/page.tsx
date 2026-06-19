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
  const primary_color = String(formData.get("primary_color"));
  const accent_color = String(formData.get("accent_color"));
  const bg_color = String(formData.get("bg_color"));
  const card_color = String(formData.get("card_color"));
  const success_color = String(formData.get("success_color"));
  const warning_color = String(formData.get("warning_color"));
  const danger_color = String(formData.get("danger_color"));

  const ui_radius = Number(formData.get("ui_radius") || 12);
  const ui_shadow = String(formData.get("ui_shadow") || "0 4px 20px rgba(0,0,0,0.5)");
  const ui_glass_intensity = Number(formData.get("ui_glass_intensity") || 4);

  const feat_gradient = formData.get("feat_gradient") === "true";
  const feat_glass = formData.get("feat_glass") === "true";
  const feat_neon = formData.get("feat_neon") === "true";
  const feat_compact = formData.get("feat_compact") === "true";
  const feat_contrast = formData.get("feat_contrast") === "true";

  const kennel_name = String(formData.get("kennel_name") || "Saját Kennel");
  const owner_name = String(formData.get("owner_name") || "");
  const kennel_address = String(formData.get("kennel_address") || "");
  const tax_number = String(formData.get("tax_number") || "");

  const payload = {
    user_id: user.id,
    theme_mode,
    primary_color,
    accent_color,
    bg_color,
    card_color,
    success_color,
    warning_color,
    danger_color,
    ui_radius,
    ui_shadow,
    ui_glass_intensity,
    feat_gradient,
    feat_glass,
    feat_neon,
    feat_compact,
    feat_contrast,
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
    primary_color: "#7D39EB",
    accent_color: "#C6FF33",
    bg_color: "#000000",
    card_color: "rgba(125, 57, 235, 0.06)",
    success_color: "#10B981",
    warning_color: "#F59E0B",
    danger_color: "#EF4444",
    ui_radius: 12,
    ui_shadow: "0 4px 20px rgba(0,0,0,0.5)",
    ui_glass_intensity: 4,
    feat_gradient: false,
    feat_glass: false,
    feat_neon: true,
    feat_compact: false,
    feat_contrast: false,
    kennel_name: "Saját Kennel",
    owner_name: "",
    kennel_address: "",
    tax_number: ""
  };

  return <BrandingClient settings={defaultSettings} saveBrandingAction={saveBrandingAction} />;
}
