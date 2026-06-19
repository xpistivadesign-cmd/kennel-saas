import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import BrandingClient from "./BrandingClient";

export const dynamic = "force-dynamic";

async function saveBrandingAction(formData: FormData) {
  "use server";

  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const payload = {
    user_id: user.id,

    // Theme
    theme_mode: String(formData.get("theme_mode") || "dark"),
    preset_palette: String(formData.get("preset_palette") || "midnight"),

    // Colors
    bg_color: String(formData.get("bg_color") || "#000000"),
    primary_color: String(formData.get("primary_color") || "#7D39EB"),
    accent_color: String(formData.get("accent_color") || "#C6FF33"),
    card_color: String(formData.get("card_color") || "#090A0F"),

    // UI
    ui_style: String(formData.get("ui_style") || "glass"),
    ui_radius: String(formData.get("ui_radius") || "medium"),
    ui_animation: String(formData.get("ui_animation") || "normal"),
    ui_density: String(formData.get("ui_density") || "balanced"),

    // Typography
    font_family: String(formData.get("font_family") || "inter"),
    heading_style: String(formData.get("heading_style") || "modern"),

    // Dashboard
    dashboard_variant: String(
      formData.get("dashboard_variant") || "gradient"
    ),

    dashboard_cards:
      String(formData.get("dashboard_cards") || "multi"),

    dashboard_glow:
      formData.get("dashboard_glow") === "on",

    // Branding
    kennel_name:
      String(formData.get("kennel_name")) ||
      "My Kennel",

    owner_name:
      String(formData.get("owner_name")) || "",

    kennel_address:
      String(formData.get("kennel_address")) || "",

    tax_number:
      String(formData.get("tax_number")) || "",

    website:
      String(formData.get("website")) || "",

    instagram:
      String(formData.get("instagram")) || "",

    facebook:
      String(formData.get("facebook")) || "",

    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("branding_settings")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("branding_settings")
      .update(payload)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase
      .from("branding_settings")
      .insert(payload);

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/dogs");
  revalidatePath("/settings/branding");
}

export default async function BrandingPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("branding_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const settings = data ?? {
    // Mode
    theme_mode: "dark",

    // Presets
    preset_palette: "midnight",

    // Core colors
    bg_color: "#000000",
    primary_color: "#7D39EB",
    accent_color: "#C6FF33",
    card_color: "#090A0F",

    // UI
    ui_style: "glass",
    ui_radius: "medium",
    ui_animation: "normal",
    ui_density: "balanced",

    // Typography
    font_family: "inter",
    heading_style: "modern",

    // Dashboard
    dashboard_variant: "gradient",
    dashboard_cards: "multi",
    dashboard_glow: true,

    // Branding
    kennel_name: "My Kennel",
    owner_name: "",

    kennel_address: "",

    tax_number: "",

    website: "",

    instagram: "",

    facebook: "",
  };

  return (
    <div className="min-h-screen">
      <BrandingClient
        settings={settings}
        saveBrandingAction={saveBrandingAction}
      />
    </div>
  );
}
