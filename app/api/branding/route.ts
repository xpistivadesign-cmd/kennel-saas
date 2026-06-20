import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const actionType = formData.get("action_type")?.toString();

    // Megkeressük a meglévő rekordot, ha van
    const { data: current } = await supabase
      .from("branding_settings")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let payload: any = {};

    // 🏢 KENNEL PROFIL ADATOK MENTÉSE (A te oldaladhoz igazítva!)
    if (actionType === "save_profile") {
      payload = {
        user_id: user.id,
        kennel_name: formData.get("kennel_name")?.toString() || "Saját Kennel",
        owner_name: formData.get("owner_name")?.toString() || "",
        kennel_address: formData.get("kennel_address")?.toString() || "",
        tax_number: formData.get("tax_number")?.toString() || "",
        updated_at: new Date().toISOString()
      };

      // Logó cseréje fájlfeltöltés esetén
      const logoFile = formData.get("logo_file") as File | null;
      if (logoFile && logoFile.size > 0 && logoFile.name !== "undefined") {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `logo-${user.id}-${Date.now()}.${fileExt}`;
        const { data: uploadData } = await supabase.storage.from("logos").upload(fileName, logoFile, { upsert: true });
        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(fileName);
          payload.logo_url = publicUrl;
        }
      }
    }

    // 🎨 ARCULATI STRATÉGIA MENTÉSE
    if (actionType === "save_branding") {
      payload = {
        user_id: user.id,
        preset_palette: formData.get("preset_palette")?.toString() || "obsidian_dark",
        theme_mode: formData.get("theme_mode")?.toString() || "dark",
        primary_color: formData.get("primary_color")?.toString(),
        accent_color: formData.get("accent_color")?.toString(),
        bg_color: formData.get("bg_color")?.toString(),
        surface_color: formData.get("surface_color")?.toString(),
        text_color: formData.get("text_color")?.toString(),
        border_color: formData.get("border_color")?.toString(),
        bg_gradient_enabled: formData.get("bg_gradient_enabled") === "true",
        bg_gradient_from: formData.get("bg_gradient_from")?.toString(),
        bg_gradient_to: formData.get("bg_gradient_to")?.toString(),
        bg_gradient_angle: Number(formData.get("bg_gradient_angle") || 135),
        bg_pattern: formData.get("bg_pattern")?.toString() || "none",
        font_family: formData.get("font_family")?.toString() || "inter",
        font_scale: Number(formData.get("font_scale") || 100),
        font_weight: Number(formData.get("font_weight") || 400),
        letter_spacing: Number(formData.get("letter_spacing") || 0),
        heading_color: formData.get("heading_color")?.toString(),
        heading_uppercase: formData.get("heading_uppercase") === "true",
        sub_heading_color: formData.get("sub_heading_color")?.toString(),
        widget_dogs_bg: formData.get("widget_dogs_bg")?.toString(),
        widget_litters_bg: formData.get("widget_litters_bg")?.toString(),
        widget_heats_bg: formData.get("widget_heats_bg")?.toString(),
        widget_finance_bg: formData.get("widget_finance_bg")?.toString(),
        btn_primary_bg: formData.get("btn_primary_bg")?.toString(),
        btn_primary_text: formData.get("btn_primary_text")?.toString(),
        btn_radius: Number(formData.get("btn_radius") || 12),
        input_bg: formData.get("input_bg")?.toString(),
        input_border: formData.get("input_border")?.toString(),
        sidebar_bg: formData.get("sidebar_bg")?.toString(),
        sidebar_active_bg: formData.get("sidebar_active_bg")?.toString(),
        sidebar_width: Number(formData.get("sidebar_width") || 270),
        ui_radius: formData.get("ui_radius")?.toString() || "medium",
        ui_animation: formData.get("ui_animation")?.toString() || "normal",
        ui_style: formData.get("ui_style")?.toString() || "glass",
        custom_css: formData.get("custom_css")?.toString() || "",
        kennel_name: formData.get("kennel_name")?.toString() || "Saját Kennel",
        updated_at: new Date().toISOString()
      };
    }

    const { error } = await supabase
      .from("branding_settings")
      .upsert({
        ...(current?.id ? { id: current.id } : {}),
        ...payload
      });

    if (error) throw error;

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Branding/Profile API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
