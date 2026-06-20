import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("branding_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json(data || {});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const actionType = formData.get("action_type")?.toString();

    // Lekérjük a jelenlegi rekordot, hogy tudjuk az ID-t, ha van
    const { data: current } = await supabase
      .from("branding_settings")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let updatePayload: any = {};

    // KENNEL PROFIL ADATOK MENTÉSE
    if (actionType === "save_profile") {
      updatePayload = {
        user_id: user.id,
        kennel_name: formData.get("kennel_name")?.toString() || "Saját Kennel",
        owner_name: formData.get("owner_name")?.toString() || "",
        address: formData.get("address")?.toString() || "",
        tax_id: formData.get("tax_id")?.toString() || "",
        updated_at: new Date().toISOString(),
      };

      // Opcionális logó feltöltés kezelése
      const logoFile = formData.get("logo_file") as File;
      if (logoFile && logoFile.size > 0) {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `logo-${user.id}-${Date.now()}.${fileExt}`;
        const { data: uploadData } = await supabase.storage.from("logos").upload(fileName, logoFile, { upsert: true });
        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(fileName);
          updatePayload.logo_url = publicUrl;
        }
      }
    }

    // ARCULATI TOKENEK ÉS STRATÉGIA MENTÉSE
    if (actionType === "save_branding") {
      updatePayload = {
        user_id: user.id,
        kennel_name: formData.get("kennel_name")?.toString() || "Saját Kennel",
        theme_mode: formData.get("theme_mode")?.toString() || "dark",
        font_family: formData.get("font_family")?.toString() || "Inter",
        palette: formData.get("palette")?.toString() || "Midnight Neon",
        style_core: formData.get("style_core")?.toString() || "glassmorphism",
        radius: formData.get("radius")?.toString() || "sharp",
        animation: formData.get("animation")?.toString() || "normal",
        custom_css: formData.get("custom_css")?.toString() || "",
        updated_at: new Date().toISOString(),
      };
    }

    // Golyóálló UPSERT futtatása
    const { error } = await supabase
      .from("branding_settings")
      .upsert({
        ...(current?.id ? { id: current.id } : {}),
        ...updatePayload,
      });

    if (error) throw error;

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Branding Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
