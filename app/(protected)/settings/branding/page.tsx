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

  const accent_color = String(formData.get("accent_color"));
  const bg_color = String(formData.get("bg_color"));
  const google_font_name = String(formData.get("google_font_name") || "Inter");
  const kennel_name = String(formData.get("kennel_name") || "Saját Kennel");
  const owner_name = String(formData.get("owner_name") || "");
  const kennel_address = String(formData.get("kennel_address") || "");
  const tax_number = String(formData.get("tax_number") || "");
  const icon_style = String(formData.get("icon_style") || "minimal");
  const logo_file = formData.get("logo_file") as File;

  let logo_url = String(formData.get("current_logo_url") || "");

  // BIZTONSÁGOS ARRAYBUFFER ÁTALAKÍTÁS A FELTÖLTÉSHEZ
  if (logo_file && logo_file.size > 0 && logo_file.name !== "undefined") {
    const fileExt = logo_file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // Átalakítjuk a fájlt olyan formátummá, amit a szerver imádni fog
      const bytes = await logo_file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, buffer, {
          contentType: logo_file.type,
          cacheControl: "3600",
          upsert: true
        });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(filePath);
        logo_url = publicUrl;
      } else {
        console.error("Storage hiba:", uploadError.message);
      }
    } catch (e) {
      console.error("Fájl konverziós hiba:", e);
    }
  }

  const { data: existing } = await supabase
    .from("branding_settings")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const payload = {
    user_id: user.id,
    accent_color,
    bg_color,
    google_font_name,
    logo_url: logo_url || null,
    kennel_name,
    owner_name,
    kennel_address,
    tax_number,
    icon_style,
    updated_at: new Date().toISOString(),
  };

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

  const { data: settings } = await supabase
    .from("branding_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const defaultSettings = settings || {
    accent_color: "#3b82f6",
    bg_color: "#09090b",
    google_font_name: "Inter",
    logo_url: null,
    kennel_name: "Saját Kennel",
    owner_name: "",
    kennel_address: "",
    tax_number: "",
    icon_style: "minimal",
  };

  return (
    <BrandingClient 
      settings={defaultSettings} 
      saveBrandingAction={saveBrandingAction} 
    />
  );
}
