import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import BrandingClient from "./BrandingClient";

export const dynamic = "force-dynamic";

// Szerveroldali hiteles másolat a 12 sémáról a pontos mentés érdekében
const SERVER_PRESETS = {
  deep_burgundy: { bg: "#0E0D0D", heading: "#EEDCC1", body: "#A89A8D", card: "#EEDCC1", btnText: "#FFFFFF", accent: "#5E001A" },
  royal_navy: { bg: "#1F2A44", heading: "#E8DCC8", body: "#94A3B8", card: "#E8DCC8", btnText: "#000000", accent: "#C6A75E" },
  cyber_neon: { bg: "#0E48C1", heading: "#3DF8F8", body: "#E0A0FF", card: "#3DF8F8", btnText: "#FFFFFF", accent: "#E23AFB" },
  neon_lime: { bg: "#111217", heading: "#FEFFFC", body: "#94949E", card: "#FEFFFC", btnText: "#000000", accent: "#DDFF00" },
  behance_pastel: { bg: "#F5F5F5", heading: "#5A4EFF", body: "#4B5563", card: "#5A4EFF", btnText: "#FFFFFF", accent: "#EEA0FF" },
  travel_app: { bg: "#F5F5F5", heading: "#1F2937", body: "#6B7280", card: "#1F2937", btnText: "#000000", accent: "#E2F4A6" },
  royal_gold_dark: { bg: "#09090B", heading: "#D4A45A", body: "#A1A1AA", card: "#D4A45A", btnText: "#000000", accent: "#F4D58D" },
  imperial_purple: { bg: "#0E081A", heading: "#C084FC", body: "#A78BFA", card: "#C084FC", btnText: "#FFFFFF", accent: "#7C3AED" },
  bordeaux_velvet: { bg: "#14070B", heading: "#F472B6", body: "#FDA4AF", card: "#F472B6", btnText: "#FFFFFF", accent: "#A11A4B" },
  forest_elite: { bg: "#07100A", heading: "#81C784", body: "#A7F3D0", card: "#81C784", btnText: "#FFFFFF", accent: "#2E7D32" },
  sandstone_luxury: { bg: "#12100D", heading: "#E7CFA4", body: "#D1B894", card: "#E7CFA4", btnText: "#000000", accent: "#C19A6B" },
  graphite_monochrome: { bg: "#09090B", heading: "#FFFFFF", body: "#71717A", card: "#FFFFFF", btnText: "#000000", accent: "#FFFFFF" },
};

async function saveBrandingAction(formData: FormData) {
  "use server";
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const theme_mode = String(formData.get("theme_mode") || "preset");
  const preset_palette = String(formData.get("preset_palette") || "deep_burgundy");

  // ALAPÉRTELMEZETT BEOLVASÁS A CUSTOM PICKEREKBŐL
  let bg_color = String(formData.get("bg_color"));
  let accent_color = String(formData.get("accent_color"));
  let text_heading_color = String(formData.get("text_heading_color"));
  let text_body_color = String(formData.get("text_body_color"));
  let text_card_color = String(formData.get("text_card_color"));
  let text_btn_color = String(formData.get("text_btn_color"));

  // 🔥 INTELLIGENS PÁRBASTÉD: Ha Preset módban vagyunk, felülbíráljuk a küldött Custom pickereket a fix gyári kódokkal!
  if (theme_mode === "preset") {
    const targetPreset = SERVER_PRESETS[preset_palette as keyof typeof SERVER_PRESETS] || SERVER_PRESETS.deep_burgundy;
    bg_color = targetPreset.bg;
    accent_color = targetPreset.accent;
    text_heading_color = targetPreset.heading;
    text_body_color = targetPreset.body;
    text_card_color = targetPreset.card;
    text_btn_color = targetPreset.btnText;
  }

  const google_font_name = String(formData.get("google_font_name") || "Inter");
  const kennel_name = String(formData.get("kennel_name") || "Saját Kennel");
  
  const owner_name = String(formData.get("owner_name") || "");
  const kennel_address = String(formData.get("kennel_address") || "");
  const tax_number = String(formData.get("tax_number") || "");
  const icon_style = String(formData.get("icon_style") || "glass-box");

  const widget_dogs = formData.get("widget_dogs") === "true";
  const widget_heats = formData.get("widget_heats") === "true";
  const widget_litters = formData.get("widget_litters") === "true";
  const widget_finance = formData.get("widget_finance") === "true";
  const widget_shows = formData.get("widget_shows") === "true";
  const widget_calendar = formData.get("widget_calendar") === "true";

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
    text_btn_color,
    google_font_name,
    logo_url: logo_url || null,
    kennel_name,
    owner_name,
    kennel_address,
    tax_number,
    icon_style,
    widget_dogs,
    widget_heats,
    widget_litters,
    widget_finance,
    widget_shows,
    widget_calendar,
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
    preset_palette: "deep_burgundy",
    bg_color: "#0E0D0D",
    accent_color: "#5E001A",
    text_heading_color: "#EEDCC1",
    text_body_color: "#A89A8D",
    text_card_color: "#EEDCC1",
    text_btn_color: "#FFFFFF",
    google_font_name: "Inter",
    logo_url: null,
    kennel_name: "Saját Kennel",
    owner_name: "",
    kennel_address: "",
    tax_number: "",
    icon_style: "glass-box",
    widget_dogs: true,
    widget_heats: true,
    widget_litters: true,
    widget_finance: true,
    widget_shows: true,
    widget_calendar: true
  };

  return <BrandingClient settings={defaultSettings} saveBrandingAction={saveBrandingAction} />;
}
